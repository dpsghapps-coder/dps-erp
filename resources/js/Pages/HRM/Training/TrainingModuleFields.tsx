import { GlassCard } from '@/Components/ui';
import { Plus, Trash2 } from 'lucide-react';
import { QuizQuestionForm, useQuizQuestionHandlers } from './quizQuestions';

interface TrainingModuleData {
    title: string;
    description: string;
    video_url: string;
    category: string;
    due_date: string;
    passing_score: number;
    is_active: boolean;
    questions: QuizQuestionForm[];
}

interface TrainingModuleFieldsProps {
    data: TrainingModuleData;
    setData: (key: keyof TrainingModuleData, value: any) => void;
    errors: Partial<Record<keyof TrainingModuleData, string>>;
    titlePlaceholder?: string;
}

export default function TrainingModuleFields({ data, setData, errors, titlePlaceholder }: TrainingModuleFieldsProps) {
    const { addQuestion, removeQuestion, updateQuestion, addOption, removeOption, updateOption } =
        useQuizQuestionHandlers(data.questions, (questions) => setData('questions', questions));

    return (
        <>
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
                            placeholder={titlePlaceholder}
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
        </>
    );
}
