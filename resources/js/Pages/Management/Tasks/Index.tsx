import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState, Pagination } from '@/Components/ui';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ListChecks, Plus, Calendar, Users } from 'lucide-react';

const FREQUENCY_LABELS: Record<string, string> = {
    one_time: 'One-time',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
};

const PRIORITY_STYLES: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
    normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function TasksIndex() {
    const { tasks, filters } = usePage().props as any;

    const applyFilter = (key: string, value: string) => {
        router.get('/management/tasks', { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Non-Operational Tasks" />

            <PageHeader
                title="Non-Operational Tasks"
                subtitle={`${tasks.total} tasks total`}
                action={
                    <Link href="/management/tasks/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Task
                    </Link>
                }
            />

            <div className="flex flex-wrap gap-3 mb-4">
                <select
                    value={filters.status || ''}
                    onChange={(e) => applyFilter('status', e.target.value)}
                    className="glass-input"
                >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                </select>
                <select
                    value={filters.frequency || ''}
                    onChange={(e) => applyFilter('frequency', e.target.value)}
                    className="glass-input"
                >
                    <option value="">All Frequencies</option>
                    {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <GlassCard className="overflow-hidden p-0">
                {tasks.data.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {tasks.data.map((task: any) => (
                            <Link
                                key={task.id}
                                href={`/management/tasks/${task.id}`}
                                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{task.title}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.normal}`}>
                                            {task.priority}
                                        </span>
                                        <StatusBadge status={task.status} />
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                        <span>{FREQUENCY_LABELS[task.frequency] || task.frequency}</span>
                                        {task.deadline && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" /> {new Date(task.deadline).toLocaleDateString()}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" /> {task.assignees.length} assigned
                                        </span>
                                    </div>
                                </div>
                                <div className="flex -space-x-2 flex-shrink-0">
                                    {task.assignees.slice(0, 4).map((a: any) => (
                                        <div
                                            key={a.id}
                                            title={a.name}
                                            className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-medium text-indigo-700 dark:text-indigo-300"
                                        >
                                            {a.name.charAt(0).toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-8">
                        <EmptyState icon={ListChecks} title="No tasks yet" description="Create a non-operational task to start assigning and following up on it." />
                    </div>
                )}
            </GlassCard>
            <Pagination meta={tasks} />
        </AppLayout>
    );
}
