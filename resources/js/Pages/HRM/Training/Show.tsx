import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Calendar, Users, Video } from 'lucide-react';
import Swal from 'sweetalert2';

export default function TrainingShow() {
    const { module, employees } = usePage().props as any;

    const handleDelete = () => {
        Swal.fire({
            title: 'Delete this training module?',
            text: 'This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/hrm/training/${module.id}`);
            }
        });
    };

    const completedCount = employees.filter((e: any) => e.status === 'completed').length;

    return (
        <AppLayout>
            <Head title={module.title} />

            <div className="mb-6">
                <Link href="/hrm/training" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Training
                </Link>
            </div>

            <PageHeader
                title={module.title}
                subtitle={module.category || 'Staff Training'}
                action={
                    <div className="flex items-center gap-2">
                        {!module.is_active && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Inactive</span>
                        )}
                        <Link href={`/hrm/training/${module.id}/edit`} className="glass-button-secondary flex items-center gap-2">
                            <Pencil className="w-4 h-4" /> Edit
                        </Link>
                        <button onClick={handleDelete} className="glass-button-secondary flex items-center gap-2 text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                }
            />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Details</h2>
                        {module.description && (
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-4">{module.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Due Date</p>
                                    <p className="font-medium">{module.due_date ? new Date(module.due_date).toLocaleDateString() : 'No deadline'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Passing Score</p>
                                    <p className="font-medium">{module.passing_score}%</p>
                                </div>
                            </div>
                        </div>
                        {module.video_url && (
                            <a
                                href={module.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:underline text-sm"
                            >
                                <Video className="w-4 h-4" /> Watch training video
                            </a>
                        )}
                    </GlassCard>

                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Quiz Questions ({module.quiz_questions?.length || 0})</h2>
                        <div className="space-y-3">
                            {(module.quiz_questions || []).map((q: any, i: number) => (
                                <div key={q.id} className="p-3 rounded-lg bg-slate-50 dark:bg-white/5">
                                    <p className="text-sm font-medium mb-1">{i + 1}. {q.question}</p>
                                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                                        {q.options.map((opt: string, oi: number) => (
                                            <li key={oi} className={oi === q.correct_option ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                                                {oi === q.correct_option ? '✓ ' : '· '}{opt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Completion</h2>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-2xl font-bold">{completedCount}</span>
                            <span className="text-slate-400">/ {employees.length} employees</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden mb-4">
                            <div
                                className="h-full bg-indigo-500"
                                style={{ width: `${employees.length > 0 ? (completedCount / employees.length) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {employees.map((emp: any) => (
                                <div key={emp.id} className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{emp.name}</p>
                                        {emp.quiz_score !== null && (
                                            <p className="text-xs text-slate-400">Score: {emp.quiz_score}%{emp.attempts > 1 ? ` (${emp.attempts} attempts)` : ''}</p>
                                        )}
                                    </div>
                                    <StatusBadge status={emp.status} />
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
}
