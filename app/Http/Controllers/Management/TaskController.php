<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['assignees', 'createdBy'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('frequency')) {
            $query->where('frequency', $request->frequency);
        }

        $tasks = $query->paginate(20)->withQueryString();

        return inertia('Management/Tasks/Index', [
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'frequency']),
        ]);
    }

    public function create()
    {
        return inertia('Management/Tasks/Create', [
            'employees' => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'frequency' => 'required|in:'.implode(',', Task::FREQUENCIES),
            'priority' => 'required|in:'.implode(',', Task::PRIORITIES),
            'assignee_ids' => 'required|array|min:1',
            'assignee_ids.*' => 'exists:users,id',
        ]);

        $task = Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'deadline' => $validated['deadline'] ?? null,
            'frequency' => $validated['frequency'],
            'priority' => $validated['priority'],
            'status' => 'open',
            'created_by' => auth()->id(),
        ]);

        $task->assignees()->attach($validated['assignee_ids']);

        return redirect()->route('management.tasks.show', $task)->with('success', 'Task created successfully');
    }

    public function show(Task $task)
    {
        $task->load(['assignees', 'createdBy', 'closedBy', 'progressUpdates.user']);

        return inertia('Management/Tasks/Show', ['task' => $task]);
    }

    public function edit(Task $task)
    {
        $task->load('assignees');

        return inertia('Management/Tasks/Edit', [
            'task' => $task,
            'employees' => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'frequency' => 'required|in:'.implode(',', Task::FREQUENCIES),
            'priority' => 'required|in:'.implode(',', Task::PRIORITIES),
            'assignee_ids' => 'required|array|min:1',
            'assignee_ids.*' => 'exists:users,id',
        ]);

        $task->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'deadline' => $validated['deadline'] ?? null,
            'frequency' => $validated['frequency'],
            'priority' => $validated['priority'],
        ]);

        $task->assignees()->sync($validated['assignee_ids']);

        return redirect()->route('management.tasks.show', $task)->with('success', 'Task updated successfully');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->route('management.tasks.index')->with('success', 'Task deleted');
    }

    public function close(Task $task)
    {
        $task->update([
            'status' => 'closed',
            'closed_by' => auth()->id(),
            'closed_at' => now(),
        ]);

        return back()->with('success', 'Task closed');
    }

    public function reopen(Task $task)
    {
        $task->update([
            'status' => 'open',
            'closed_by' => null,
            'closed_at' => null,
        ]);

        return back()->with('success', 'Task reopened');
    }
}
