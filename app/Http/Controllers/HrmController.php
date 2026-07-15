<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentType;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\Level;
use App\Models\Notice;
use App\Models\Payroll;
use App\Models\Performance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        $attendanceData = [
            'present' => AttendanceLog::where('date', $today)->whereNotNull('check_in')->count(),
            'absent' => Employee::count() - AttendanceLog::where('date', $today)->count(),
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
        $query = Employee::with(['department', 'level', 'employmentType']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                    ->orWhere('last_name', 'like', "%{$request->search}%")
                    ->orWhere('employee_number', 'like', "%{$request->search}%");
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
        $employee->load(['department', 'level', 'employmentType', 'leaveRequests', 'attendanceLogs', 'payrolls', 'performances']);

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

        if ($employeeId) {
            $leaveBalance = Employee::find($employeeId);
            $leaveRequests = LeaveRequest::where('employee_id', $employeeId)
                ->orderBy('created_at', 'desc')
                ->paginate(20);
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
            'employees' => $employees,
            'teamLeave' => $teamLeave,
        ]);
    }

    public function storeLeave(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type' => 'required|in:annual,sick,unpaid,maternity,paternity',
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
            $newBalance = max(0, ($employee->leave_balance ?? 20) - $leaveRequest->days_count);
            $employee->update(['leave_balance' => $newBalance]);
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

    public function departments()
    {
        $departments = Department::withCount('employees')->get();

        return inertia('Admin/HrmDepartments', [
            'departments' => $departments,
        ]);
    }

    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:departments',
            'manager_id' => 'nullable|exists:employees,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Department::create($validated);

        return back()->with('success', 'Department created successfully');
    }

    public function updateDepartment(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:departments,code,'.$department->id,
            'manager_id' => 'nullable|exists:employees,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $department->update($validated);

        return back()->with('success', 'Department updated successfully');
    }

    public function destroyDepartment(Department $department)
    {
        if ($department->employees()->count() > 0) {
            return back()->with('error', 'Cannot delete department with employees');
        }

        $department->delete();

        return back()->with('success', 'Department deleted successfully');
    }

    public function create()
    {
        return inertia('HRM/Create', [
            'departments' => Department::all(),
            'levels' => Level::all(),
            'employmentTypes' => EmploymentType::all(),
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
            'level_id' => 'required|exists:levels,id',
            'employment_type_id' => 'required|exists:employment_types,id',
            'date_hired' => 'required|date',
        ]);

        Employee::create($validated);

        return redirect()->route('hrm.employees')->with('success', 'Employee created successfully');
    }

    public function show(Employee $employee)
    {
        $employee->load(['department', 'level', 'employmentType', 'leaveRequests', 'attendanceLogs', 'payrolls', 'performances']);

        return inertia('HRM/Show', [
            'employee' => $employee,
        ]);
    }

    public function edit(Employee $employee)
    {
        $employee->load(['department', 'level', 'employmentType']);

        return inertia('HRM/Edit', [
            'employee' => $employee,
            'departments' => Department::all(),
            'levels' => Level::all(),
            'employmentTypes' => EmploymentType::all(),
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email,'.$employee->id,
            'employee_number' => 'required|string|unique:employees,employee_number,'.$employee->id,
            'department_id' => 'required|exists:departments,id',
            'level_id' => 'required|exists:levels,id',
            'employment_type_id' => 'required|exists:employment_types,id',
            'date_hired' => 'required|date',
            'date_terminated' => 'nullable|date',
        ]);

        $employee->update($validated);

        return redirect()->route('hrm.employees')->with('success', 'Employee updated successfully');
    }
}
