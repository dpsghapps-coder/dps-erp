import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Printer, Search, X, Building2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCurrency } from '@/Utils/currency';
import Swal from 'sweetalert2';

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-400',
    sent: 'bg-blue-500/20 text-blue-400',
    accepted: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
};

const STATUSES = ['all', 'draft', 'sent', 'accepted', 'rejected'];

export default function ProformaAllIndex() {
    const { proformas, clients } = usePage().props as any;
    const formatCurrency = useCurrency();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showClientPicker, setShowClientPicker] = useState(false);
    const [clientSearch, setClientSearch] = useState('');

    const filteredProformas = useMemo(() => {
        const list = proformas || [];
        return list.filter((p: any) => {
            const matchStatus = statusFilter === 'all' || p.status === statusFilter;
            const matchSearch = !search ||
                p.number?.toLowerCase().includes(search.toLowerCase()) ||
                p.client?.company_name?.toLowerCase().includes(search.toLowerCase());
            return matchStatus && matchSearch;
        });
    }, [proformas, search, statusFilter]);

    const filteredClients = useMemo(() => {
        const list = clients || [];
        if (!clientSearch) return list;
        return list.filter((c: any) => c.company_name.toLowerCase().includes(clientSearch.toLowerCase()));
    }, [clients, clientSearch]);

    const handleDelete = (clientId: number, id: number) => {
        Swal.fire({
            title: 'Delete Proforma?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/crm/${clientId}/proformas/${id}`, { preserveScroll: true });
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Proformas" />

            <PageHeader
                title="Proformas / Estimates"
                subtitle={`${proformas?.length || 0} proformas across all clients`}
                action={
                    <button onClick={() => setShowClientPicker(true)} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Proforma
                    </button>
                }
            />

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[220px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by client or proforma number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {STATUSES.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                                    statusFilter === s
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {s === 'all' ? 'All Statuses' : s}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            {filteredProformas.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProformas.map((p: any) => (
                        <Link key={p.id} href={`/crm/${p.client_id}/proformas/${p.id}`} className="block group">
                            <GlassCard variant="interactive" className="h-full">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="min-w-0">
                                        <h3 className="font-semibold group-hover:text-indigo-400 transition-colors truncate">{p.number}</h3>
                                        <p className="text-sm text-slate-400">{p.date ? new Date(p.date).toLocaleDateString() : '-'}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${STATUS_COLORS[p.status] || ''}`}>
                                        {p.status?.charAt(0).toUpperCase()}{p.status?.slice(1)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2 min-w-0">
                                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{p.client?.company_name || 'Unknown client'}</span>
                                </div>

                                {p.valid_until && (
                                    <p className="text-xs text-slate-400 mb-2">Valid until {new Date(p.valid_until).toLocaleDateString()}</p>
                                )}

                                <p className="text-xs mb-2">
                                    {p.deal ? (
                                        <span className="text-indigo-400">{p.deal.type === 'repeat_business' ? 'Sales Campaign' : 'New Lead'} · {p.deal.stage.replace(/_/g, ' ')}</span>
                                    ) : (
                                        <span className="text-slate-500">Standalone</span>
                                    )}
                                </p>

                                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                                    <span className="text-lg font-semibold">{formatCurrency(p.total)}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`/crm/${p.client_id}/proformas/${p.id}`, '_blank'); }}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.visit(`/crm/${p.client_id}/proformas/${p.id}/edit`); }}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(p.client_id, p.id); }}
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
                        <p className="text-slate-400 text-lg">No proformas found</p>
                        <p className="text-slate-500 text-sm mt-1">
                            {proformas?.length ? 'Try adjusting your filters' : 'Create your first proforma to get started'}
                        </p>
                    </div>
                </GlassCard>
            )}

            {/* Client Picker Modal */}
            {showClientPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">New Proforma</h3>
                                <p className="text-xs text-slate-400">Select the client this proforma is for</p>
                            </div>
                            <button onClick={() => { setShowClientPicker(false); setClientSearch(''); }} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search clients..."
                                    value={clientSearch}
                                    onChange={(e) => setClientSearch(e.target.value)}
                                    className="glass-input w-full pl-10 text-sm"
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-64 overflow-y-auto space-y-1 border border-slate-200 dark:border-white/10 rounded-lg p-1.5">
                                {filteredClients.length > 0 ? (
                                    filteredClients.map((c: any) => (
                                        <button
                                            key={c.id}
                                            onClick={() => router.visit(`/crm/${c.id}/proformas/create`)}
                                            className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300"
                                        >
                                            {c.company_name}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 text-center py-6">No clients found</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
