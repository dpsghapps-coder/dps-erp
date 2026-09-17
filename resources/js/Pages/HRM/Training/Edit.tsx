import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import TrainingModuleFields from './TrainingModuleFields';
import { emptyQuestion, QuizQuestionForm } from './quizQuestions';

export default function TrainingEdit() {
    const { module } = usePage().props as any;
    const { data, setData, put, processing, errors } = useForm({
        title: module.title || '',
        description: module.description || '',
        video_url: module.video_url || '',
        category: module.category || '',
        due_date: module.due_date?.split('T')[0] || '',
        passing_score: module.passing_score ?? 70,
        is_active: module.is_active ?? true,
        questions: (module.quiz_questions?.length > 0
            ? module.quiz_questions.map((q: any) => ({ question: q.question, options: q.options, correct_option: q.correct_option }))
            : [emptyQuestion()]) as QuizQuestionForm[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/hrm/training/${module.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit ${module.title}`} />

            <div className="mb-6">
                <Link href={`/hrm/training/${module.id}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Training
                </Link>
            </div>

            <PageHeader title="Edit Training Module" subtitle={module.title} />

            <div className="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <TrainingModuleFields data={data} setData={setData} errors={errors} />

                    <div className="flex gap-3">
                        <button type="submit" disabled={processing} className="glass-button">
                            Save Changes
                        </button>
                        <Link href={`/hrm/training/${module.id}`} className="glass-button-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
