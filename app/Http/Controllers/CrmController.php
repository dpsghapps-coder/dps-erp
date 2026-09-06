<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Client;
use App\Models\Contact;
use App\Models\Deal;
use Illuminate\Http\Request;

class CrmController extends Controller
{
    public function index()
    {
        $clients = Client::with(['primaryContact'])
            ->withExists(['deals as has_open_deal' => fn ($q) => $q->whereIn('stage', Deal::OPEN_STAGES)])
            ->orderBy('company_name')
            ->get();

        return inertia('CRM/Index', ['clients' => $clients]);
    }

    public function create()
    {
        return inertia('CRM/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:clients,email',
            'phone' => ['nullable', 'string', 'max:10', 'regex:/^0[0-9]{9}$/'],
            'estimated_value' => 'nullable|numeric|min:0',
            'next_follow_up_at' => 'nullable|date',
            'create_lead' => 'nullable|boolean',
            'industry' => 'nullable|string|max:100',
            'website' => 'nullable|url',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:50',
            'source' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'linkedin' => 'nullable|url',
            'facebook' => 'nullable|url',
            'instagram' => 'nullable|url',
            'twitter' => 'nullable|url',
            'tiktok' => 'nullable|url',
        ]);

        $estimatedValue = $validated['estimated_value'] ?? 0;
        $nextFollowUpAt = $validated['next_follow_up_at'] ?? null;
        $createLead = $validated['create_lead'] ?? true;
        unset($validated['estimated_value'], $validated['next_follow_up_at'], $validated['create_lead']);

        $client = Client::create($validated);

        if ($createLead) {
            $client->deals()->create([
                'type' => 'new_business',
                'stage' => 'new_lead',
                'estimated_value' => $estimatedValue,
                'next_follow_up_at' => $nextFollowUpAt,
                'created_by' => auth()->id(),
            ]);
        }

        return redirect()->route('crm.index')->with('success', 'Client created successfully');
    }

    public function show(Client $client)
    {
        $client->load([
            'contacts' => fn ($q) => $q->orderBy('id'),
            'interactions' => fn ($q) => $q->with('user')->orderBy('occurred_at', 'desc'),
            'orders.items',
            'orders.createdBy',
            'proformas',
            'deals' => fn ($q) => $q->orderBy('created_at', 'desc'),
        ]);

        $auditLogs = AuditLog::with('user')
            ->where('model_type', Client::class)
            ->where('model_id', $client->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('CRM/Show', [
            'client' => $client,
            'auditLogs' => $auditLogs,
        ]);
    }

    public function edit(Client $client)
    {
        return inertia('CRM/Edit', ['client' => $client]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:clients,email,'.$client->id,
            'phone' => ['nullable', 'string', 'max:10', 'regex:/^0[0-9]{9}$/'],
            'status' => 'nullable|in:'.implode(',', Client::TIERS),
            'industry' => 'nullable|string|max:100',
            'website' => 'nullable|url',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:50',
            'source' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'linkedin' => 'nullable|url',
            'facebook' => 'nullable|url',
            'instagram' => 'nullable|url',
            'twitter' => 'nullable|url',
            'tiktok' => 'nullable|url',
        ]);

        $client->update($validated);

        return redirect()->route('crm.show', $client->id)->with('success', 'Client updated successfully');
    }

    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()->route('crm.index')->with('success', 'Client deleted successfully');
    }

    public function updateStatus(Request $request, Client $client)
    {
        $validated = $request->validate([
            'status' => 'required|in:'.implode(',', Client::TIERS),
        ]);

        $client->update($validated);

        return back()->with('success', 'Status updated successfully');
    }

    public function toggleGreylist(Request $request, Client $client)
    {
        $validated = $request->validate([
            'greylisted' => 'required|boolean',
            'reason' => 'nullable|string|max:255',
        ]);

        if ($validated['greylisted']) {
            $client->update([
                'is_greylisted' => true,
                'greylisted_at' => now(),
                'greylisted_by' => auth()->id(),
                'greylist_reason' => $validated['reason'] ?? null,
            ]);

            $client->interactions()->create([
                'user_id' => auth()->id(),
                'type' => 'note',
                'subject' => 'Client greylisted',
                'body' => $validated['reason'] ?? 'No reason given',
                'occurred_at' => now(),
            ]);

            return back()->with('success', 'Client greylisted');
        }

        if (! auth()->user()->hasPermission('crm.approve-greylist')) {
            return back()->with('error', 'Only a manager can approve removing a greylist.');
        }

        $client->update([
            'is_greylisted' => false,
            'greylisted_at' => null,
            'greylisted_by' => null,
            'greylist_reason' => null,
        ]);

        $client->interactions()->create([
            'user_id' => auth()->id(),
            'type' => 'note',
            'subject' => 'Greylist lifted',
            'body' => 'Client approved and greylist removed.',
            'occurred_at' => now(),
        ]);

        return back()->with('success', 'Greylist lifted');
    }

    public function updateBulk(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:clients,id',
            'status' => 'nullable|in:'.implode(',', Client::TIERS),
            'next_follow_up_at' => 'nullable|date',
        ]);

        if (empty($validated['status']) && empty($validated['next_follow_up_at'])) {
            return back()->with('error', 'No update provided');
        }

        // Mass query-builder updates never fire Eloquent model events, so the
        // Auditable trait would silently miss bulk changes — save each model
        // individually instead to keep the audit trail complete.
        if (! empty($validated['status'])) {
            Client::whereIn('id', $validated['ids'])->get()->each(
                fn ($client) => $client->update(['status' => $validated['status']])
            );
        }

        if (! empty($validated['next_follow_up_at'])) {
            Deal::whereIn('client_id', $validated['ids'])
                ->whereIn('stage', Deal::OPEN_STAGES)
                ->get()
                ->each(fn ($deal) => $deal->update(['next_follow_up_at' => $validated['next_follow_up_at']]));
        }

        return back()->with('success', count($validated['ids']) . ' leads updated');
    }

    public function logInteraction(Request $request, Client $client)
    {
        $validated = $request->validate([
            'type' => 'required|in:call,email,meeting,note,whatsapp',
            'subject' => 'required|string|max:255',
            'body' => 'nullable|string',
            'occurred_at' => 'required|date',
        ]);

        $client->interactions()->create(array_merge($validated, [
            'user_id' => auth()->id(),
        ]));

        return back()->with('success', 'Interaction logged successfully');
    }

    public function storeContact(Request $request, Client $client)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'branch' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:50',
            'job_title' => 'nullable|string|max:255',
            'phone' => ['nullable', 'string', 'max:10', 'regex:/^0[0-9]{9}$/'],
        ]);

        $client->contacts()->create($validated);

        return back()->with('success', 'Contact added successfully');
    }

    public function updateContact(Request $request, Client $client, Contact $contact)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'branch' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:50',
            'job_title' => 'nullable|string|max:255',
            'phone' => ['nullable', 'string', 'max:10', 'regex:/^0[0-9]{9}$/'],
        ]);

        $contact->update($validated);

        return back()->with('success', 'Contact updated successfully');
    }

    public function destroyContact(Client $client, Contact $contact)
    {
        $contact->delete();

        return back()->with('success', 'Contact removed successfully');
    }
}
