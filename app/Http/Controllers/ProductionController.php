<?php

namespace App\Http\Controllers;

use App\Models\JobStatusHistory;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductionJob;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ProductionController extends Controller
{
    public function index()
    {
        $jobs = ProductionJob::with(['assignedTo', 'materials.material', ...$this->orderDetailsForProduction()])
            ->orderBy('created_at', 'desc')
            ->get();

        $this->hideMoneyFromOrderItems($jobs);

        $users = User::where('is_active', true)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return inertia('Production/Index', [
            'jobs' => $jobs,
            'users' => $users,
            'orders' => $this->linkableOrders(),
        ]);
    }

    public function create()
    {
        return inertia('Production/Create', [
            'orders' => $this->linkableOrders(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order_id' => 'nullable|exists:orders,id',
            'priority' => 'required|in:low,normal,high,urgent',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:'.implode(',', ProductionJob::ALL_STATUSES),
        ]);

        $status = $validated['status'] ?? ProductionJob::STATUS_NEW_JOBS;
        unset($validated['status']);

        $job = ProductionJob::create(array_merge($validated, [
            'job_number' => ProductionJob::generateJobNumber(),
            'status' => $status,
        ]));

        JobStatusHistory::create([
            'production_job_id' => $job->id,
            'old_status' => null,
            'new_status' => $job->status,
            'changed_by' => auth()->id(),
            'notes' => 'Job created',
        ]);

        if ($job->order_id) {
            $job->populateMaterialsFromOrder($job->order);
            $job->order->syncStatusWithProduction();
        }

        return back()->with('success', 'Job created successfully');
    }

    private function linkableOrders()
    {
        return Order::whereNotIn('status', ['draft', 'cancelled'])
            ->with('client:id,company_name')
            ->orderByDesc('created_at')
            ->get(['id', 'order_number', 'client_id']);
    }

    /**
     * Eager-load specs for an order's production-relevant details, deliberately
     * excluding money fields (prices, totals, payment status) — production staff
     * need to know what to make and how many, not what it costs or was paid.
     */
    private function orderDetailsForProduction(): array
    {
        return [
            'order:id,order_number,client_id,status,delivery_date,notes,created_at',
            'order.client:id,company_name',
            'order.items:id,order_id,product_id,product_type,description,qty',
            'order.items.product' => fn (MorphTo $morphTo) => $morphTo->morphWith([
                Product::class => [],
                Service::class => [],
            ]),
        ];
    }

    /**
     * default_price/calculated_base_price are always-appended accessors on
     * Product/Service, so column selection above can't suppress them — hide
     * them explicitly to keep money out of what production staff see.
     */
    private function hideMoneyFromOrderItems(ProductionJob|Collection $jobs): void
    {
        $jobs = $jobs instanceof Collection ? $jobs : collect([$jobs]);

        $jobs->each(function (ProductionJob $job) {
            $job->order?->items?->each(function ($item) {
                $item->product?->makeHidden(['default_price', 'calculated_base_price']);
            });
        });
    }

    public function show(ProductionJob $job)
    {
        $job->load(['assignedTo', ...$this->orderDetailsForProduction(), 'tasks', 'materials.material', 'statusHistory.changedBy']);
        $this->hideMoneyFromOrderItems($job);

        return inertia('Production/Show', ['job' => $job]);
    }

    public function edit(ProductionJob $job)
    {
        return inertia('Production/Edit', ['job' => $job]);
    }

    public function update(Request $request, ProductionJob $job)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,normal,high,urgent',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'status' => 'required|in:'.implode(',', ProductionJob::ALL_STATUSES),
        ]);

        if ($validated['status'] === 'printing' && ! $job->started_at) {
            $validated['started_at'] = now();
        }

        if ($validated['status'] === 'completed' && ! $job->completed_at) {
            $validated['completed_at'] = now();
        }

        $job->update($validated);

        if ($job->order_id) {
            $job->order->syncStatusWithProduction();
        }

        return redirect()->route('production.show', $job->id)->with('success', 'Job updated successfully');
    }

    public function updateStatus(Request $request, ProductionJob $job)
    {
        $validated = $request->validate([
            'status' => 'required|in:'.implode(',', ProductionJob::ALL_STATUSES),
            'notes' => 'nullable|string|max:500',
        ]);

        $oldStatus = $job->status;
        $newStatus = $validated['status'];

        if ($oldStatus === $newStatus) {
            return back()->with('success', 'Status unchanged');
        }

        $updates = ['status' => $newStatus];

        if ($newStatus === 'printing' && ! $job->started_at) {
            $updates['started_at'] = now();
        }

        if ($newStatus === 'completed' && ! $job->completed_at) {
            $updates['completed_at'] = now();
        }

        $job->update($updates);

        JobStatusHistory::create([
            'production_job_id' => $job->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => auth()->id(),
            'notes' => $validated['notes'] ?? null,
        ]);

        if ($job->order_id) {
            $job->order->syncStatusWithProduction();
        }

        return back()->with('success', 'Status updated');
    }

    public function destroy(ProductionJob $job)
    {
        $oldStatus = $job->status;

        $job->update(['status' => ProductionJob::STATUS_CANCELLED]);

        JobStatusHistory::create([
            'production_job_id' => $job->id,
            'old_status' => $oldStatus,
            'new_status' => ProductionJob::STATUS_CANCELLED,
            'changed_by' => auth()->id(),
            'notes' => 'Job cancelled',
        ]);

        return back()->with('success', 'Job cancelled');
    }
}
