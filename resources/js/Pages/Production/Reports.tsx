import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Factory, Clock, AlertTriangle, CheckCircle, ArrowRight, BarChart3, Users } from 'lucide-react';

const STATUS_META: Record<string, { label: string; color: string }> = {
    new_jobs: { label: 'New Jobs', color: 'bg-blue-500' },
    design: { label: 'Design', color: 'bg-indigo-500' },
    printing: { label: 'Printing', color: 'bg-amber-500' },
    assembly: { label: 'Assembly', color: 'bg-orange-500' },
    qc_inspection: { label: 'QC & Inspection', color: 'bg-purple-500' },
    completed: { label: 'Completed', color: 'bg-emerald-500' },
    paused: { label: 'Paused', color: 'bg-yellow-500' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500' },
};

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-500/20 text-slate-400',
    normal: 'bg-blue-500/20 text-blue-400',
    high: 'bg-amber-500/20 text-amber-400',
    urgent: 'bg-red-500/20 text-red-400',
};

export default function ProductionReports() {
    const { stats, totalJobs, overdueCount, avgCompletionHours, priorityBreakdown, monthlyJobs, workload, recentJobs } = usePage().props as any;

    const statCards = [
        { label: 'Total Jobs', value: totalJobs, icon: Factory, color: 'bg-slate-500/20 text-slate-400' },
        { label: 'Completed', value: stats.completed ?? 0, icon: CheckCircle, color: 'bg-green-500/20 text-green-400' },
        { label: 'Overdue', value: overdueCount, icon: AlertTriangle, color: 'bg-red-500/20 text-red-400' },
        { label: 'Avg Completion', value: `${avgCompletionHours}h`, icon: Clock, color: 'bg-indigo-500/20 text-indigo-400' },
    ];

    const maxCount = Math.max(...monthlyJobs.map((m: any) => m.count), 1);
    const maxStatus = Math.max(...Object.values(stats).map((v: any) => v as number), 1);
    const maxWorkload = Math.max(...workload.map((w: any) => Number(w.job_count)), 1);

    return (
        <AppLayout>
            <Head title="Production Reports" />

            <PageHeader
                title="Production Reports"
                subtitle="Job throughput and workload analytics"
            />

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statCards.map((stat, i) => (
                    <GlassCard key={i}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{stat.value}</p>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Jobs */}
                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" /> Monthly Jobs Created
                        </h2>
                        <span className="text-sm text-slate-500">Last 12 months</span>
                    </div>
                    <div className="space-y-2">
                        {monthlyJobs.map((month: any, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-sm text-slate-500 w-16">{month.month}</span>
                                <div className="flex-1 bg-slate-100 dark:bg-white/10 rounded-full h-6 relative overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full rounded-full transition-all"
                                        style={{ width: `${(month.count / maxCount) * 100}%` }}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-900 dark:text-white">
                                        {month.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Status Breakdown */}
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Jobs by Status</h2>
                    <div className="space-y-2">
                        {Object.entries(STATUS_META).map(([status, meta]) => (
                            <div key={status} className="flex items-center gap-3">
                                <span className="text-sm text-slate-500 w-32 truncate">{meta.label}</span>
                                <div className="flex-1 bg-slate-100 dark:bg-white/10 rounded-full h-6 relative overflow-hidden">
                                    <div
                                        className={`${meta.color} h-full rounded-full transition-all`}
                                        style={{ width: `${((stats[status] ?? 0) / maxStatus) * 100}%` }}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-900 dark:text-white">
                                        {stats[status] ?? 0}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Priority Breakdown */}
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Jobs by Priority</h2>
                    <div className="space-y-4">
                        {Object.entries(priorityBreakdown).map(([priority, count]) => (
                            <div key={priority} className={`flex items-center justify-between p-3 rounded-lg ${PRIORITY_COLORS[priority] || 'bg-slate-500/10'}`}>
                                <span className="font-medium capitalize">{priority}</span>
                                <span className="text-xl font-semibold">{count as number}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Workload */}
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" /> Active Workload
                    </h2>
                    {workload.length > 0 ? (
                        <div className="space-y-2">
                            {workload.map((w: any) => (
                                <div key={w.id} className="flex items-center gap-3">
                                    <span className="text-sm text-slate-500 w-32 truncate">{w.name}</span>
                                    <div className="flex-1 bg-slate-100 dark:bg-white/10 rounded-full h-6 relative overflow-hidden">
                                        <div
                                            className="bg-indigo-500 h-full rounded-full transition-all"
                                            style={{ width: `${(Number(w.job_count) / maxWorkload) * 100}%` }}
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-900 dark:text-white">
                                            {w.job_count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-4">No active jobs assigned yet</p>
                    )}
                </GlassCard>
            </div>

            {/* Recent Jobs */}
            <GlassCard>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Jobs</h2>
                    <Link href="/production" className="text-sm text-indigo-400 hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Job #</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Title</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Assignee</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Due</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentJobs.map((job: any) => (
                                <tr key={job.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                                    <td className="py-3 px-4 font-mono text-sm">{job.job_number}</td>
                                    <td className="py-3 px-4">{job.title}</td>
                                    <td className="py-3 px-4">
                                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                            {STATUS_META[job.status]?.label || job.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-400">{job.assigned_to?.name || '-'}</td>
                                    <td className="py-3 px-4 text-slate-400">{job.due_date ? new Date(job.due_date).toLocaleDateString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </AppLayout>
    );
}
