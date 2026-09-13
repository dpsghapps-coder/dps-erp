import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Calendar, Clock, User, Lock, Unlock } from 'lucide-react';
import Swal from 'sweetalert2';

const FREQUENCY_LABELS: Record<string, string> = {
    one_time: 'One-time',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
};

export default function TaskShow() {
    const { task, auth } = usePage().props as any;
    const permissions: string[] = auth?.permissions || [];
    const canManage = permissions.includes('*') || permissions.includes('tasks.manage');

    const handleDelete = () => {
        Swal.fire({
            title: 'Delete this task?',
            text: 'This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/management/tasks/${task.id}`);
            }
        });
    };

    const handleClose = () => {
        Swal.fire({
            title: 'Close this task?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Close Task',
        }).then((res) => {
            if (res.isConfirmed) {
                router.post(`/management/tasks/${task.id}/close`);
            }
        });
    };

    const handleReopen = () => {
        router.post(`/management/tasks/${task.id}/reopen`);
    };

    return (
        <AppLayout>
            <Head title={task.title} />

            <div className="mb-6">
                <Link href="/management/tasks" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Tasks
                </Link>
            </div>

            <PageHeader
                title={task.title}
                subtitle={FREQUENCY_LABELS[task.frequency] || task.frequency}
                action={
                    canManage && (
                        <div className="flex items-center gap-2">
                            <StatusBadge status={task.status} />
                            <Link href={`/management/tasks/${task.id}/edit`} className="glass-button-secondary flex items-center gap-2">
                                <Pencil className="w-4 h-4" /> Edit
                            </Link>
                            {task.status === 'open' ? (
                                <button onClick={handleClose} className="glass-button-secondary flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Close
                                </button>
                            ) : (
                                <button onClick={handleReopen} className="glass-button-secondary flex items-center gap-2">
                                    <Unlock className="w-4 h-4" /> Reopen
                                </button>
                            )}
                            <button onClick={handleDelete} className="glass-button-secondary flex items-center gap-2 text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    )
                }
            />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Details</h2>
                        {task.description && (
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-4">{task.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Deadline</p>
                                    <p className="font-medium">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Priority</p>
                                    <p className="font-medium capitalize">{task.priority}</p>
                                </div>
                            </div>
                        </div>
                        {task.status === 'closed' && task.closed_by && (
                            <div className="mt-4 pt-4 border-t text-sm text-slate-500 dark:text-slate-400">
                                Closed by {task.closed_by.name} on {new Date(task.closed_at).toLocaleDateString()}
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Progress Log</h2>
                        {task.progress_updates && task.progress_updates.length > 0 ? (
                            <div className="space-y-3">
                                {task.progress_updates.map((update: any) => (
                                    <div key={update.id} className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium">{update.user?.name}</span>
                                                {update.status && <StatusBadge status={update.status} className="text-[10px]" />}
                                                {update.progress !== null && (
                                                    <span className="text-xs text-slate-400">{update.progress}%</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400">{new Date(update.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{update.note}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 dark:text-slate-300">No progress logged yet</p>
                        )}
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Assignees</h2>
                        <div className="space-y-3">
                            {task.assignees.map((assignee: any) => (
                                <div key={assignee.id} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-medium text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                                            {assignee.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium truncate">{assignee.name}</span>
                                    </div>
                                    <StatusBadge status={assignee.pivot.status} />
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Info</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Created By</span>
                                <span>{task.created_by?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Created At</span>
                                <span>{new Date(task.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
}
