<?php

namespace App\Http\Controllers\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\InventoryProduct;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRequestHistory;
use App\Models\Stock;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = PurchaseRequest::with(['requester', 'departmentManager', 'supplier', 'purchaseOrder']);

        if ($user->hasRole('admin') || $user->hasRole('md') || $user->hasRole('general')) {
            // See all PRs
        } elseif ($user->hasPermissionTo('pr.finance.review')) {
            // Finance sees dept_approved + their own
            $query->where(function ($q) use ($user) {
                $q->where('status', 'dept_approved')
                    ->orWhere('requester_id', $user->id);
            });
        } elseif ($user->hasPermissionTo('pr.approve')) {
            // Dept managers see their department's PRs + their own
            $query->where(function ($q) use ($user) {
                $q->where('department', $user->department)
                    ->orWhere('requester_id', $user->id);
            });
        } else {
            // Regular users see only their own
            $query->where('requester_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('pr_number', 'like', "%{$search}%")
                    ->orWhereHas('requester', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $prs = $query->latest()->paginate(25);

        return inertia('Procurement/PurchaseRequests/Index', [
            'purchaseRequests' => $prs,
            'filters' => $request->only(['status', 'search']),
            'pendingCount' => PurchaseRequest::where('status', 'pending')->count(),
            'deptApprovedCount' => PurchaseRequest::where('status', 'dept_approved')->count(),
        ]);
    }

    public function create()
    {
        return inertia('Procurement/PurchaseRequests/Create', [
            'products' => InventoryProduct::where('item_status', 'Active')->get(),
            'suppliers' => Supplier::where('is_active', true)->get(),
            'users' => User::all(),
            'departments' => Department::where('is_active', true)->orderBy('name')->pluck('name'),
        ]);
    }

    public function store(Request $request)
    {
        $departmentNames = Department::where('is_active', true)->pluck('name')->toArray();
        $deptValidation = $departmentNames ? 'in:'.implode(',', $departmentNames) : 'nullable';

        $validated = $request->validate([
            'department' => 'required|string|'.$deptValidation,
            'priority' => 'required|in:Low,Normal,High,Emergency',
            'required_by_date' => 'nullable|date|after:today',
            'purpose' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.item_description' => 'nullable|string',
            'items.*.product_id' => 'nullable|uuid|exists:inventory_products,id',
            'items.*.estimated_cost' => 'required|numeric|min:0',
            'items.*.qty_requested' => 'required|numeric|min:0.01',
            'items.*.uom' => 'required|string',
        ]);

        $user = $request->user();
        $deptManager = User::where('department', $validated['department'])
            ->whereHas('role', fn ($q) => $q->where('name', 'manager'))
            ->first();

        return DB::transaction(function () use ($validated, $user, $deptManager, $request) {
            $pr = PurchaseRequest::create([
                'request_date' => now()->toDateString(),
                'requester_id' => $user->id,
                'department' => $validated['department'],
                'priority' => $validated['priority'],
                'required_by_date' => $validated['required_by_date'] ?? null,
                'purpose' => $validated['purpose'] ?? null,
                'status' => 'draft',
                'dept_manager_id' => $deptManager?->id,
                'created_by' => $user->id,
            ]);

            foreach ($validated['items'] as $itemData) {
                $item = $pr->items()->create([
                    'item_name' => $itemData['item_name'],
                    'item_description' => $itemData['item_description'] ?? null,
                    'product_id' => $itemData['product_id'] ?? null,
                    'estimated_cost' => $itemData['estimated_cost'],
                    'qty_requested' => $itemData['qty_requested'],
                    'uom' => $itemData['uom'],
                ]);

                if ($request->hasFile("items.{$item->id}.attachments")) {
                    foreach ($request->file("items.{$item->id}.attachments") as $file) {
                        $path = $file->store('purchase-requests/attachments', 'public');
                        $item->attachments()->create([
                            'file_name' => $file->getClientOriginalName(),
                            'file_path' => $path,
                            'file_type' => $file->getMimeType(),
                            'file_size' => $file->getSize(),
                        ]);
                    }
                }
            }

            PurchaseRequestHistory::create([
                'purchase_request_id' => $pr->id,
                'status' => 'draft',
                'changed_by' => $user->id,
                'comment' => 'PR created',
            ]);

            return redirect()->route('procurement.purchase-requests.show', $pr)
                ->with('success', 'Purchase request created successfully');
        });
    }

    public function show(PurchaseRequest $purchaseRequest)
    {
        $purchaseRequest->load([
            'requester',
            'departmentManager',
            'financeUser',
            'supplier',
            'purchaseOrder.supplier',
            'purchaseOrder.items.product',
            'items.product',
            'items.attachments',
            'history.user',
        ]);

        return inertia('Procurement/PurchaseRequests/Show', [
            'purchaseRequest' => $purchaseRequest,
        ]);
    }

    public function edit(PurchaseRequest $purchaseRequest)
    {
        if (! in_array($purchaseRequest->status, ['draft', 'queried'])) {
            return back()->withErrors(['error' => 'Cannot edit a PR that is not in draft or queried status']);
        }

        $purchaseRequest->load(['items.attachments', 'items.product']);

        return inertia('Procurement/PurchaseRequests/Edit', [
            'purchaseRequest' => $purchaseRequest,
            'products' => InventoryProduct::where('item_status', 'Active')->get(),
            'departments' => Department::where('is_active', true)->orderBy('name')->pluck('name'),
        ]);
    }

    public function update(Request $request, PurchaseRequest $purchaseRequest)
    {
        if (! in_array($purchaseRequest->status, ['draft', 'queried'])) {
            return back()->withErrors(['error' => 'Cannot update a PR that is not in draft or queried status']);
        }

        $departmentNames = Department::where('is_active', true)->pluck('name')->toArray();
        $deptValidation = $departmentNames ? 'in:'.implode(',', $departmentNames) : 'nullable';

        $validated = $request->validate([
            'department' => 'required|string|'.$deptValidation,
            'priority' => 'required|in:Low,Normal,High,Emergency',
            'required_by_date' => 'nullable|date|after:today',
            'purpose' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.item_description' => 'nullable|string',
            'items.*.product_id' => 'nullable|uuid|exists:inventory_products,id',
            'items.*.estimated_cost' => 'required|numeric|min:0',
            'items.*.qty_requested' => 'required|numeric|min:0.01',
            'items.*.uom' => 'required|string',
        ]);

        DB::transaction(function () use ($validated, $purchaseRequest, $request) {
            $purchaseRequest->update([
                'department' => $validated['department'],
                'priority' => $validated['priority'],
                'required_by_date' => $validated['required_by_date'] ?? null,
                'purpose' => $validated['purpose'] ?? null,
            ]);

            $purchaseRequest->items()->delete();

            foreach ($validated['items'] as $itemData) {
                $item = $purchaseRequest->items()->create([
                    'item_name' => $itemData['item_name'],
                    'item_description' => $itemData['item_description'] ?? null,
                    'product_id' => $itemData['product_id'] ?? null,
                    'estimated_cost' => $itemData['estimated_cost'],
                    'qty_requested' => $itemData['qty_requested'],
                    'uom' => $itemData['uom'],
                ]);

                if ($request->hasFile("items.{$item->id}.attachments")) {
                    foreach ($request->file("items.{$item->id}.attachments") as $file) {
                        $path = $file->store('purchase-requests/attachments', 'public');
                        $item->attachments()->create([
                            'file_name' => $file->getClientOriginalName(),
                            'file_path' => $path,
                            'file_type' => $file->getMimeType(),
                            'file_size' => $file->getSize(),
                        ]);
                    }
                }
            }

            if ($purchaseRequest->status === 'queried') {
                $purchaseRequest->update(['status' => 'pending']);
                PurchaseRequestHistory::create([
                    'purchase_request_id' => $purchaseRequest->id,
                    'status' => 'pending',
                    'changed_by' => auth()->id(),
                    'comment' => 'PR updated after query, resubmitted',
                ]);
            }
        });

        return redirect()->route('procurement.purchase-requests.show', $purchaseRequest)
            ->with('success', 'Purchase request updated successfully');
    }

    public function submit(PurchaseRequest $purchaseRequest)
    {
        if ($purchaseRequest->status !== 'draft') {
            return back()->withErrors(['error' => 'Only draft PRs can be submitted']);
        }

        $purchaseRequest->update(['status' => 'pending']);
        PurchaseRequestHistory::create([
            'purchase_request_id' => $purchaseRequest->id,
            'status' => 'pending',
            'changed_by' => auth()->id(),
            'comment' => 'PR submitted for review',
        ]);

        return back()->with('success', 'Purchase request submitted for review');
    }

    public function deptReview(Request $request, PurchaseRequest $purchaseRequest)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,query',
            'comment' => 'nullable|string',
        ]);

        if (! in_array($purchaseRequest->status, ['pending', 'queried'])) {
            return back()->withErrors(['error' => 'PR is not pending department review']);
        }

        $newStatus = match ($validated['action']) {
            'approve' => 'dept_approved',
            'reject' => 'rejected',
            'query' => 'queried',
        };

        $purchaseRequest->update([
            'status' => $newStatus,
            'dept_manager_comment' => $validated['comment'] ?? null,
        ]);

        PurchaseRequestHistory::create([
            'purchase_request_id' => $purchaseRequest->id,
            'status' => $newStatus,
            'changed_by' => auth()->id(),
            'comment' => $validated['comment'] ?? "Department manager {$validated['action']}d the PR",
        ]);

        return back()->with('success', "Purchase request {$validated['action']}d successfully");
    }

    public function financeReview(Request $request, PurchaseRequest $purchaseRequest)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,query,hold',
            'comment' => 'nullable|string',
            'postpone_until' => 'required_if:action,hold|nullable|date|after:today',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        if ($purchaseRequest->status !== 'dept_approved') {
            return back()->withErrors(['error' => 'PR is not pending finance review']);
        }

        $newStatus = match ($validated['action']) {
            'approve' => 'finance_approved',
            'reject' => 'rejected',
            'query' => 'queried',
            'hold' => 'held',
        };

        $purchaseRequest->update([
            'status' => $newStatus,
            'finance_comment' => $validated['comment'] ?? null,
            'supplier_id' => $validated['supplier_id'] ?? $purchaseRequest->supplier_id,
            'finance_user_id' => auth()->id(),
            'postpone_until' => $validated['postpone_until'] ?? null,
        ]);

        PurchaseRequestHistory::create([
            'purchase_request_id' => $purchaseRequest->id,
            'status' => $newStatus,
            'changed_by' => auth()->id(),
            'comment' => $validated['comment'] ?? "Finance {$validated['action']}d the PR",
        ]);

        return back()->with('success', "Purchase request {$validated['action']}d successfully");
    }

    public function cancel(PurchaseRequest $purchaseRequest)
    {
        $user = auth()->user();
        $canCancel = $purchaseRequest->requester_id === $user->id
            || $user->hasPermissionTo('pr.approve')
            || $user->hasPermissionTo('pr.finance.review');

        if (! $canCancel) {
            return back()->withErrors(['error' => 'You do not have permission to cancel this PR']);
        }

        if (in_array($purchaseRequest->status, ['cancelled', 'po_created'])) {
            return back()->withErrors(['error' => 'Cannot cancel this PR']);
        }

        $purchaseRequest->update(['status' => 'cancelled']);
        PurchaseRequestHistory::create([
            'purchase_request_id' => $purchaseRequest->id,
            'status' => 'cancelled',
            'changed_by' => $user->id,
            'comment' => 'PR cancelled',
        ]);

        return back()->with('success', 'Purchase request cancelled');
    }

    public function createPo(PurchaseRequest $purchaseRequest)
    {
        if ($purchaseRequest->status !== 'finance_approved') {
            return back()->withErrors(['error' => 'PR must be finance approved to create a PO']);
        }

        return inertia('Procurement/PurchaseRequests/CreatePo', [
            'purchaseRequest' => $purchaseRequest->load(['items.product', 'supplier']),
            'suppliers' => Supplier::where('is_active', true)->get(),
        ]);
    }

    public function storePo(Request $request, PurchaseRequest $purchaseRequest)
    {
        if ($purchaseRequest->status !== 'finance_approved') {
            return back()->withErrors(['error' => 'PR must be finance approved to create a PO']);
        }

        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'expected_date' => 'nullable|date|after:today',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $purchaseRequest) {
            $po = PurchaseOrder::create([
                'po_number' => PurchaseOrder::generatePoNumber(),
                'supplier_id' => $validated['supplier_id'],
                'status' => 'draft',
                'expected_date' => $validated['expected_date'] ?? null,
                'total_amount' => 0,
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            $total = 0;
            foreach ($validated['items'] as $index => $itemData) {
                $prItem = $purchaseRequest->items[$index];
                $lineTotal = $itemData['qty'] * $itemData['unit_cost'];
                $total += $lineTotal;

                $po->items()->create([
                    'product_id' => $prItem->product_id,
                    'description' => $prItem->item_name,
                    'qty' => $itemData['qty'],
                    'unit_cost' => $itemData['unit_cost'],
                    'line_total' => $lineTotal,
                ]);
            }

            $po->update(['total_amount' => $total]);
            $purchaseRequest->update([
                'status' => 'po_created',
                'purchase_order_id' => $po->id,
                'supplier_id' => $validated['supplier_id'],
            ]);

            PurchaseRequestHistory::create([
                'purchase_request_id' => $purchaseRequest->id,
                'status' => 'po_created',
                'changed_by' => auth()->id(),
                'comment' => "PO {$po->po_number} created",
            ]);

            return redirect()->route('procurement.show', $po)
                ->with('success', "Purchase order {$po->po_number} created from PR {$purchaseRequest->pr_number}");
        });
    }

    public function uploadReceipt(Request $request, PurchaseRequest $purchaseRequest)
    {
        $validated = $request->validate([
            'receipt' => 'required|file|max:10240',
            'invoice' => 'nullable|file|max:10240',
        ]);

        if (! $purchaseRequest->purchase_order_id) {
            return back()->withErrors(['error' => 'No PO linked to this PR']);
        }

        $po = $purchaseRequest->purchaseOrder;
        if ($po->status !== 'ordered') {
            return back()->withErrors(['error' => 'PO must be in ordered status']);
        }

        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store("pos/{$po->po_number}", 'public');
            $po->update(['receipt_path' => $path]);
        }

        if ($request->hasFile('invoice')) {
            $path = $request->file('invoice')->store("pos/{$po->po_number}", 'public');
            $po->update(['invoice_path' => $path]);
        }

        $po->update(['status' => 'purchased']);

        return back()->with('success', 'Receipt and invoice uploaded successfully');
    }

    public function inspect(Request $request, PurchaseRequest $purchaseRequest)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:purchase_order_items,id',
            'items.*.inspection_status' => 'required|in:accepted,rejected,partial',
            'items.*.accepted_qty' => 'required_if:items.*.inspection_status,partial|nullable|numeric|min:0',
            'items.*.inspection_notes' => 'nullable|string',
        ]);

        if (! $purchaseRequest->purchase_order_id) {
            return back()->withErrors(['error' => 'No PO linked to this PR']);
        }

        $po = $purchaseRequest->purchaseOrder;
        if ($po->status !== 'purchased') {
            return back()->withErrors(['error' => 'PO must be in purchased status to inspect']);
        }

        DB::transaction(function () use ($validated, $po) {
            foreach ($validated['items'] as $itemData) {
                $poItem = $po->items()->findOrFail($itemData['item_id']);
                $poItem->update([
                    'inspection_status' => $itemData['inspection_status'],
                    'accepted_qty' => $itemData['accepted_qty'] ?? $poItem->qty,
                    'inspection_notes' => $itemData['inspection_notes'] ?? null,
                ]);
            }

            $allAccepted = $po->items()->where('inspection_status', 'accepted')->count() === $po->items()->count();
            $anyRejected = $po->items()->where('inspection_status', 'rejected')->exists();
            $anyPartial = $po->items()->where('inspection_status', 'partial')->exists();

            if ($allAccepted) {
                $po->update(['status' => 'inspected']);
            } elseif ($anyRejected || $anyPartial) {
                // Keep as purchased, items have mixed results
            }
        });

        return back()->with('success', 'Inspection results saved');
    }

    public function closePo(PurchaseRequest $purchaseRequest)
    {
        if (! $purchaseRequest->purchase_order_id) {
            return back()->withErrors(['error' => 'No PO linked to this PR']);
        }

        $po = $purchaseRequest->purchaseOrder;
        if ($po->status !== 'inspected') {
            return back()->withErrors(['error' => 'PO must be inspected before closing']);
        }

        DB::transaction(function () use ($po) {
            foreach ($po->items as $item) {
                if ($item->product_id && $item->inspection_status === 'accepted') {
                    Stock::create([
                        'product_id' => $item->product_id,
                        'good_id' => null,
                        'supplier_id' => $po->supplier_id,
                        'qty_purchased' => $item->accepted_qty,
                        'price' => $item->unit_cost,
                        'total_cost' => $item->line_total,
                        'date_purchased' => now()->toDateString(),
                        'notes' => "Auto-created from PO {$po->po_number}",
                        'added_by' => auth()->user()->name,
                        'purchased_by' => auth()->user()->name,
                    ]);
                }
            }

            $po->update(['status' => 'closed']);
        });

        return back()->with('success', 'Purchase order closed and stock updated');
    }

    public function destroy(PurchaseRequest $purchaseRequest)
    {
        if (! in_array($purchaseRequest->status, ['draft', 'cancelled'])) {
            return back()->withErrors(['error' => 'Only draft or cancelled PRs can be deleted']);
        }

        $purchaseRequest->items()->each(function ($item) {
            $item->attachments()->delete();
        });
        $purchaseRequest->items()->delete();
        $purchaseRequest->history()->delete();
        $purchaseRequest->delete();

        return redirect()->route('procurement.purchase-requests.index')
            ->with('success', 'Purchase request deleted');
    }
}
