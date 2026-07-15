<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class CrmController extends Controller
{
    public function index()
    {
        $clients = Client::with(['assignedTo', 'primaryContact'])
            ->orderBy('created_at', 'desc')
            ->paginate(25);

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
            'email' => 'nullable|email',
            'phone' => ['nullable', 'string', 'max:10', 'regex:/^0[0-9]{9}$/'],
            'status' => 'required|in:lead,prospect,active,inactive',
            'industry' => 'nullable|string|max:100',
            'website' => 'nullable|url',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:50',
            'source' => 'nullable|string|max:100',
            'contact_person_1' => 'nullable|string|max:100',
            'contact_person_mobile' => ['nullable', 'string', 'max:10', 'regex:/^0[0-9]{9}$/'],
            'notes' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        Client::create($validated);

        return redirect()->route('crm.index')->with('success', 'Client created successfully');
    }

    public function show(Client $client)
    {
        $client->load(['assignedTo', 'contacts', 'interactions.user', 'orders']);

        return inertia('CRM/Show', ['client' => $client]);
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
            'industry' => 'nullable|string|max:100',
            'website' => 'nullable|url',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:50',
            'source' => 'nullable|string|max:100',
            'contact_person_1' => 'nullable|string|max:100',
            'contact_person_mobile' => ['nullable', 'string', 'max:10', 'regex:/^0[0-9]{9}$/'],
            'notes' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $client->update($validated);

        return redirect()->route('crm.show', $client->id)->with('success', 'Client updated successfully');
    }

    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()->route('crm.index')->with('success', 'Client deleted successfully');
    }

    public function logInteraction(Request $request, Client $client)
    {
        $validated = $request->validate([
            'type' => 'required|in:call,email,meeting,note',
            'subject' => 'required|string|max:255',
            'body' => 'nullable|string',
            'occurred_at' => 'required|date',
        ]);

        $client->interactions()->create(array_merge($validated, [
            'user_id' => auth()->id(),
        ]));

        return back()->with('success', 'Interaction logged successfully');
    }
}
