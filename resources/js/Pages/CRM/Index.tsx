import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, Building, User, MapPin, Pencil, Trash2, Rocket } from 'lucide-react';
import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { router } from '@inertiajs/react';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function CrmIndex() {
    const { clients } = usePage().props as any;
    const clientsList = clients?.data || clients || [];
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [letterFilter, setLetterFilter] = useState<string | null>(null);

    const filteredClients = useMemo(() => {
        return clientsList.filter((c: any) => {
            const matchSearch = !search || c.company_name.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === 'all' || c.status === statusFilter;
            const matchLetter = !letterFilter || c.company_name.charAt(0).toUpperCase() === letterFilter;
            return matchSearch && matchStatus && matchLetter;
        });
    }, [clientsList, search, statusFilter, letterFilter]);

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

    const handleStartCampaign = (id: string) => {
        router.post(`/crm/${id}/deals`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: string) => {
        Swal.fire({
            title: 'Delete Client?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete'
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/crm/${id}`);
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Clients & Accounts" />

            <PageHeader
                title="Clients & Accounts"
                subtitle={`${clientsList.length} clients`}
                action={
                    <Link href="/crm/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Client
                    </Link>
                }
            />

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
                                        placeholder="Search clients..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="glass-input w-full pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {['all', 'bronze', 'silver', 'gold', 'platinum'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                            statusFilter === s
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className="lg:hidden flex gap-1 overflow-x-auto pb-1">
                                {ALPHABET.map((letter) => (
                                    <button
                                        key={letter}
                                        onClick={() => setLetterFilter(letterFilter === letter ? null : letter)}
                                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium shrink-0 transition-colors ${
                                            letterFilter === letter
                                                ? 'bg-indigo-600 text-white'
                                                : letterCounts[letter]
                                                    ? 'text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                                                    : 'text-slate-600'
                                        }`}
                                    >
                                        {letter}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {(letterFilter || statusFilter !== 'all' || search) && (
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                                <span className="text-sm text-slate-400">Active filters:</span>
                                {letterFilter && (
                                    <button onClick={() => setLetterFilter(null)} className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30">
                                        {letterFilter} ✕
                                    </button>
                                )}
                                {statusFilter !== 'all' && (
                                    <button onClick={() => setStatusFilter('all')} className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30">
                                        {statusFilter} ✕
                                    </button>
                                )}
                                {search && (
                                    <button onClick={() => setSearch('')} className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30">
                                        "{search}" ✕
                                    </button>
                                )}
                            </div>
                        )}
                    </GlassCard>

                    {filteredClients.length > 0 ? (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredClients.map((client: any) => (
                                <Link key={client.id} href={`/crm/${client.id}`} className="block group">
                                    <GlassCard variant="interactive" className="h-full">
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <h3 className="font-semibold text-lg group-hover:text-indigo-400 transition-colors truncate min-w-0">
                                                {client.company_name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {client.is_greylisted && <StatusBadge status="greylisted" />}
                                                {client.status && <StatusBadge status={client.status} />}
                                            </div>
                                        </div>

                                        {client.industry && (
                                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                                <Building className="w-4 h-4 shrink-0" />
                                                <span>{client.industry}</span>
                                            </div>
                                        )}

                                        {client.primaryContact && (
                                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                                <User className="w-4 h-4 shrink-0" />
                                                <span>{client.primaryContact.first_name} {client.primaryContact.last_name}</span>
                                            </div>
                                        )}

                                        {client.city && (
                                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                                                <MapPin className="w-4 h-4 shrink-0" />
                                                <span>{client.city}{client.country ? `, ${client.country}` : ''}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                                            {!client.has_open_deal ? (
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStartCampaign(client.id); }}
                                                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 transition-colors"
                                                >
                                                    <Rocket className="w-3.5 h-3.5" /> Start Sale Campaign
                                                </button>
                                            ) : <span />}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.visit(`/crm/${client.id}/edit`); }}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(client.id); }}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <GlassCard>
                            <div className="text-center py-12">
                                <p className="text-slate-400 text-lg">No clients found</p>
                                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
