import { useState, useCallback } from 'react';
import { router, useForm } from '@inertiajs/react';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GlassCard } from '@/Components/ui';
import { User, Link2, Clock, AlertTriangle, Phone, MessageSquare, Calendar, FileText, X } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

const COLUMNS = [
    { id: 'lead', label: 'Lead', color: 'border-blue-500/30' },
    { id: 'prospect', label: 'Prospect', color: 'border-yellow-500/30' },
    { id: 'active', label: 'Active', color: 'border-green-500/30' },
    { id: 'inactive', label: 'Inactive', color: 'border-slate-500/30' },
];

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

const SOURCE_WEIGHTS: Record<string, number> = {
    'Referral': 30, 'Website': 20, 'Event': 25, 'Social Media': 15,
    'Cold Call': 10, 'Advertisement': 10, 'Other': 5,
};

function calculateScore(client: any): number {
    let score = 0;
    const daysAgo = daysSince(client.lastInteraction?.occurred_at);
    if (daysAgo !== null) {
        if (daysAgo <= 1) score += 40;
        else if (daysAgo <= 3) score += 30;
        else if (daysAgo <= 7) score += 20;
        else if (daysAgo <= 14) score += 10;
    }
    score += Math.min((client.interactions_count ?? 0) * 5, 30);
    score += SOURCE_WEIGHTS[client.source] ?? 5;
    return Math.min(score, 100);
}

function KanbanCard({ client, onQuickAction }: { client: any; onQuickAction: (client: any, type: string) => void }) {
    const formatCurrency = useCurrency();
    const daysAgo = daysSince(client.lastInteraction?.occurred_at);
    const isStale = daysAgo !== null && daysAgo > 7;
    const noActivity = daysAgo === null;
    const score = calculateScore(client);
    const today = new Date().toISOString().split('T')[0];
    const isDueToday = client.next_follow_up_at?.startsWith(today);
    const isOverdue = client.next_follow_up_at && client.next_follow_up_at < today && !isDueToday;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: client.id,
        data: { type: 'client', status: client.status },
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
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        score >= 70 ? 'bg-green-500/20 text-green-400' :
                        score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                    }`}>{score}</span>
                </div>

                {client.estimated_value > 0 && (
                    <div className="mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Est: {formatCurrency(client.estimated_value)}
                        </span>
                    </div>
                )}

                {client.primaryContact && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <User className="w-3 h-3 shrink-0" />
                        <span className="truncate">{client.primaryContact.first_name} {client.primaryContact.last_name}</span>
                    </div>
                )}
                {client.source && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <Link2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{client.source}</span>
                    </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-white/10 mt-2">
                    {noActivity ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400">
                            <AlertTriangle className="w-3 h-3" /><span>No activity</span>
                        </div>
                    ) : isStale ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400">
                            <Clock className="w-3 h-3" /><span>{timeAgo(client.lastInteraction.occurred_at)} — stale</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span>{INTERACTION_ICONS[client.lastInteraction.type] || '📋'}</span>
                            <span>{timeAgo(client.lastInteraction.occurred_at)}</span>
                        </div>
                    )}
                    {(isDueToday || isOverdue) && (
                        <div className={`flex items-center gap-1.5 text-xs mt-1 ${isOverdue ? 'text-red-400 font-medium' : 'text-amber-400'}`}>
                            <Clock className="w-3 h-3" />
                            <span>{isOverdue ? 'Follow-up overdue' : 'Due today'}</span>
                        </div>
                    )}
                </div>

                {/* Quick Action Buttons on Card */}
                <div className="flex items-center justify-between gap-1 pt-2.5 mt-2 border-t border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onQuickAction(client, 'call'); }}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-blue-400 transition-colors"
                        title="Log Call"
                    >
                        <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onQuickAction(client, 'whatsapp'); }}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-emerald-400 transition-colors"
                        title="Log WhatsApp"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onQuickAction(client, 'meeting'); }}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-purple-400 transition-colors"
                        title="Schedule Meeting"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onQuickAction(client, 'note'); }}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors"
                        title="Add Note"
                    >
                        <FileText className="w-3.5 h-3.5" />
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}

function DroppableColumn({ column, clients, onQuickAction }: { column: typeof COLUMNS[number]; clients: any[]; onQuickAction: (client: any, type: string) => void }) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });
    const formatCurrency = useCurrency();

    const columnTotal = clients.reduce((sum: number, c: any) => sum + (parseFloat(c.estimated_value) || 0), 0);

    return (
        <div className={`rounded-xl border ${column.color} p-3 transition-colors ${isOver ? 'bg-slate-100 dark:bg-white/10' : 'bg-slate-50 dark:bg-white/5'}`}>
            <div className="flex flex-col mb-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{column.label}</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{clients.length}</span>
                </div>
                {columnTotal > 0 && (
                    <span className="text-xs text-emerald-400 font-semibold mt-1">
                        Est: {formatCurrency(columnTotal)}
                    </span>
                )}
            </div>
            <div ref={setNodeRef} className="min-h-[200px] rounded-lg">
                <SortableContext items={clients.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                    {clients.map((client: any) => (
                        <KanbanCard key={client.id} client={client} onQuickAction={onQuickAction} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}

export default function KanbanBoard({ clients }: { clients: any[] }) {
    const [activeId, setActiveId] = useState<number | null>(null);
    const [localClients, setLocalClients] = useState(() => [...clients]);
    const [modalClient, setModalClient] = useState<any>(null);
    const [modalActionType, setModalActionType] = useState<string>('call');

    const interactionForm = useForm({
        type: 'call',
        subject: '',
        body: '',
        occurred_at: new Date().toISOString().slice(0, 16),
        next_follow_up_at: '',
    });

    const openQuickActionModal = (client: any, type: string) => {
        setModalClient(client);
        setModalActionType(type);
        const actionLabel = type.charAt(0).toUpperCase() + type.slice(1);
        interactionForm.setData({
            type,
            subject: `${actionLabel} with ${client.company_name}`,
            body: '',
            occurred_at: new Date().toISOString().slice(0, 16),
            next_follow_up_at: client.next_follow_up_at?.split('T')[0] || '',
        });
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalClient) return;

        interactionForm.post(`/crm/${modalClient.id}/interactions`, {
            onSuccess: () => {
                if (interactionForm.data.next_follow_up_at) {
                    router.patch(`/crm/${modalClient.id}/status`, {
                        status: modalClient.status,
                        next_follow_up_at: interactionForm.data.next_follow_up_at,
                    }, { preserveScroll: true });
                }
                setModalClient(null);
            },
        });
    };

    const clientsByStatus = COLUMNS.reduce((acc, col) => {
        acc[col.id] = localClients.filter((c: any) => c.status === col.id);
        return acc;
    }, {} as Record<string, any[]>);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as number);
    };

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const draggedClient = localClients.find((c: any) => c.id === active.id);
        if (!draggedClient) return;

        let newStatus: string | null = null;

        if (COLUMNS.some(col => col.id === over.id)) {
            newStatus = over.id as string;
        } else {
            const overClient = localClients.find((c: any) => c.id === over.id);
            if (overClient) {
                newStatus = overClient.status;
            }
        }

        if (newStatus && newStatus !== draggedClient.status) {
            setLocalClients(prev => prev.map(c => 
                c.id === draggedClient.id ? { ...c, status: newStatus } : c
            ));

            router.patch(`/crm/${draggedClient.id}/status`, { status: newStatus }, {
                preserveScroll: true,
                preserveState: true,
                only: [],
                onError: () => {
                    setLocalClients(prev => prev.map(c => 
                        c.id === draggedClient.id ? { ...c, status: draggedClient.status } : c
                    ));
                },
            });
        }
    }, [localClients]);

    const activeClient = localClients.find((c: any) => c.id === activeId);

    return (
        <>
            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[600px]">
                    {COLUMNS.map((col) => (
                        <DroppableColumn key={col.id} column={col} clients={clientsByStatus[col.id] || []} onQuickAction={openQuickActionModal} />
                    ))}
                </div>

                <DragOverlay>
                    {activeClient ? (
                        <div className="w-[280px] opacity-90 rotate-2">
                            <GlassCard className="p-3 shadow-xl border border-indigo-500/30">
                                <h4 className="font-medium text-sm">{activeClient.company_name}</h4>
                            </GlassCard>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Quick Action Modal */}
            {modalClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                                    Log {modalActionType} — {modalClient.company_name}
                                </h3>
                                <p className="text-xs text-slate-400">Quick log interaction and set follow-up date</p>
                            </div>
                            <button onClick={() => setModalClient(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
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
                                    onClick={() => setModalClient(null)}
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
        </>
    );
}
