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
use App\Models\StaffLevel;
use App\Notifications\HrmNotification;
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

    private function isHrmManager(): bool
    {
        return Auth::user()->hasRole('md') || Auth::user()->hasPermission('hrm.manage_employees');
    }

    private function currentEmployee(): ?Employee
    {
        return Employee::where('user_id', Auth::id())->first();
    }

    public function dashboard()
    {
        if (! $this->isHrmManager()) {
            return $this->personalDashboard();
        }

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

        $latestPayrollMonth = Payroll::max('month');
        $payrollStatus = [
            'processed' => Payroll::where('month', $latestPayrollMonth)->where('status', 'paid')->count(),
            'pending' => Payroll::where('month', $latestPayrollMonth)->where('status', '!=', 'paid')->count(),
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

    private function personalDashboard()
    {
        $employee = $this->currentEmployee();
        $today = Carbon::now()->toDateString();

        if (! $employee) {
            return inertia('HRM/Dashboard', [
                'stats' => ['totalEmployees' => 0, 'presentToday' => 0, 'onLeave' => 0, 'pendingApprovals' => 0],
                'attendanceData' => ['present' => 0, 'absent' => 0, 'onLeave' => 0],
                'pendingLeaves' => collect(),
                'recentAttendance' => collect(),
                'departments' => collect(),
                'payrollStatus' => ['processed' => 0, 'pending' => 0],
            ]);
        }

        $todayLog = AttendanceLog::where('employee_id', $employee->id)->where('date', $today)->first();
        $onLeaveToday = LeaveRequest::where('employee_id', $employee->id)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->where('status', 'approved')
            ->exists();

        $stats = [
            'totalEmployees' => 1,
            'presentToday' => $todayLog && $todayLog->check_in ? 1 : 0,
            'onLeave' => $onLeaveToday ? 1 : 0,
            'pendingApprovals' => 0,
        ];

        $attendanceData = [
            'present' => $stats['presentToday'],
            'absent' => (! $stats['presentToday'] && ! $onLeaveToday) ? 1 : 0,
            'onLeave' => $stats['onLeave'],
        ];

        $recentAttendance = AttendanceLog::with('employee')
            ->where('employee_id', $employee->id)
            ->orderBy('date', 'desc')
            ->orderBy('check_in', 'desc')
            ->limit(10)
            ->get();

        $latestPayslip = Payroll::where('employee_id', $employee->id)->orderBy('month', 'desc')->first();

        return inertia('HRM/Dashboard', [
            'stats' => $stats,
            'attendanceData' => $attendanceData,
            'pendingLeaves' => collect(),
            'recentAttendance' => $recentAttendance,
            'departments' => collect(),
            'payrollStatus' => [
                'processed' => $latestPayslip && $latestPayslip->status === 'paid' ? 1 : 0,
                'pending' => $latestPayslip && $latestPayslip->status !== 'paid' ? 1 : 0,
            ],
        ]);
    }

    public function employees(Request $request)
    {
        $isManager = $this->isHrmManager();
        $currentEmployee = $this->currentEmployee();

        $query = Employee::with(['department', 'employmentType'])
            ->when(! $isManager, fn ($q) => $q->where('id', $currentEmployee?->id ?? 0));

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
            'isManager' => $isManager,
        ]);
    }

    public function employeeShow(Employee $employee)
    {
        if (! $this->isHrmManager() && $this->currentEmployee()?->id !== $employee->id) {
            abort(403, 'You are not authorized to view this employee\'s record.');
        }

        $employee->load([
            'department',
            'employmentType',
            'staffLevel',
            'supervisingManager',
            'leaveRequests' => fn ($q) => $q->with('leaveType')->orderBy('start_date', 'desc'),
            'attendanceLogs' => fn ($q) => $q->orderBy('date', 'desc')->limit(30),
            'payrolls' => fn ($q) => $q->orderBy('month', 'desc'),
            'performances' => fn ($q) => $q->orderBy('review_date', 'desc'),
        ]);

        return inertia('HRM/EmployeeShow', [
            'employee' => $employee,
            'isManager' => $this->isHrmManager(),
        ]);
    }

    public function attendance(Request $request)
    {
        $isManager = $this->isHrmManager() || Auth::user()->hasPermission('hrm.manage_attendance');
        $currentEmployee = $this->currentEmployee();

        $today = Carbon::now()->toDateString();
        $month = $request->month ?? Carbon::now()->format('Y-m');

        $startOfMonth = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $logs = AttendanceLog::whereBetween('date', [$startOfMonth, $endOfMonth])
            ->with('employee')
            ->when(! $isManager, fn ($q) => $q->where('employee_id', $currentEmployee?->id ?? 0))
            ->orderBy('date', 'desc')
            ->get()
            ->groupBy('date');

        $employees = Employee::whereNull('date_terminated')
            ->when(! $isManager, fn ($q) => $q->where('id', $currentEmployee?->id ?? 0))
            ->get();

        $stats = [
            'present' => AttendanceLog::whereBetween('date', [$startOfMonth, $endOfMonth])
                ->whereNotNull('check_in')
                ->when(! $isManager, fn ($q) => $q->where('employee_id', $currentEmployee?->id ?? 0))
                ->distinct('employee_id')
                ->count('employee_id'),
            'absent' => $employees->count(),
            'onLeave' => LeaveRequest::whereBetween('start_date', [$startOfMonth, $endOfMonth])
                ->where('status', 'approved')
                ->when(! $isManager, fn ($q) => $q->where('employee_id', $currentEmployee?->id ?? 0))
                ->distinct('employee_id')
                ->count('employee_id'),
        ];

        $recentLogs = AttendanceLog::with('employee')
            ->when(! $isManager, fn ($q) => $q->where('employee_id', $currentEmployee?->id ?? 0))
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
        $employee = $this->currentEmployee();

        if (! $employee) {
            abort(403, 'No employee record is linked to your account.');
        }

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
        $employee = $this->currentEmployee();

        if (! $employee) {
            abort(403, 'No employee record is linked to your account.');
        }

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
        $currentEmployee = Employee::where('user_id', Auth::id())->first();
        $canViewAll = Auth::user()->hasPermission('hrm.manage_leaves') || Auth::user()->hasRole('md');
        $canViewTeam = Auth::user()->hasPermission('hrm.view_team_leaves');

        if ($canViewAll) {
            $visibleEmployeeIds = null;
        } elseif ($currentEmployee && $canViewTeam) {
            $visibleEmployeeIds = Employee::where('supervising_manager_id', $currentEmployee->id)
                ->pluck('id')
                ->push($currentEmployee->id);
        } elseif ($currentEmployee) {
            $visibleEmployeeIds = collect([$currentEmployee->id]);
        } else {
            $visibleEmployeeIds = collect();
        }

        $employeeId = $request->employee_id;

        if ($employeeId && $visibleEmployeeIds !== null && ! $visibleEmployeeIds->contains((int) $employeeId)) {
            abort(403, 'You are not authorized to view this employee\'s leave records.');
        }

        if (! $employeeId && $visibleEmployeeIds !== null && $visibleEmployeeIds->count() <= 1) {
            $employeeId = $currentEmployee?->id;
        }

        $allLeaveTypes = LeaveType::orderBy('name')->get();

        if ($employeeId) {
            $employee = Employee::with('staffLevel')->find($employeeId);
            $leaveTypes = $allLeaveTypes->where('staff_level_id', $employee->staff_level_id)->values();

            $leaveRequests = LeaveRequest::where('employee_id', $employeeId)
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            $year = Carbon::now()->year;
            $approvedThisYear = LeaveRequest::where('employee_id', $employeeId)
                ->where('status', 'approved')
                ->whereYear('start_date', $year)
                ->get()
                ->groupBy('leave_type_id')
                ->map(fn ($requests) => $requests->sum('days_count'));

            $balanceData = $leaveTypes->map(function ($lt) use ($approvedThisYear) {
                $used = $approvedThisYear->get($lt->id, 0);

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
            $leaveTypes = $allLeaveTypes;
            $leaveRequests = LeaveRequest::with('employee')
                ->when($visibleEmployeeIds !== null, fn ($q) => $q->whereIn('employee_id', $visibleEmployeeIds))
                ->orderBy('created_at', 'desc')
                ->paginate(20);
            $leaveBalance = null;
        }

        $employees = Employee::whereNull('date_terminated')
            ->when($visibleEmployeeIds !== null, fn ($q) => $q->whereIn('id', $visibleEmployeeIds))
            ->get();

        $teamLeave = LeaveRequest::with('employee')
            ->where('status', 'approved')
            ->where('start_date', '>=', Carbon::now()->subMonth())
            ->when($visibleEmployeeIds !== null, fn ($q) => $q->whereIn('employee_id', $visibleEmployeeIds))
            ->orderBy('start_date')
            ->get();

        return inertia('HRM/Leaves', [
            'leaveRequests' => $leaveRequests,
            'leaveBalance' => $leaveBalance,
            'leaveTypes' => $leaveTypes,
            'allLeaveTypes' => $allLeaveTypes,
            'employees' => $employees,
            'teamLeave' => $teamLeave,
        ]);
    }

    public function storeLeave(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);
        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);

        if ($leaveType->staff_level_id !== $employee->staff_level_id) {
            return back()->withErrors(['leave_type_id' => 'This leave type does not apply to the employee\'s staff level.']);
        }

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $daysCount = $start->diffInDays($end) + 1;

        LeaveRequest::create([
            'employee_id' => $validated['employee_id'],
            'leave_type_id' => $leaveType->id,
            'leave_type' => strtolower($leaveType->name),
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'] ?? null,
            'days_count' => $daysCount,
            'status' => 'pending',
        ]);

        $supervisor = $employee->supervisingManager?->user;
        if ($supervisor) {
            $supervisor->notify(new HrmNotification('leave_requested', $employee->full_name ?? $employee->first_name, $employee->id));
        }

        return back()->with('success', 'Leave request submitted successfully');
    }

    private function authorizeLeaveAction(LeaveRequest $leaveRequest): void
    {
        $canViewAll = Auth::user()->hasPermission('hrm.manage_leaves') || Auth::user()->hasRole('md');

        if ($canViewAll) {
            return;
        }

        $currentEmployee = Employee::where('user_id', Auth::id())->first();
        $canViewTeam = Auth::user()->hasPermission('hrm.view_team_leaves');

        if ($canViewTeam
            && $currentEmployee
            && $leaveRequest->employee
            && $leaveRequest->employee->supervising_manager_id === $currentEmployee->id) {
            return;
        }

        abort(403, 'You are not authorized to act on this leave request.');
    }

    public function approveLeave(LeaveRequest $leaveRequest)
    {
        $this->authorizeLeaveAction($leaveRequest);

        $leaveRequest->update([
            'status' => 'approved',
            'reviewed_by' => Auth::id(),
        ]);

        if ($leaveRequest->employee && $leaveRequest->leaveType?->name === 'Annual') {
            $employee = $leaveRequest->employee;
            $newBalance = max(0, ($employee->leave_days ?? 0) - $leaveRequest->days_count);
            $employee->update(['leave_days' => $newBalance]);
        }

        $employeeUser = $leaveRequest->employee?->user;
        if ($employeeUser) {
            $employeeUser->notify(new HrmNotification('leave_approved', $leaveRequest->employee->full_name, $leaveRequest->employee->id));
        }

        return back()->with('success', 'Leave approved successfully');
    }

    public function rejectLeave(LeaveRequest $leaveRequest)
    {
        $this->authorizeLeaveAction($leaveRequest);

        $leaveRequest->update([
            'status' => 'rejected',
            'reviewed_by' => Auth::id(),
        ]);

        $employeeUser = $leaveRequest->employee?->user;
        if ($employeeUser) {
            $employeeUser->notify(new HrmNotification('leave_rejected', $leaveRequest->employee->full_name, $leaveRequest->employee->id));
        }

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
        $isManager = $this->isHrmManager() || Auth::user()->hasPermission('hrm.view_payroll') || Auth::user()->hasPermission('hrm.manage_payroll');
        $currentEmployee = $this->currentEmployee();

        $employeeId = $isManager ? $request->employee_id : ($currentEmployee?->id ?? 0);
        $month = $request->month;

        $query = Payroll::with('employee');

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        if ($month) {
            $query->where('month', $month);
        }

        $payslips = $query->orderBy('month', 'desc')->paginate(12);

        $employees = Employee::whereNull('date_terminated')
            ->when(! $isManager, fn ($q) => $q->where('id', $currentEmployee?->id ?? 0))
            ->get();

        $trendData = Payroll::where('status', 'paid')
            ->when(! $isManager, fn ($q) => $q->where('employee_id', $currentEmployee?->id ?? 0))
            ->selectRaw('month, SUM(net_pay) as value')
            ->groupBy('month')
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
        $isManager = $this->isHrmManager() || Auth::user()->hasPermission('hrm.manage_performance');
        $currentEmployee = $this->currentEmployee();

        $employeeId = $isManager ? $request->employee_id : ($currentEmployee?->id ?? 0);

        $query = Performance::with('employee');

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        $reviews = $query->orderBy('review_date', 'desc')->paginate(20);

        $employees = Employee::whereNull('date_terminated')
            ->when(! $isManager, fn ($q) => $q->where('id', $currentEmployee?->id ?? 0))
            ->get();

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
        if (! $this->isHrmManager() && ! Auth::user()->hasPermission('hrm.manage_performance')) {
            abort(403, 'You are not authorized to create performance reviews.');
        }

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
        if (! $this->isHrmManager()) {
            abort(403, 'You are not authorized to add employees.');
        }

        $nextNumber = (Employee::max('id') ?? 0) + 1;
        $employeeNumber = 'EMP'.str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        return inertia('HRM/Create', [
            'departments' => Department::all(),
            'employmentTypes' => EmploymentType::all(),
            'staffLevels' => StaffLevel::orderBy('sort_order')->get(),
            'managers' => Employee::with('staffLevel')->whereHas('staffLevel', fn ($q) => $q->whereIn('name', ['Managing Director', 'General Manager', 'Manager']))->orderBy('first_name')->get(),
            'employeeNumber' => $employeeNumber,
        ]);
    }

    public function store(Request $request)
    {
        if (! $this->isHrmManager()) {
            abort(403, 'You are not authorized to add employees.');
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
            'emergency_person' => 'nullable|string|max:255',
            'pay_frequency' => 'nullable|string|in:weekly,bi_weekly,monthly',
            'date_hired' => 'required|date',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $validated['avatar'] = $request->hasFile('avatar')
            ? $request->file('avatar')->store('avatars', 'public')
            : null;

        $validated['leave_days'] = $validated['staff_level_id']
            ? (LeaveType::where('staff_level_id', $validated['staff_level_id'])->where('name', 'Annual')->value('days_per_year') ?? 0)
            : 0;

        $employee = Employee::create($validated);

        return redirect()->route('hrm.employees')->with('success', 'Employee created successfully');
    }

    public function show(Employee $employee)
    {
        if (! $this->isHrmManager() && $this->currentEmployee()?->id !== $employee->id) {
            abort(403, 'You are not authorized to view this employee\'s record.');
        }

        $employee->load(['department', 'employmentType', 'staffLevel', 'supervisingManager', 'leaveRequests', 'attendanceLogs', 'payrolls', 'performances']);

        return inertia('HRM/Show', [
            'employee' => $employee,
        ]);
    }

    public function edit(Employee $employee)
    {
        if (! $this->isHrmManager()) {
            abort(403, 'You are not authorized to edit employee records.');
        }

        $employee->load(['department', 'employmentType', 'staffLevel', 'supervisingManager']);

        return inertia('HRM/Edit', [
            'employee' => $employee,
            'departments' => Department::all(),
            'employmentTypes' => EmploymentType::all(),
            'staffLevels' => StaffLevel::orderBy('sort_order')->get(),
            'managers' => Employee::with('staffLevel')
                ->where('id', '!=', $employee->id)
                ->whereHas('staffLevel', fn ($q) => $q->whereIn('name', ['Managing Director', 'General Manager', 'Manager']))
                ->orderBy('first_name')
                ->get(),
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        if (! $this->isHrmManager()) {
            abort(403, 'You are not authorized to edit employee records.');
        }

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
