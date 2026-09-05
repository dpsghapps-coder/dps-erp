import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusChips } from '@/Components/ui';
import PipelineBoard from '@/Components/PipelineBoard';
import { Head, usePage, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search, Users, TrendingUp, Target, Clock, AlertTriangle, User, MapPin, ChevronDown, ChevronUp, Link2, Check, X, LayoutGrid, List, DollarSign, XCircle, Rocket } from 'lucide-react';
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
    { value: 'bronze', label: 'Bronze', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { value: 'silver', label: 'Silver', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    { value: 'gold', label: 'Gold', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'platinum', label: 'Platinum', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
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
    const daysAgo = daysSince(client.last_interaction?.occurred_at);
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
    const { deals, eligibleForCampaign, stats, currentFilter, currentView } = usePage().props as any;
    const formatCurrency = useCurrency();
    const dealsList = deals?.data || deals || [];
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
    const [showQuickLeadModal, setShowQuickLeadModal] = useState(false);
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [campaignClientId, setCampaignClientId] = useState('');
    const [campaignSearch, setCampaignSearch] = useState('');

    const quickLeadForm = useForm({
        company_name: '',
        phone: '',
        email: '',
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

    const filteredCampaignClients = useMemo(() => {
        const list = eligibleForCampaign || [];
        if (!campaignSearch) return list;
        return list.filter((c: any) => c.company_name.toLowerCase().includes(campaignSearch.toLowerCase()));
    }, [eligibleForCampaign, campaignSearch]);

    const handleStartCampaign = () => {
        if (!campaignClientId) return;
        router.post(`/crm/${campaignClientId}/deals`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCampaignModal(false);
                setCampaignClientId('');
                setCampaignSearch('');
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
        if (selectedIds.size === filteredDeals.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredDeals.map((d: any) => d.client.id)));
        }
    };

    const [bulkFollowUpDate, setBulkFollowUpDate] = useState('');

    const handleBulkUpdate = () => {
        if (!bulkStatus && !bulkFollowUpDate) return;
        router.patch('/crm/bulk-update', {
            ids: Array.from(selectedIds),
            ...(bulkStatus && { status: bulkStatus }),
            ...(bulkFollowUpDate && { next_follow_up_at: bulkFollowUpDate }),
        }, { preserveScroll: true, onFinish: () => {
            setSelectedIds(new Set());
            setBulkStatus('');
            setBulkFollowUpDate('');
        }});
    };

    const filteredDeals = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const filtered = dealsList.filter((d: any) => {
            const c = d.client || {};
            const matchSearch = !search ||
                c.company_name.toLowerCase().includes(search.toLowerCase()) ||
                c.email?.toLowerCase().includes(search.toLowerCase()) ||
                c.phone?.includes(search) ||
                c.city?.toLowerCase().includes(search.toLowerCase()) ||
                c.primary_contact?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
                c.primary_contact?.last_name?.toLowerCase().includes(search.toLowerCase());
            const matchLetter = !letterFilter || c.company_name.charAt(0).toUpperCase() === letterFilter;
            const matchSource = sourceFilter === 'all' || c.source === sourceFilter;
            const matchDueToday = !dueTodayOnly || (d.next_follow_up_at && d.next_follow_up_at.split('T')[0] <= today);
            return matchSearch && matchLetter && matchSource && matchDueToday;
        });
        if (sortByScore) {
            filtered.sort((a: any, b: any) => calculateScore(b.client) - calculateScore(a.client));
        }
        return filtered;
    }, [dealsList, search, letterFilter, sourceFilter, dueTodayOnly, sortByScore]);

    const letterCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        dealsList.forEach((d: any) => {
            const letter = d.client?.company_name?.charAt(0)?.toUpperCase();
            if (letter && /[A-Z]/.test(letter)) {
                counts[letter] = (counts[letter] || 0) + 1;
            }
        });
        return counts;
    }, [dealsList]);

    const handleFollowUpChange = (deal: any, followUpDate: string) => {
        setOpenStatusId(null);
        router.patch(`/deals/${deal.id}/status`, {
            stage: deal.stage,
            next_follow_up_at: followUpDate,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Lead Management" />

            <PageHeader
                title="Lead Management"
                subtitle={`${dealsList.length} leads & prospects`}
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
                            onClick={() => setShowCampaignModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 transition-colors text-sm font-medium"
                        >
                            <Rocket className="w-4 h-4" /> Start Sale Campaign
                        </button>
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
                            <div className="flex flex-wrap gap-2">
                                {['all', ...SOURCES].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSourceFilter(s)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                            sourceFilter === s
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {s === 'all' ? 'All Sources' : s}
                                    </button>
                                ))}
                            </div>
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
                        filteredDeals.length > 0 ? (
                            <>
                                <div className="flex items-center gap-3 mb-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === filteredDeals.length && filteredDeals.length > 0}
                                        onChange={selectAll}
                                        className="rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/10 text-indigo-500 focus:ring-indigo-500/50"
                                    />
                                    <span className="text-sm text-slate-400">
                                        {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
                                    </span>
                                </div>
                                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredDeals.map((deal: any) => {
                                const client = deal.client || {};
                                const daysAgo = daysSince(client.last_interaction?.occurred_at);
                                const isStale = daysAgo !== null && daysAgo > 7;
                                const noActivity = daysAgo === null;
                                const score = calculateScore(client);
                                const isDueToday = deal.next_follow_up_at && deal.next_follow_up_at.startsWith(new Date().toISOString().split('T')[0]);
                                const isOverdue = deal.next_follow_up_at && new Date(deal.next_follow_up_at) < new Date() && !isDueToday;

                                return (
                                    <div key={deal.id} className="relative">
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
                                                            {client.is_greylisted && (
                                                                <span className="status-badge text-xs status-greylisted shrink-0">Greylisted</span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                </div>

                                                {client.primary_contact && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                                        <User className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="truncate">{client.primary_contact.first_name} {client.primary_contact.last_name}</span>
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
                                                            <span>Last contact {timeAgo(client.last_interaction.occurred_at)} — stale</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                                            <span>{INTERACTION_ICONS[client.last_interaction.type] || '📋'}</span>
                                                            <span>
                                                                {client.last_interaction.type.charAt(0).toUpperCase() + client.last_interaction.type.slice(1)}
                                                                {' '}{timeAgo(client.last_interaction.occurred_at)}
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

                                                {/* Stage + follow-up */}
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setOpenStatusId(openStatusId === deal.id ? null : deal.id);
                                                        }}
                                                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-sm"
                                                    >
                                                        <span className="status-badge text-xs bg-indigo-500/20 text-indigo-400">
                                                            {deal.stage === 'new_lead' ? 'New Lead' : deal.stage === 'contacted' ? 'Contacted' : deal.stage === 'meeting_scheduled' ? 'Meeting Scheduled' : deal.stage === 'proposal_sent' ? 'Proposal Sent' : deal.stage === 'negotiating' ? 'Negotiating' : deal.stage}
                                                        </span>
                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                    {openStatusId === deal.id && (
                                                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl z-10 overflow-hidden p-3">
                                                            <label className="text-xs text-slate-400 block mb-1">Next follow-up</label>
                                                            <input
                                                                type="date"
                                                                defaultValue={deal.next_follow_up_at?.split('T')[0] || ''}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleFollowUpChange(deal, e.target.value);
                                                                }}
                                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-sm text-slate-900 dark:text-white"
                                                            />
                                                            <p className="text-[11px] text-slate-500 mt-2">Change the pipeline stage from the Sales Pipeline board.</p>
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
                        <PipelineBoard deals={dealsList} />
                    )}
                </div>
            </div>

            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedIds.size} selected</span>
                    <div className="w-px h-6 bg-slate-100 dark:bg-white/10" />
                    <StatusChips
                        value={bulkStatus}
                        onChange={setBulkStatus}
                        options={STATUS_OPTIONS}
                        size="sm"
                    />
                    <input
                        type="date"
                        value={bulkFollowUpDate}
                        onChange={(e) => setBulkFollowUpDate(e.target.value)}
                        title="Set follow-up date on each selected client's open deal"
                        className="glass-input text-sm py-1.5"
                    />
                    <button
                        onClick={handleBulkUpdate}
                        disabled={!bulkStatus && !bulkFollowUpDate}
                        className="glass-button text-sm disabled:opacity-40"
                    >
                        Apply
                    </button>
                    <button
                        onClick={() => { setSelectedIds(new Set()); setBulkStatus(''); setBulkFollowUpDate(''); }}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            {/* Start Sale Campaign Modal */}
            {showCampaignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Start Sale Campaign</h3>
                                <p className="text-xs text-slate-400">Pick an existing client to start a new deal at New Lead</p>
                            </div>
                            <button onClick={() => { setShowCampaignModal(false); setCampaignClientId(''); setCampaignSearch(''); }} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search clients..."
                                    value={campaignSearch}
                                    onChange={(e) => setCampaignSearch(e.target.value)}
                                    className="glass-input w-full pl-10 text-sm"
                                />
                            </div>

                            <div className="max-h-64 overflow-y-auto space-y-1 border border-slate-200 dark:border-white/10 rounded-lg p-1.5">
                                {filteredCampaignClients.length > 0 ? (
                                    filteredCampaignClients.map((c: any) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setCampaignClientId(String(c.id))}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                campaignClientId === String(c.id)
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            {c.company_name}
                                            {c.first_converted_at && (
                                                <span className={`ml-2 text-xs ${campaignClientId === String(c.id) ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                    (Existing client)
                                                </span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 text-center py-6">No eligible clients found</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => { setShowCampaignModal(false); setCampaignClientId(''); setCampaignSearch(''); }}
                                    className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-300 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStartCampaign}
                                    disabled={!campaignClientId}
                                    className="glass-button text-sm font-medium disabled:opacity-40"
                                >
                                    Start Campaign
                                </button>
                            </div>
                        </div>
                    </div>
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
