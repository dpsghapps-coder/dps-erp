import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link } from '@inertiajs/react';
import { 
    Clock, 
    CheckCircle, 
    XCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    User
} from 'lucide-react';

const LOGS_MOCK = [
    { id: 1, employee: { first_name: 'John', last_name: 'Smith' }, date: '2026-04-26', check_in: '09:02', check_out: '17:30', hours_worked: 8.5, status: 'present' },
    { id: 2, employee: { first_name: 'Sarah', last_name: 'Johnson' }, date: '2026-04-26', check_in: '08:55', check_out: '18:00', hours_worked: 9.0, status: 'present' },
    { id: 3, employee: { first_name: 'Mike', last_name: 'Chen' }, date: '2026-04-26', check_in: '09:15', check_out: '17:45', hours_worked: 8.5, status: 'present' },
    { id: 4, employee: { first_name: 'Emily', last_name: 'Davis' }, date: '2026-04-26', hours_worked: 0, status: 'on_leave' },
    { id: 5, employee: { first_name: 'James', last_name: 'Wilson' }, date: '2026-04-25', check_in: '09:00', check_out: '17:30', hours_worked: 8.5, status: 'present' },
    { id: 6, employee: { first_name: 'Lisa', last_name: 'Brown' }, date: '2026-04-25', check_in: '08:50', check_out: '17:00', hours_worked: 8.2, status: 'present' },
];

const STATS_MOCK = { present: 42, absent: 3, onLeave: 2 };

export default function HrmAttendance() {
    const { props } = usePage();
    const recentLogsData = (props as any)?.recentLogs;
    // @ts-ignore
    const recentLogs = recentLogsData?.data || recentLogsData || LOGS_MOCK;
    const statsData = (props as any)?.stats;
    const stats = statsData || STATS_MOCK;
    const currentMonthData = (props as any)?.currentMonth;
    const currentMonth = currentMonthData || '2026-04';

    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'check' | 'calendar'>('check');

    useEffect(() => {
        const saved = localStorage.getItem('hrmAttendanceCheckedIn');
        if (saved) setIsCheckedIn(saved === 'true');
    }, []);

    const handleCheckIn = async () => {
        try {
            await fetch('/hrm/attendance/check-in', { method: 'POST' });
        } catch (e) {}
        setIsCheckedIn(true);
        localStorage.setItem('hrmAttendanceCheckedIn', 'true');
    };

    const handleCheckOut = async () => {
        try {
            await fetch('/hrm/attendance/check-out', { method: 'POST' });
        } catch (e) {}
        setIsCheckedIn(false);
        localStorage.setItem('hrmAttendanceCheckedIn', 'false');
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getStatusForDay = (day: number) => {
        if (day > new Date().getDate() && currentDate.getMonth() === new Date().getMonth()) return 'future';
        const random = Math.random();
        if (random > 0.8) return 'leave';
        if (random > 0.95) return 'absent';
        return 'present';
    };

    const statusColors: Record<string, string> = {
        present: 'bg-green-500',
        absent: 'bg-red-500',
        on_leave: 'bg-blue-500',
        future: 'bg-slate-200',
    };

    const navItems = ['Dashboard', 'Employees', 'Attendance', 'Leaves', 'Holidays', 'Payroll', 'Performance', 'Noticeboard'];

    return (
        <AppLayout>
            <Head title="Attendance" />

            <div className="flex flex-wrap items-center gap-2 mb-6">
                {navItems.map((item) => (
                    <Link
                        key={item}
                        href={`/hrm/${item.toLowerCase()}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item === 'Attendance'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <PageHeader title="Attendance" subtitle="Track employee attendance" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.present ?? 0}</p>
                        <p className="text-sm text-slate-500">Present</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.absent ?? 0}</p>
                        <p className="text-sm text-slate-500">Absent</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.onLeave ?? 0}</p>
                        <p className="text-sm text-slate-500">On Leave</p>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Clock In/Out</h3>
                    <div className="text-center py-8">
                        <div className="w-32 h-32 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <Clock className="w-12 h-12 text-slate-400" />
                        </div>
                        <p className="text-slate-500 mb-4">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        {!isCheckedIn ? (
                            <button
                                onClick={handleCheckIn}
                                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                            >
                                Clock In
                            </button>
                        ) : (
                            <button
                                onClick={handleCheckOut}
                                className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                            >
                                Clock Out
                            </button>
                        )}
                        {isCheckedIn && (
                            <p className="text-sm text-emerald-600 mt-2">You are checked in</p>
                        )}
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">This Month</h3>
                    <div className="flex items-center justify-between mb-4">
                        <button 
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-medium">{monthName}</span>
                        <button 
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {weekDays.map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                                {day}
                            </div>
                        ))}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-10" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const status = getStatusForDay(day);
                            return (
                                <div
                                    key={day}
                                    className={`h-10 rounded-lg flex items-center justify-center text-xs font-medium ${statusColors[status]} text-white`}
                                    title={status}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            </div>

            <GlassCard>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {Array.isArray(recentLogs) && recentLogs.slice(0, 8).map((log: any) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-sm">
                                    {log.employee?.first_name?.charAt(0)}{log.employee?.last_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">
                                        {log.employee?.first_name} {log.employee?.last_name}
                                    </p>
                                    <p className="text-xs text-slate-500">{log.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {log.status === 'on_leave' ? (
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">On Leave</span>
                                ) : (
                                    <p className="text-sm">
                                        {log.check_in && <span className="text-slate-500">In: {log.check_in}</span>}
                                        {log.check_in && log.check_out && <span className="text-slate-300 mx-2">|</span>}
                                        {log.check_out && <span className="text-slate-500">Out: {log.check_out}</span>}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </AppLayout>
    );
}