import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, LoadingSpinner } from '@/Components/ui';
import { ArrowLeft, Star, Save } from 'lucide-react';

const WORKFLOW_STEPS = [
    { key: 'self_assessment', label: 'Self-Assessment' },
    { key: 'supervisor_review', label: 'Supervisor' },
    { key: 'manager_review', label: 'Manager' },
    { key: 'hr_review', label: 'HR' },
    { key: 'completed', label: 'Completed' },
];

function StatusStepper({ status, hasManagerStage }: { status: string; hasManagerStage: boolean }) {
    const steps = hasManagerStage ? WORKFLOW_STEPS : WORKFLOW_STEPS.filter((s) => s.key !== 'manager_review');
    const currentIndex = steps.findIndex((s) => s.key === status);
    const activeIndex = currentIndex === -1 ? steps.length - 1 : currentIndex;

    return (
        <div className="flex items-center justify-between mb-8 px-2">
            {steps.map((step, index) => (
                <div key={step.key} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                            index < activeIndex ? 'bg-green-500 border-green-500 text-white' :
                            index === activeIndex ? 'bg-indigo-500 border-indigo-500 text-white' :
                            'bg-white border-slate-300 text-slate-400'
                        }`}>
                            {index + 1}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${index === activeIndex ? 'text-indigo-600' : index < activeIndex ? 'text-green-600' : 'text-slate-400'}`}>
                            {step.label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${index < activeIndex ? 'bg-green-500' : 'bg-slate-200'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => onChange(n)}>
                    <Star className={`w-6 h-6 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                </button>
            ))}
        </div>
    );
}

function Stars({ rating }: { rating: number | null }) {
    if (!rating) return null;
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`w-4 h-4 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
            ))}
        </div>
    );
}

export default function PerformanceReviewShow({ review, viewerRoles }: { review: any; viewerRoles: any }) {
    const [processing, setProcessing] = useState(false);

    const [selfRating, setSelfRating] = useState(review.self_rating || 3);
    const [achievements, setAchievements] = useState(review.achievements || '');
    const [goals, setGoals] = useState(review.goals || '');
    const [selfComments, setSelfComments] = useState(review.self_comments || '');

    const [supervisorRating, setSupervisorRating] = useState(review.supervisor_rating || 3);
    const [supervisorComments, setSupervisorComments] = useState(review.supervisor_comments || '');

    const [managerComments, setManagerComments] = useState(review.manager_comments || '');
    const [hrComments, setHrComments] = useState(review.hr_comments || '');

    const submit = (url: string, data: Record<string, any>) => {
        setProcessing(true);
        router.post(url, data, {
            onFinish: () => setProcessing(false),
        });
    };

    const employeeName = `${review.employee?.first_name || ''} ${review.employee?.last_name || ''}`.trim();
    const hasManagerStage = Boolean(review.manager_employee_id) || review.status === 'manager_review';

    return (
        <AppLayout>
            <Head title={`Performance Review — ${employeeName}`} />

            <PageHeader
                title={`Performance Review — ${employeeName}`}
                subtitle={review.period || undefined}
                action={
                    <Link href="/profile/performance" className="glass-button-secondary flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                }
            />

            <div className="flex items-center gap-3 mb-6">
                <StatusBadge status={review.status} />
                <span className="text-sm text-slate-500">
                    Initiated {new Date(review.review_date).toLocaleDateString()}
                    {review.initiated_by ? ` by ${review.initiated_by.name}` : ''}
                </span>
            </div>

            <StatusStepper status={review.status} hasManagerStage={hasManagerStage} />

            <div className="space-y-6 max-w-3xl">
                {/* Self-assessment */}
                <GlassCard>
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Self-Assessment</h3>
                    {review.self_submitted_at ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Self-rating:</span>
                                <Stars rating={review.self_rating} />
                            </div>
                            {review.achievements && (
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase mb-1">Achievements</p>
                                    <p className="text-sm whitespace-pre-wrap">{review.achievements}</p>
                                </div>
                            )}
                            {review.goals && (
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase mb-1">Goals</p>
                                    <p className="text-sm whitespace-pre-wrap">{review.goals}</p>
                                </div>
                            )}
                            {review.self_comments && (
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase mb-1">Comments</p>
                                    <p className="text-sm whitespace-pre-wrap">{review.self_comments}</p>
                                </div>
                            )}
                        </div>
                    ) : viewerRoles.isSelf && review.status === 'self_assessment' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-slate-500">Self-Rating *</label>
                                <StarPicker value={selfRating} onChange={setSelfRating} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-slate-500">Achievements this period</label>
                                <textarea className="glass-input w-full h-24" value={achievements} onChange={(e) => setAchievements(e.target.value)} placeholder="What did you accomplish?" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-slate-500">Goals for next period</label>
                                <textarea className="glass-input w-full h-24" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="What are you aiming for next?" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-slate-500">Comments</label>
                                <textarea className="glass-input w-full h-20" value={selfComments} onChange={(e) => setSelfComments(e.target.value)} placeholder="Anything else you'd like to add?" />
                            </div>
                            <button
                                disabled={processing}
                                onClick={() => submit(`/hrm/performance/${review.id}/self-assessment`, {
                                    self_rating: selfRating, achievements, goals, self_comments: selfComments,
                                })}
                                className="glass-button flex items-center gap-2"
                            >
                                {processing ? <LoadingSpinner /> : <Save className="w-4 h-4" />} Submit Self-Assessment
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">Awaiting the employee's self-assessment.</p>
                    )}
                </GlassCard>

                {/* Supervisor */}
                <GlassCard>
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                        Supervisor{review.supervisor_employee ? ` — ${review.supervisor_employee.first_name} ${review.supervisor_employee.last_name}` : ''}
                    </h3>
                    {review.supervisor_submitted_at ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Rating:</span>
                                <Stars rating={review.supervisor_rating} />
                            </div>
                            {review.supervisor_comments && <p className="text-sm whitespace-pre-wrap">{review.supervisor_comments}</p>}
                        </div>
                    ) : viewerRoles.isSupervisor && review.status === 'supervisor_review' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-slate-500">Rating *</label>
                                <StarPicker value={supervisorRating} onChange={setSupervisorRating} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-slate-500">Comments</label>
                                <textarea className="glass-input w-full h-24" value={supervisorComments} onChange={(e) => setSupervisorComments(e.target.value)} placeholder="Your view on their performance..." />
                            </div>
                            <button
                                disabled={processing}
                                onClick={() => submit(`/hrm/performance/${review.id}/supervisor-review`, {
                                    supervisor_rating: supervisorRating, supervisor_comments: supervisorComments,
                                })}
                                className="glass-button flex items-center gap-2"
                            >
                                {processing ? <LoadingSpinner /> : <Save className="w-4 h-4" />} Submit Review
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">
                            {review.status === 'self_assessment' ? 'Waiting on the self-assessment first.' : 'Awaiting the supervisor\'s review.'}
                        </p>
                    )}
                </GlassCard>

                {/* Manager (only shown once the chain has reached or passed this stage) */}
                {hasManagerStage && (
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                            Manager{review.manager_employee ? ` — ${review.manager_employee.first_name} ${review.manager_employee.last_name}` : ''}
                        </h3>
                        {review.manager_submitted_at ? (
                            <p className="text-sm whitespace-pre-wrap">{review.manager_comments}</p>
                        ) : viewerRoles.isManager && review.status === 'manager_review' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500">Comments</label>
                                    <textarea className="glass-input w-full h-24" value={managerComments} onChange={(e) => setManagerComments(e.target.value)} placeholder="Your view..." />
                                </div>
                                <button
                                    disabled={processing}
                                    onClick={() => submit(`/hrm/performance/${review.id}/manager-review`, { manager_comments: managerComments })}
                                    className="glass-button flex items-center gap-2"
                                >
                                    {processing ? <LoadingSpinner /> : <Save className="w-4 h-4" />} Submit Comments
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Awaiting the manager's comments.</p>
                        )}
                    </GlassCard>
                )}

                {/* HR */}
                <GlassCard>
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">HR Comments</h3>
                    {review.hr_submitted_at ? (
                        <p className="text-sm whitespace-pre-wrap">{review.hr_comments}</p>
                    ) : viewerRoles.isHr && review.status === 'hr_review' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-slate-500">Comments</label>
                                <textarea className="glass-input w-full h-24" value={hrComments} onChange={(e) => setHrComments(e.target.value)} placeholder="Final HR remarks..." />
                            </div>
                            <button
                                disabled={processing}
                                onClick={() => submit(`/hrm/performance/${review.id}/hr-review`, { hr_comments: hrComments })}
                                className="glass-button flex items-center gap-2"
                            >
                                {processing ? <LoadingSpinner /> : <Save className="w-4 h-4" />} Complete Review
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">Awaiting HR comments.</p>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
