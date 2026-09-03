<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Proforma;
use Illuminate\Http\Request;

class ProformaController extends Controller
{
    public function index(Client $client)
    {
        $proformas = $client->proformas()->latest()->get();

        return inertia('CRM/Proformas/Index', [
            'client' => $client,
            'proformas' => $proformas,
        ]);
    }

    public function create(Client $client)
    {
        return inertia('CRM/Proformas/Create', [
            'client' => $client,
        ]);
    }

    public function store(Request $request, Client $client)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'valid_until' => 'nullable|date|after_or_equal:date',
            'status' => 'required|in:draft,sent,accepted,rejected',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.specs' => 'nullable|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:percentage,flat',
            'vat_rate' => 'nullable|numeric|min:0|max:100',
            'deposit_rate' => 'nullable|numeric|min:0|max:100',
            'rep_name' => 'nullable|string|max:255',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['client_id'] = $client->id;
        $validated['number'] = Proforma::generateNumber();

        $calculated = Proforma::calculate($validated);
        $validated = array_merge($validated, $calculated);

        Proforma::create($validated);

        return redirect()->route('crm.proformas.index', $client->id)
            ->with('success', 'Proforma created successfully');
    }

    public function show(Client $client, Proforma $proforma)
    {
        $proforma->load('client');

        return inertia('CRM/Proformas/Show', [
            'client' => $client,
            'proforma' => $proforma,
        ]);
    }

    public function edit(Client $client, Proforma $proforma)
    {
        return inertia('CRM/Proformas/Edit', [
            'client' => $client,
            'proforma' => $proforma,
        ]);
    }

    public function update(Request $request, Client $client, Proforma $proforma)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'valid_until' => 'nullable|date|after_or_equal:date',
            'status' => 'required|in:draft,sent,accepted,rejected',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.specs' => 'nullable|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:percentage,flat',
            'vat_rate' => 'nullable|numeric|min:0|max:100',
            'deposit_rate' => 'nullable|numeric|min:0|max:100',
            'rep_name' => 'nullable|string|max:255',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $calculated = Proforma::calculate($validated);
        $validated = array_merge($validated, $calculated);

        $proforma->update($validated);

        return redirect()->route('crm.proformas.show', [$client->id, $proforma->id])
            ->with('success', 'Proforma updated successfully');
    }

    public function destroy(Client $client, Proforma $proforma)
    {
        $proforma->delete();

        return redirect()->route('crm.proformas.index', $client->id)
            ->with('success', 'Proforma deleted successfully');
    }
}
