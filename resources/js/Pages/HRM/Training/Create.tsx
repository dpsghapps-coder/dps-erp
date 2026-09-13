import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface QuizQuestionForm {
    question: string;
    options: string[];
    correct_option: number;
}

function emptyQuestion(): QuizQuestionForm {
    return { question: '', options: ['', ''], correct_option: 0 };
}

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

    const addQuestion = () => setData('questions', [...data.questions, emptyQuestion()]);
    const removeQuestion = (index: number) => setData('questions', data.questions.filter((_, i) => i !== index));
    const updateQuestion = (index: number, field: keyof QuizQuestionForm, value: any) => {
        const next = [...data.questions];
        next[index] = { ...next[index], [field]: value };
        setData('questions', next);
    };
    const addOption = (qIndex: number) => {
        const next = [...data.questions];
        next[qIndex] = { ...next[qIndex], options: [...next[qIndex].options, ''] };
        setData('questions', next);
    };
    const removeOption = (qIndex: number, oIndex: number) => {
        const next = [...data.questions];
        const options = next[qIndex].options.filter((_, i) => i !== oIndex);
        let correct = next[qIndex].correct_option;
        if (correct >= options.length) correct = 0;
        next[qIndex] = { ...next[qIndex], options, correct_option: correct };
        setData('questions', next);
    };
    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const next = [...data.questions];
        const options = [...next[qIndex].options];
        options[oIndex] = value;
        next[qIndex] = { ...next[qIndex], options };
        setData('questions', next);
    };

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
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="e.g., Fire and Health Safety"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="glass-input w-full h-24 resize-none"
                                    placeholder="What this training covers..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Video URL</label>
                                <input
                                    type="text"
                                    value={data.video_url}
                                    onChange={(e) => setData('video_url', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                                {errors.video_url && <p className="text-red-500 text-sm mt-1">{errors.video_url}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <input
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="e.g., Safety"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                    {errors.due_date && <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={data.passing_score}
                                        onChange={(e) => setData('passing_score', Number(e.target.value))}
                                        className="glass-input w-full"
                                    />
                                    {errors.passing_score && <p className="text-red-500 text-sm mt-1">{errors.passing_score}</p>}
                                </div>
                                <div className="flex items-center gap-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded"
                                    />
                                    <label htmlFor="is_active" className="text-sm">Active (assigned to staff)</label>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Quiz Questions</h2>
                            <button type="button" onClick={addQuestion} className="glass-button-secondary text-sm flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Question
                            </button>
                        </div>
                        {errors.questions && <p className="text-red-500 text-sm mb-3">{errors.questions}</p>}
                        <div className="space-y-5">
                            {data.questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-4 rounded-lg border border-slate-200 dark:border-white/10">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <span className="text-sm font-medium text-slate-500 mt-2">Q{qIndex + 1}</span>
                                        {data.questions.length > 1 && (
                                            <button type="button" onClick={() => removeQuestion(qIndex)} className="text-slate-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={q.question}
                                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                        className="glass-input w-full mb-3"
                                        placeholder="Question text"
                                    />
                                    <div className="space-y-2">
                                        {q.options.map((option, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={q.correct_option === oIndex}
                                                    onChange={() => updateQuestion(qIndex, 'correct_option', oIndex)}
                                                    title="Mark as correct answer"
                                                />
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    className="glass-input flex-1 text-sm"
                                                    placeholder={`Option ${oIndex + 1}`}
                                                />
                                                {q.options.length > 2 && (
                                                    <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-slate-400 hover:text-red-500">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addOption(qIndex)} className="text-xs text-indigo-600 hover:underline">
                                            + Add option
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Select the radio button next to the correct answer.</p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

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
