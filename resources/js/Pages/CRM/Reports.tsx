import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Users, TrendingUp, BarChart3, ArrowRight, DollarSign, Trophy, Medal, Award, Crown, Gem } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

const STAGE_LABELS: Record<string, string> = {
    new_lead: 'New Lead',
    contacted: 'Contacted',
    meeting_scheduled: 'Meeting Scheduled',
    proposal_sent: 'Proposal Sent',
    negotiating: 'Negotiating',
    converted: 'Converted',
    lost: 'Lost',
};

export default function Reports() {
    const { stats, conversionRate, won, lost, pipelineFunnel, pipelineValue, wonValue, lostReasons, monthlyClients, sources, industries, recentClients } = usePage().props as any;
    const formatCurrency = useCurrency();

    const statCards = [
        { label: 'Total Clients', value: stats.total_clients, icon: Users, color: 'bg-slate-500/20 text-slate-400' },
        { label: 'Gold', value: stats.gold, icon: Award, color: 'bg-yellow-500/20 text-yellow-400' },
        { label: 'Platinum', value: stats.platinum, icon: Crown, color: 'bg-violet-500/20 text-violet-400' },
        { label: 'Win Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'bg-indigo-500/20 text-indigo-400' },
        { label: 'Pipeline Value', value: formatCurrency(pipelineValue || 0), icon: DollarSign, color: 'bg-emerald-500/20 text-emerald-400' },
        { label: 'Won Revenue', value: formatCurrency(wonValue || 0), icon: Trophy, color: 'bg-amber-500/20 text-amber-400' },
    ];

    const maxCount = Math.max(...monthlyClients.map((m: any) => m.count), 1);
    const maxFunnel = Math.max(...Object.values(pipelineFunnel || {}).map((v: any) => v as number), 1);

    return (
        <AppLayout>
            <Head title="CRM Reports" />

            <PageHeader 
                title="CRM Reports" 
                subtitle="Analytics and insights"
            />

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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
                                <div className="flex-1 bg-slate-100 dark:bg-white/10 rounded-full h-6 relative overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full rounded-full transition-all"
                                        style={{ width: `${(month.count / maxCount) * 100}%` }}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-900 dark:text-white">
                                        {month.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Tier Breakdown */}
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Tier Breakdown</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Medal className="w-5 h-5 text-orange-400" />
                                <span className="font-medium">Bronze</span>
                            </div>
                            <span className="text-xl font-semibold text-orange-400">{stats.bronze}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-500/10 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Gem className="w-5 h-5 text-slate-400" />
                                <span className="font-medium">Silver</span>
                            </div>
                            <span className="text-xl font-semibold text-slate-400">{stats.silver}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-yellow-400" />
                                <span className="font-medium">Gold</span>
                            </div>
                            <span className="text-xl font-semibold text-yellow-400">{stats.gold}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-violet-500/10 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Crown className="w-5 h-5 text-violet-400" />
                                <span className="font-medium">Platinum</span>
                            </div>
                            <span className="text-xl font-semibold text-violet-400">{stats.platinum}</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Sales Funnel */}
                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Sales Funnel</h2>
                        <span className="text-sm text-slate-500">{won} won · {lost} lost</span>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(pipelineFunnel || {}).map(([stage, count]) => (
                            <div key={stage} className="flex items-center gap-3">
                                <span className="text-sm text-slate-500 w-36 truncate">{STAGE_LABELS[stage] || stage}</span>
                                <div className="flex-1 bg-slate-100 dark:bg-white/10 rounded-full h-6 relative overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${stage === 'lost' ? 'bg-red-500' : stage === 'converted' ? 'bg-green-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${((count as number) / maxFunnel) * 100}%` }}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-900 dark:text-white">
                                        {count as number}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Lost Reasons */}
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Lost Reasons</h2>
                    {Object.keys(lostReasons || {}).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(lostReasons).map(([reason, count]) => (
                                <div key={reason} className="flex items-center justify-between">
                                    <span className="text-slate-400">{reason}</span>
                                    <span className="font-medium">{count as number}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-4">No lost deals recorded yet</p>
                    )}
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
                                    <span className="text-slate-400">{source}</span>
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
                                    <span className="text-slate-400">{industry}</span>
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
                    <Link href="/crm" className="text-sm text-indigo-400 hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Company</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Added</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentClients.map((client: any) => (
                                <tr key={client.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                                    <td className="py-3 px-4">
                                        <Link href={`/crm/${client.id}`} className="font-medium text-slate-900 dark:text-white hover:text-indigo-400">
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