<?php

namespace App\Http\Controllers;

use App\Models\JobStatusHistory;
use App\Models\ProductionJob;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    public function index()
    {
        $jobs = ProductionJob::with(['assignedTo', 'order'])
            ->orderBy('created_at', 'desc')
            ->get();

        $users = User::where('is_active', true)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return inertia('Production/Index', [
            'jobs' => $jobs,
            'users' => $users,
        ]);
    }

    public function create()
    {
        return inertia('Production/Create');
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

        return back()->with('success', 'Job created successfully');
    }

    public function show(ProductionJob $job)
    {
        $job->load(['assignedTo', 'order', 'tasks', 'materials.product', 'statusHistory.changedBy']);

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

        return redirect()->route('production.show', $job->id)->with('success', 'Job updated successfully');
    }

    public function updateStatus(Request $request, ProductionJob $job): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:'.implode(',', ProductionJob::ALL_STATUSES),
            'notes' => 'nullable|string|max:500',
        ]);

        $oldStatus = $job->status;
        $newStatus = $validated['status'];

        if ($oldStatus === $newStatus) {
            return response()->json(['message' => 'Status unchanged'], 200);
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

        $job->load(['assignedTo', 'order']);

        return response()->json([
            'message' => 'Status updated',
            'job' => $job,
        ]);
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
