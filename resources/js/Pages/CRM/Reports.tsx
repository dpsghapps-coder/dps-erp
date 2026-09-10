import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import CrmTabs from '@/Components/CrmTabs';
import { Head, usePage, Link } from '@inertiajs/react';
import { Users, TrendingUp, BarChart3, ArrowRight, DollarSign, Trophy, Medal, Award, Crown, Gem, AlertTriangle, Clock, Megaphone, Calendar, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
    social: 'Social Media',
    email: 'Email',
    event: 'Event',
    ad: 'Advertising',
    print: 'Print',
    other: 'Other',
};

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    active: 'bg-emerald-500/20 text-emerald-400',
    completed: 'bg-indigo-500/20 text-indigo-400',
    cancelled: 'bg-red-500/20 text-red-400',
};

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
    const { stats, conversionRate, won, newBusinessWon, repeatBusinessWon, lost, pipelineFunnel, pipelineValue, wonValue, overdueFollowUps, upcomingFollowUps, marketing, lostReasons, monthlyClients, sources, industries, recentClients } = usePage().props as any;
    const formatCurrency = useCurrency();

    const statCards = [
        { label: 'Total Clients', value: stats.total_clients, icon: Users, color: 'bg-slate-500/20 text-slate-400' },
        { label: 'Gold', value: stats.gold, icon: Award, color: 'bg-yellow-500/20 text-yellow-400' },
        { label: 'Platinum', value: stats.platinum, icon: Crown, color: 'bg-violet-500/20 text-violet-400' },
        { label: 'Win Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'bg-indigo-500/20 text-indigo-400' },
        { label: 'Pipeline Value', value: formatCurrency(pipelineValue || 0), icon: DollarSign, color: 'bg-emerald-500/20 text-emerald-400' },
        { label: 'Won Revenue', value: formatCurrency(wonValue || 0), icon: Trophy, color: 'bg-amber-500/20 text-amber-400' },
    ];

    const salesManagementCards = [
        { label: 'Overdue Follow-ups', value: overdueFollowUps || 0, icon: AlertTriangle, color: 'bg-red-500/20 text-red-400' },
        { label: 'Due This Week', value: upcomingFollowUps || 0, icon: Clock, color: 'bg-amber-500/20 text-amber-400' },
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

            <CrmTabs activeTab="dashboard" />

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
                    <div className="flex items-center gap-4 mb-4 text-sm">
                        <span className="text-emerald-400 font-medium">{newBusinessWon || 0} new business won</span>
                        <span className="text-indigo-400 font-medium">{repeatBusinessWon || 0} repeat deals won</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {salesManagementCards.map((stat, i) => (
                            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-white/5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                                    <stat.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold leading-tight">{stat.value}</p>
                                    <p className="text-xs text-slate-500">{stat.label}</p>
                                </div>
                            </div>
                        ))}
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

            {/* Marketing */}
            {marketing && (
                <GlassCard className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Megaphone className="w-5 h-5" /> Marketing
                        </h2>
                        <Link href="/marketing" className="text-sm text-indigo-400 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-500/20 text-slate-400">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{marketing.total}</p>
                                <p className="text-sm text-slate-500">Total Campaigns</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{marketing.active}</p>
                                <p className="text-sm text-slate-500">Active</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/20 text-blue-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{marketing.scheduled}</p>
                                <p className="text-sm text-slate-500">Scheduled</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{formatCurrency(marketing.totalBudget || 0)}</p>
                                <p className="text-sm text-slate-500">Total Budget</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/20 text-amber-400">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{formatCurrency(marketing.totalSpent || 0)}</p>
                                <p className="text-sm text-slate-500">Total Spent</p>
                            </div>
                        </div>
                    </div>

                    {marketing.recentCampaigns?.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10">
                                        <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Campaign</th>
                                        <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Type</th>
                                        <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Status</th>
                                        <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Start Date</th>
                                        <th className="text-right py-2 px-4 text-sm font-medium text-slate-500">Budget</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marketing.recentCampaigns.map((campaign: any) => (
                                        <tr key={campaign.id} className="border-b border-slate-100 dark:border-white/5">
                                            <td className="py-2 px-4">
                                                <Link href={`/marketing/${campaign.id}`} className="hover:text-indigo-400 transition-colors">
                                                    {campaign.title}
                                                </Link>
                                            </td>
                                            <td className="py-2 px-4 text-slate-400">{CAMPAIGN_TYPE_LABELS[campaign.type] || campaign.type}</td>
                                            <td className="py-2 px-4">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${CAMPAIGN_STATUS_COLORS[campaign.status] || 'bg-slate-500/20 text-slate-400'}`}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 text-slate-400">{new Date(campaign.start_date).toLocaleDateString()}</td>
                                            <td className="py-2 px-4 text-right font-medium">{formatCurrency(campaign.budget || 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>
            )}

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
                                        {client.status ? <StatusBadge status={client.status} /> : <span className="text-slate-500 text-sm">—</span>}
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