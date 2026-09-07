<?php

namespace App\Http\Controllers;

use App\Models\OfficeIssueReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OfficeIssueReportController extends Controller
{
    private function canReview(): bool
    {
        return Auth::user()->hasRole('admin')
            || Auth::user()->hasRole('md')
            || Auth::user()->hasPermission('hrm.manage_employees');
    }

    public function create()
    {
        return inertia('Profile/ReportIssue', [
            'categories' => OfficeIssueReport::CATEGORIES,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|in:'.implode(',', OfficeIssueReport::CATEGORIES),
            'location' => 'nullable|string|max:255',
            'description' => 'required|string|max:5000',
        ]);

        // No submitter identity is captured anywhere in this request handling —
        // the report is anonymous at the data level, not just hidden in the UI.
        OfficeIssueReport::create($validated);

        return back()->with('success', 'Report submitted. Thank you — it has been sent for review anonymously.');
    }

    public function index()
    {
        if (! $this->canReview()) {
            abort(403, 'You are not authorized to view office issue reports.');
        }

        $reports = OfficeIssueReport::orderBy('created_at', 'desc')->paginate(20);

        return inertia('HRM/IssueReports/Index', [
            'reports' => $reports,
        ]);
    }

    public function updateStatus(Request $request, OfficeIssueReport $officeIssueReport)
    {
        if (! $this->canReview()) {
            abort(403, 'You are not authorized to update office issue reports.');
        }

        $validated = $request->validate([
            'status' => 'required|in:'.implode(',', OfficeIssueReport::STATUSES),
            'admin_notes' => 'nullable|string|max:5000',
        ]);

        $officeIssueReport->update($validated);

        return back()->with('success', 'Report updated');
    }
}
