<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Client;
use App\Models\Contact;
use Illuminate\Http\Request;

class CrmController extends Controller
{
    public function index()
    {
        $clients = Client::with(['primaryContact'])
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
            'status' => 'required|in:lead,prospect,active,inactive',
            'estimated_value' => 'nullable|numeric|min:0',
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

        $validated['pipeline_stage'] = Client::pipelineStageForStatus($validated['status']);

        Client::create($validated);

        return redirect()->route('crm.index')->with('success', 'Client created successfully');
    }

    public function show(Client $client)
    {
        $client->load([
            'contacts' => fn ($q) => $q->orderBy('id'),
            'interactions.user',
            'orders.items',
            'orders.createdBy',
            'proformas',
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
            'status' => 'required|in:lead,prospect,active,inactive',
            'estimated_value' => 'nullable|numeric|min:0',
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
            'status' => 'sometimes|required|in:lead,prospect,active,inactive',
            'pipeline_stage' => 'sometimes|required|in:'.implode(',', Client::PIPELINE_STAGES),
            'next_follow_up_at' => 'nullable|date',
            'lost_reason' => 'nullable|string|max:100',
            'lost_note' => 'nullable|string',
        ]);

        $wasActive = $client->status === 'active';
        $previousPipelineStage = $client->pipeline_stage;

        $update = [];
        if (array_key_exists('next_follow_up_at', $validated)) {
            $update['next_follow_up_at'] = $validated['next_follow_up_at'];
        }

        if (isset($validated['pipeline_stage'])) {
            $update['pipeline_stage'] = $validated['pipeline_stage'];
            if ($validated['pipeline_stage'] === 'converted') {
                $update['status'] = 'active';
            } elseif ($validated['pipeline_stage'] === 'lost') {
                $update['status'] = 'inactive';
                $update['lost_reason'] = $validated['lost_reason'] ?? null;
                $update['lost_note'] = $validated['lost_note'] ?? null;
            }
        } elseif (isset($validated['status'])) {
            $update['status'] = $validated['status'];
            if ($validated['status'] === 'active' && $client->pipeline_stage !== 'converted') {
                $update['pipeline_stage'] = 'converted';
            } elseif ($validated['status'] === 'inactive' && $client->pipeline_stage !== 'lost') {
                $update['pipeline_stage'] = 'lost';
            }
        }

        $client->update($update);

        if (! $wasActive && $client->status === 'active') {
            $client->interactions()->create([
                'user_id' => auth()->id(),
                'type' => 'note',
                'subject' => 'Lead converted to active',
                'body' => 'Status changed to active',
                'occurred_at' => now(),
            ]);
        }

        if (($validated['pipeline_stage'] ?? null) === 'lost' && $previousPipelineStage !== 'lost') {
            $client->interactions()->create([
                'user_id' => auth()->id(),
                'type' => 'note',
                'subject' => 'Lead marked as lost',
                'body' => 'Reason: ' . ($validated['lost_reason'] ?? 'Not specified')
                    . (! empty($validated['lost_note']) ? ' — ' . $validated['lost_note'] : ''),
                'occurred_at' => now(),
            ]);
        }

        return back()->with('success', 'Status updated successfully');
    }

    public function updateBulk(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:clients,id',
            'status' => 'nullable|in:lead,prospect,active,inactive',
            'next_follow_up_at' => 'nullable|date',
        ]);

        $data = array_filter([
            'status' => $validated['status'] ?? null,
            'next_follow_up_at' => $validated['next_follow_up_at'] ?? null,
        ], fn($v) => $v !== null);

        if (empty($data)) {
            return back()->with('error', 'No update provided');
        }

        Client::whereIn('id', $validated['ids'])->update($data);

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
