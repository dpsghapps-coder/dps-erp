import { useState, useCallback, useMemo, useEffect } from 'react';
import { router, useForm, Link } from '@inertiajs/react';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GlassCard, StatusChips } from '@/Components/ui';
import { User, Link2, Clock, AlertTriangle, Phone, MessageSquare, Calendar, FileText, X, TrendingUp, ExternalLink } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

const COLUMNS = [
    { id: 'new_lead', label: 'New Lead', color: 'border-blue-500/30', open: true },
    { id: 'contacted', label: 'Contacted', color: 'border-cyan-500/30', open: true },
    { id: 'meeting_scheduled', label: 'Meeting Scheduled', color: 'border-purple-500/30', open: true },
    { id: 'proposal_sent', label: 'Proposal Sent', color: 'border-amber-500/30', open: true },
    { id: 'negotiating', label: 'Negotiating', color: 'border-orange-500/30', open: true },
    { id: 'converted', label: 'Converted', color: 'border-green-500/30', open: false },
    { id: 'lost', label: 'Lost', color: 'border-red-500/30', open: false },
];

const TIER_OPTIONS = [
    { value: 'bronze', label: 'Bronze' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' },
];

const LOST_REASONS = ['Budget', 'Timing', 'Chose competitor', 'No response', 'Other'];

const INTERACTION_ICONS: Record<string, string> = {
    call: '📞', email: '📧', meeting: '🤝', note: '📝', whatsapp: '💬',
};

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return '';
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function daysSince(dateStr: string | null): number | null {
    if (!dateStr) return null;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function PipelineCard({ deal, onQuickAction }: { deal: any; onQuickAction: (deal: any, type: string) => void }) {
    const formatCurrency = useCurrency();
    const client = deal.client || {};
    const daysAgo = daysSince(client.last_interaction?.occurred_at);
    const isStale = daysAgo !== null && daysAgo > 7;
    const noActivity = daysAgo === null;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: deal.id,
        data: { type: 'deal', stage: deal.stage },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none mb-2">
            <GlassCard className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                        <h4 className="font-medium text-sm truncate">{client.company_name}</h4>
                        {client.industry && <p className="text-xs text-slate-400 truncate">{client.industry}</p>}
                    </div>
                    <Link
                        href={`/crm/${client.id}`}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition-colors shrink-0"
                        title="View client details"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {deal.estimated_value > 0 && (
                    <div className="mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {formatCurrency(deal.estimated_value)}
                        </span>
                    </div>
                )}

                {client.primary_contact && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <User className="w-3 h-3 shrink-0" />
                        <span className="truncate">{client.primary_contact.first_name} {client.primary_contact.last_name}</span>
                    </div>
                )}
                {client.source && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <Link2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{client.source}</span>
                    </div>
                )}

                {deal.stage === 'lost' && deal.lost_reason && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 mb-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span className="truncate">Lost: {deal.lost_reason}</span>
                    </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-white/10 mt-2">
                    {noActivity ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400">
                            <AlertTriangle className="w-3 h-3" /><span>No activity</span>
                        </div>
                    ) : isStale ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400">
                            <Clock className="w-3 h-3" /><span>{timeAgo(client.last_interaction.occurred_at)} — stale</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span>{INTERACTION_ICONS[client.last_interaction.type] || '📋'}</span>
                            <span>{timeAgo(client.last_interaction.occurred_at)}</span>
                        </div>
                    )}
                </div>

                <div
                    className="flex items-center justify-between gap-1 pt-2.5 mt-2 border-t border-slate-200 dark:border-white/10"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <button type="button" onClick={(e) => { e.stopPropagation(); onQuickAction(deal, 'call'); }} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-blue-400 transition-colors" title="Log Call">
                        <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onQuickAction(deal, 'whatsapp'); }} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-emerald-400 transition-colors" title="Log WhatsApp">
                        <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onQuickAction(deal, 'meeting'); }} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-purple-400 transition-colors" title="Schedule Meeting">
                        <Calendar className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onQuickAction(deal, 'note'); }} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors" title="Add Note">
                        <FileText className="w-3.5 h-3.5" />
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}

function DroppableColumn({ column, deals, onQuickAction }: { column: typeof COLUMNS[number]; deals: any[]; onQuickAction: (deal: any, type: string) => void }) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });
    const formatCurrency = useCurrency();

    const columnTotal = deals.reduce((sum: number, d: any) => sum + (parseFloat(d.estimated_value) || 0), 0);

    return (
        <div className={`rounded-xl border ${column.color} p-3 transition-colors ${isOver ? 'bg-slate-100 dark:bg-white/10' : 'bg-slate-50 dark:bg-white/5'}`}>
            <div className="flex flex-col mb-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{column.label}</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{deals.length}</span>
                </div>
                {columnTotal > 0 && (
                    <span className="text-xs text-emerald-400 font-semibold mt-1">
                        {formatCurrency(columnTotal)}
                    </span>
                )}
            </div>
            <div ref={setNodeRef} className="min-h-[200px] rounded-lg">
                <SortableContext items={deals.map((d: any) => d.id)} strategy={verticalListSortingStrategy}>
                    {deals.map((deal: any) => (
                        <PipelineCard key={deal.id} deal={deal} onQuickAction={onQuickAction} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}

export default function PipelineBoard({ deals }: { deals: any[] }) {
    const formatCurrency = useCurrency();
    const [dealType, setDealType] = useState<'new_business' | 'repeat_business'>('repeat_business');
    const [activeId, setActiveId] = useState<number | null>(null);
    const [localDeals, setLocalDeals] = useState(() => [...deals]);

    useEffect(() => {
        setLocalDeals([...deals]);
    }, [deals]);
    const [modalDeal, setModalDeal] = useState<any>(null);
    const [modalActionType, setModalActionType] = useState<string>('call');
    const [lostModalDeal, setLostModalDeal] = useState<any>(null);
    const [convertModalDeal, setConvertModalDeal] = useState<any>(null);
    const [convertTier, setConvertTier] = useState('bronze');

    const interactionForm = useForm({
        type: 'call',
        subject: '',
        body: '',
        occurred_at: new Date().toISOString().slice(0, 16),
        next_follow_up_at: '',
    });

    const lostForm = useForm({
        lost_reason: LOST_REASONS[0],
        lost_note: '',
    });

    const openQuickActionModal = (deal: any, type: string) => {
        setModalDeal(deal);
        setModalActionType(type);
        const actionLabel = type.charAt(0).toUpperCase() + type.slice(1);
        interactionForm.setData({
            type,
            subject: `${actionLabel} with ${deal.client?.company_name}`,
            body: '',
            occurred_at: new Date().toISOString().slice(0, 16),
            next_follow_up_at: deal.next_follow_up_at?.split('T')[0] || '',
        });
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalDeal) return;

        interactionForm.post(`/crm/${modalDeal.client.id}/interactions`, {
            preserveScroll: true,
            onSuccess: () => {
                if (interactionForm.data.next_follow_up_at) {
                    router.patch(`/deals/${modalDeal.id}/status`, {
                        stage: modalDeal.stage,
                        next_follow_up_at: interactionForm.data.next_follow_up_at,
                    }, { preserveScroll: true });
                }
                setModalDeal(null);
            },
        });
    };

    const dealsForType = useMemo(() => localDeals.filter((d: any) => d.type === dealType), [localDeals, dealType]);

    const dealsByStage = COLUMNS.reduce((acc, col) => {
        acc[col.id] = dealsForType.filter((d: any) => (d.stage || 'new_lead') === col.id);
        return acc;
    }, {} as Record<string, any[]>);

    const totalPipelineValue = COLUMNS.filter(c => c.open).reduce((sum, col) => {
        return sum + (dealsByStage[col.id] || []).reduce((s: number, d: any) => s + (parseFloat(d.estimated_value) || 0), 0);
    }, 0);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as number);
    };

    const applyStageChange = useCallback((dealId: number, newStage: string, extra?: Record<string, any>) => {
        const deal = localDeals.find((d: any) => d.id === dealId);
        const previousStage = deal?.stage;

        setLocalDeals(prev => prev.map(d =>
            d.id === dealId ? { ...d, stage: newStage, ...(extra || {}) } : d
        ));

        router.patch(`/deals/${dealId}/status`, { stage: newStage, ...(extra || {}) }, {
            preserveScroll: true,
            preserveState: true,
            only: [],
            onError: () => {
                setLocalDeals(prev => prev.map(d =>
                    d.id === dealId ? { ...d, stage: previousStage } : d
                ));
            },
        });
    }, [localDeals]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const draggedDeal = localDeals.find((d: any) => d.id === active.id);
        if (!draggedDeal) return;

        let newStage: string | null = null;

        if (COLUMNS.some(col => col.id === over.id)) {
            newStage = over.id as string;
        } else {
            const overDeal = localDeals.find((d: any) => d.id === over.id);
            if (overDeal) {
                newStage = overDeal.stage;
            }
        }

        const currentStage = draggedDeal.stage || 'new_lead';
        if (newStage && newStage !== currentStage) {
            if (newStage === 'lost') {
                lostForm.setData({ lost_reason: LOST_REASONS[0], lost_note: '' });
                setLostModalDeal(draggedDeal);
                return;
            }
            if (newStage === 'converted' && draggedDeal.type === 'new_business') {
                setConvertTier('bronze');
                setConvertModalDeal(draggedDeal);
                return;
            }
            applyStageChange(draggedDeal.id, newStage);
        }
    }, [localDeals, applyStageChange]);

    const handleLostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!lostModalDeal) return;
        applyStageChange(lostModalDeal.id, 'lost', {
            lost_reason: lostForm.data.lost_reason,
            lost_note: lostForm.data.lost_note,
        });
        setLostModalDeal(null);
    };

    const handleConvertSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!convertModalDeal) return;
        applyStageChange(convertModalDeal.id, 'converted', { status: convertTier });
        setConvertModalDeal(null);
    };

    const activeDeal = localDeals.find((d: any) => d.id === activeId);

    return (
        <>
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-emerald-400">{formatCurrency(totalPipelineValue)}</p>
                        <p className="text-xs text-slate-500">Total pipeline value (open stages)</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-white/10 rounded-lg p-0.5">
                    <button
                        onClick={() => setDealType('repeat_business')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${dealType === 'repeat_business' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Repeat Business
                    </button>
                    <button
                        onClick={() => setDealType('new_business')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${dealType === 'new_business' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        New Business
                    </button>
                </div>
            </div>

            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-7 gap-4 min-h-[600px]">
                    {COLUMNS.map((col) => (
                        <DroppableColumn key={col.id} column={col} deals={dealsByStage[col.id] || []} onQuickAction={openQuickActionModal} />
                    ))}
                </div>

                <DragOverlay>
                    {activeDeal ? (
                        <div className="w-[280px] opacity-90 rotate-2">
                            <GlassCard className="p-3 shadow-xl border border-indigo-500/30">
                                <h4 className="font-medium text-sm">{activeDeal.client?.company_name}</h4>
                            </GlassCard>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Quick Action Modal */}
            {modalDeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                                    Log {modalActionType} — {modalDeal.client?.company_name}
                                </h3>
                                <p className="text-xs text-slate-400">Quick log interaction and set follow-up date</p>
                            </div>
                            <button onClick={() => setModalDeal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleModalSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Subject *</label>
                                <input
                                    type="text"
                                    value={interactionForm.data.subject}
                                    onChange={(e) => interactionForm.setData('subject', e.target.value)}
                                    className="glass-input w-full text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Notes / Details</label>
                                <textarea
                                    value={interactionForm.data.body}
                                    onChange={(e) => interactionForm.setData('body', e.target.value)}
                                    className="glass-input w-full h-24 text-sm"
                                    placeholder="Enter details about this interaction..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Interaction Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={interactionForm.data.occurred_at}
                                        onChange={(e) => interactionForm.setData('occurred_at', e.target.value)}
                                        className="glass-input w-full text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Next Follow-Up Date</label>
                                    <input
                                        type="date"
                                        value={interactionForm.data.next_follow_up_at}
                                        onChange={(e) => interactionForm.setData('next_follow_up_at', e.target.value)}
                                        className="glass-input w-full text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setModalDeal(null)}
                                    className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-300 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={interactionForm.processing}
                                    className="glass-button text-sm font-medium"
                                >
                                    {interactionForm.processing ? 'Saving...' : 'Save Interaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lost Reason Modal */}
            {lostModalDeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Mark as Lost</h3>
                                <p className="text-xs text-slate-400">{lostModalDeal.client?.company_name}</p>
                            </div>
                            <button onClick={() => setLostModalDeal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleLostSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Reason</label>
                                <select
                                    value={lostForm.data.lost_reason}
                                    onChange={(e) => lostForm.setData('lost_reason', e.target.value)}
                                    className="glass-input w-full text-sm"
                                >
                                    {LOST_REASONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Notes (optional)</label>
                                <textarea
                                    value={lostForm.data.lost_note}
                                    onChange={(e) => lostForm.setData('lost_note', e.target.value)}
                                    className="glass-input w-full h-20 text-sm"
                                    placeholder="Any extra detail..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setLostModalDeal(null)}
                                    className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-300 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="glass-button text-sm font-medium bg-red-600/80 hover:bg-red-600"
                                >
                                    Mark Lost
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Convert & Assign Tier Modal */}
            {convertModalDeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Convert & Assign Tier</h3>
                                <p className="text-xs text-slate-400">{convertModalDeal.client?.company_name} — new client won</p>
                            </div>
                            <button onClick={() => setConvertModalDeal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConvertSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-2">Tier *</label>
                                <StatusChips value={convertTier} onChange={setConvertTier} options={TIER_OPTIONS} />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setConvertModalDeal(null)}
                                    className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-300 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="glass-button text-sm font-medium bg-emerald-600/80 hover:bg-emerald-600"
                                >
                                    Convert Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
