<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryProduct;
use App\Models\Requisition;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RequisitionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');

        $requisitions = Requisition::with('product.supplier')
            ->when($search, function ($query) use ($search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where('item_name', 'like', "%{$search}%")
                        ->orWhere('material_id', 'like', "%{$search}%");
                });
            })
            ->when($status !== 'all', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->orderBy('date_requested', 'desc')
            ->paginate(25);

        $products = InventoryProduct::with(['stocks', 'approvedRequisitions'])
            ->where('item_status', 'Active')
            ->orderBy('item_name')
            ->get(['id', 'item_name', 'material_id']);

        return inertia('Inventory/Requisition/Index', [
            'requisitions' => $requisitions,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'nullable|exists:inventory_products,id',
            'material_name' => 'required_without:product_id|string|max:255',
            'material_attributes' => 'nullable|string',
            'qty_requested' => 'required|integer|min:1',
            'purpose' => 'nullable|string|in:Sample,R&D,Order',
            'requested_by' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:100',
            'assignee' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $validated['id'] = Str::uuid();
        $validated['status'] = 'pending';
        $validated['date_requested'] = now();

        Requisition::create($validated);

        return back()->with('success', 'Requisition created successfully');
    }

    public function update(Request $request, Requisition $requisition)
    {
        $validated = $request->validate([
            'product_id' => 'nullable|exists:inventory_products,id',
            'material_name' => 'required_without:product_id|string|max:255',
            'material_attributes' => 'nullable|string',
            'qty_requested' => 'required|integer|min:1',
            'purpose' => 'nullable|string|in:Sample,R&D,Order',
            'requested_by' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:100',
            'assignee' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $requisition->update($validated);

        return back()->with('success', 'Requisition updated successfully');
    }

    public function updateStatus(Request $request, Requisition $requisition)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,cancelled',
        ]);

        $requisition->update($validated);

        return back()->with('success', 'Requisition status updated');
    }

    public function destroy(Requisition $requisition)
    {
        $requisition->delete();

        return back()->with('success', 'Requisition deleted');
    }
}
