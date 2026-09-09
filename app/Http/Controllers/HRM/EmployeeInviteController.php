<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeInvite;
use App\Models\EmploymentType;
use App\Models\LeaveType;
use App\Models\StaffLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmployeeInviteController extends Controller
{
    private function isHrmManager(): bool
    {
        return Auth::user()->hasRole('md') || Auth::user()->hasPermission('hrm.manage_employees');
    }

    private function authorizeManager(): void
    {
        if (! $this->isHrmManager()) {
            abort(403, 'You are not authorized to manage employee invites.');
        }
    }

    public function index()
    {
        $this->authorizeManager();

        $invites = EmployeeInvite::with('createdBy')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HRM/Invites', [
            'invites' => $invites,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeManager();

        $invite = EmployeeInvite::create([
            'token' => Str::random(48),
            'created_by' => Auth::id(),
            'expires_at' => now()->addDays(7),
        ]);

        return back()->with([
            'success' => 'Invite link created — it expires in 7 days.',
            'inviteLink' => url("/onboarding/{$invite->token}"),
        ]);
    }

    public function destroy(EmployeeInvite $invite)
    {
        $this->authorizeManager();

        if ($invite->avatar) {
            Storage::disk('public')->delete($invite->avatar);
        }

        $invite->delete();

        return back()->with('success', 'Invite revoked.');
    }

    public function review(EmployeeInvite $invite)
    {
        $this->authorizeManager();

        if ($invite->status !== 'submitted') {
            abort(404);
        }

        $nextNumber = (Employee::max('id') ?? 0) + 1;
        $employeeNumber = 'EMP'.str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        return inertia('HRM/Create', [
            'invite' => $invite,
            'departments' => Department::all(),
            'employmentTypes' => EmploymentType::all(),
            'staffLevels' => StaffLevel::orderBy('sort_order')->get(),
            'managers' => Employee::with('staffLevel')->whereHas('staffLevel', fn ($q) => $q->where('is_manager', true))->orderBy('first_name')->get(),
            'employeeNumber' => $employeeNumber,
        ]);
    }

    public function approve(Request $request, EmployeeInvite $invite)
    {
        $this->authorizeManager();

        if ($invite->status !== 'submitted') {
            abort(404);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees',
            'employee_number' => 'required|string|unique:employees',
            'department_id' => 'required|exists:departments,id',
            'staff_level_id' => 'nullable|exists:staff_levels,id',
            'supervising_manager_id' => 'nullable|exists:employees,id',
            'employment_type_id' => 'required|exists:employment_types,id',
            'job_title' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'mobile_1' => 'nullable|string|max:255',
            'mobile_2' => 'nullable|string|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:255',
            'emergency_contact_relation' => 'nullable|string|max:255',
            'pay_frequency' => 'nullable|string|in:weekly,bi_weekly,monthly',
            'date_hired' => 'required|date',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $validated['avatar'] = $request->hasFile('avatar')
            ? $request->file('avatar')->store('avatars', 'public')
            : $invite->avatar;

        $validated['leave_days'] = $validated['staff_level_id']
            ? (LeaveType::where('staff_level_id', $validated['staff_level_id'])->where('name', 'Annual')->value('days_per_year') ?? 0)
            : 0;

        $employee = Employee::create($validated);

        $invite->update([
            'approved_at' => now(),
            'approved_employee_id' => $employee->id,
        ]);

        return redirect()->route('hrm.employees')->with('success', 'Employee created from invite.');
    }
}
