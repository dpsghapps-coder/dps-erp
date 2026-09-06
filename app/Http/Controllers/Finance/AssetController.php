<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Finance\Asset;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function index()
    {
        $assets = Asset::with('department')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $stats = [
            'total_assets' => Asset::count(),
            'total_current_value' => Asset::sum('current_value'),
            'total_purchase_cost' => Asset::sum('purchase_cost'),
            'disposed' => Asset::where('status', 'disposed')->count(),
        ];

        return inertia('Finance/AssetLedger', [
            'assets' => $assets,
            'stats' => $stats,
            'departments' => Department::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'asset_tag' => 'nullable|string|max:100|unique:assets',
            'category' => 'required|string|max:100',
            'purchase_date' => 'required|date',
            'purchase_cost' => 'required|numeric|min:0',
            'status' => 'required|in:'.implode(',', Asset::STATUSES),
            'location' => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'notes' => 'nullable|string',
        ]);

        $validated['current_value'] = $validated['purchase_cost'];
        $validated['created_by'] = auth()->id();

        $asset = Asset::create($validated);

        $asset->ledgerEntries()->create([
            'type' => 'acquisition',
            'amount' => $asset->purchase_cost,
            'date' => $asset->purchase_date,
            'description' => 'Initial acquisition',
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Asset added successfully');
    }

    public function show(Asset $asset)
    {
        $asset->load(['department', 'createdBy', 'ledgerEntries.createdBy']);

        return inertia('Finance/AssetShow', [
            'asset' => $asset,
        ]);
    }

    public function storeEntry(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'type' => 'required|in:depreciation,appreciation,maintenance,disposal',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $entry = $asset->ledgerEntries()->create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        if ($entry->type === 'depreciation') {
            $asset->current_value = max(0, $asset->current_value - $entry->amount);
        } elseif ($entry->type === 'appreciation') {
            $asset->current_value += $entry->amount;
        } elseif ($entry->type === 'disposal') {
            $asset->current_value = 0;
            $asset->status = 'disposed';
        }

        $asset->save();

        return back()->with('success', 'Ledger entry recorded');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();

        return redirect()->route('finance.assets.index')->with('success', 'Asset deleted successfully');
    }
}
