import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, Star, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Props {
    decision: any;
    employees: any[];
}

const STATUSES = [
    { value: 'draft', label: 'Draft' },
    { value: 'proposed', label: 'Proposed' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
];

function getPriorityBadge(priority: string) {
    const map: Record<string, string> = {
        critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        low: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    };
    return map[priority?.toLowerCase()] || map.low;
}

function getStatusBadge(status: string) {
    const map: Record<string, string> = {
        draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
        proposed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return map[status] || map.draft;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                />
            ))}
        </div>
    );
}

export default function DecisionShow({ decision, employees }: Props) {
    const [showActionItemForm, setShowActionItemForm] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [expandedItems, setExpandedItems] = useState<number[]>([]);
    const [statusOpen, setStatusOpen] = useState(false);

    const { data: actionData, setData: setActionData, post: postAction, processing: actionProcessing, errors: actionErrors, reset: resetAction } = useForm({
        description: '',
        assigned_to: '',
        department: '',
        due_date: '',
        priority: 'Medium',
    });

    const toggleExpand = (id: number) => {
        setExpandedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleStatusUpdate = (status: string) => {
        setStatusOpen(false);
        router.patch(`/management/decisions/${decision.id}/status`, { status });
    };

    const handleAddActionItem = (e: React.FormEvent) => {
        e.preventDefault();
        postAction(`/management/decisions/${decision.id}/action-items`, {
            onSuccess: () => {
                resetAction();
                setShowActionItemForm(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={decision.title} />

            <PageHeader
                title={decision.title}
                subtitle={decision.number}
                action={
                    <Link href="/management/decisions" className="glass-button-secondary flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Decisions
                    </Link>
                }
            />

            <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(decision.status)}`}>
                    {decision.status.replace(/_/g, ' ')}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityBadge(decision.priority)}`}>
                    {decision.priority}
                </span>
                {decision.category && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {decision.category.name}
                    </span>
                )}
                <div className="ml-auto flex gap-2">
                    <Link
                        href={`/management/decisions/${decision.id}/edit`}
                        className="glass-button-secondary flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" /> Edit
                    </Link>
                    <div className="relative">
                        <button
                            onClick={() => setStatusOpen(!statusOpen)}
                            className="glass-button flex items-center gap-2"
                        >
                            Update Status <ChevronDown className="w-4 h-4" />
                        </button>
                        {statusOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-white/10 z-50 py-1">
                                {STATUSES.map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => handleStatusUpdate(s.value)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10 ${
                                            decision.status === s.value ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason</label>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{decision.reason || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expected Benefits</label>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{decision.expected_benefits || '-'}</p>
                            </div>
                            {decision.meeting && (
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-slate-500 dark:text-slate-400 uppercase tracking-wider">Related Meeting</label>
                                    <Link
                                        href={`/management/meetings/${decision.meeting.id}`}
                                        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                    >
                                        {decision.meeting.title || `Meeting #${decision.meeting.id}`}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Action Items</h3>
                            <button
                                onClick={() => setShowActionItemForm(!showActionItemForm)}
                                className="glass-button flex items-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Action Item
                            </button>
                        </div>

                        {showActionItemForm && (
                            <form onSubmit={handleAddActionItem} className="glass-card p-4 rounded-lg border border-slate-200 dark:border-white/10 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium mb-1 text-slate-500">Description *</label>
                                        <textarea
                                            className="glass-input w-full h-20"
                                            placeholder="What needs to be done?"
                                            value={actionData.description}
                                            onChange={(e) => setActionData('description', e.target.value)}
                                            required
                                        />
                                        {actionErrors.description && <p className="text-rose-500 text-xs mt-1.5">{actionErrors.description}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-slate-500">Assigned To *</label>
                                        <select
                                            className="glass-input w-full"
                                            value={actionData.assigned_to}
                                            onChange={(e) => setActionData('assigned_to', e.target.value)}
                                            required
                                        >
                                            <option value="">Select person</option>
                                            {employees.map((emp: any) => (
                                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                                            ))}
                                        </select>
                                        {actionErrors.assigned_to && <p className="text-rose-500 text-xs mt-1.5">{actionErrors.assigned_to}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-slate-500">Department</label>
                                        <input
                                            type="text"
                                            className="glass-input w-full"
                                            placeholder="Department"
                                            value={actionData.department}
                                            onChange={(e) => setActionData('department', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-slate-500">Due Date *</label>
                                        <input
                                            type="date"
                                            className="glass-input w-full"
                                            value={actionData.due_date}
                                            onChange={(e) => setActionData('due_date', e.target.value)}
                                            required
                                        />
                                        {actionErrors.due_date && <p className="text-rose-500 text-xs mt-1.5">{actionErrors.due_date}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-slate-500">Priority</label>
                                        <select
                                            className="glass-input w-full"
                                            value={actionData.priority}
                                            onChange={(e) => setActionData('priority', e.target.value)}
                                        >
                                            <option value="Critical">Critical</option>
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button type="submit" disabled={actionProcessing} className="glass-button flex items-center gap-2">
                                        {actionProcessing ? 'Saving...' : 'Add Item'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowActionItemForm(false); resetAction(); }}
                                        className="glass-button-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {(decision.action_items || []).length > 0 ? (
                            <div className="space-y-3">
                                {decision.action_items.map((item: any) => {
                                    const isExpanded = expandedItems.includes(item.id);
                                    return (
                                        <div key={item.id} className="glass-card p-4 rounded-lg border border-slate-200 dark:border-white/10">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.description}</p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                        <span>{item.assigned_to?.name || 'Unassigned'}</span>
                                                        {item.department && <span>{item.department}</span>}
                                                        {item.due_date && <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(item.priority)}`}>
                                                            {item.priority}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status || 'draft')}`}>
                                                            {(item.status || 'draft').replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleExpand(item.id)}
                                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                    <span>Progress</span>
                                                    <span>{item.progress || 0}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${item.progress || 0}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                                                    {(item.progress_updates || []).length > 0 && (
                                                        <div className="space-y-2 mb-4">
                                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Progress Updates</p>
                                                            {item.progress_updates.map((update: any) => (
                                                                <div key={update.id} className="flex items-start gap-2 text-sm">
                                                                    <Clock className="w-3 h-3 mt-1 text-slate-400 shrink-0" />
                                                                    <div>
                                                                        <p className="text-slate-700 dark:text-slate-300">{update.comment}</p>
                                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                                            {update.progress}% — {new Date(update.created_at).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <ProgressUpdateForm actionItemId={item.id} decisionId={decision.id} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={CheckCircle}
                                title="No action items yet"
                                description="Add action items to track implementation."
                            />
                        )}
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Status</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(decision.status)}`}>
                                    {decision.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Priority</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(decision.priority)}`}>
                                    {decision.priority}
                                </span>
                            </div>
                            {decision.category && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Category</span>
                                    <span className="text-slate-900 dark:text-white">{decision.category.name}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-500">Budget</span>
                                <span className="text-slate-900 dark:text-white font-medium">
                                    {decision.budget ? `GH₵ ${parseFloat(decision.budget).toLocaleString()}` : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Approved By</span>
                                <span className="text-slate-900 dark:text-white">{decision.approver?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Created By</span>
                                <span className="text-slate-900 dark:text-white">{decision.creator?.name || '-'}</span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Review</h3>
                        {decision.review ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-slate-500 uppercase tracking-wider">Rating</label>
                                    <StarRating rating={decision.review.rating} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-slate-500 uppercase tracking-wider">Notes</label>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{decision.review.notes || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-slate-500 uppercase tracking-wider">Lessons Learned</label>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{decision.review.lessons_learned || '-'}</p>
                                </div>
                            </div>
                        ) : decision.status === 'completed' ? (
                            <ReviewForm
                                decisionId={decision.id}
                                showForm={showReviewForm}
                                onToggle={() => setShowReviewForm(!showReviewForm)}
                            />
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">Review will be available once the decision is completed.</p>
                        )}
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
}

function ProgressUpdateForm({ actionItemId, decisionId }: { actionItemId: number; decisionId: number }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        comment: '',
        progress: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/management/decisions/${decisionId}/action-items/${actionItemId}/progress`, {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Add Progress Update</p>
            <div>
                <textarea
                    className="glass-input w-full h-16 text-sm"
                    placeholder="Update comment"
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                />
                {errors.comment && <p className="text-rose-500 text-xs mt-1.5">{errors.comment}</p>}
            </div>
            <div>
                <label className="block text-xs font-medium mb-1 text-slate-500">Progress: {data.progress}%</label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    className="w-full"
                    value={data.progress}
                    onChange={(e) => setData('progress', parseInt(e.target.value))}
                />
            </div>
            <button
                type="submit"
                disabled={processing}
                className="glass-button text-sm px-3 py-1.5"
            >
                {processing ? 'Saving...' : 'Update Progress'}
            </button>
        </form>
    );
}

function ReviewForm({ decisionId, showForm, onToggle }: { decisionId: number; showForm: boolean; onToggle: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        rating: 3,
        notes: '',
        lessons_learned: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/management/decisions/${decisionId}/review`, {
            onSuccess: () => { reset(); onToggle(); },
        });
    };

    if (!showForm) {
        return (
            <button onClick={onToggle} className="glass-button w-full flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Review
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Rating *</label>
                <select
                    className="glass-input w-full"
                    value={data.rating}
                    onChange={(e) => setData('rating', parseInt(e.target.value))}
                >
                    <option value={1}>1 - Poor</option>
                    <option value={2}>2 - Fair</option>
                    <option value={3}>3 - Good</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={5}>5 - Excellent</option>
                </select>
                {errors.rating && <p className="text-rose-500 text-xs mt-1.5">{errors.rating}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Notes</label>
                <textarea
                    className="glass-input w-full h-24"
                    placeholder="Review notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                />
                {errors.notes && <p className="text-rose-500 text-xs mt-1.5">{errors.notes}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Lessons Learned</label>
                <textarea
                    className="glass-input w-full h-24"
                    placeholder="What can we learn from this decision?"
                    value={data.lessons_learned}
                    onChange={(e) => setData('lessons_learned', e.target.value)}
                />
                {errors.lessons_learned && <p className="text-rose-500 text-xs mt-1.5">{errors.lessons_learned}</p>}
            </div>
            <div className="flex gap-3">
                <button type="submit" disabled={processing} className="glass-button flex items-center gap-2">
                    {processing ? 'Saving...' : 'Submit Review'}
                </button>
                <button type="button" onClick={onToggle} className="glass-button-secondary">
                    Cancel
                </button>
            </div>
        </form>
    );
}
