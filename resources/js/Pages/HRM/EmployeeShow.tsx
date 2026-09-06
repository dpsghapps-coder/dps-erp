import { useState } from 'react';
import { usePage, Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState } from '@/Components/ui';
import { useCurrency } from '@/Utils/currency';
import WhatsAppLink from '@/Components/WhatsAppLink';
import {
    ArrowLeft,
    Pencil,
    Mail,
    Building,
    Briefcase,
    Calendar,
    Star,
    Clock,
    Wallet,
    User,
    FileText,
    ShieldAlert,
} from 'lucide-react';

const TABS = ['Details', 'Leave History', 'Attendance', 'Payroll', 'Performance'] as const;
type Tab = typeof TABS[number];

function formatDate(value?: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

function DetailRow({ label, children }: { label: string; children?: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            {children ? children : <span className="text-slate-600">—</span>}
        </div>
    );
}

export default function EmployeeShow() {
    const { props } = usePage();
    const employee = (props as any)?.employee || {};
    const formatCurrency = useCurrency();
    const [activeTab, setActiveTab] = useState<Tab>('Details');

    const leaveRequests = employee.leave_requests || [];
    const attendanceLogs = employee.attendance_logs || [];
    const payrolls = employee.payrolls || [];
    const performances = employee.performances || [];

    const isActive = !employee.date_terminated;

    const latestPayslip = payrolls[0];
    const avgRating = performances.length > 0
        ? (performances.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / performances.length).toFixed(1)
        : null;
    const presentDaysThisMonth = attendanceLogs.filter((a: any) => a.check_in).length;

    return (
        <AppLayout>
            <Head title={`${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Employee Profile'} />

            <div className="mb-6">
                <Link href="/hrm/employees" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Employees
                </Link>
            </div>

            <PageHeader
                title={
                    <div className="flex items-center gap-2 flex-wrap">
                        <span>{employee.first_name} {employee.last_name}</span>
                        <StatusBadge status={isActive ? 'active' : 'inactive'} />
                    </div>
                }
                subtitle={employee.job_title || 'No title'}
                action={
                    <Link href={`/hrm/${employee.id}/edit`} className="glass-button flex items-center gap-2">
                        <Pencil className="w-4 h-4" /> Edit
                    </Link>
                }
            />

            {/* Top KPI Summary Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <GlassCard className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Leave Days</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{employee.leave_days ?? 0}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Present (recent)</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{presentDaysThisMonth} days</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Star className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Avg Rating</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{avgRating ?? '—'}{avgRating ? ' / 5' : ''}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Latest Net Pay</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                                {latestPayslip ? formatCurrency(latestPayslip.net_pay) : '—'}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-slate-50 dark:bg-white/5 rounded-lg p-1 w-fit overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                            activeTab === tab
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                    >
                        {tab}
                        {tab === 'Leave History' && leaveRequests.length > 0 && (
                            <span className="ml-1.5 text-xs bg-slate-200 dark:bg-white/20 px-1.5 py-0.5 rounded-full">{leaveRequests.length}</span>
                        )}
                        {tab === 'Payroll' && payrolls.length > 0 && (
                            <span className="ml-1.5 text-xs bg-slate-200 dark:bg-white/20 px-1.5 py-0.5 rounded-full">{payrolls.length}</span>
                        )}
                        {tab === 'Performance' && performances.length > 0 && (
                            <span className="ml-1.5 text-xs bg-slate-200 dark:bg-white/20 px-1.5 py-0.5 rounded-full">{performances.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Details */}
            {activeTab === 'Details' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <GlassCard>
                        <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow label="Employee Number">
                                <span className="font-mono text-sm">{employee.employee_number}</span>
                            </DetailRow>
                            <DetailRow label="Job Title">{employee.job_title}</DetailRow>
                            <DetailRow label="Department">
                                <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-400" /> {employee.department?.name || '—'}</span>
                            </DetailRow>
                            <DetailRow label="Employment Type">
                                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {employee.employment_type?.name || '—'}</span>
                            </DetailRow>
                            <DetailRow label="Staff Level">{employee.staff_level?.name || '—'}</DetailRow>
                            <DetailRow label="Supervising Manager">
                                {employee.supervising_manager
                                    ? `${employee.supervising_manager.first_name} ${employee.supervising_manager.last_name}`
                                    : '—'}
                            </DetailRow>
                            <DetailRow label="Date Hired">{formatDate(employee.date_hired)}</DetailRow>
                            <DetailRow label="Date Terminated">{employee.date_terminated ? formatDate(employee.date_terminated) : '—'}</DetailRow>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="font-semibold mb-4 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> Contact & Pay</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow label="Email">{employee.email || '—'}</DetailRow>
                            <DetailRow label="Mobile">
                                {employee.mobile_1 ? (
                                    <WhatsAppLink phone={employee.mobile_1} className="text-sm text-green-500 hover:underline">
                                        {employee.mobile_1}
                                    </WhatsAppLink>
                                ) : '—'}
                            </DetailRow>
                            <DetailRow label="Alternate Mobile">{employee.mobile_2 || '—'}</DetailRow>
                            <DetailRow label="Emergency Contact">{employee.emergency_person || '—'}</DetailRow>
                            <DetailRow label="Salary">{employee.salary ? formatCurrency(employee.salary) : '—'}</DetailRow>
                            <DetailRow label="Pay Frequency">
                                <span className="capitalize">{employee.pay_frequency || '—'}</span>
                            </DetailRow>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Leave History */}
            {activeTab === 'Leave History' && (
                <GlassCard className="overflow-hidden">
                    {leaveRequests.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Dates</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Days</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Reason</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaveRequests.map((lr: any) => (
                                        <tr key={lr.id} className="border-b border-slate-100 dark:border-white/5">
                                            <td className="py-3 px-4">{lr.leave_type?.name || lr.leave_type || '—'}</td>
                                            <td className="py-3 px-4 text-slate-500">{formatDate(lr.start_date)} – {formatDate(lr.end_date)}</td>
                                            <td className="py-3 px-4">{lr.days_count}</td>
                                            <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{lr.reason || '—'}</td>
                                            <td className="py-3 px-4"><StatusBadge status={lr.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState icon={Calendar} title="No leave requests yet" />
                    )}
                </GlassCard>
            )}

            {/* Attendance */}
            {activeTab === 'Attendance' && (
                <GlassCard className="overflow-hidden">
                    {attendanceLogs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Check In</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Check Out</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Hours</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceLogs.map((log: any) => (
                                        <tr key={log.id} className="border-b border-slate-100 dark:border-white/5">
                                            <td className="py-3 px-4">{formatDate(log.date)}</td>
                                            <td className="py-3 px-4 text-slate-500">{log.check_in ? new Date(log.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                            <td className="py-3 px-4 text-slate-500">{log.check_out ? new Date(log.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                            <td className="py-3 px-4">{log.hours_worked ?? '—'}</td>
                                            <td className="py-3 px-4">{log.status ? <StatusBadge status={log.status} /> : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState icon={Clock} title="No attendance records yet" />
                    )}
                </GlassCard>
            )}

            {/* Payroll */}
            {activeTab === 'Payroll' && (
                <GlassCard className="overflow-hidden">
                    {payrolls.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Month</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Basic</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Allowances</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Deductions</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Net Pay</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.map((p: any) => {
                                        const deductions = (parseFloat(p.deductions_tax) || 0)
                                            + (parseFloat(p.deductions_insurance) || 0)
                                            + (parseFloat(p.deductions_retirement) || 0)
                                            + (parseFloat(p.deductions_other) || 0);
                                        return (
                                            <tr key={p.id} className="border-b border-slate-100 dark:border-white/5">
                                                <td className="py-3 px-4 font-mono text-sm">{p.month}</td>
                                                <td className="py-3 px-4 text-right">{formatCurrency(p.basic_salary)}</td>
                                                <td className="py-3 px-4 text-right">{formatCurrency(p.allowances)}</td>
                                                <td className="py-3 px-4 text-right text-red-500">-{formatCurrency(deductions)}</td>
                                                <td className="py-3 px-4 text-right font-semibold">{formatCurrency(p.net_pay)}</td>
                                                <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState icon={Wallet} title="No payslips yet" />
                    )}
                </GlassCard>
            )}

            {/* Performance */}
            {activeTab === 'Performance' && (
                <div className="space-y-4">
                    {performances.length > 0 ? (
                        performances.map((review: any) => (
                            <GlassCard key={review.id}>
                                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                                    <div>
                                        <p className="text-sm text-slate-400">{formatDate(review.review_date)} · {review.reviewer_name || 'Unknown reviewer'}</p>
                                        {review.status && <StatusBadge status={review.status} className="mt-1" />}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                                            />
                                        ))}
                                        <span className="ml-1 text-sm font-medium">{review.rating}/5</span>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <DetailRow label="Goals">{review.goals}</DetailRow>
                                    <DetailRow label="Achievements">{review.achievements}</DetailRow>
                                </div>
                                {review.comments && (
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                                        <p className="text-xs text-slate-500 mb-1">Comments</p>
                                        <p className="text-sm italic text-slate-600 dark:text-slate-300">{review.comments}</p>
                                    </div>
                                )}
                            </GlassCard>
                        ))
                    ) : (
                        <GlassCard>
                            <EmptyState icon={FileText} title="No performance reviews yet" />
                        </GlassCard>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
