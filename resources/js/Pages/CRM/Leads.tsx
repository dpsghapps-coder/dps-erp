import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, User, Mail, Phone, Grid, List as ListIcon, Users, TrendingUp, Target } from 'lucide-react';
import { useState } from 'react';

export default function LeadsIndex() {
    const { clients, stats, currentFilter } = usePage().props as any;
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');

    const filters = [
        { key: 'all', label: 'All', count: stats.total },
        { key: 'lead', label: 'Leads', count: stats.leads },
        { key: 'prospect', label: 'Prospects', count: stats.prospects },
    ];

    const filteredClients = (clients?.data || []).filter((c: any) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            c.company_name.toLowerCase().includes(searchLower) ||
            c.email?.toLowerCase().includes(searchLower) ||
            c.phone?.includes(search)
        );
    });

    const statusColors: Record<string, string> = {
        lead: 'bg-blue-100 text-blue-700',
        prospect: 'bg-yellow-100 text-yellow-700',
    };

    return (
        <AppLayout>
            <Head title="Lead Management" />

            <PageHeader 
                title="Lead Management" 
                subtitle="Manage leads and prospects"
            />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <GlassCard>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{stats.total}</p>
                            <p className="text-sm text-slate-500">Total Leads</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{stats.leads}</p>
                            <p className="text-sm text-slate-500">New Leads</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{stats.prospects}</p>
                            <p className="text-sm text-slate-500">Prospects</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search clients..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            {filters.map(f => (
                                <Link
                                    key={f.key}
                                    href={`/crm/leads?filter=${f.key}`}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        currentFilter === f.key || (currentFilter === undefined && f.key === 'all')
                                            ? 'bg-slate-800 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {f.label} ({f.count})
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </GlassCard>

            {view === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredClients.length > 0 ? (
                        filteredClients.map((client: any) => (
                            <Link key={client.id} href={`/crm/${client.id}`}>
                                <GlassCard variant="interactive" className="h-full">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <span className="text-lg font-semibold text-slate-600">
                                                {client.company_name.charAt(0)}
                                            </span>
                                        </div>
                                        <StatusBadge status={client.status} />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">{client.company_name}</h3>
                                    {client.industry && <p className="text-sm text-slate-500">{client.industry}</p>}
                                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                                        {client.email && (
                                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                                <Mail className="w-4 h-4" /> {client.email}
                                            </p>
                                        )}
                                        {client.phone && (
                                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                                <Phone className="w-4 h-4" /> {client.phone}
                                            </p>
                                        )}
                                    </div>
                                </GlassCard>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <GlassCard>
                                <EmptyState 
                                    icon={User}
                                    title="No clients found"
                                    action={
                                        <Link href="/crm/create" className="glass-button">
                                            <Plus className="w-4 h-4 mr-2" /> Add Client
                                        </Link>
                                    }
                                />
                            </GlassCard>
                        </div>
                    )}
                </div>
            ) : (
                <GlassCard className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Company</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Industry</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Phone</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.length > 0 ? (
                                    filteredClients.map((client: any) => (
                                        <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-slate-900">{client.company_name}</p>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500">{client.industry || '-'}</td>
                                            <td className="py-3 px-4 text-slate-500">{client.email || '-'}</td>
                                            <td className="py-3 px-4 text-slate-500">{client.phone || '-'}</td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={client.status} />
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/crm/${client.id}`} className="text-indigo-600 hover:underline">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8">
                                            <EmptyState icon={User} title="No clients found" />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}
        </AppLayout>
    );
}