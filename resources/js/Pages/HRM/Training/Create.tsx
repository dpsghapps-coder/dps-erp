import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/ui';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import TrainingModuleFields from './TrainingModuleFields';
import { emptyQuestion, QuizQuestionForm } from './quizQuestions';

export default function TrainingCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        video_url: '',
        category: '',
        due_date: '',
        passing_score: 70,
        is_active: true,
        questions: [emptyQuestion()] as QuizQuestionForm[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/hrm/training');
    };

    return (
        <AppLayout>
            <Head title="New Training Module" />

            <div className="mb-6">
                <Link href="/hrm/training" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Training
                </Link>
            </div>

            <PageHeader title="New Training Module" subtitle="Add a video and quiz for staff to complete" />

            <div className="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <TrainingModuleFields data={data} setData={setData} errors={errors} titlePlaceholder="e.g., Fire and Health Safety" />

                    <div className="flex gap-3">
                        <button type="submit" disabled={processing} className="glass-button">
                            Create Training Module
                        </button>
                        <Link href="/hrm/training" className="glass-button-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
