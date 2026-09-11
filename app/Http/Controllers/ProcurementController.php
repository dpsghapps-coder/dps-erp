<?php

namespace App\Http\Controllers;

use App\Models\Good;
use App\Models\InventoryProduct;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\Setting;
use App\Models\Stock;
use App\Models\Supplier;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'items.*.type' => 'required|in:material,good',
            'items.*.product_id' => 'required|string',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        foreach ($validated['items'] as $index => $item) {
            $modelClass = $item['type'] === 'good' ? Good::class : InventoryProduct::class;
            if (! $modelClass::whereKey($item['product_id'])->exists()) {
                return back()->withErrors(["items.{$index}.product_id" => 'Selected item was not found.'])->withInput();
            }
        }

        $po = PurchaseOrder::create([
            'supplier_id' => $validated['supplier_id'],
            'expected_date' => $validated['expected_date'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'po_number' => PurchaseOrder::generatePoNumber(),
            'created_by' => auth()->id(),
            'status' => 'draft',
        ]);

        foreach ($validated['items'] as $item) {
            $po->items()->create([
                'product_id' => $item['product_id'],
                'product_type' => $item['type'] === 'good' ? Good::class : InventoryProduct::class,
                'qty' => $item['qty'],
                'unit_cost' => $item['unit_cost'],
                'line_total' => $item['qty'] * $item['unit_cost'],
            ]);
        }

        $po->update(['total_amount' => $po->items->sum('line_total')]);

        return redirect()->route('procurement.index')->with('success', 'PO created successfully');
    }

    public function show(PurchaseOrder $po)
    {
        $po->load(['supplier.branches', 'items.product', 'items.stocks', 'createdBy', 'purchaseRequest']);
        $user = auth()->user();

        return inertia('Procurement/Show', [
            'purchase_order' => $po,
            'currencySymbol' => $this->currencySymbol(),
            'canMarkOrdered' => $user->hasRole('admin') || $user->hasRole('manager'),
        ]);
    }

    /**
     * draft -> ordered. Nothing else in the PO lifecycle (receipt upload,
     * inspect, close, pull-to-stock) can happen until this runs, since they
     * all require the PO to already be past draft. Role-gated to manager
     * for now rather than a dedicated permission, per an explicit ask to
     * keep this simple until the access model is revisited.
     */
    public function markOrdered(PurchaseOrder $po)
    {
        $user = auth()->user();
        if (! $user->hasRole('admin') && ! $user->hasRole('manager')) {
            return back()->withErrors(['error' => 'Only a manager can mark this purchase order as ordered']);
        }

        if ($po->status !== 'draft') {
            return back()->withErrors(['error' => 'This purchase order has already been ordered']);
        }

        $po->update(['status' => 'ordered']);

        return back()->with('success', 'Purchase order marked as ordered');
    }

    /**
     * Pull a standalone PO's items straight into Stock, instead of someone
     * re-keying the same quantities and costs by hand once goods arrive.
     * PR-linked POs keep using PurchaseRequestController::closePo(), which
     * goes through the fuller inspect-then-close workflow -- this covers
     * the standalone flow, which has no such workflow at all.
     */
    public function pullToStock(Request $request, PurchaseOrder $po)
    {
        if (! $request->user()->hasPermission('procurement.close')) {
            return back()->withErrors(['error' => 'You do not have permission to pull stock for this purchase order']);
        }

        if ($po->purchaseRequest) {
            return back()->withErrors(['error' => 'This PO is linked to a Purchase Request -- use its Inspect/Close PO flow instead']);
        }

        if ($po->stock_pulled_at) {
            return back()->withErrors(['error' => 'Stock has already been pulled for this purchase order']);
        }

        if ($po->status === 'draft') {
            return back()->withErrors(['error' => 'PO must be ordered before stock can be pulled']);
        }

        $po->load('items');
        $skippedGoods = 0;

        DB::transaction(function () use ($po, &$skippedGoods) {
            foreach ($po->items as $item) {
                if (! $item->product_id) {
                    continue;
                }

                // Stock only tracks InventoryProduct materials -- a "Good" item
                // has no matching row in inventory_products, so pulling it in
                // would violate stocks.product_id's foreign key.
                if ($item->product_type && $item->product_type !== InventoryProduct::class) {
                    $skippedGoods++;

                    continue;
                }

                if (Stock::alreadyPulledFor($item)) {
                    continue;
                }

                Stock::fromPurchaseOrderItem($item, $po)->save();
            }

            $po->update(['status' => 'closed', 'stock_pulled_at' => now()]);
        });

        $message = 'Stock pulled from purchase order';
        if ($skippedGoods > 0) {
            $message .= " ({$skippedGoods} good item(s) skipped -- Stock only tracks materials)";
        }

        return back()->with('success', $message);
    }

    public function downloadPdf(PurchaseOrder $po)
    {
        $po->load(['supplier.branches', 'items.product']);

        $pdf = Pdf::loadView('pdf.purchase_order', [
            'po' => $po,
            'currencySymbol' => $this->currencySymbol(),
        ]);

        return $pdf->download("PO-{$po->po_number}.pdf");
    }

    public function downloadWhatsapp(PurchaseOrder $po)
    {
        $po->load(['supplier.branches', 'items.product']);
        $symbol = $this->currencySymbol();

        $lines = [];
        $lines[] = "*PURCHASE ORDER*";
        $lines[] = "PO No: *{$po->po_number}*";
        $lines[] = 'Date: '.$po->created_at->format('d M Y');
        if ($po->expected_date) {
            $lines[] = 'Expected Delivery: '.$po->expected_date->format('d M Y');
        }
        $lines[] = '';
        $lines[] = "*Supplier:* {$po->supplier->company_name}";
        $branch = $po->supplier->branches->first();
        if ($branch?->contact_name) {
            $lines[] = "Attn: {$branch->contact_name}";
        }
        if ($branch?->mobile) {
            $lines[] = "Phone: {$branch->mobile}";
        }
        $lines[] = '';
        $lines[] = '*Items:*';
        foreach ($po->items as $i => $item) {
            $qty = rtrim(rtrim(number_format((float) $item->qty, 2), '0'), '.');
            $lines[] = ($i + 1).". {$item->display_name} — {$qty} x {$symbol} ".number_format((float) $item->unit_cost, 2)." = {$symbol} ".number_format((float) $item->line_total, 2);
        }
        $lines[] = '';
        $lines[] = "*Total: {$symbol} ".number_format((float) $po->total_amount, 2).'*';
        if ($po->notes) {
            $lines[] = '';
            $lines[] = "Notes: {$po->notes}";
        }
        $lines[] = '';
        $lines[] = 'DP Solutions Ghana Limited';

        return response(implode("\n", $lines))
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    private function currencySymbol(): string
    {
        // dompdf's default fonts don't cover the Cedi/Naira glyphs, so those fall
        // back to the plain currency code rather than rendering as "?".
        $code = Setting::get('currency', 'GHS');

        return match ($code) {
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            default => $code,
        };
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
