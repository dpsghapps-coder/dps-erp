import { useState, useMemo } from 'react';
import { usePage, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, Pagination } from '@/Components/ui';
import { TeamCalendar, BalanceBar, RequestModal } from '@/Components/HRM';
import { Head, Link } from '@inertiajs/react';
import { Plus, Check, X } from 'lucide-react';

const BALANCE_COLORS = ['bg-indigo-500', 'bg-red-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'];

export default function HrmLeaves() {
    const { props } = usePage();
    const leaveRequestsData = (props as any)?.leaveRequests;
    const leaveRequests = leaveRequestsData?.data || [];
    const leaveBalance = (props as any)?.leaveBalance;
    const leaveTypes = (props as any)?.leaveTypes || [];
    const teamLeaveData = (props as any)?.teamLeave;
    const teamLeave = teamLeaveData?.data || [];
    const employees = (props as any)?.employees || [];

    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);

    const leaveTypeLabels = useMemo(() => {
        const map: Record<string, string> = {};
        leaveTypes.forEach((lt: any) => {
            map[lt.name.toLowerCase()] = lt.name;
        });
        return map;
    }, [leaveTypes]);

    const handleSubmitLeave = (data: any) => {
        router.post('/hrm/leaves', data);
    };

    const handleApprove = (id: number) => {
        router.post(`/hrm/leaves/${id}/approve`);
    };

    const handleReject = (id: number) => {
        router.post(`/hrm/leaves/${id}/reject`);
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        approved: 'bg-green-500/20 text-green-400',
        rejected: 'bg-red-500/20 text-red-400',
    };

    const filteredLeaveRequests = useMemo(() => {
        if (!Array.isArray(leaveRequests)) return [];
        return leaveRequests.filter((leave: any) => {
            if (statusFilter !== 'all' && leave.status !== statusFilter) return false;
            if (typeFilter !== 'all' && leave.leave_type !== typeFilter) return false;
            return true;
        });
    }, [leaveRequests, statusFilter, typeFilter]);

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
                        {leaveBalance?.types?.length > 0 ? (
                            leaveBalance.types.map((bt: any, i: number) => (
                                <BalanceBar
                                    key={bt.id}
                                    label={bt.name}
                                    used={bt.used}
                                    total={bt.days_per_year}
                                    color={BALANCE_COLORS[i % BALANCE_COLORS.length]}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-slate-400">Select an employee to view balance</p>
                        )}
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
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'all', label: 'All Status' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'rejected', label: 'Rejected' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setStatusFilter(opt.value)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                        statusFilter === opt.value
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'all', label: 'All Types' },
                                ...leaveTypes.map((lt: any) => ({ value: lt.name.toLowerCase(), label: lt.name })),
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setTypeFilter(opt.value)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                        typeFilter === opt.value
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="space-y-3">
                {filteredLeaveRequests.map((leave: any) => (
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
                                        {leaveTypeLabels[leave.leave_type] || leave.leave_type}
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
            <Pagination meta={leaveRequestsData} />

            <RequestModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmitLeave}
                employees={employees}
                leaveTypes={leaveTypes}
            />
        </AppLayout>
    );
}