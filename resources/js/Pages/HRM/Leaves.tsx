import { useState } from 'react';
import { usePage, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { TeamCalendar, BalanceBar, RequestModal } from '@/Components/HRM';
import { Head, Link } from '@inertiajs/react';
import { 
    Plus, 
    Calendar,
    Check,
    X,
    Filter,
    User
} from 'lucide-react';

const LEAVE_REQUESTS_MOCK = [
    { id: 1, employee: { id: 1, first_name: 'John', last_name: 'Smith', employee_number: 'EMP-001' }, leave_type: 'annual', start_date: '2026-04-28', end_date: '2026-04-30', days_count: 3, reason: 'Family vacation', status: 'pending' },
    { id: 2, employee: { id: 2, first_name: 'Sarah', last_name: 'Johnson', employee_number: 'EMP-002' }, leave_type: 'sick', start_date: '2026-04-27', end_date: '2026-04-27', days_count: 1, reason: 'Not feeling well', status: 'approved' },
    { id: 3, employee: { id: 3, first_name: 'Mike', last_name: 'Chen', employee_number: 'EMP-003' }, leave_type: 'annual', start_date: '2026-05-01', end_date: '2026-05-05', days_count: 5, reason: 'Wedding anniversary trip', status: 'pending' },
    { id: 4, employee: { id: 4, first_name: 'Emily', last_name: 'Davis', employee_number: 'EMP-004' }, leave_type: 'paternity', start_date: '2026-04-28', end_date: '2026-05-03', days_count: 6, reason: 'New baby care', status: 'approved' },
    { id: 5, employee: { id: 5, first_name: 'James', last_name: 'Wilson', employee_number: 'EMP-005' }, leave_type: 'sick', start_date: '2026-04-26', end_date: '2026-04-26', days_count: 1, reason: 'Doctor appointment', status: 'rejected' },
    { id: 6, employee: { id: 6, first_name: 'Lisa', last_name: 'Brown', employee_number: 'EMP-006' }, leave_type: 'annual', start_date: '2026-05-10', end_date: '2026-05-12', days_count: 3, reason: 'Personal time off', status: 'pending' },
];

const EMPLOYEES_MOCK = [
    { id: 1, first_name: 'John', last_name: 'Smith' },
    { id: 2, first_name: 'Sarah', last_name: 'Johnson' },
    { id: 3, first_name: 'Mike', last_name: 'Chen' },
    { id: 4, first_name: 'Emily', last_name: 'Davis' },
    { id: 5, first_name: 'James', last_name: 'Wilson' },
];

const TEAM_LEAVE_MOCK = [
    { id: 1, employee: { first_name: 'Emily' }, start_date: '2026-04-28', end_date: '2026-05-03' },
    { id: 2, employee: { first_name: 'Sarah' }, start_date: '2026-04-27', end_date: '2026-04-27' },
];

export default function HrmLeaves() {
    const { props } = usePage();
    const leaveRequestsData = (props as any)?.leaveRequests;
    const leaveRequests = leaveRequestsData?.data || LEAVE_REQUESTS_MOCK;
    const leaveBalance = (props as any)?.leaveBalance || { leave_balance: 18 };
    const teamLeaveData = (props as any)?.teamLeave;
    const teamLeave = teamLeaveData?.data || TEAM_LEAVE_MOCK;
    const employeesData = (props as any)?.employees;
    const employees = employeesData || EMPLOYEES_MOCK;

    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);

    const { post, processing } = useForm({});

    const handleSubmitLeave = async (data: any) => {
        try {
            await fetch('/hrm/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } catch (e) {}
    };

    const handleApprove = async (id: number) => {
        try {
            await fetch(`/hrm/leaves/${id}/approve`, { method: 'POST' });
        } catch (e) {}
    };

    const handleReject = async (id: number) => {
        try {
            await fetch(`/hrm/leaves/${id}/reject`, { method: 'POST' });
        } catch (e) {}
    };

    const leaveTypeLabels: Record<string, string> = {
        annual: 'Annual',
        sick: 'Sick',
        unpaid: 'Unpaid',
        maternity: 'Maternity',
        paternity: 'Paternity',
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        approved: 'bg-green-500/20 text-green-400',
        rejected: 'bg-red-500/20 text-red-400',
    };

    const navItems = ['Dashboard', 'Employees', 'Attendance', 'Leaves', 'Holidays', 'Payroll', 'Performance', 'Noticeboard'];

    return (
        <AppLayout>
            <Head title="Leaves" />

            <div className="flex flex-wrap items-center gap-2 mb-6">
                {navItems.map((item) => (
                    <Link
                        key={item}
                        href={`/hrm/${item.toLowerCase()}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item === 'Leaves'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <PageHeader 
                title="Leaves" 
                subtitle="Manage leave requests & balances"
                action={
                    <button onClick={() => setShowModal(true)} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Request Leave
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Leave Balance</h3>
                    <div className="space-y-4">
                        <BalanceBar label="Annual Leave" used={20 - (leaveBalance.leave_balance || 18)} total={20} color="bg-indigo-500" />
                        <BalanceBar label="Sick Leave" used={2} total={10} color="bg-red-500" />
                        <BalanceBar label="Personal Leave" used={1} total={5} color="bg-blue-500" />
                    </div>
                </GlassCard>

                <GlassCard className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Team Leave Calendar</h3>
                    <TeamCalendar leaveRequests={Array.isArray(teamLeave) ? teamLeave : (teamLeave?.data || [])} />
                </GlassCard>
            </div>

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="glass-input"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select 
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="glass-input"
                        >
                            <option value="all">All Types</option>
                            <option value="annual">Annual</option>
                            <option value="sick">Sick</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="maternity">Maternity</option>
                            <option value="paternity">Paternity</option>
                        </select>
                    </div>
                </div>
            </GlassCard>

            <div className="space-y-3">
                {Array.isArray(leaveRequests) && leaveRequests.map((leave: any) => (
                    <GlassCard key={leave.id}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-sm font-medium">
                                    {leave.employee?.first_name?.charAt(0)}{leave.employee?.last_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {leave.employee?.first_name} {leave.employee?.last_name}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {leaveTypeLabels[leave.leave_type]} Leave 
                                        <span className="mx-2">|</span>
                                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                        <span className="mx-2">|</span>
                                        {leave.days_count} day{leave.days_count > 1 ? 's' : ''}
                                    </p>
                                    {leave.reason && (
                                        <p className="text-xs text-slate-400 mt-1 italic">{leave.reason}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-3 py-1 rounded-full ${statusColors[leave.status]}`}>
                                    {leave.status}
                                </span>
                                {leave.status === 'pending' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApprove(leave.id)}
                                            className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleReject(leave.id)}
                                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <RequestModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmitLeave}
                employees={employees}
            />
        </AppLayout>
    );
}