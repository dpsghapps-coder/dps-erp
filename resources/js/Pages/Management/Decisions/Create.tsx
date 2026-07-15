import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
    categories: any[];
    employees: any[];
}

export default function DecisionCreate({ categories, employees }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        reason: '',
        expected_benefits: '',
        priority: 'Medium',
        category_id: '',
        budget: '',
        approved_by: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/management/decisions');
    };

    return (
        <AppLayout>
            <Head title="New Decision" />

            <PageHeader
                title="New Decision"
                subtitle="Record a management decision"
                action={
                    <Link href="/management/decisions" className="glass-button-secondary flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Decisions
                    </Link>
                }
            />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Decision Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Title *</label>
                                    <input
                                        type="text"
                                        className="glass-input w-full"
                                        placeholder="Enter decision title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    {errors.title && <p className="text-rose-500 text-xs mt-1.5">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Reason *</label>
                                    <textarea
                                        className="glass-input w-full h-28"
                                        placeholder="Why is this decision being made?"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        required
                                    />
                                    {errors.reason && <p className="text-rose-500 text-xs mt-1.5">{errors.reason}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Expected Benefits</label>
                                    <textarea
                                        className="glass-input w-full h-28"
                                        placeholder="What benefits are expected from this decision?"
                                        value={data.expected_benefits}
                                        onChange={(e) => setData('expected_benefits', e.target.value)}
                                    />
                                    {errors.expected_benefits && <p className="text-rose-500 text-xs mt-1.5">{errors.expected_benefits}</p>}
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Classification</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Priority *</label>
                                    <select
                                        className="glass-input w-full"
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                        required
                                    >
                                        <option value="Critical">Critical</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                    {errors.priority && <p className="text-rose-500 text-xs mt-1.5">{errors.priority}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Category *</label>
                                    <select
                                        className="glass-input w-full"
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="text-rose-500 text-xs mt-1.5">{errors.category_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Budget</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">GH₵</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="glass-input w-full pl-12"
                                            placeholder="0.00"
                                            value={data.budget}
                                            onChange={(e) => setData('budget', e.target.value)}
                                        />
                                    </div>
                                    {errors.budget && <p className="text-rose-500 text-xs mt-1.5">{errors.budget}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Approved By</label>
                                    <select
                                        className="glass-input w-full"
                                        value={data.approved_by}
                                        onChange={(e) => setData('approved_by', e.target.value)}
                                    >
                                        <option value="">Select approver</option>
                                        {employees.map((emp: any) => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                    {errors.approved_by && <p className="text-rose-500 text-xs mt-1.5">{errors.approved_by}</p>}
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Actions</h3>
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="glass-button w-full flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : 'Save Decision'}
                                </button>
                                <Link
                                    href="/management/decisions"
                                    className="glass-button-secondary w-full flex items-center justify-center gap-2"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
