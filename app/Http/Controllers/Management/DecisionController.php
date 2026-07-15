<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Models\Decision;
use App\Models\DecisionCategory;
use App\Models\User;
use Illuminate\Http\Request;

class DecisionController extends Controller
{
    public function index()
    {
        $decisions = Decision::with(['category', 'approvedBy', 'createdBy', 'actionItems'])
            ->orderByDesc('created_at')
            ->paginate(20);

        $categories = DecisionCategory::orderBy('name')->get();

        return inertia('Management/Decisions/Index', [
            'decisions' => $decisions,
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        $categories = DecisionCategory::orderBy('name')->get();
        $employees = User::where('is_active', true)->orderBy('name')->get();

        return inertia('Management/Decisions/Create', [
            'categories' => $categories,
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'reason' => 'required|string',
            'expected_benefits' => 'nullable|string',
            'priority' => 'required|in:critical,high,medium,low',
            'budget' => 'nullable|numeric|min:0',
            'category_id' => 'nullable|exists:decision_categories,id',
            'approved_by' => 'nullable|exists:users,id',
            'meeting_id' => 'nullable|exists:meetings,id',
            'agenda_id' => 'nullable|exists:meeting_agendas,id',
        ]);

        $decision = Decision::create([
            'number' => Decision::nextNumber(),
            'title' => $validated['title'],
            'reason' => $validated['reason'],
            'expected_benefits' => $validated['expected_benefits'] ?? null,
            'priority' => $validated['priority'],
            'budget' => $validated['budget'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'approved_by' => $validated['approved_by'] ?? null,
            'meeting_id' => $validated['meeting_id'] ?? null,
            'agenda_id' => $validated['agenda_id'] ?? null,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('management.decisions.show', $decision)->with('success', 'Decision created successfully');
    }

    public function show(Decision $decision)
    {
        $decision->load([
            'category', 'approvedBy', 'createdBy', 'meeting',
            'actionItems.assignedTo', 'actionItems.updates.createdBy',
            'review.reviewedBy', 'attachments.createdBy',
        ]);

        $employees = User::where('is_active', true)->orderBy('name')->get();

        return inertia('Management/Decisions/Show', [
            'decision' => $decision,
            'employees' => $employees,
        ]);
    }

    public function edit(Decision $decision)
    {
        $categories = DecisionCategory::orderBy('name')->get();
        $employees = User::where('is_active', true)->orderBy('name')->get();

        return inertia('Management/Decisions/Edit', [
            'decision' => $decision,
            'categories' => $categories,
            'employees' => $employees,
        ]);
    }

    public function update(Request $request, Decision $decision)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'reason' => 'required|string',
            'expected_benefits' => 'nullable|string',
            'priority' => 'required|in:critical,high,medium,low',
            'budget' => 'nullable|numeric|min:0',
            'category_id' => 'nullable|exists:decision_categories,id',
            'approved_by' => 'nullable|exists:users,id',
        ]);

        $decision->update($validated);

        return redirect()->route('management.decisions.show', $decision)->with('success', 'Decision updated successfully');
    }

    public function updateStatus(Request $request, Decision $decision)
    {
        $validated = $request->validate([
            'status' => 'required|in:'.implode(',', Decision::STATUSES),
        ]);

        $decision->update(['status' => $validated['status']]);

        return back()->with('success', 'Status updated');
    }

    public function destroy(Decision $decision)
    {
        $decision->update(['status' => 'cancelled']);

        return redirect()->route('management.decisions.index')->with('success', 'Decision cancelled');
    }
}
