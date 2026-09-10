<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Performance;
use App\Models\UserNotificationPreference;
use App\Rules\EmailUniqueInTable;
use Carbon\Carbon;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user()->load(['role', 'employee.department', 'employee.staffLevel', 'employee.employmentType']);

        $notificationPreferences = UserNotificationPreference::getForUser($user->id);

        return Inertia::render('Profile/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->employee->avatar ?? null,
                'role' => $user->role ? [
                    'name' => $user->role->name,
                ] : null,
                'employee' => $user->employee ? [
                    'employee_number' => $user->employee->employee_number,
                    'first_name' => $user->employee->first_name,
                    'last_name' => $user->employee->last_name,
                    'email' => $user->employee->email,
                    'avatar' => $user->employee->avatar,
                    'job_title' => $user->employee->job_title,
                    'mobile_1' => $user->employee->mobile_1,
                    'mobile_2' => $user->employee->mobile_2,
                    'date_hired' => $user->employee->date_hired?->format('Y-m-d'),
                    'department' => $user->employee->department ? [
                        'name' => $user->employee->department->name,
                    ] : null,
                    'staff_level' => $user->employee->staffLevel ? [
                        'name' => $user->employee->staffLevel->name,
                    ] : null,
                    'employment_type' => $user->employee->employmentType ? [
                        'name' => $user->employee->employmentType->name,
                    ] : null,
                ] : null,
                'notification_preferences' => [
                    'procurement' => $notificationPreferences->procurement,
                    'orders' => $notificationPreferences->orders,
                    'inventory' => $notificationPreferences->inventory,
                    'hrm' => $notificationPreferences->hrm,
                    'chat_messages' => $notificationPreferences->chat_messages,
                ],
            ],
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email,'.$request->user()->id,
                new EmailUniqueInTable('employees', $request->user()->employee_id),
            ],
            'avatar' => 'nullable|image|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $employee = $user->employee;
            if ($employee) {
                if ($employee->avatar) {
                    Storage::disk('public')->delete($employee->avatar);
                }
                $employee->update(['avatar' => $request->file('avatar')->store('avatars', 'public')]);
            }
        }

        if (array_key_exists('email', $validated) && $validated['email'] !== $user->email) {
            $user->email_verified_at = null;
        }

        $user->fill(collect($validated)->only('name', 'email')->toArray());
        $user->save();

        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
    }

    public function updateNotificationPreferences(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'procurement' => 'boolean',
            'orders' => 'boolean',
            'inventory' => 'boolean',
            'hrm' => 'boolean',
            'chat_messages' => 'boolean',
        ]);

        UserNotificationPreference::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return Redirect::route('profile.edit')->with('success', 'Notification preferences updated.');
    }

    public function employeeDetails(Request $request): Response
    {
        $employee = $request->user()->employee()
            ->with(['department', 'staffLevel', 'employmentType', 'supervisingManager'])
            ->first();

        return Inertia::render('Profile/EmployeeDetails', [
            'employee' => $employee,
        ]);
    }

    public function leave(Request $request): Response
    {
        $employee = $request->user()->employee;

        $leaveTypes = $employee
            ? LeaveType::where('staff_level_id', $employee->staff_level_id)->orderBy('name')->get()
            : collect();

        $leaveRequests = $employee
            ? LeaveRequest::with('leaveType')->where('employee_id', $employee->id)->orderBy('created_at', 'desc')->paginate(15)
            : null;

        $year = Carbon::now()->year;
        $approvedThisYear = $employee
            ? LeaveRequest::where('employee_id', $employee->id)
                ->where('status', 'approved')
                ->whereYear('start_date', $year)
                ->get()
                ->groupBy('leave_type_id')
                ->map(fn ($requests) => (float) $requests->sum('days_count'))
            : collect();

        $balance = $leaveTypes->map(fn ($lt) => [
            'id' => $lt->id,
            'name' => $lt->name,
            'days_per_year' => $lt->days_per_year,
            'used' => $approvedThisYear->get($lt->id, 0),
            'remaining' => max(0, $lt->days_per_year - $approvedThisYear->get($lt->id, 0)),
        ]);

        return Inertia::render('Profile/Leave', [
            'hasEmployeeRecord' => (bool) $employee,
            'leaveTypes' => $leaveTypes,
            'leaveRequests' => $leaveRequests,
            'balance' => $balance,
        ]);
    }

    public function storeLeave(Request $request): RedirectResponse
    {
        $employee = $request->user()->employee;

        if (! $employee) {
            return back()->withErrors(['leave_type_id' => 'No employee record is linked to your account.']);
        }

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);

        if ($leaveType->staff_level_id !== $employee->staff_level_id) {
            return back()->withErrors(['leave_type_id' => 'This leave type does not apply to your staff level.']);
        }

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);

        LeaveRequest::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'leave_type' => strtolower($leaveType->name),
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'] ?? null,
            'days_count' => $start->diffInDays($end) + 1,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Leave request submitted successfully');
    }

    public function performance(Request $request): Response
    {
        $employee = $request->user()->employee;

        $reviews = $employee
            ? Performance::where('employee_id', $employee->id)->orderBy('review_date', 'desc')->paginate(15)
            : null;

        return Inertia::render('Profile/Performance', [
            'hasEmployeeRecord' => (bool) $employee,
            'reviews' => $reviews,
        ]);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
