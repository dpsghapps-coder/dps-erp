import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function TaskCreate() {
    const { employees } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        deadline: '',
        frequency: 'one_time',
        priority: 'normal',
        assignee_ids: [] as number[],
    });
    const [assigneeToAdd, setAssigneeToAdd] = useState('');

    const addAssignee = () => {
        if (!assigneeToAdd) return;
        const id = Number(assigneeToAdd);
        if (!data.assignee_ids.includes(id)) {
            setData('assignee_ids', [...data.assignee_ids, id]);
        }
        setAssigneeToAdd('');
    };
    const removeAssignee = (id: number) => {
        setData('assignee_ids', data.assignee_ids.filter((a) => a !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/management/tasks');
    };

    return (
        <AppLayout>
            <Head title="New Task" />

            <div className="mb-6">
                <Link href="/management/tasks" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Tasks
                </Link>
            </div>

            <PageHeader title="New Non-Operational Task" subtitle="Assign a task to one or more employees" />

            <div className="max-w-2xl">
                <GlassCard>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name *</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="glass-input w-full"
                                placeholder="e.g., Update the safety checklist"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="glass-input w-full h-24 resize-none"
                                placeholder="What needs to be done..."
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Frequency *</label>
                                <select
                                    value={data.frequency}
                                    onChange={(e) => setData('frequency', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="one_time">One-time</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Priority *</label>
                                <select
                                    value={data.priority}
                                    onChange={(e) => setData('priority', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Deadline{data.frequency !== 'one_time' ? ' (next due date)' : ''}</label>
                            <input
                                type="date"
                                value={data.deadline}
                                onChange={(e) => setData('deadline', e.target.value)}
                                className="glass-input w-full"
                            />
                            {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Assigned To *</label>
                            {data.assignee_ids.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {data.assignee_ids.map((id) => {
                                        const emp = employees.find((e: any) => e.id === id);
                                        return (
                                            <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                                                {emp?.name || 'Unknown'}
                                                <button type="button" onClick={() => removeAssignee(id)} className="hover:text-indigo-600">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <select
                                    value={assigneeToAdd}
                                    onChange={(e) => setAssigneeToAdd(e.target.value)}
                                    className="glass-input flex-1"
                                >
                                    <option value="">Select an employee...</option>
                                    {employees
                                        .filter((emp: any) => !data.assignee_ids.includes(emp.id))
                                        .map((emp: any) => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                </select>
                                <button type="button" onClick={addAssignee} disabled={!assigneeToAdd} className="glass-button-secondary px-3 disabled:opacity-50">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {errors.assignee_ids && <p className="text-red-500 text-sm mt-1">{errors.assignee_ids}</p>}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                            <button type="submit" disabled={processing} className="glass-button">
                                Create Task
                            </button>
                            <Link href="/management/tasks" className="glass-button-secondary">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </AppLayout>
    );
}
