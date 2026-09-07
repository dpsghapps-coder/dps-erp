import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, StatusBadge, Pagination } from '@/Components/ui';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, Send } from 'lucide-react';
import ProfileNav from '@/Components/ProfileNav';

export default function Leave() {
    const { hasEmployeeRecord, leaveTypes, leaveRequests, balance } = usePage().props as any;

    const { data, setData, post, processing, errors, reset } = useForm({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile/leave', { onSuccess: () => reset() });
    };

    return (
        <AppLayout>
            <Head title="Leave" />

            <div className="max-w-4xl mx-auto">
                <PageHeader title="Leave" subtitle="Apply for leave and track your requests" />
                <ProfileNav />

                {!hasEmployeeRecord ? (
                    <GlassCard>
                        <EmptyState icon={CalendarDays} title="No employee record linked" description="Your user account isn't linked to an employee record yet. Contact HR to get this set up." />
                    </GlassCard>
                ) : (
                    <div className="space-y-6">
                        {(balance || []).length > 0 && (
                            <GlassCard>
                                <h2 className="text-lg font-semibold mb-4">Leave Balance</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {balance.map((b: any) => (
                                        <div key={b.id} className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">{b.name}</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{b.remaining}</p>
                                            <p className="text-xs text-slate-400">of {b.days_per_year} days remaining ({b.used} used)</p>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Apply for Leave</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Leave Type</label>
                                    <select value={data.leave_type_id} onChange={(e) => setData('leave_type_id', e.target.value)} className="glass-input w-full">
                                        <option value="">Select leave type</option>
                                        {(leaveTypes || []).map((lt: any) => (
                                            <option key={lt.id} value={lt.id}>{lt.name} ({lt.days_per_year} days/yr)</option>
                                        ))}
                                    </select>
                                    {errors.leave_type_id && <p className="text-red-400 text-sm mt-1">{errors.leave_type_id}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Start Date</label>
                                        <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className="glass-input w-full" />
                                        {errors.start_date && <p className="text-red-400 text-sm mt-1">{errors.start_date}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">End Date</label>
                                        <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} className="glass-input w-full" />
                                        {errors.end_date && <p className="text-red-400 text-sm mt-1">{errors.end_date}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Reason (optional)</label>
                                    <textarea value={data.reason} onChange={(e) => setData('reason', e.target.value)} className="glass-input w-full h-20" placeholder="Reason for leave..." />
                                </div>
                                <button type="submit" disabled={processing} className="glass-button flex items-center gap-2">
                                    <Send className="w-4 h-4" /> {processing ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        </GlassCard>

                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">My Requests</h2>
                            {leaveRequests?.data?.length > 0 ? (
                                <>
                                    <div className="space-y-2">
                                        {leaveRequests.data.map((lr: any) => (
                                            <div key={lr.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5 last:border-0">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{lr.leave_type?.name || lr.leave_type}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {new Date(lr.start_date).toLocaleDateString()} — {new Date(lr.end_date).toLocaleDateString()} ({lr.days_count} days)
                                                    </p>
                                                    {lr.reason && <p className="text-xs text-slate-400 mt-0.5">{lr.reason}</p>}
                                                </div>
                                                <StatusBadge status={lr.status} />
                                            </div>
                                        ))}
                                    </div>
                                    <Pagination meta={leaveRequests} />
                                </>
                            ) : (
                                <EmptyState icon={CalendarDays} title="No leave requests yet" description="Requests you submit will show up here" />
                            )}
                        </GlassCard>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
