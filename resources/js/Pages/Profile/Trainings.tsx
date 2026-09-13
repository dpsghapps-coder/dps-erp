import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, StatusBadge } from '@/Components/ui';
import { Head, router, usePage } from '@inertiajs/react';
import { GraduationCap, Video, Send } from 'lucide-react';
import { useState } from 'react';
import ProfileNav from '@/Components/ProfileNav';

function TrainingCard({ module }: { module: any }) {
    const [showQuiz, setShowQuiz] = useState(false);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [submitting, setSubmitting] = useState(false);

    const questions = module.quiz_questions || [];
    const allAnswered = questions.length > 0 && questions.every((q: any) => answers[q.id] !== undefined);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!allAnswered) return;
        setSubmitting(true);
        router.post(`/profile/trainings/${module.id}/quiz`, {
            answers: questions.map((q: any) => ({ question_id: q.id, selected_option: answers[q.id] })),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowQuiz(false);
                setAnswers({});
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <GlassCard>
            <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{module.title}</h3>
                    {module.category && <p className="text-xs text-slate-400 mt-0.5">{module.category}</p>}
                </div>
                <StatusBadge status={module.my_status} />
            </div>
            {module.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 whitespace-pre-wrap">{module.description}</p>
            )}
            {module.my_quiz_score !== null && module.my_quiz_score !== undefined && (
                <p className="text-xs text-slate-400 mb-3">
                    Last score: {module.my_quiz_score}% (passing: {module.passing_score}%){module.my_attempts > 1 ? ` · ${module.my_attempts} attempts` : ''}
                </p>
            )}

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                {module.video_url && (
                    <a
                        href={module.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-button-secondary text-sm flex items-center gap-2"
                    >
                        <Video className="w-4 h-4" /> Watch Video
                    </a>
                )}
                {module.my_status !== 'completed' && questions.length > 0 && (
                    <button onClick={() => setShowQuiz(!showQuiz)} className="glass-button text-sm">
                        {showQuiz ? 'Hide Quiz' : module.my_status === 'failed' ? 'Retake Quiz' : 'Take Quiz'}
                    </button>
                )}
            </div>

            {showQuiz && (
                <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-4">
                    {questions.map((q: any, i: number) => (
                        <div key={q.id}>
                            <p className="text-sm font-medium mb-2">{i + 1}. {q.question}</p>
                            <div className="space-y-1.5">
                                {q.options.map((option: string, oi: number) => (
                                    <label key={oi} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            checked={answers[q.id] === oi}
                                            onChange={() => setAnswers({ ...answers, [q.id]: oi })}
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button
                        type="submit"
                        disabled={!allAnswered || submitting}
                        className="glass-button flex items-center gap-2 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" /> Submit Quiz
                    </button>
                </form>
            )}
        </GlassCard>
    );
}

export default function ProfileTrainings() {
    const { modules } = usePage().props as any;

    return (
        <AppLayout>
            <Head title="Training" />

            <div className="max-w-4xl mx-auto">
                <PageHeader title="My Training" subtitle="Watch each video and pass the quiz to complete your training" />
                <ProfileNav />

                {modules && modules.length > 0 ? (
                    <div className="space-y-4">
                        {modules.map((module: any) => (
                            <TrainingCard key={module.id} module={module} />
                        ))}
                    </div>
                ) : (
                    <GlassCard>
                        <EmptyState icon={GraduationCap} title="No training assigned" description="Training modules will show up here once they're added." />
                    </GlassCard>
                )}
            </div>
        </AppLayout>
    );
}
