import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link } from '@inertiajs/react';
import { Clock, CheckCircle2, AlertTriangle, CalendarCheck, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface Decision {
    id: number;
    title: string;
    category?: { name: string };
    created_by?: { name: string };
    status: string;
    created_at: string;
}

interface ActionItem {
    id: number;
    title: string;
    decision?: { title: string };
    assigned_to?: { name: string };
    due_date: string;
    status: string;
}

interface DashboardProps {
    stats: {
        pending_decisions: number;
        approved_this_month: number;
        overdue_actions: number;
        completed_this_week: number;
    };
    decisionsByCategory: { name: string; value: number }[];
    decisionsByStatus: { name: string; value: number }[];
    recentDecisions: Decision[];
    overdueActionItems: ActionItem[];
}

export default function Dashboard({
    stats,
    decisionsByCategory,
    decisionsByStatus,
    recentDecisions,
    overdueActionItems,
}: DashboardProps) {
    const statCards = [
        {
            label: 'Pending Decisions',
            value: stats.pending_decisions,
            icon: Clock,
            color: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Approved This Month',
            value: stats.approved_this_month,
            icon: CheckCircle2,
            color: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-600',
        },
        {
            label: 'Overdue Actions',
            value: stats.overdue_actions,
            icon: AlertTriangle,
            color: 'bg-amber-100 dark:bg-amber-900/30',
            iconColor: 'text-amber-600',
        },
        {
            label: 'Completed This Week',
            value: stats.completed_this_week,
            icon: CalendarCheck,
            color: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600',
        },
    ];

    const STATUS_COLORS: Record<string, string> = {
        draft: '#94a3b8',
        pending: '#f59e0b',
        approved: '#22c55e',
        rejected: '#ef4444',
        implemented: '#3b82f6',
        archived: '#6b7280',
    };

    return (
        <AppLayout>
            <Head title="Decision Hub" />

            <PageHeader title="Decision Hub" subtitle="Management overview" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat) => (
                    <GlassCard key={stat.label}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Decisions by Category</h3>
                    <div className="flex justify-center">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={decisionsByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {decisionsByCategory.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Decisions by Status</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={decisionsByStatus}>
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {decisionsByStatus.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Decisions</h3>
                        <Link href="/management/decisions" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentDecisions.length > 0 ? (
                            recentDecisions.slice(0, 5).map((decision) => (
                                <div key={decision.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{decision.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {decision.category && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                        {decision.category.name}
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-400">
                                                    {decision.created_by?.name}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                            {new Date(decision.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-400 py-8">No recent decisions</p>
                        )}
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Overdue Action Items</h3>
                        <Link href="/management/decisions?filter=overdue" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {overdueActionItems.length > 0 ? (
                            overdueActionItems.slice(0, 5).map((item) => (
                                <div key={item.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {item.decision && (
                                                    <span className="text-xs text-slate-400">
                                                        {item.decision.title}
                                                    </span>
                                                )}
                                            </div>
                                            {item.assigned_to && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Assigned to {item.assigned_to.name}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs text-red-500 font-medium whitespace-nowrap">
                                            Due {new Date(item.due_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-400 py-8">No overdue items</p>
                        )}
                    </div>
                </GlassCard>
            </div>
        </AppLayout>
    );
}
