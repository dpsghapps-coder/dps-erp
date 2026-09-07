import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { Package, Wrench, Receipt, Layers, Building2 } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-400',
    sent: 'bg-blue-500/20 text-blue-400',
    accepted: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
};

const STATUS_ORDER = ['draft', 'sent', 'accepted', 'rejected'];

export default function SalesOverview() {
    const { productStats, serviceStats, categoryBreakdown, proformaStats, recentProformas } = usePage().props as any;
    const formatCurrency = useCurrency();

    const cards = [
        { label: 'Products', value: productStats?.total ?? 0, sub: `${productStats?.active ?? 0} active`, icon: Package, href: '/products' },
        { label: 'Services', value: serviceStats?.total ?? 0, sub: `${serviceStats?.active ?? 0} active`, icon: Wrench, href: '/services' },
        { label: 'Proformas', value: proformaStats?.total ?? 0, sub: formatCurrency(proformaStats?.total_value ?? 0), icon: Receipt, href: '/crm/proformas' },
        { label: 'Categories', value: categoryBreakdown?.length ?? 0, sub: 'with active items', icon: Layers, href: '/products' },
    ];

    return (
        <AppLayout>
            <Head title="Sales Overview" />

            <PageHeader title="Sales Overview" subtitle="Products, services, and proforma activity at a glance" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cards.map((card) => (
                    <Link key={card.label} href={card.href} className="block">
                        <GlassCard variant="interactive" className="h-full">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 dark:text-slate-500">{card.label}</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{card.value}</p>
                                    <p className="text-xs text-slate-400">{card.sub}</p>
                                </div>
                            </div>
                        </GlassCard>
                    </Link>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Proformas by Status</h3>
                    <div className="space-y-3">
                        {STATUS_ORDER.map((status) => {
                            const row = proformaStats?.by_status?.[status];
                            return (
                                <div key={status} className="flex items-center justify-between">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[status]}`}>
                                        {status}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{row?.count ?? 0}</p>
                                        <p className="text-xs text-slate-400">{formatCurrency(row?.value ?? 0)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Catalog by Category</h3>
                    {(categoryBreakdown || []).length > 0 ? (
                        <div className="space-y-2">
                            {categoryBreakdown.map((cat: any) => (
                                <div key={cat.name} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                                    <span className="text-slate-600 dark:text-slate-300">{cat.name}</span>
                                    <span className="text-slate-400 text-xs">
                                        {cat.products_count} product{cat.products_count !== 1 ? 's' : ''} · {cat.services_count} service{cat.services_count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 py-8 text-center">No categorized items yet</p>
                    )}
                </GlassCard>

                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Proformas</h3>
                        <Link href="/crm/proformas" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
                    </div>
                    {(recentProformas || []).length > 0 ? (
                        <div className="space-y-2">
                            {recentProformas.map((p: any) => (
                                <Link
                                    key={p.id}
                                    href={`/crm/${p.client_id}/proformas/${p.id}`}
                                    className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5 last:border-0 hover:text-indigo-500 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{p.number}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                                            <Building2 className="w-3 h-3 shrink-0" /> {p.client?.company_name || 'Unknown client'}
                                        </p>
                                    </div>
                                    <span className="text-sm font-medium shrink-0 ml-2">{formatCurrency(p.total)}</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={Receipt} title="No proformas yet" description="Proformas created for clients will show up here" />
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
