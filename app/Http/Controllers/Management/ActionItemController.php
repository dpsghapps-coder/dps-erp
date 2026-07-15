<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Models\ActionItemUpdate;
use App\Models\DecisionActionItem;
use Illuminate\Http\Request;

class ActionItemController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'decision_id' => 'required|exists:decisions,id',
            'description' => 'required|string',
            'assigned_to' => 'nullable|exists:users,id',
            'department' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'priority' => 'required|in:high,medium,low',
        ]);

        DecisionActionItem::create([
            'decision_id' => $validated['decision_id'],
            'description' => $validated['description'],
            'assigned_to' => $validated['assigned_to'] ?? null,
            'department' => $validated['department'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'priority' => $validated['priority'],
            'progress' => 0,
            'status' => 'pending',
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Action item added');
    }

    public function update(Request $request, DecisionActionItem $item)
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'assigned_to' => 'nullable|exists:users,id',
            'department' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:high,medium,low',
            'status' => 'required|in:pending,in_progress,completed,overdue',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $item->update($validated);

        return back()->with('success', 'Action item updated');
    }

    public function addUpdate(Request $request, DecisionActionItem $item)
    {
        $validated = $request->validate([
            'progress' => 'required|integer|min:0|max:100',
            'comment' => 'nullable|string|max:1000',
        ]);

        ActionItemUpdate::create([
            'action_item_id' => $item->id,
            'progress' => $validated['progress'],
            'comment' => $validated['comment'] ?? null,
            'created_by' => auth()->id(),
        ]);

        $newStatus = $validated['progress'] >= 100 ? 'completed' : ($validated['progress'] > 0 ? 'in_progress' : 'pending');
        $item->update(['progress' => $validated['progress'], 'status' => $newStatus]);

        return back()->with('success', 'Progress updated');
    }

    public function destroy(DecisionActionItem $item)
    {
        $item->delete();

        return back()->with('success', 'Action item deleted');
    }
}
