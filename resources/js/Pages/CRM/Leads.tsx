import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import KanbanBoard from '@/Components/KanbanBoard';
import PipelineBoard from '@/Components/PipelineBoard';
import { Head, usePage, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search, Users, TrendingUp, Target, Clock, AlertTriangle, User, MapPin, ChevronDown, ChevronUp, Link2, Check, X, LayoutGrid, List, DollarSign, XCircle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useCurrency } from '@/Utils/currency';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

function daysSince(dateStr: string | null): number | null {
    if (!dateStr) return null;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

const STATUS_OPTIONS = [
    { value: 'lead', label: 'Lead', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'prospect', label: 'Prospect', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'active', label: 'Active', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 'inactive', label: 'Inactive', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
];

const INTERACTION_ICONS: Record<string, string> = {
    call: '📞',
    email: '📧',
    meeting: '🤝',
    note: '📝',
};

const SOURCES = ['Referral', 'Website', 'Cold Call', 'Social Media', 'Advertisement', 'Event', 'Other'];

const SOURCE_WEIGHTS: Record<string, number> = {
    'Referral': 30,
    'Website': 20,
    'Event': 25,
    'Social Media': 15,
    'Cold Call': 10,
    'Advertisement': 10,
    'Other': 5,
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
    const interactionCount = client.interactions_count ?? client.interactions?.length ?? 0;
    score += Math.min(interactionCount * 5, 30);
    score += SOURCE_WEIGHTS[client.source] ?? 5;
    return Math.min(score, 100);
}

export default function LeadsIndex() {
    const { clients, stats, currentFilter, currentView } = usePage().props as any;
    const formatCurrency = useCurrency();
    const clientsList = clients?.data || clients || [];
    const [statsCollapsed, setStatsCollapsed] = useState(false);
    const [search, setSearch] = useState('');
    const [letterFilter, setLetterFilter] = useState<string | null>(null);
    const [sourceFilter, setSourceFilter] = useState('all');
    const [openStatusId, setOpenStatusId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkStatus, setBulkStatus] = useState('');
    const [showBulkBar, setShowBulkBar] = useState(false);
    const [dueTodayOnly, setDueTodayOnly] = useState(false);
    const [sortByScore, setSortByScore] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'board'>(currentView === 'board' ? 'board' : 'list');
    const [boardTab, setBoardTab] = useState<'status' | 'pipeline'>('pipeline');
    const [showQuickLeadModal, setShowQuickLeadModal] = useState(false);

    const quickLeadForm = useForm({
        company_name: '',
        phone: '',
        email: '',
        status: 'lead',
        source: 'Referral',
        estimated_value: '',
        next_follow_up_at: '',
    });

    const handleQuickLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        quickLeadForm.post('/crm', {
            onSuccess: () => {
                quickLeadForm.reset();
                setShowQuickLeadModal(false);
            },
        });
    };

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenStatusId(null);
        };
        if (openStatusId !== null) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openStatusId]);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selectedIds.size === filteredClients.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredClients.map((c: any) => c.id)));
        }
    };

    const handleBulkUpdate = () => {
        if (!bulkStatus) return;
        router.patch('/crm/bulk-update', {
            ids: Array.from(selectedIds),
            ...(bulkStatus && { status: bulkStatus }),
        }, { preserveScroll: true, onFinish: () => {
            setSelectedIds(new Set());
            setBulkStatus('');
        }});
    };

    const filteredClients = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const filtered = clientsList.filter((c: any) => {
            const matchSearch = !search ||
                c.company_name.toLowerCase().includes(search.toLowerCase()) ||
                c.email?.toLowerCase().includes(search.toLowerCase()) ||
                c.phone?.includes(search) ||
                c.city?.toLowerCase().includes(search.toLowerCase()) ||
                c.primaryContact?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
                c.primaryContact?.last_name?.toLowerCase().includes(search.toLowerCase());
            const matchLetter = !letterFilter || c.company_name.charAt(0).toUpperCase() === letterFilter;
            const matchSource = sourceFilter === 'all' || c.source === sourceFilter;
            const matchDueToday = !dueTodayOnly || (c.next_follow_up_at && c.next_follow_up_at.split('T')[0] <= today);
            return matchSearch && matchLetter && matchSource && matchDueToday;
        });
        if (sortByScore) {
            filtered.sort((a: any, b: any) => calculateScore(b) - calculateScore(a));
        }
        return filtered;
    }, [clientsList, search, letterFilter, sourceFilter, dueTodayOnly, sortByScore]);

    const letterCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        clientsList.forEach((c: any) => {
            const letter = c.company_name?.charAt(0)?.toUpperCase();
            if (letter && /[A-Z]/.test(letter)) {
                counts[letter] = (counts[letter] || 0) + 1;
            }
        });
        return counts;
    }, [clientsList]);

    const handleStatusChange = (clientId: number, newStatus: string, followUpDate?: string) => {
        setOpenStatusId(null);
        router.patch(`/crm/${clientId}/status`, {
            status: newStatus,
            ...(followUpDate && { next_follow_up_at: followUpDate }),
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Lead Management" />

            <PageHeader
                title="Lead Management"
                subtitle={`${clientsList.length} leads & prospects`}
                action={
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 dark:bg-white/10 rounded-lg p-0.5">
                            <button
                                onClick={() => router.visit('/crm/leads?view=list', { preserveState: false })}
                                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => router.visit('/crm/leads?view=board', { preserveState: false })}
                                className={`p-1.5 rounded transition-colors ${viewMode === 'board' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            onClick={() => setShowQuickLeadModal(true)}
                            className="glass-button flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Quick Lead
                        </button>
                    </div>
                }
            />

            <div className="mb-3">
                <button
                    onClick={() => setStatsCollapsed(!statsCollapsed)}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    {statsCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    {statsCollapsed ? 'Show stats' : 'Hide stats'}
                </button>
            </div>

            {!statsCollapsed && (
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{stats.total}</p>
                                <p className="text-sm text-slate-500">Total Leads</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{stats.leads}</p>
                                <p className="text-sm text-slate-500">New Leads</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{stats.prospects}</p>
                                <p className="text-sm text-slate-500">Prospects</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{formatCurrency(stats.pipelineValue || 0)}</p>
                                <p className="text-sm text-slate-500">Pipeline Value</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                <LayoutGrid className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{stats.openDeals || 0}</p>
                                <p className="text-sm text-slate-500">Open Deals</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{stats.won || 0}</p>
                                <p className="text-sm text-slate-500">Won</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{stats.lost || 0}</p>
                                <p className="text-sm text-slate-500">Lost</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            <div className="flex gap-6">
                <aside className="hidden lg:block w-16 shrink-0">
                    <GlassCard className="sticky top-24 p-2">
                        <div className="flex flex-col items-center gap-0.5">
                            <button
                                onClick={() => setLetterFilter(null)}
                                className={`w-10 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                                    !letterFilter ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                All
                            </button>
                            {ALPHABET.map((letter) => (
                                <button
                                    key={letter}
                                    onClick={() => setLetterFilter(letterFilter === letter ? null : letter)}
                                    className={`w-10 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                                        letterFilter === letter
                                            ? 'bg-indigo-600 text-white'
                                            : letterCounts[letter]
                                                ? 'text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                                                : 'text-slate-600 cursor-default'
                                    }`}
                                    disabled={!letterCounts[letter] && letterFilter !== letter}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                    </GlassCard>
                </aside>

                <div className="flex-1 min-w-0">
                    <GlassCard className="mb-6">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search leads, contacts..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="glass-input w-full pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'lead', label: 'Leads' },
                                    { key: 'prospect', label: 'Prospects' },
                                ].map(f => (
                                    <Link
                                        key={f.key}
                                        href={`/crm/leads?filter=${f.key}`}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                            currentFilter === f.key || (currentFilter === undefined && f.key === 'all')
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {f.label}
                                    </Link>
                                ))}
                            </div>
                            <select
                                value={sourceFilter}
                                onChange={(e) => setSourceFilter(e.target.value)}
                                className="glass-input text-sm"
                            >
                                <option value="all">All Sources</option>
                                {SOURCES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setDueTodayOnly(!dueTodayOnly)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                    dueTodayOnly
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Clock className="w-3.5 h-3.5 inline mr-1" />
                                Due / Overdue
                            </button>
                            <button
                                onClick={() => setSortByScore(!sortByScore)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                    sortByScore
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                                Score
                            </button>
                        </div>
                        {(letterFilter || sourceFilter !== 'all') && (
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                                <span className="text-sm text-slate-400">Filters:</span>
                                {letterFilter && (
                                    <button onClick={() => setLetterFilter(null)} className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30">
                                        {letterFilter} ✕
                                    </button>
                                )}
                                {sourceFilter !== 'all' && (
                                    <button onClick={() => setSourceFilter('all')} className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30">
                                        {sourceFilter} ✕
                                    </button>
                                )}
                            </div>
                        )}
                    </GlassCard>

                    {viewMode === 'list' ? (
                        filteredClients.length > 0 ? (
                            <>
                                <div className="flex items-center gap-3 mb-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === filteredClients.length && filteredClients.length > 0}
                                        onChange={selectAll}
                                        className="rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/10 text-indigo-500 focus:ring-indigo-500/50"
                                    />
                                    <span className="text-sm text-slate-400">
                                        {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
                                    </span>
                                </div>
                                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredClients.map((client: any) => {
                                const daysAgo = daysSince(client.lastInteraction?.occurred_at);
                                const isStale = daysAgo !== null && daysAgo > 7;
                                const noActivity = daysAgo === null;
                                const score = calculateScore(client);
                                const isDueToday = client.next_follow_up_at && client.next_follow_up_at.startsWith(new Date().toISOString().split('T')[0]);
                                const isOverdue = client.next_follow_up_at && new Date(client.next_follow_up_at) < new Date() && !isDueToday;

                                return (
                                    <div key={client.id} className="relative">
                                        <div className={`border rounded-xl transition-colors ${selectedIds.has(client.id) ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-transparent'}`}>
                                            <GlassCard variant="interactive" className="h-full">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(client.id)}
                                                        onChange={() => toggleSelect(client.id)}
                                                        className="mt-1 rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/10 text-indigo-500 focus:ring-indigo-500/50"
                                                    />
                                                    <Link href={`/crm/${client.id}`} className="block group flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                                                <span className="text-lg font-semibold">
                                                                    {client.company_name.charAt(0)}
                                                                </span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="font-semibold truncate group-hover:text-indigo-400 transition-colors">
                                                                    {client.company_name}
                                                                </h3>
                                                                {client.industry && (
                                                                    <p className="text-sm text-slate-400 truncate">{client.industry}</p>
                                                                )}
                                                            </div>
                                                            <div className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                                                score >= 70 ? 'bg-green-500/20 text-green-400' :
                                                                score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-slate-500/20 text-slate-400'
                                                            }`}>
                                                                {score}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>

                                                {client.primaryContact && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                                        <User className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="truncate">{client.primaryContact.first_name} {client.primaryContact.last_name}</span>
                                                    </div>
                                                )}
                                                {client.city && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="truncate">{client.city}</span>
                                                    </div>
                                                )}
                                                {client.source && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                                        <Link2 className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="truncate">{client.source}</span>
                                                    </div>
                                                )}

                                                {/* Last contact */}
                                                <div className="pt-3 border-t border-slate-200 dark:border-white/10 mb-3">
                                                    {noActivity ? (
                                                        <div className="flex items-center gap-2 text-sm text-amber-400">
                                                            <AlertTriangle className="w-4 h-4" />
                                                            <span>No activity yet</span>
                                                        </div>
                                                    ) : isStale ? (
                                                        <div className="flex items-center gap-2 text-sm text-amber-400">
                                                            <Clock className="w-4 h-4" />
                                                            <span>Last contact {timeAgo(client.lastInteraction.occurred_at)} — stale</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                                            <span>{INTERACTION_ICONS[client.lastInteraction.type] || '📋'}</span>
                                                            <span>
                                                                {client.lastInteraction.type.charAt(0).toUpperCase() + client.lastInteraction.type.slice(1)}
                                                                {' '}{timeAgo(client.lastInteraction.occurred_at)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {isDueToday && (
                                                        <div className="flex items-center gap-2 text-sm text-amber-400 mt-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>Follow-up due today</span>
                                                        </div>
                                                    )}
                                                    {isOverdue && (
                                                        <div className="flex items-center gap-2 text-sm text-red-400 mt-1">
                                                            <AlertTriangle className="w-4 h-4" />
                                                            <span>Follow-up overdue</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quick status change */}
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setOpenStatusId(openStatusId === client.id ? null : client.id);
                                                        }}
                                                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-sm"
                                                    >
                                                        <StatusBadge status={client.status} />
                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                    {openStatusId === client.id && (
                                                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                                                            {STATUS_OPTIONS.filter(o => o.value !== client.status).map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        handleStatusChange(client.id, option.value);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                                >
                                                                    <span className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`} />
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                            <div className="border-t border-slate-200 dark:border-white/10 px-3 py-2">
                                                                <label className="text-xs text-slate-400 block mb-1">Next follow-up</label>
                                                                <input
                                                                    type="date"
                                                                    defaultValue={client.next_follow_up_at?.split('T')[0] || ''}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        handleStatusChange(client.id, client.status, e.target.value);
                                                                    }}
                                                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-sm text-slate-900 dark:text-white"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </GlassCard>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                            </>
                        ) : (
                            <GlassCard>
                                <div className="text-center py-12">
                                    <p className="text-slate-400 text-lg">No leads found</p>
                                    <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
                                </div>
                            </GlassCard>
                        )
                    ) : (
                        <>
                            <div className="flex bg-slate-100 dark:bg-white/10 rounded-lg p-0.5 mb-4 w-fit">
                                <button
                                    onClick={() => setBoardTab('pipeline')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${boardTab === 'pipeline' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Sales Pipeline
                                </button>
                                <button
                                    onClick={() => setBoardTab('status')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${boardTab === 'status' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Status Board
                                </button>
                            </div>
                            {boardTab === 'pipeline' ? (
                                <PipelineBoard clients={clientsList} />
                            ) : (
                                <KanbanBoard clients={clientsList} />
                            )}
                        </>
                    )}
                </div>
            </div>

            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedIds.size} selected</span>
                    <div className="w-px h-6 bg-slate-100 dark:bg-white/10" />
                    <select
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value)}
                        className="glass-input text-sm"
                    >
                        <option value="">Change status...</option>
                        {STATUS_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleBulkUpdate}
                        disabled={!bulkStatus}
                        className="glass-button text-sm disabled:opacity-40"
                    >
                        Apply
                    </button>
                    <button
                        onClick={() => { setSelectedIds(new Set()); setBulkStatus(''); }}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            {/* Quick Lead Modal */}
            {showQuickLeadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create Quick Lead</h3>
                            <button onClick={() => setShowQuickLeadModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleQuickLeadSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Company Name *</label>
                                <input
                                    type="text"
                                    value={quickLeadForm.data.company_name}
                                    onChange={(e) => quickLeadForm.setData('company_name', e.target.value)}
                                    className="glass-input w-full text-sm"
                                    placeholder="Acme Corp, Creative Ltd..."
                                    required
                                />
                                {quickLeadForm.errors.company_name && <p className="text-red-400 text-xs mt-1">{quickLeadForm.errors.company_name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={quickLeadForm.data.phone}
                                        onChange={(e) => quickLeadForm.setData('phone', e.target.value)}
                                        className="glass-input w-full text-sm"
                                        placeholder="054XXXXXXX"
                                    />
                                    {quickLeadForm.errors.phone && <p className="text-red-400 text-xs mt-1">{quickLeadForm.errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={quickLeadForm.data.email}
                                        onChange={(e) => quickLeadForm.setData('email', e.target.value)}
                                        className="glass-input w-full text-sm"
                                        placeholder="info@company.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Stage / Status</label>
                                    <select
                                        value={quickLeadForm.data.status}
                                        onChange={(e) => quickLeadForm.setData('status', e.target.value)}
                                        className="glass-input w-full text-sm"
                                    >
                                        <option value="lead">Lead</option>
                                        <option value="prospect">Prospect</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Source</label>
                                    <select
                                        value={quickLeadForm.data.source}
                                        onChange={(e) => quickLeadForm.setData('source', e.target.value)}
                                        className="glass-input w-full text-sm"
                                    >
                                        {SOURCES.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Estimated Value</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={quickLeadForm.data.estimated_value}
                                        onChange={(e) => quickLeadForm.setData('estimated_value', e.target.value)}
                                        className="glass-input w-full text-sm"
                                        placeholder="e.g. 15000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Next Follow-Up Date</label>
                                    <input
                                        type="date"
                                        value={quickLeadForm.data.next_follow_up_at}
                                        onChange={(e) => quickLeadForm.setData('next_follow_up_at', e.target.value)}
                                        className="glass-input w-full text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickLeadModal(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-300 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={quickLeadForm.processing}
                                    className="glass-button text-sm font-medium"
                                >
                                    {quickLeadForm.processing ? 'Creating...' : 'Create Lead'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
