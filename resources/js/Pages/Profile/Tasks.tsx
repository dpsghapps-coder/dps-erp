import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, StatusBadge } from '@/Components/ui';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ListChecks, Calendar, Send } from 'lucide-react';
import ProfileNav from '@/Components/ProfileNav';

const FREQUENCY_LABELS: Record<string, string> = {
    one_time: 'One-time',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
};

function TaskCard({ task }: { task: any }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        note: '',
        status: task.pivot.status,
        progress: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/profile/tasks/${task.id}/progress`, {
            preserveScroll: true,
            onSuccess: () => reset('note', 'progress'),
        });
    };

    return (
        <GlassCard>
            <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>{FREQUENCY_LABELS[task.frequency] || task.frequency}</span>
                        {task.deadline && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {new Date(task.deadline).toLocaleDateString()}
                            </span>
                        )}
                        <span className="capitalize">{task.priority} priority</span>
                    </div>
                </div>
                <StatusBadge status={task.pivot.status} />
            </div>
            {task.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-wrap">{task.description}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Add Update</label>
                    <textarea
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        className="glass-input w-full h-16 resize-none text-sm"
                        placeholder="What did you do..."
                    />
                    {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note}</p>}
                </div>
                <div className="flex gap-2">
                    <select
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        className="glass-input text-sm flex-1"
                    >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={data.progress}
                        onChange={(e) => setData('progress', e.target.value)}
                        placeholder="%"
                        className="glass-input text-sm w-20"
                    />
                    <button type="submit" disabled={processing || !data.note} className="glass-button-secondary px-3 disabled:opacity-50 flex items-center gap-1">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {task.progress_updates && task.progress_updates.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                    {task.progress_updates.map((update: any) => (
                        <div key={update.id} className="text-xs">
                            <div className="flex items-center gap-2 text-slate-400">
                                <span>{new Date(update.created_at).toLocaleString()}</span>
                                {update.status && <StatusBadge status={update.status} className="text-[10px]" />}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">{update.note}</p>
                        </div>
                    ))}
                </div>
            )}
        </GlassCard>
    );
}

export default function ProfileTasks() {
    const { tasks } = usePage().props as any;

    return (
        <AppLayout>
            <Head title="My Tasks" />

            <div className="max-w-4xl mx-auto">
                <PageHeader title="My Tasks" subtitle="Non-operational tasks assigned to you" />
                <ProfileNav />

                {tasks && tasks.length > 0 ? (
                    <div className="space-y-4">
                        {tasks.map((task: any) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                ) : (
                    <GlassCard>
                        <EmptyState icon={ListChecks} title="No tasks assigned" description="Non-operational tasks assigned to you will show up here." />
                    </GlassCard>
                )}
            </div>
        </AppLayout>
    );
}
