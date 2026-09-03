<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentType;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Notice;
use App\Models\Payroll;
use App\Models\Performance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class HrmController extends Controller
{
    public function index()
    {
        return redirect()->route('hrm.dashboard');
    }

    public function dashboard()
    {
        $today = Carbon::now()->toDateString();

        $stats = [
            'totalEmployees' => Employee::count(),
            'presentToday' => AttendanceLog::where('date', $today)->whereNotNull('check_in')->count(),
            'onLeave' => LeaveRequest::where('start_date', '<=', $today)
                ->where('end_date', '>=', $today)
                ->where('status', 'approved')
                ->count(),
            'pendingApprovals' => LeaveRequest::where('status', 'pending')->count(),
        ];

        $presentIds = AttendanceLog::where('date', $today)->whereNotNull('check_in')->pluck('employee_id');
        $onLeaveIds = LeaveRequest::where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->where('status', 'approved')
            ->pluck('employee_id');

        $attendanceData = [
            'present' => $presentIds->count(),
            'absent' => Employee::whereNull('date_terminated')
                ->whereNotIn('id', $presentIds->merge($onLeaveIds))
                ->count(),
            'onLeave' => $stats['onLeave'],
        ];

        $pendingLeaves = LeaveRequest::with('employee')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentAttendance = AttendanceLog::with('employee')
            ->orderBy('date', 'desc')
            ->orderBy('check_in', 'desc')
            ->limit(10)
            ->get();

        $departments = Department::withCount('employees')->get();

        $payrollStatus = [
            'processed' => Payroll::where('status', 'paid')->count(),
            'pending' => Payroll::where('status', '!=', 'paid')->count(),
        ];

        return inertia('HRM/Dashboard', [
            'stats' => $stats,
            'attendanceData' => $attendanceData,
            'pendingLeaves' => $pendingLeaves,
            'recentAttendance' => $recentAttendance,
            'departments' => $departments,
            'payrollStatus' => $payrollStatus,
        ]);
    }

    public function employees(Request $request)
    {
        $query = Employee::with(['department', 'employmentType']);

        if ($request->search) {
            $search = str_replace(['%', '_'], ['\\%', '\\_'], $request->search);
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('employee_number', 'like', "%{$search}%");
            });
        }

        if ($request->department_id && $request->department_id !== 'all') {
            $query->where('department_id', $request->department_id);
        }

        if ($request->status && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->whereNull('date_terminated');
            } else {
                $query->whereNotNull('date_terminated');
            }
        }

        $employees = $query->orderBy('created_at', 'desc')->paginate(20);
        $departments = Department::all();

        return inertia('HRM/Employees', [
            'employees' => $employees,
            'departments' => $departments,
        ]);
    }

    public function employeeShow(Employee $employee)
    {
        $employee->load(['department', 'employmentType', 'leaveRequests', 'attendanceLogs', 'payrolls', 'performances']);

        return response()->json($employee);
    }

    public function attendance(Request $request)
    {
        $today = Carbon::now()->toDateString();
        $month = $request->month ?? Carbon::now()->format('Y-m');

        $startOfMonth = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $logs = AttendanceLog::whereBetween('date', [$startOfMonth, $endOfMonth])
            ->with('employee')
            ->orderBy('date', 'desc')
            ->get()
            ->groupBy('date');

        $employees = Employee::whereNull('date_terminated')->get();

        $stats = [
            'present' => AttendanceLog::whereBetween('date', [$startOfMonth, $endOfMonth])
                ->whereNotNull('check_in')
                ->distinct('employee_id')
                ->count('employee_id'),
            'absent' => $employees->count(),
            'onLeave' => LeaveRequest::whereBetween('start_date', [$startOfMonth, $endOfMonth])
                ->where('status', 'approved')
                ->distinct('employee_id')
                ->count('employee_id'),
        ];

        $recentLogs = AttendanceLog::with('employee')
            ->orderBy('date', 'desc')
            ->orderBy('check_in', 'desc')
            ->limit(20)
            ->get();

        return inertia('HRM/Attendance', [
            'logs' => $logs,
            'employees' => $employees,
            'stats' => $stats,
            'currentMonth' => $month,
            'recentLogs' => $recentLogs,
        ]);
    }

    public function checkIn(Request $request)
    {
        $employee = $request->user()->employee ?? Employee::first();

        $today = Carbon::now()->toDateString();
        $now = Carbon::now();

        $log = AttendanceLog::updateOrCreate(
            [
                'employee_id' => $employee->id,
                'date' => $today,
            ],
            [
                'check_in' => $now,
                'status' => 'present',
            ]
        );

        return response()->json(['success' => true, 'log' => $log]);
    }

    public function checkOut(Request $request)
    {
        $employee = $request->user()->employee ?? Employee::first();

        $today = Carbon::now()->toDateString();
        $now = Carbon::now();

        $log = AttendanceLog::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        if ($log) {
            $log->update([
                'check_out' => $now,
                'hours_worked' => $now->diffInHours($log->check_in),
            ]);
        }

        return response()->json(['success' => true, 'log' => $log]);
    }

    public function leaves(Request $request)
    {
        $employeeId = $request->employee_id;

        $leaveTypes = LeaveType::orderBy('name')->get();

        if ($employeeId) {
            $employee = Employee::with('staffLevel')->find($employeeId);
            $leaveRequests = LeaveRequest::where('employee_id', $employeeId)
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            $year = Carbon::now()->year;
            $approvedThisYear = LeaveRequest::where('employee_id', $employeeId)
                ->where('status', 'approved')
                ->whereYear('start_date', $year)
                ->get()
                ->groupBy('leave_type')
                ->map(fn ($requests) => $requests->sum('days_count'));

            $balanceData = $leaveTypes->map(function ($lt) use ($employee, $approvedThisYear) {
                $used = $approvedThisYear->get(strtolower($lt->name), 0);
                return [
                    'id' => $lt->id,
                    'name' => $lt->name,
                    'days_per_year' => $lt->days_per_year,
                    'used' => $used,
                    'remaining' => max(0, $lt->days_per_year - $used),
                ];
            });

            $leaveBalance = [
                'employee_id' => $employeeId,
                'staff_level_id' => $employee->staff_level_id,
                'types' => $balanceData,
            ];
        } else {
            $leaveRequests = LeaveRequest::with('employee')
                ->orderBy('created_at', 'desc')
                ->paginate(20);
            $leaveBalance = null;
        }

        $employees = Employee::whereNull('date_terminated')->get();

        $teamLeave = LeaveRequest::with('employee')
            ->where('status', 'approved')
            ->where('start_date', '>=', Carbon::now()->subMonth())
            ->orderBy('start_date')
            ->get();

        return inertia('HRM/Leaves', [
            'leaveRequests' => $leaveRequests,
            'leaveBalance' => $leaveBalance,
            'leaveTypes' => $leaveTypes,
            'employees' => $employees,
            'teamLeave' => $teamLeave,
        ]);
    }

    public function storeLeave(Request $request)
    {
        $validTypes = LeaveType::pluck('name')->map(fn ($name) => strtolower($name))->implode(',');

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type' => 'required|in:' . $validTypes,
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $daysCount = $start->diffInDays($end) + 1;

        $validated['days_count'] = $daysCount;
        $validated['status'] = 'pending';

        LeaveRequest::create($validated);

        return back()->with('success', 'Leave request submitted successfully');
    }

    public function approveLeave(LeaveRequest $leaveRequest)
    {
        $leaveRequest->update([
            'status' => 'approved',
            'reviewed_by' => Auth::id(),
        ]);

        if ($leaveRequest->employee) {
            $employee = $leaveRequest->employee;
            $newBalance = max(0, ($employee->leave_days ?? 20) - $leaveRequest->days_count);
            $employee->update(['leave_days' => $newBalance]);
        }

        return back()->with('success', 'Leave approved successfully');
    }

    public function rejectLeave(LeaveRequest $leaveRequest)
    {
        $leaveRequest->update([
            'status' => 'rejected',
            'reviewed_by' => Auth::id(),
        ]);

        return back()->with('success', 'Leave rejected');
    }

    public function holidays(Request $request)
    {
        $year = $request->year ?? Carbon::now()->year;

        $holidays = Holiday::whereYear('date', $year)
            ->orWhere('is_recurring', true)
            ->orderBy('date')
            ->get();

        $companyHolidays = $holidays->where('type', 'company');
        $publicHolidays = $holidays->where('type', 'public');

        return inertia('HRM/Holidays', [
            'holidays' => $holidays,
            'companyHolidays' => $companyHolidays,
            'publicHolidays' => $publicHolidays,
            'currentYear' => $year,
        ]);
    }

    public function storeHoliday(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'type' => 'required|in:company,public',
            'description' => 'nullable|string',
            'is_recurring' => 'boolean',
        ]);

        Holiday::create($validated);

        return back()->with('success', 'Holiday added successfully');
    }

    public function payroll(Request $request)
    {
        $employeeId = $request->employee_id;
        $month = $request->month;

        $query = Payroll::with('employee');

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        if ($month) {
            $query->where('month', $month);
        }

        $payslips = $query->orderBy('month', 'desc')->paginate(12);

        $employees = Employee::whereNull('date_terminated')->get();

        $trendData = Payroll::where('status', 'paid')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get()
            ->reverse()
            ->values();

        $selectedPayslip = $month && $employeeId
            ? Payroll::where('employee_id', $employeeId)->where('month', $month)->first()
            : null;

        return inertia('HRM/Payroll', [
            'payslips' => $payslips,
            'employees' => $employees,
            'trendData' => $trendData,
            'selectedPayslip' => $selectedPayslip,
            'filters' => [
                'employee_id' => $employeeId,
                'month' => $month,
            ],
        ]);
    }

    public function performance(Request $request)
    {
        $employeeId = $request->employee_id;

        $query = Performance::with('employee');

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        $reviews = $query->orderBy('review_date', 'desc')->paginate(20);

        $employees = Employee::whereNull('date_terminated')->get();

        return inertia('HRM/Performance', [
            'reviews' => $reviews,
            'employees' => $employees,
            'filters' => [
                'employee_id' => $employeeId,
            ],
        ]);
    }

    public function storePerformance(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'review_date' => 'required|date',
            'rating' => 'required|integer|min:1|max:5',
            'goals' => 'nullable|string',
            'achievements' => 'nullable|string',
            'comments' => 'nullable|string',
            'reviewer_name' => 'nullable|string',
        ]);

        $validated['status'] = 'completed';

        Performance::create($validated);

        return back()->with('success', 'Performance review added successfully');
    }

    public function noticeboard(Request $request)
    {
        $type = $request->type ?? 'all';

        $query = Notice::with('postedBy');

        if ($type && $type !== 'all') {
            $query->where('type', $type);
        }

        $notices = $query->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $birthdays = Notice::where('type', 'birthday')
            ->whereMonth('event_date', Carbon::now()->month)
            ->get();

        $anniversaries = Notice::where('type', 'anniversary')
            ->whereMonth('event_date', Carbon::now()->month)
            ->get();

        return inertia('HRM/Noticeboard', [
            'notices' => $notices,
            'birthdays' => $birthdays,
            'anniversaries' => $anniversaries,
        ]);
    }

    public function storeNotice(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:announcement,birthday,anniversary,general',
            'is_pinned' => 'boolean',
            'event_date' => 'nullable|date',
        ]);

        $validated['posted_by'] = Auth::id();

        Notice::create($validated);

        return back()->with('success', 'Notice posted successfully');
    }

    public function create()
    {
        $nextNumber = (Employee::max('id') ?? 0) + 1;
        $employeeNumber = 'EMP' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        return inertia('HRM/Create', [
            'departments' => Department::all(),
            'employmentTypes' => EmploymentType::all(),
            'staffLevels' => \App\Models\StaffLevel::orderBy('sort_order')->get(),
            'managers' => Employee::with('staffLevel')->whereHas('staffLevel', fn ($q) => $q->whereIn('name', ['Managing Director', 'General Manager', 'Manager']))->orderBy('first_name')->get(),
            'employeeNumber' => $employeeNumber,
        ]);
    }

    public function store(Request $request)
    {
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
            'emergency_person' => 'nullable|string|max:255',
            'pay_frequency' => 'nullable|string|in:weekly,bi_weekly,monthly',
            'leave_days' => 'nullable|numeric|min:0',
            'date_hired' => 'required|date',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $validated['avatar'] = $request->hasFile('avatar')
            ? $request->file('avatar')->store('avatars', 'public')
            : null;

        $employee = Employee::create($validated);

        return redirect()->route('hrm.employees')->with('success', 'Employee created successfully');
    }

    public function show(Employee $employee)
    {
        $employee->load(['department', 'employmentType', 'staffLevel', 'supervisingManager', 'leaveRequests', 'attendanceLogs', 'payrolls', 'performances']);

        return inertia('HRM/Show', [
            'employee' => $employee,
        ]);
    }

    public function edit(Employee $employee)
    {
        $employee->load(['department', 'employmentType', 'staffLevel', 'supervisingManager']);

        return inertia('HRM/Edit', [
            'employee' => $employee,
            'departments' => Department::all(),
            'employmentTypes' => EmploymentType::all(),
            'staffLevels' => \App\Models\StaffLevel::orderBy('sort_order')->get(),
            'managers' => Employee::with('staffLevel')
                ->where('id', '!=', $employee->id)
                ->whereHas('staffLevel', fn ($q) => $q->whereIn('name', ['Managing Director', 'General Manager', 'Manager']))
                ->orderBy('first_name')
                ->get(),
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email,'.$employee->id,
            'department_id' => 'required|exists:departments,id',
            'staff_level_id' => 'nullable|exists:staff_levels,id',
            'supervising_manager_id' => 'nullable|exists:employees,id|not_in:'.$employee->id,
            'employment_type_id' => 'required|exists:employment_types,id',
            'job_title' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'mobile_1' => 'nullable|string|max:255',
            'mobile_2' => 'nullable|string|max:255',
            'emergency_person' => 'nullable|string|max:255',
            'pay_frequency' => 'nullable|string|in:weekly,bi_weekly,monthly',
            'leave_days' => 'nullable|numeric|min:0',
            'date_hired' => 'required|date',
            'date_terminated' => 'nullable|date',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            if ($employee->avatar) {
                Storage::disk('public')->delete($employee->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        } else {
            unset($validated['avatar']);
        }

        $employee->update($validated);

        return redirect()->route('hrm.employees')->with('success', 'Employee updated successfully');
    }
}
