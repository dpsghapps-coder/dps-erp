<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CampaignReminder;
use App\Models\Client;
use App\Models\User;
use App\Notifications\CampaignNotification;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function index()
    {
        $campaigns = Campaign::with(['client', 'assignedTo', 'createdBy'])
            ->orderByDesc('start_date')
            ->get();

        return inertia('Marketing/Index', ['campaigns' => $campaigns]);
    }

    public function create()
    {
        $clients = Client::orderBy('company_name')->get();
        $employees = User::where('is_active', true)->orderBy('name')->get();

        return inertia('Marketing/Create', [
            'clients' => $clients,
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:social,email,event,ad,print,other',
            'status' => 'required|in:draft,scheduled,active,completed,cancelled',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'client_id' => 'nullable|exists:clients,id',
            'budget' => 'nullable|numeric|min:0',
            'actual_cost' => 'nullable|numeric|min:0',
            'assigned_to' => 'nullable|exists:users,id',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
            'reminders' => 'nullable|array',
            'reminders.*' => 'date|after:now',
        ]);

        $campaign = Campaign::create([
            'number' => Campaign::nextNumber(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'status' => $validated['status'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'client_id' => $validated['client_id'] ?? null,
            'budget' => $validated['budget'] ?? null,
            'actual_cost' => $validated['actual_cost'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'created_by' => auth()->id(),
        ]);

        if (! empty($validated['reminders'])) {
            foreach ($validated['reminders'] as $remindAt) {
                CampaignReminder::create([
                    'campaign_id' => $campaign->id,
                    'user_id' => auth()->id(),
                    'remind_at' => $remindAt,
                ]);
            }
        }

        $campaign->load(['client', 'assignedTo', 'createdBy']);

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
        $campaign->load(['client', 'assignedTo', 'createdBy', 'reminders.user']);

        return inertia('Marketing/Show', ['campaign' => $campaign]);
    }

    public function edit(Campaign $campaign)
    {
        $campaign->load(['assignedTo', 'reminders']);
        $clients = Client::orderBy('company_name')->get();
        $employees = User::where('is_active', true)->orderBy('name')->get();

        return inertia('Marketing/Edit', [
            'campaign' => $campaign,
            'clients' => $clients,
            'employees' => $employees,
        ]);
    }

    public function update(Request $request, Campaign $campaign)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:social,email,event,ad,print,other',
            'status' => 'required|in:draft,scheduled,active,completed,cancelled',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'client_id' => 'nullable|exists:clients,id',
            'budget' => 'nullable|numeric|min:0',
            'actual_cost' => 'nullable|numeric|min:0',
            'assigned_to' => 'nullable|exists:users,id',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
            'reminders' => 'nullable|array',
            'reminders.*' => 'date|after:now',
        ]);

        $oldStatus = $campaign->status;

        $campaign->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'status' => $validated['status'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'client_id' => $validated['client_id'] ?? null,
            'budget' => $validated['budget'] ?? null,
            'actual_cost' => $validated['actual_cost'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

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
