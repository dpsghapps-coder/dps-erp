<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CampaignReminder;
use App\Models\Client;
use App\Models\Holiday;
use App\Models\MarketingDocument;
use App\Models\User;
use App\Notifications\CampaignNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CampaignController extends Controller
{
    public function index()
    {
        $campaigns = Campaign::with(['client', 'assignedTo', 'createdBy'])
            ->orderByDesc('start_date')
            ->get();

        $holidays = Holiday::public()->orderBy('date')->get(['id', 'name', 'date', 'description']);

        return inertia('Marketing/Index', ['campaigns' => $campaigns, 'holidays' => $holidays]);
    }

    public function create()
    {
        $clients = Client::orderBy('company_name')->get();
        $employees = User::where('is_active', true)->orderBy('name')->get();
        $unlinkedDocuments = MarketingDocument::whereNull('campaign_id')->orderByDesc('created_at')->get();
        $salesPromoEvents = Campaign::whereIn('type', Campaign::ATTACHABLE_PARENT_TYPES)
            ->orderByDesc('start_date')
            ->get(['id', 'title', 'type']);

        return inertia('Marketing/Create', [
            'clients' => $clients,
            'employees' => $employees,
            'unlinkedDocuments' => $unlinkedDocuments,
            'salesPromoEvents' => $salesPromoEvents,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:social,email,event,ad,print,sale,promotion,other',
            'color' => 'nullable|string|max:255',
            'status' => 'required|in:draft,scheduled,active,completed,cancelled',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'client_id' => 'nullable|exists:clients,id',
            'budget' => 'nullable|numeric|min:0',
            'actual_cost' => 'nullable|numeric|min:0',
            'assigned_to' => 'nullable|exists:users,id',
            'team_member_ids' => 'nullable|array',
            'team_member_ids.*' => 'exists:users,id',
            'parent_campaign_id' => [
                'nullable',
                Rule::exists('campaigns', 'id')->whereIn('type', Campaign::ATTACHABLE_PARENT_TYPES),
            ],
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
            'reminders' => 'nullable|array',
            'reminders.*' => 'date|after:now',
            'new_documents' => 'nullable|array',
            'new_documents.*.name' => 'required_with:new_documents|string|max:255',
            'new_documents.*.description' => 'nullable|string',
            'new_documents.*.file' => ['required_with:new_documents', 'file', MarketingDocument::MIME_RULE, 'max:'.MarketingDocument::MAX_KB],
            'existing_document_ids' => 'nullable|array',
            'existing_document_ids.*' => 'exists:marketing_documents,id',
        ]);

        // A Sale/Promotion event is itself the parent grouping -- it cannot also belong to one.
        $isAttachableParentType = in_array($validated['type'], Campaign::ATTACHABLE_PARENT_TYPES, true);

        $campaign = Campaign::create([
            'number' => Campaign::nextNumber(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'color' => $validated['color'] ?? null,
            'status' => $validated['status'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'client_id' => $validated['client_id'] ?? null,
            'budget' => $validated['budget'] ?? null,
            'actual_cost' => $validated['actual_cost'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'parent_campaign_id' => $isAttachableParentType ? null : ($validated['parent_campaign_id'] ?? null),
            'tags' => $validated['tags'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'created_by' => auth()->id(),
        ]);

        $campaign->teamMembers()->sync($validated['team_member_ids'] ?? []);

        if (! empty($validated['reminders'])) {
            foreach ($validated['reminders'] as $remindAt) {
                CampaignReminder::create([
                    'campaign_id' => $campaign->id,
                    'user_id' => auth()->id(),
                    'remind_at' => $remindAt,
                ]);
            }
        }

        foreach ($validated['new_documents'] ?? [] as $documentData) {
            MarketingDocument::createFromUpload($documentData['file'], [
                'name' => $documentData['name'],
                'description' => $documentData['description'] ?? null,
                'campaign_id' => $campaign->id,
                'created_by' => auth()->id(),
            ]);
        }

        if (! empty($validated['existing_document_ids'])) {
            MarketingDocument::whereIn('id', $validated['existing_document_ids'])
                ->update(['campaign_id' => $campaign->id]);
        }

        $campaign->load(['client', 'assignedTo', 'createdBy', 'teamMembers']);

        $users = User::where('is_active', true)->get();
        foreach ($users as $user) {
            if ($user->id !== auth()->id()) {
                $user->notify(new CampaignNotification('created', $campaign));
            }
        }

        return redirect()->route('marketing.show', $campaign)->with('success', 'Campaign created successfully');
    }

    public function show(Campaign $campaign)
    {
        $campaign->load(['client', 'assignedTo', 'createdBy', 'reminders.user', 'documents', 'parentCampaign', 'childCampaigns', 'teamMembers']);

        $attachableCampaigns = null;
        if (in_array($campaign->type, Campaign::ATTACHABLE_PARENT_TYPES, true)) {
            $attachableCampaigns = Campaign::where('id', '!=', $campaign->id)
                ->whereNotIn('type', Campaign::ATTACHABLE_PARENT_TYPES)
                ->orderByDesc('start_date')
                ->get(['id', 'number', 'title', 'type', 'parent_campaign_id']);
        }

        return inertia('Marketing/Show', [
            'campaign' => $campaign,
            'attachableCampaigns' => $attachableCampaigns,
        ]);
    }

    public function attachCampaign(Request $request, Campaign $campaign)
    {
        if (! in_array($campaign->type, Campaign::ATTACHABLE_PARENT_TYPES, true)) {
            return back()->withErrors(['error' => 'Only Sale/Promotion events can have campaigns attached to them']);
        }

        $validated = $request->validate([
            'child_campaign_id' => 'required|exists:campaigns,id',
        ]);

        if ((int) $validated['child_campaign_id'] === $campaign->id) {
            return back()->withErrors(['error' => 'A campaign cannot be attached to itself']);
        }

        $child = Campaign::findOrFail($validated['child_campaign_id']);

        if (in_array($child->type, Campaign::ATTACHABLE_PARENT_TYPES, true)) {
            return back()->withErrors(['error' => 'A Sale/Promotion event cannot be attached to another one']);
        }

        $child->update(['parent_campaign_id' => $campaign->id]);

        return back()->with('success', 'Campaign attached');
    }

    public function detachCampaign(Campaign $campaign, Campaign $child)
    {
        if ($child->parent_campaign_id === $campaign->id) {
            $child->update(['parent_campaign_id' => null]);
        }

        return back()->with('success', 'Campaign detached');
    }

    public function edit(Campaign $campaign)
    {
        $campaign->load(['assignedTo', 'reminders', 'documents', 'teamMembers']);
        $clients = Client::orderBy('company_name')->get();
        $employees = User::where('is_active', true)->orderBy('name')->get();
        $unlinkedDocuments = MarketingDocument::whereNull('campaign_id')->orderByDesc('created_at')->get();
        $salesPromoEvents = Campaign::whereIn('type', Campaign::ATTACHABLE_PARENT_TYPES)
            ->where('id', '!=', $campaign->id)
            ->orderByDesc('start_date')
            ->get(['id', 'title', 'type']);

        return inertia('Marketing/Edit', [
            'campaign' => $campaign,
            'clients' => $clients,
            'employees' => $employees,
            'unlinkedDocuments' => $unlinkedDocuments,
            'salesPromoEvents' => $salesPromoEvents,
        ]);
    }

    public function update(Request $request, Campaign $campaign)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:social,email,event,ad,print,sale,promotion,other',
            'color' => 'nullable|string|max:255',
            'status' => 'required|in:draft,scheduled,active,completed,cancelled',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'client_id' => 'nullable|exists:clients,id',
            'budget' => 'nullable|numeric|min:0',
            'actual_cost' => 'nullable|numeric|min:0',
            'assigned_to' => 'nullable|exists:users,id',
            'team_member_ids' => 'nullable|array',
            'team_member_ids.*' => 'exists:users,id',
            'parent_campaign_id' => [
                'nullable',
                Rule::exists('campaigns', 'id')->whereIn('type', Campaign::ATTACHABLE_PARENT_TYPES),
            ],
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
            'reminders' => 'nullable|array',
            'reminders.*' => 'date|after:now',
            'new_documents' => 'nullable|array',
            'new_documents.*.name' => 'required_with:new_documents|string|max:255',
            'new_documents.*.description' => 'nullable|string',
            'new_documents.*.file' => ['required_with:new_documents', 'file', MarketingDocument::MIME_RULE, 'max:'.MarketingDocument::MAX_KB],
            'existing_document_ids' => 'nullable|array',
            'existing_document_ids.*' => 'exists:marketing_documents,id',
        ]);

        $oldStatus = $campaign->status;
        $isAttachableParentType = in_array($validated['type'], Campaign::ATTACHABLE_PARENT_TYPES, true);

        $campaign->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'color' => $validated['color'] ?? null,
            'status' => $validated['status'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'client_id' => $validated['client_id'] ?? null,
            'budget' => $validated['budget'] ?? null,
            'actual_cost' => $validated['actual_cost'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'parent_campaign_id' => $isAttachableParentType ? null : ($validated['parent_campaign_id'] ?? null),
            'tags' => $validated['tags'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        $campaign->teamMembers()->sync($validated['team_member_ids'] ?? []);

        if (isset($validated['reminders'])) {
            $campaign->reminders()->where('user_id', auth()->id())->delete();
            foreach ($validated['reminders'] as $remindAt) {
                CampaignReminder::create([
                    'campaign_id' => $campaign->id,
                    'user_id' => auth()->id(),
                    'remind_at' => $remindAt,
                ]);
            }
        }

        foreach ($validated['new_documents'] ?? [] as $documentData) {
            MarketingDocument::createFromUpload($documentData['file'], [
                'name' => $documentData['name'],
                'description' => $documentData['description'] ?? null,
                'campaign_id' => $campaign->id,
                'created_by' => auth()->id(),
            ]);
        }

        if (! empty($validated['existing_document_ids'])) {
            MarketingDocument::whereIn('id', $validated['existing_document_ids'])
                ->update(['campaign_id' => $campaign->id]);
        }

        $campaign->load(['client', 'assignedTo', 'createdBy']);

        if ($oldStatus !== $campaign->status) {
            $users = User::where('is_active', true)->get();
            foreach ($users as $user) {
                if ($user->id !== auth()->id()) {
                    $user->notify(new CampaignNotification('status_changed', $campaign));
                }
            }
        } else {
            $users = User::where('is_active', true)->get();
            foreach ($users as $user) {
                if ($user->id !== auth()->id()) {
                    $user->notify(new CampaignNotification('updated', $campaign));
                }
            }
        }

        return redirect()->route('marketing.show', $campaign)->with('success', 'Campaign updated successfully');
    }

    public function destroy(Campaign $campaign)
    {
        $campaign->update(['status' => 'cancelled']);

        return redirect()->route('marketing.index')->with('success', 'Campaign cancelled');
    }
}
