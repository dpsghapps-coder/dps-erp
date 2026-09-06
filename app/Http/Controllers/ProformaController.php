<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Deal;
use App\Models\Proforma;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProformaController extends Controller
{
    public function index(Client $client)
    {
        $proformas = $client->proformas()->with('deal:id,type,stage')->latest()->get();

        return inertia('CRM/Proformas/Index', [
            'client' => $client,
            'proformas' => $proformas,
        ]);
    }

    public function all()
    {
        $proformas = Proforma::with(['client:id,company_name', 'deal:id,type,stage'])->latest()->get();

        $clients = Client::orderBy('company_name')->get(['id', 'company_name']);

        return inertia('CRM/Proformas/AllIndex', [
            'proformas' => $proformas,
            'clients' => $clients,
        ]);
    }

    public function create(Client $client)
    {
        $deals = $client->deals()->orderBy('created_at', 'desc')->get(['id', 'type', 'stage', 'created_at']);
        $openDeal = $deals->first(fn ($d) => in_array($d->stage, Deal::OPEN_STAGES));

        return inertia('CRM/Proformas/Create', [
            'client' => $client,
            'deals' => $deals,
            'openDealId' => $openDeal?->id,
        ]);
    }

    public function store(Request $request, Client $client)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'valid_until' => 'nullable|date|after_or_equal:date',
            'status' => 'required|in:draft,sent,accepted,rejected',
            'deal_id' => ['nullable', Rule::exists('deals', 'id')->where('client_id', $client->id)],
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

        // No deal explicitly chosen? Auto-attach whichever deal is currently
        // open for this client — most proformas are written during an active
        // campaign, so this covers that case with no user action needed.
        // Leaves null when there's nothing open, rather than guessing.
        if (empty($validated['deal_id'])) {
            $validated['deal_id'] = $client->deals()
                ->whereIn('stage', Deal::OPEN_STAGES)
                ->latest()
                ->value('id');
        }

        $calculated = Proforma::calculate($validated);
        $validated = array_merge($validated, $calculated);

        Proforma::create($validated);

        return redirect()->route('crm.proformas.index', $client->id)
            ->with('success', 'Proforma created successfully');
    }

    public function show(Client $client, Proforma $proforma)
    {
        $proforma->load(['client', 'deal:id,type,stage']);

        return inertia('CRM/Proformas/Show', [
            'client' => $client,
            'proforma' => $proforma,
        ]);
    }

    public function edit(Client $client, Proforma $proforma)
    {
        $deals = $client->deals()->orderBy('created_at', 'desc')->get(['id', 'type', 'stage', 'created_at']);

        return inertia('CRM/Proformas/Edit', [
            'client' => $client,
            'proforma' => $proforma,
            'deals' => $deals,
        ]);
    }

    public function update(Request $request, Client $client, Proforma $proforma)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'valid_until' => 'nullable|date|after_or_equal:date',
            'status' => 'required|in:draft,sent,accepted,rejected',
            'deal_id' => ['nullable', Rule::exists('deals', 'id')->where('client_id', $client->id)],
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
