import { useState, useEffect } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { DonutChart } from '@/Components/HRM';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    DollarSign,
    TrendingUp,
    UserCheck,
    UserX,
    Calendar,
    Check,
    X,
    ArrowRight
} from 'lucide-react';

const STATS_MOCK = {
    totalEmployees: 47,
    presentToday: 42,
    onLeave: 3,
    pendingApprovals: 5,
};

const ATTENDANCE_MOCK = {
    present: 42,
    absent: 2,
    onLeave: 3,
};

const PENDING_LEAVES_MOCK = [
    { id: 1, employee: { first_name: 'Sarah', last_name: 'Johnson', employee_number: 'EMP-012' }, leave_type: 'annual', start_date: '2026-04-28', end_date: '2026-04-30', days_count: 3, reason: 'Family vacation' },
    { id: 2, employee: { first_name: 'Mike', last_name: 'Chen', employee_number: 'EMP-008' }, leave_type: 'sick', start_date: '2026-04-27', end_date: '2026-04-27', days_count: 1, reason: 'Not feeling well' },
    { id: 3, employee: { first_name: 'Emily', last_name: 'Davis', employee_number: 'EMP-015' }, leave_type: 'annual', start_date: '2026-05-01', end_date: '2026-05-05', days_count: 5, reason: 'Wedding anniversary trip' },
    { id: 4, employee: { first_name: 'James', last_name: 'Wilson', employee_number: 'EMP-021' }, leave_type: 'paternity', start_date: '2026-04-28', end_date: '2026-05-03', days_count: 6, reason: 'New baby care' },
    { id: 5, employee: { first_name: 'Lisa', last_name: 'Brown', employee_number: 'EMp-019' }, leave_type: 'sick', start_date: '2026-04-26', end_date: '2026-04-26', days_count: 1, reason: 'Doctor appointment' },
];

const DEPARTMENTS_MOCK = [
    { id: 1, name: 'Engineering', employees_count: 18 },
    { id: 2, name: 'Sales', employees_count: 12 },
    { id: 3, name: 'Marketing', employees_count: 8 },
    { id: 4, name: 'Operations', employees_count: 6 },
    { id: 5, name: 'Finance', employees_count: 3 },
];

const PAYROLL_MOCK = {
    processed: 42,
    pending: 5,
};

export default function HrmDashboard() {
    const { props } = usePage();
    const stats = (props as any)?.stats || STATS_MOCK;
    const attendanceData = (props as any)?.attendanceData || ATTENDANCE_MOCK;
    const pendingLeaves = (props as any)?.pendingLeaves || PENDING_LEAVES_MOCK;
    const departments = (props as any)?.departments || DEPARTMENTS_MOCK;
    const payrollStatus = (props as any)?.payrollStatus || PAYROLL_MOCK;

    const [activePage, setActivePage] = useState('dashboard');
    const [rejectingId, setRejectingId] = useState<number | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('hrmActivePage');
        if (saved) setActivePage(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem('hrmActivePage', activePage);
    }, [activePage]);

    const attendanceChartData = [
        { name: 'Present', value: attendanceData.present, color: '#22c55e' },
        { name: 'Absent', value: attendanceData.absent, color: '#ef4444' },
        { name: 'On Leave', value: attendanceData.onLeave, color: '#3b82f6' },
    ];

    const handleApprove = async (id: number) => {
        try {
            await fetch(`/hrm/leaves/${id}/approve`, { method: 'POST' });
        } catch (e) {
            console.log('Mock approve');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await fetch(`/hrm/leaves/${id}/reject`, { method: 'POST' });
        } catch (e) {
            console.log('Mock reject');
        }
    };

    const leaveTypeLabels: Record<string, string> = {
        annual: 'Annual',
        sick: 'Sick',
        unpaid: 'Unpaid',
        maternity: 'Maternity',
        paternity: 'Paternity',
    };

    const navItems = [
        { name: 'Dashboard', href: '/hrm/dashboard', active: activePage === 'dashboard' },
        { name: 'Employees', href: '/hrm/employees', active: activePage === 'employees' },
        { name: 'Attendance', href: '/hrm/attendance', active: activePage === 'attendance' },
        { name: 'Leaves', href: '/hrm/leaves', active: activePage === 'leaves' },
        { name: 'Holidays', href: '/hrm/holidays', active: activePage === 'holidays' },
        { name: 'Payroll', href: '/hrm/payroll', active: activePage === 'payroll' },
        { name: 'Performance', href: '/hrm/performance', active: activePage === 'performance' },
        { name: 'Noticeboard', href: '/hrm/noticeboard', active: activePage === 'noticeboard' },
    ];

    return (
        <AppLayout>
            <Head title="HRM Dashboard" />

            <div className="flex flex-wrap items-center gap-2 mb-6">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setActivePage(item.name.toLowerCase())}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item.active
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </div>

            <PageHeader title="HR Dashboard" subtitle="Human Resource Management Overview" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalEmployees}</p>
                        <p className="text-sm text-slate-500">Total Employees</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.presentToday}</p>
                        <p className="text-sm text-slate-500">Present Today</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.onLeave}</p>
                        <p className="text-sm text-slate-500">On Leave</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingApprovals}</p>
                        <p className="text-sm text-slate-500">Pending Approvals</p>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Today's Attendance</h3>
                    <div className="flex justify-center">
                        <DonutChart
                            data={attendanceChartData}
                            centerText={`${Math.round((attendanceData.present / stats.totalEmployees) * 100)}%`}
                            size={180}
                        />
                    </div>
                </GlassCard>

                <GlassCard className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Department Overview</h3>
                    <div className="space-y-3">
                        {departments.map((dept: any) => (
                            <div key={dept.id} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(dept.employees_count / stats.totalEmployees) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-500 w-8">{dept.employees_count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pending Leave Approvals</h3>
                        <Link href="/hrm/leaves" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {pendingLeaves.slice(0, 4).map((leave: any) => (
                            <div key={leave.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {leave.employee?.first_name} {leave.employee?.last_name}
                                        </p>
                                        <p className="text-sm text-slate-500">{leaveTypeLabels[leave.leave_type]} Leave</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()} ({leave.days_count} day{leave.days_count > 1 ? 's' : ''})
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApprove(leave.id)}
                                            className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleReject(leave.id)}
                                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {leave.reason && (
                                    <p className="text-xs text-slate-500 mt-2 italic">{leave.reason}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Payroll Status</h3>
                        <Link href="/hrm/payroll" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Processed</p>
                                    <p className="text-sm text-slate-500">{payrollStatus.processed} employees</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 text-sm font-medium">
                                {Math.round((payrollStatus.processed / stats.totalEmployees) * 100)}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Pending</p>
                                    <p className="text-sm text-slate-500">{payrollStatus.pending} employees</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 text-sm font-medium">
                                {Math.round((payrollStatus.pending / stats.totalEmployees) * 100)}%
                            </span>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </AppLayout>
    );
}