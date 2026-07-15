import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Users, TrendingUp, UserCheck, UserX, Target, BarChart3, ArrowRight } from 'lucide-react';

export default function Reports() {
    const { stats, conversionRate, monthlyClients, sources, industries, recentClients } = usePage().props as any;

    const statCards = [
        { label: 'Total Clients', value: stats.total_clients, icon: Users, color: 'bg-slate-100 text-slate-600' },
        { label: 'Active', value: stats.active, icon: UserCheck, color: 'bg-green-100 text-green-600' },
        { label: 'Inactive', value: stats.inactive, icon: UserX, color: 'bg-red-100 text-red-600' },
        { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'bg-indigo-100 text-indigo-600' },
    ];

    const maxCount = Math.max(...monthlyClients.map((m: any) => m.count), 1);

    return (
        <AppLayout>
            <Head title="CRM Reports" />

            <PageHeader 
                title="CRM Reports" 
                subtitle="Analytics and insights"
            />

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statCards.map((stat, i) => (
                    <GlassCard key={i}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{stat.value}</p>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly New Clients */}
                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" /> Monthly New Clients
                        </h2>
                        <span className="text-sm text-slate-500">Last 12 months</span>
                    </div>
                    <div className="space-y-2">
                        {monthlyClients.map((month: any, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-sm text-slate-500 w-16">{month.month}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                                    <div 
                                        className="bg-indigo-500 h-full rounded-full transition-all"
                                        style={{ width: `${(month.count / maxCount) * 100}%` }}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                                        {month.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Status Breakdown */}
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Status Breakdown</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Target className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">Leads</span>
                            </div>
                            <span className="text-xl font-semibold text-blue-600">{stats.leads}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-yellow-600" />
                                <span className="font-medium">Prospects</span>
                            </div>
                            <span className="text-xl font-semibold text-yellow-600">{stats.prospects}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <UserCheck className="w-5 h-5 text-green-600" />
                                <span className="font-medium">Active</span>
                            </div>
                            <span className="text-xl font-semibold text-green-600">{stats.active}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <UserX className="w-5 h-5 text-red-600" />
                                <span className="font-medium">Inactive</span>
                            </div>
                            <span className="text-xl font-semibold text-red-600">{stats.inactive}</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Clients by Source */}
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Clients by Source</h2>
                    {Object.keys(sources).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(sources).map(([source, count]) => (
                                <div key={source} className="flex items-center justify-between">
                                    <span className="text-slate-600">{source}</span>
                                    <span className="font-medium">{count as number}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-4">No source data available</p>
                    )}
                </GlassCard>

                {/* Clients by Industry */}
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Clients by Industry</h2>
                    {Object.keys(industries).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(industries).map(([industry, count]) => (
                                <div key={industry} className="flex items-center justify-between">
                                    <span className="text-slate-600">{industry}</span>
                                    <span className="font-medium">{count as number}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-4">No industry data available</p>
                    )}
                </GlassCard>
            </div>

            {/* Recent Clients */}
            <GlassCard className="mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Clients</h2>
                    <Link href="/crm" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Company</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Added</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentClients.map((client: any) => (
                                <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <Link href={`/crm/${client.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                            {client.company_name}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4">
                                        <StatusBadge status={client.status} />
                                    </td>
                                    <td className="py-3 px-4 text-slate-500">
                                        {new Date(client.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </AppLayout>
    );
}