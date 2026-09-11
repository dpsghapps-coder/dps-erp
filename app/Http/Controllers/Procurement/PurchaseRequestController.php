<?php

namespace App\Http\Controllers\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\InventoryProduct;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRequestHistory;
use App\Models\Setting;
use App\Models\Stock;
use App\Models\Supplier;
use App\Models\User;
use App\Notifications\PurchaseRequestNotification;
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
        } elseif ($user->hasPermission('pr.finance.review')) {
            // Finance sees dept_approved + their own
            $query->where(function ($q) use ($user) {
                $q->where('status', 'dept_approved')
                    ->orWhere('requester_id', $user->id);
            });
        } elseif ($user->hasPermission('pr.approve')) {
            // Managers see PRs from anyone in their reporting chain (at any depth), + their own
            $employeeId = $user->employee?->id;
            $subordinateIds = $employeeId ? $this->subordinateEmployeeIds($employeeId) : [];
            $query->where(function ($q) use ($user, $subordinateIds) {
                $q->where('requester_id', $user->id);
                if ($subordinateIds) {
                    $q->orWhereHas('requester.employee', fn ($q2) => $q2->whereIn('id', $subordinateIds));
                }
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
            'products' => InventoryProduct::where('item_status', 'Active')
                ->with(['prices' => fn ($q) => $q->with('supplier:id,company_name')->orderByDesc('collection_date')])
                ->get(),
            'suppliers' => Supplier::where('is_active', true)->get(),
            'users' => User::all(),
            'departments' => Department::where('is_active', true)->orderBy('name')->pluck('name'),
            'uoms' => Setting::where('key', 'like', 'uom_%')->pluck('value'),
            'costTypes' => Setting::where('key', 'like', 'extra_cost_%')->pluck('value'),
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
            'items.*.item_description' => 'nullable|string',
            'items.*.product_id' => 'required|uuid|exists:inventory_products,id',
            'items.*.estimated_cost' => 'required|numeric|min:0',
            'items.*.qty_requested' => 'required|numeric|min:0.01',
            'items.*.cost_items' => 'nullable|array',
            'items.*.cost_items.*.label' => 'required|string|max:100',
            'items.*.cost_items.*.amount' => 'required|numeric|min:0',
            'items.*.attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,gif,pdf,doc,docx|max:10240',
        ]);

        $user = $request->user();
        $deptManager = $this->nearestApprovingManager($user->employee);

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

            foreach ($validated['items'] as $index => $itemData) {
                $product = InventoryProduct::findOrFail($itemData['product_id']);

                $item = $pr->items()->create([
                    'item_name' => $product->item_name,
                    'item_description' => $itemData['item_description'] ?? null,
                    'product_id' => $product->id,
                    'estimated_cost' => $itemData['estimated_cost'],
                    'qty_requested' => $itemData['qty_requested'],
                    'uom' => $product->uom,
                ]);

                foreach ($itemData['cost_items'] ?? [] as $costItem) {
                    $item->costItems()->create($costItem);
                }

                if ($request->hasFile("items.{$index}.attachments")) {
                    foreach ($request->file("items.{$index}.attachments") as $file) {
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
            'items.costItems',
            'history.user',
        ]);

        return inertia('Procurement/PurchaseRequests/Show', [
            'purchaseRequest' => $purchaseRequest,
        ]);
    }

    /**
     * All employee ids anywhere below $managerEmployeeId in the reporting
     * chain (Employee.supervising_manager_id), at any depth -- not just
     * direct reports. A senior staffer with no approval permission can sit
     * between an intern and their department manager without breaking the
     * manager's ability to review the intern's PRs.
     */
    private function subordinateEmployeeIds(int $managerEmployeeId): array
    {
        $childrenOf = [];
        foreach (Employee::whereNotNull('supervising_manager_id')->pluck('supervising_manager_id', 'id') as $employeeId => $managerId) {
            $childrenOf[$managerId][] = $employeeId;
        }

        $result = [];
        $queue = $childrenOf[$managerEmployeeId] ?? [];
        while ($queue) {
            $id = array_shift($queue);
            if (in_array($id, $result, true)) {
                continue; // cycle guard
            }
            $result[] = $id;
            foreach ($childrenOf[$id] ?? [] as $childId) {
                $queue[] = $childId;
            }
        }

        return $result;
    }

    /**
     * True when $user sits anywhere above the PR's requester in the
     * reporting chain -- their direct manager, or that manager's manager,
     * and so on -- per Employee.supervising_manager_id.
     */
    private function isInManagementChainOf(PurchaseRequest $purchaseRequest, User $user): bool
    {
        $reviewerEmployeeId = $user->employee?->id;
        $requesterEmployeeId = $purchaseRequest->requester?->employee?->id;

        if (! $reviewerEmployeeId || ! $requesterEmployeeId) {
            return false;
        }

        return in_array($requesterEmployeeId, $this->subordinateEmployeeIds($reviewerEmployeeId), true);
    }

    /**
     * Walk up the requester's reporting chain and return the nearest
     * ancestor who actually holds pr.approve -- so a PR still routes to a
     * real approver even when the requester's immediate supervisor doesn't
     * have approval rights themselves.
     */
    private function nearestApprovingManager(?Employee $employee): ?User
    {
        $current = $employee?->supervisingManager;
        $guard = 0;

        while ($current && $guard < 20) {
            if ($current->user && $current->user->hasPermission('pr.approve')) {
                return $current->user;
            }
            $current = $current->supervisingManager;
            $guard++;
        }

        return null;
    }

    private function canManagePr(PurchaseRequest $purchaseRequest, User $user): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($purchaseRequest->requester_id === $user->id) {
            return in_array($purchaseRequest->status, ['draft', 'queried']);
        }

        if ($user->hasPermission('pr.approve') && $this->isInManagementChainOf($purchaseRequest, $user)) {
            return in_array($purchaseRequest->status, ['pending', 'queried']);
        }

        if ($user->hasPermission('pr.finance.review')) {
            return $purchaseRequest->status === 'dept_approved';
        }

        return false;
    }

    public function edit(PurchaseRequest $purchaseRequest)
    {
        $user = auth()->user();
        if (! $this->canManagePr($purchaseRequest, $user)) {
            abort(403, 'You do not have permission to edit this purchase request');
        }

        $purchaseRequest->load(['items.attachments', 'items.product', 'items.costItems']);

        return inertia('Procurement/PurchaseRequests/Edit', [
            'purchaseRequest' => $purchaseRequest,
            'products' => InventoryProduct::where('item_status', 'Active')
                ->with(['prices' => fn ($q) => $q->with('supplier:id,company_name')->orderByDesc('collection_date')])
                ->get(),
            'departments' => Department::where('is_active', true)->orderBy('name')->pluck('name'),
            'uoms' => Setting::where('key', 'like', 'uom_%')->pluck('value'),
            'costTypes' => Setting::where('key', 'like', 'extra_cost_%')->pluck('value'),
        ]);
    }

    public function update(Request $request, PurchaseRequest $purchaseRequest)
    {
        $user = $request->user();
        if (! $this->canManagePr($purchaseRequest, $user)) {
            abort(403, 'You do not have permission to update this purchase request');
        }

        $departmentNames = Department::where('is_active', true)->pluck('name')->toArray();
        $deptValidation = $departmentNames ? 'in:'.implode(',', $departmentNames) : 'nullable';

        $validated = $request->validate([
            'department' => 'required|string|'.$deptValidation,
            'priority' => 'required|in:Low,Normal,High,Emergency',
            'required_by_date' => 'nullable|date|after:today',
            'purpose' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_description' => 'nullable|string',
            'items.*.product_id' => 'required|uuid|exists:inventory_products,id',
            'items.*.estimated_cost' => 'required|numeric|min:0',
            'items.*.qty_requested' => 'required|numeric|min:0.01',
            'items.*.cost_items' => 'nullable|array',
            'items.*.cost_items.*.label' => 'required|string|max:100',
            'items.*.cost_items.*.amount' => 'required|numeric|min:0',
            'items.*.attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,gif,pdf,doc,docx|max:10240',
        ]);

        DB::transaction(function () use ($validated, $purchaseRequest, $request, $user) {
            $wasQueried = $purchaseRequest->status === 'queried';
            $isRequester = $purchaseRequest->requester_id === $user->id;

            $purchaseRequest->update([
                'department' => $validated['department'],
                'priority' => $validated['priority'],
                'required_by_date' => $validated['required_by_date'] ?? null,
                'purpose' => $validated['purpose'] ?? null,
            ]);

            $purchaseRequest->items()->delete();

            foreach ($validated['items'] as $index => $itemData) {
                $product = InventoryProduct::findOrFail($itemData['product_id']);

                $item = $purchaseRequest->items()->create([
                    'item_name' => $product->item_name,
                    'item_description' => $itemData['item_description'] ?? null,
                    'product_id' => $product->id,
                    'estimated_cost' => $itemData['estimated_cost'],
                    'qty_requested' => $itemData['qty_requested'],
                    'uom' => $product->uom,
                ]);

                foreach ($itemData['cost_items'] ?? [] as $costItem) {
                    $item->costItems()->create($costItem);
                }

                if ($request->hasFile("items.{$index}.attachments")) {
                    foreach ($request->file("items.{$index}.attachments") as $file) {
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

            if ($wasQueried && $isRequester) {
                $purchaseRequest->update(['status' => 'pending']);
                PurchaseRequestHistory::create([
                    'purchase_request_id' => $purchaseRequest->id,
                    'status' => 'pending',
                    'changed_by' => $user->id,
                    'comment' => 'PR updated after query, resubmitted',
                ]);
            } elseif (! $isRequester) {
                PurchaseRequestHistory::create([
                    'purchase_request_id' => $purchaseRequest->id,
                    'status' => $purchaseRequest->status,
                    'changed_by' => $user->id,
                    'comment' => 'PR details edited by reviewer',
                ]);
            }
        });

        return redirect()->route('procurement.purchase-requests.show', $purchaseRequest)
            ->with('success', 'Purchase request updated successfully');
    }

    public function submit(PurchaseRequest $purchaseRequest)
    {
        $user = auth()->user();
        if ($purchaseRequest->requester_id !== $user->id && ! $user->hasRole('admin')) {
            return back()->withErrors(['error' => 'You do not have permission to submit this purchase request']);
        }

        if ($purchaseRequest->status !== 'draft') {
            return back()->withErrors(['error' => 'Only draft PRs can be submitted']);
        }

        DB::transaction(function () use ($purchaseRequest) {
            $purchaseRequest->update(['status' => 'pending']);
            PurchaseRequestHistory::create([
                'purchase_request_id' => $purchaseRequest->id,
                'status' => 'pending',
                'changed_by' => auth()->id(),
                'comment' => 'PR submitted for review',
            ]);
        });

        $manager = $this->nearestApprovingManager($purchaseRequest->requester?->employee);
        if ($manager) {
            $manager->notify(new PurchaseRequestNotification($purchaseRequest, 'submitted'));
        }

        return back()->with('success', 'Purchase request submitted for review');
    }

    public function deptReview(Request $request, PurchaseRequest $purchaseRequest)
    {
        $user = $request->user();
        $canReview = $user->hasRole('admin') || $user->hasRole('md') || $user->hasRole('general')
            || ($user->hasPermission('pr.approve') && (
                $this->isInManagementChainOf($purchaseRequest, $user)
                || $purchaseRequest->requester_id === $user->id
            ));

        if (! $canReview) {
            return back()->withErrors(['error' => 'You do not have permission to review this purchase request']);
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'comment' => 'nullable|string',
        ]);

        if (! in_array($purchaseRequest->status, ['pending', 'queried'])) {
            return back()->withErrors(['error' => 'PR is not pending department review']);
        }

        $newStatus = match ($validated['action']) {
            'approve' => 'dept_approved',
            'reject' => 'rejected',
        };

        DB::transaction(function () use ($purchaseRequest, $newStatus, $validated) {
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
        });

        $purchaseRequest->requester?->notify(new PurchaseRequestNotification($purchaseRequest, $newStatus === 'dept_approved' ? 'approved' : $newStatus));

        return back()->with('success', "Purchase request {$validated['action']}d successfully");
    }

    public function financeReview(Request $request, PurchaseRequest $purchaseRequest)
    {
        if (! $request->user()->hasPermission('pr.finance.review')) {
            return back()->withErrors(['error' => 'You do not have permission to perform finance review']);
        }

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

        DB::transaction(function () use ($purchaseRequest, $newStatus, $validated) {
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
        });

        $purchaseRequest->requester?->notify(new PurchaseRequestNotification($purchaseRequest, $newStatus === 'finance_approved' ? 'approved' : $newStatus));

        return back()->with('success', "Purchase request {$validated['action']}d successfully");
    }

    public function cancel(PurchaseRequest $purchaseRequest)
    {
        $user = auth()->user();
        $canCancel = $purchaseRequest->requester_id === $user->id
            || $user->hasPermission('pr.approve')
            || $user->hasPermission('pr.finance.review');

        if (! $canCancel) {
            return back()->withErrors(['error' => 'You do not have permission to cancel this PR']);
        }

        if (in_array($purchaseRequest->status, ['cancelled', 'po_created'])) {
            return back()->withErrors(['error' => 'Cannot cancel this PR']);
        }

        DB::transaction(function () use ($purchaseRequest, $user) {
            $purchaseRequest->update(['status' => 'cancelled']);
            PurchaseRequestHistory::create([
                'purchase_request_id' => $purchaseRequest->id,
                'status' => 'cancelled',
                'changed_by' => $user->id,
                'comment' => 'PR cancelled',
            ]);
        });

        if ($purchaseRequest->requester && $purchaseRequest->requester->id !== $user->id) {
            $purchaseRequest->requester->notify(new PurchaseRequestNotification($purchaseRequest, 'cancelled'));
        }

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
            'expected_date' => 'nullable|date|after_or_equal:today',
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
        if (! $request->user()->hasPermission('procurement.inspect')) {
            return back()->withErrors(['error' => 'You do not have permission to inspect this purchase order']);
        }

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
                $acceptedQty = match ($itemData['inspection_status']) {
                    'rejected' => 0,
                    default => $itemData['accepted_qty'] ?? $poItem->qty,
                };
                $poItem->update([
                    'inspection_status' => $itemData['inspection_status'],
                    'accepted_qty' => $acceptedQty,
                    'inspection_notes' => $itemData['inspection_notes'] ?? null,
                ]);
            }

            $allInspected = $po->items()->whereNull('inspection_status')->doesntExist();

            if ($allInspected) {
                $po->update(['status' => 'inspected']);
            }
        });

        return back()->with('success', 'Inspection results saved');
    }

    public function closePo(PurchaseRequest $purchaseRequest)
    {
        if (! auth()->user()->hasPermission('procurement.close')) {
            return back()->withErrors(['error' => 'You do not have permission to close this purchase order']);
        }

        if (! $purchaseRequest->purchase_order_id) {
            return back()->withErrors(['error' => 'No PO linked to this PR']);
        }

        $po = $purchaseRequest->purchaseOrder;
        if ($po->status !== 'inspected') {
            return back()->withErrors(['error' => 'PO must be inspected before closing']);
        }

        DB::transaction(function () use ($po) {
            foreach ($po->items as $item) {
                if ($item->product_id
                    && in_array($item->inspection_status, ['accepted', 'partial'])
                    && $item->accepted_qty > 0
                    && ! Stock::alreadyPulledFor($item)
                ) {
                    Stock::fromPurchaseOrderItem($item, $po, (float) $item->accepted_qty)->save();
                }
            }

            $po->update(['status' => 'closed', 'stock_pulled_at' => $po->stock_pulled_at ?? now()]);
        });

        return back()->with('success', 'Purchase order closed and stock updated');
    }

    public function destroy(PurchaseRequest $purchaseRequest)
    {
        $user = auth()->user();
        if ($purchaseRequest->requester_id !== $user->id && ! $user->hasRole('admin')) {
            abort(403, 'You do not have permission to delete this purchase request');
        }

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
