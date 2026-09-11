<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Performance;
use App\Models\User;
use App\Notifications\HrmNotification;
use Illuminate\Http\Request;

class PerformanceReviewController extends Controller
{
    private function isPerformanceHr($user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('md') || $user->hasPermission('hrm.manage_performance');
    }

    private function canView(Performance $performance, $user): bool
    {
        if ($this->isPerformanceHr($user)) {
            return true;
        }

        $employee = $user->employee;
        if (! $employee) {
            return false;
        }

        return $performance->employee_id === $employee->id
            || $performance->supervisor_employee_id === $employee->id
            || $performance->manager_employee_id === $employee->id;
    }

    private function notifyHr(Performance $performance): void
    {
        $hrUsers = User::whereHas('role.permissions', fn ($q) => $q->where('name', 'hrm.manage_performance'))->get();

        foreach ($hrUsers as $hrUser) {
            $hrUser->notify(new HrmNotification(
                'performance_hr_review',
                $performance->employee?->full_name,
                $performance->employee_id,
                url: "/hrm/performance/{$performance->id}"
            ));
        }
    }

    public function initiate(Request $request)
    {
        if (! $this->isPerformanceHr($request->user())) {
            abort(403, 'You are not authorized to initiate performance reviews.');
        }

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'period' => 'required|string|max:100',
        ]);

        $performance = Performance::create([
            'employee_id' => $validated['employee_id'],
            'period' => $validated['period'],
            'review_date' => now(),
            'status' => 'self_assessment',
            'initiated_by' => $request->user()->id,
        ]);

        $employee = $performance->employee;
        if ($employee?->user) {
            $employee->user->notify(new HrmNotification(
                'performance_initiated',
                $employee->full_name,
                $employee->id,
                url: "/hrm/performance/{$performance->id}"
            ));
        }

        return back()->with('success', 'Performance review initiated');
    }

    public function show(Performance $performance)
    {
        $user = auth()->user();
        if (! $this->canView($performance, $user)) {
            abort(403, 'You do not have permission to view this performance review');
        }

        $performance->load([
            'employee.department',
            'employee.staffLevel',
            'initiatedBy',
            'supervisorEmployee',
            'managerEmployee',
            'hrUser',
        ]);

        $employee = $user->employee;

        return inertia('HRM/PerformanceReview/Show', [
            'review' => $performance,
            'viewerRoles' => [
                'isSelf' => (bool) $employee && $performance->employee_id === $employee->id,
                'isSupervisor' => (bool) $employee && $performance->supervisor_employee_id === $employee->id,
                'isManager' => (bool) $employee && $performance->manager_employee_id === $employee->id,
                'isHr' => $this->isPerformanceHr($user),
            ],
        ]);
    }

    public function submitSelfAssessment(Request $request, Performance $performance)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (! $employee || $performance->employee_id !== $employee->id) {
            abort(403, 'You are not authorized to complete this self-assessment');
        }

        if ($performance->status !== 'self_assessment') {
            return back()->withErrors(['error' => 'This review is not awaiting your self-assessment']);
        }

        $validated = $request->validate([
            'self_rating' => 'required|integer|min:1|max:5',
            'achievements' => 'nullable|string',
            'goals' => 'nullable|string',
            'self_comments' => 'nullable|string',
        ]);

        $supervisorEmployee = $employee->supervisingManager;

        $performance->update([
            ...$validated,
            'self_submitted_at' => now(),
            'supervisor_employee_id' => $supervisorEmployee?->id,
            'status' => $supervisorEmployee ? 'supervisor_review' : 'hr_review',
        ]);

        if ($supervisorEmployee?->user) {
            $supervisorEmployee->user->notify(new HrmNotification(
                'performance_self_submitted',
                $employee->full_name,
                $employee->id,
                url: "/hrm/performance/{$performance->id}"
            ));
        } elseif (! $supervisorEmployee) {
            $this->notifyHr($performance);
        }

        return back()->with('success', 'Self-assessment submitted');
    }

    public function submitSupervisorReview(Request $request, Performance $performance)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (! $employee || $performance->supervisor_employee_id !== $employee->id) {
            abort(403, 'You are not authorized to review this performance review');
        }

        if ($performance->status !== 'supervisor_review') {
            return back()->withErrors(['error' => 'This review is not awaiting supervisor input']);
        }

        $validated = $request->validate([
            'supervisor_rating' => 'required|integer|min:1|max:5',
            'supervisor_comments' => 'nullable|string',
        ]);

        $managerEmployee = $employee->supervisingManager;

        $performance->update([
            ...$validated,
            'supervisor_submitted_at' => now(),
            'manager_employee_id' => $managerEmployee?->id,
            'status' => $managerEmployee ? 'manager_review' : 'hr_review',
        ]);

        if ($managerEmployee?->user) {
            $managerEmployee->user->notify(new HrmNotification(
                'performance_manager_review',
                $performance->employee?->full_name,
                $performance->employee_id,
                url: "/hrm/performance/{$performance->id}"
            ));
        } elseif (! $managerEmployee) {
            $this->notifyHr($performance);
        }

        return back()->with('success', 'Review submitted');
    }

    public function submitManagerReview(Request $request, Performance $performance)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (! $employee || $performance->manager_employee_id !== $employee->id) {
            abort(403, 'You are not authorized to review this performance review');
        }

        if ($performance->status !== 'manager_review') {
            return back()->withErrors(['error' => 'This review is not awaiting manager input']);
        }

        $validated = $request->validate([
            'manager_comments' => 'nullable|string',
        ]);

        $performance->update([
            ...$validated,
            'manager_submitted_at' => now(),
            'status' => 'hr_review',
        ]);

        $this->notifyHr($performance);

        return back()->with('success', 'Review submitted');
    }

    public function submitHrReview(Request $request, Performance $performance)
    {
        $user = $request->user();

        if (! $this->isPerformanceHr($user)) {
            abort(403, 'You are not authorized to complete this performance review');
        }

        if ($performance->status !== 'hr_review') {
            return back()->withErrors(['error' => 'This review is not awaiting HR comments']);
        }

        $validated = $request->validate([
            'hr_comments' => 'nullable|string',
        ]);

        $performance->update([
            ...$validated,
            'hr_user_id' => $user->id,
            'hr_submitted_at' => now(),
            'status' => 'completed',
        ]);

        $employee = $performance->employee;
        if ($employee?->user) {
            $employee->user->notify(new HrmNotification(
                'performance_completed',
                $employee->full_name,
                $employee->id,
                url: "/hrm/performance/{$performance->id}"
            ));
        }

        return back()->with('success', 'Performance review completed');
    }
}
