import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, X, Plus } from 'lucide-react';
import { useState } from 'react';

export default function CampaignEdit() {
    const { campaign, clients, employees } = usePage().props as any;
    const { data, setData, put, processing, errors } = useForm({
        title: campaign.title || '',
        description: campaign.description || '',
        type: campaign.type || 'other',
        status: campaign.status || 'draft',
        start_date: campaign.start_date?.split('T')[0] || '',
        end_date: campaign.end_date?.split('T')[0] || '',
        client_id: campaign.client_id || '',
        budget: campaign.budget || '',
        actual_cost: campaign.actual_cost || '',
        assigned_to: campaign.assigned_to?.id || '',
        tags: campaign.tags || [] as string[],
        notes: campaign.notes || '',
        reminders: campaign.reminders?.map((r: any) => r.remind_at) || [] as string[],
    });
    const [tagInput, setTagInput] = useState('');
    const [reminderInput, setReminderInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/marketing/${campaign.id}`);
    };

    const addTag = () => {
        if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
            setData('tags', [...data.tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setData('tags', data.tags.filter((t: string) => t !== tag));
    };

    const addReminder = () => {
        if (reminderInput && !data.reminders.includes(reminderInput)) {
            setData('reminders', [...data.reminders, reminderInput]);
            setReminderInput('');
        }
    };

    const removeReminder = (reminder: string) => {
        setData('reminders', data.reminders.filter((r: string) => r !== reminder));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${campaign.title}`} />

            <div className="mb-6">
                <Link href="/marketing" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Marketing
                </Link>
            </div>

            <PageHeader title={`Edit ${campaign.title}`} subtitle={campaign.number} />

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Campaign name"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="glass-input w-full h-24"
                                    placeholder="Campaign description..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Type *</label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="glass-input w-full"
                                    >
                                        <option value="social">Social Media</option>
                                        <option value="email">Email</option>
                                        <option value="event">Event</option>
                                        <option value="ad">Advertising</option>
                                        <option value="print">Print</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Status *</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="glass-input w-full"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Start Date *</label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">End Date *</label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="glass-input w-full"
                                        min={data.start_date}
                                    />
                                    {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Assignment & Budget */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Assignment & Budget</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Client (Optional)</label>
                                <select
                                    value={data.client_id}
                                    onChange={(e) => setData('client_id', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="">No client (standalone)</option>
                                    {clients.map((client: any) => (
                                        <option key={client.id} value={client.id}>{client.company_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Assigned To</label>
                                <select
                                    value={data.assigned_to}
                                    onChange={(e) => setData('assigned_to', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="">Unassigned</option>
                                    {employees.map((emp: any) => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Budget</label>
                                    <input
                                        type="number"
                                        value={data.budget}
                                        onChange={(e) => setData('budget', e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Actual Cost</label>
                                    <input
                                        type="number"
                                        value={data.actual_cost}
                                        onChange={(e) => setData('actual_cost', e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Tags */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Tags</h2>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    className="glass-input flex-1"
                                    placeholder="Add a tag..."
                                />
                                <button type="button" onClick={addTag} className="glass-button-secondary px-3">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {data.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {data.tags.map((tag: string) => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Reminders */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Reminders</h2>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="datetime-local"
                                    value={reminderInput}
                                    onChange={(e) => setReminderInput(e.target.value)}
                                    className="glass-input flex-1"
                                />
                                <button type="button" onClick={addReminder} className="glass-button-secondary px-3">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {data.reminders.length > 0 && (
                                <div className="space-y-2">
                                    {data.reminders.map((reminder: string) => (
                                        <div key={reminder} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                            <span className="text-sm">{new Date(reminder).toLocaleString()}</span>
                                            <button type="button" onClick={() => removeReminder(reminder)} className="text-slate-400 hover:text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-slate-400">Add custom reminder dates/times for this campaign</p>
                        </div>
                    </GlassCard>

                    {/* Notes */}
                    <GlassCard className="lg:col-span-2">
                        <h2 className="text-lg font-semibold mb-4">Notes</h2>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="glass-input w-full h-32"
                            placeholder="Internal notes..."
                        />
                    </GlassCard>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <Link href={`/marketing/${campaign.id}`} className="glass-button-secondary">Cancel</Link>
                    <button type="submit" disabled={processing} className="glass-button">
                        {processing ? 'Saving...' : 'Update Campaign'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
