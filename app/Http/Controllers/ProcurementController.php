<?php

namespace App\Http\Controllers;

use App\Models\Good;
use App\Models\InventoryProduct;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\Supplier;
use Illuminate\Http\Request;

class ProcurementController extends Controller
{
    public function index()
    {
        $stats = [
            'totalPrs' => PurchaseRequest::count(),
            'pendingPrs' => PurchaseRequest::where('status', 'pending')->count(),
            'deptApprovedPrs' => PurchaseRequest::where('status', 'dept_approved')->count(),
            'financeApprovedPrs' => PurchaseRequest::where('status', 'finance_approved')->count(),
            'poCreatedPrs' => PurchaseRequest::where('status', 'po_created')->count(),
            'heldPrs' => PurchaseRequest::where('status', 'held')->count(),
            'totalPos' => PurchaseOrder::count(),
            'draftPos' => PurchaseOrder::where('status', 'draft')->count(),
            'activePos' => PurchaseOrder::whereIn('status', ['ordered', 'purchased', 'inspected'])->count(),
            'closedPos' => PurchaseOrder::where('status', 'closed')->count(),
            'totalSuppliers' => Supplier::where('is_active', true)->count(),
            'recentPrs' => PurchaseRequest::with('requester')->latest()->limit(5)->get(),
            'recentPos' => PurchaseOrder::with('supplier')->latest()->limit(5)->get(),
        ];

        return inertia('Procurement/Index', $stats);
    }

    public function orders()
    {
        $pos = PurchaseOrder::with('supplier')
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return inertia('Procurement/Orders/Index', ['purchase_orders' => $pos]);
    }

    public function create()
    {
        $suppliers = Supplier::where('is_active', true)->get();

        $materials = InventoryProduct::where('item_status', 'Active')
            ->with(['supplierPrices.supplier' => function ($query) {
                $query->where('is_active', true);
            }])
            ->get(['id', 'item_name', 'material_id']);

        $goods = Good::where('item_status', 'Active')
            ->with(['supplierPrices.supplier' => function ($query) {
                $query->where('is_active', true);
            }])
            ->get(['id', 'item_name', 'material_id', 'supplier_id']);

        return inertia('Procurement/Create', [
            'suppliers' => $suppliers,
            'materials' => $materials,
            'goods' => $goods,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'expected_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        $po = PurchaseOrder::create(array_merge($validated, [
            'po_number' => PurchaseOrder::generatePoNumber(),
            'created_by' => auth()->id(),
            'status' => 'draft',
        ]));

        foreach ($validated['items'] as $item) {
            $item['line_total'] = $item['qty'] * $item['unit_cost'];
            $po->items()->create($item);
        }

        $po->update(['total_amount' => $po->items->sum('line_total')]);

        return redirect()->route('procurement.index')->with('success', 'PO created successfully');
    }

    public function show(PurchaseOrder $po)
    {
        $po->load(['supplier', 'items.product', 'createdBy']);

        return inertia('Procurement/Show', ['purchase_order' => $po]);
    }

    public function edit(PurchaseOrder $po)
    {
        $suppliers = Supplier::where('is_active', true)->get();
        $po->load('items');

        return inertia('Procurement/Edit', ['purchase_order' => $po, 'suppliers' => $suppliers]);
    }

    public function update(Request $request, PurchaseOrder $po)
    {
        $po->update($request->validate([
            'expected_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
        ]));

        $po->items()->delete();
        foreach ($request->items as $item) {
            $item['line_total'] = $item['qty'] * $item['unit_cost'];
            $po->items()->create($item);
        }

        $po->update(['total_amount' => $po->items->sum('line_total')]);

        return redirect()->route('procurement.show', $po->id)->with('success', 'PO updated successfully');
    }
}
