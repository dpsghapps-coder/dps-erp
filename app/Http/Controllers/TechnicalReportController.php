<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\TechnicalReport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TechnicalReportController extends Controller
{
    public function create()
    {
        return inertia('Profile/TechnicalReport', [
            'categories' => TechnicalReport::CATEGORIES,
            'severities' => TechnicalReport::SEVERITIES,
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'myReports' => TechnicalReport::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|in:'.implode(',', TechnicalReport::CATEGORIES),
            'department_id' => 'nullable|exists:departments,id',
            'title' => 'required|string|max:255',
            'severity' => 'required|in:'.implode(',', TechnicalReport::SEVERITIES),
            'location' => 'nullable|string|max:255',
            'description' => 'required|string|max:5000',
        ]);

        $validated['user_id'] = Auth::id();

        TechnicalReport::create($validated);

        return back()->with('success', 'Technical report submitted. IT/Admin has been notified.');
    }

    public function index()
    {
        if (! Auth::user()->hasPermission('technical_reports.manage')) {
            abort(403, 'You are not authorized to view technical reports.');
        }

        $reports = TechnicalReport::with(['user:id,name', 'department:id,name', 'assignee:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return inertia('Admin/TechnicalReports/Index', [
            'reports' => $reports,
            'users' => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function updateStatus(Request $request, TechnicalReport $technicalReport)
    {
        if (! Auth::user()->hasPermission('technical_reports.manage')) {
            abort(403, 'You are not authorized to update technical reports.');
        }

        $validated = $request->validate([
            'status' => 'required|in:'.implode(',', TechnicalReport::STATUSES),
            'assigned_to' => 'nullable|exists:users,id',
            'resolution_notes' => 'nullable|string|max:5000',
        ]);

        $validated['resolved_at'] = in_array($validated['status'], ['resolved', 'closed'], true)
            ? ($technicalReport->resolved_at ?? now())
            : null;

        $technicalReport->update($validated);

        return back()->with('success', 'Technical report updated');
    }
}
