import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { ShoppingCart, TrendingUp, DollarSign, XCircle, CheckCircle, ArrowRight, BarChart3, Trophy } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    confirmed: 'Confirmed',
    payment_received: 'Payment Received',
    in_production: 'In Production',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

export default function OrderReports() {
    const { stats, totalRevenue, avgOrderValue, paymentStatus, monthlyOrders, topProducts, topClients, recentOrders } = usePage().props as any;
    const formatCurrency = useCurrency();

    const statCards = [
        { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: 'bg-slate-500/20 text-slate-400' },
        { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'bg-green-500/20 text-green-400' },
        { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'bg-red-500/20 text-red-400' },
        { label: 'Total Revenue', value: formatCurrency(totalRevenue || 0), icon: DollarSign, color: 'bg-emerald-500/20 text-emerald-400' },
        { label: 'Avg Order Value', value: formatCurrency(avgOrderValue || 0), icon: TrendingUp, color: 'bg-indigo-500/20 text-indigo-400' },
        { label: 'Paid', value: paymentStatus.paid, icon: Trophy, color: 'bg-amber-500/20 text-amber-400' },
    ];

    const maxCount = Math.max(...monthlyOrders.map((m: any) => m.count), 1);
    const maxProductRevenue = Math.max(...topProducts.map((p: any) => Number(p.total_revenue)), 1);

    return (
        <AppLayout>
            <Head title="Order Reports" />

            <PageHeader
                title="Order Reports"
                subtitle="Sales analytics and insights"
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
                {/* Monthly Orders */}
                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" /> Monthly Orders
                        </h2>
                        <span className="text-sm text-slate-500">Last 12 months</span>
                    </div>
                    <div className="space-y-2">
                        {monthlyOrders.map((month: any, i: number) => (
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

                {/* Status Breakdown */}
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Status Breakdown</h2>
                    <div className="space-y-3">
                        {Object.entries(STATUS_LABELS).map(([status, label]) => (
                            <div key={status} className="flex items-center justify-between">
                                <StatusBadge status={status} />
                                <span className="text-lg font-semibold">{stats[status] ?? 0}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Top Products */}
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Top Products by Revenue</h2>
                    {topProducts.length > 0 ? (
                        <div className="space-y-2">
                            {topProducts.map((product: any) => (
                                <div key={product.id} className="flex items-center gap-3">
                                    <span className="text-sm text-slate-500 w-32 truncate">{product.name}</span>
                                    <div className="flex-1 bg-slate-100 dark:bg-white/10 rounded-full h-6 relative overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full rounded-full transition-all"
                                            style={{ width: `${(Number(product.total_revenue) / maxProductRevenue) * 100}%` }}
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-900 dark:text-white">
                                            {formatCurrency(product.total_revenue)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-4">No order items recorded yet</p>
                    )}
                </GlassCard>

                {/* Payment Status */}
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Payment Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                            <span className="font-medium">Unpaid</span>
                            <span className="text-xl font-semibold text-red-400">{paymentStatus.unpaid}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                            <span className="font-medium">Partial</span>
                            <span className="text-xl font-semibold text-amber-400">{paymentStatus.partial}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                            <span className="font-medium">Paid</span>
                            <span className="text-xl font-semibold text-green-400">{paymentStatus.paid}</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Top Clients */}
            <GlassCard className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Top Clients by Revenue</h2>
                {topClients.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Client</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Orders</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topClients.map((client: any) => (
                                    <tr key={client.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                                        <td className="py-3 px-4">
                                            <Link href={`/crm/${client.id}`} className="font-medium text-slate-900 dark:text-white hover:text-indigo-400">
                                                {client.company_name}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-right text-slate-400">{client.order_count}</td>
                                        <td className="py-3 px-4 text-right font-medium text-emerald-400">{formatCurrency(client.total_revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-slate-400 text-center py-4">No revenue recorded yet</p>
                )}
            </GlassCard>

            {/* Recent Orders */}
            <GlassCard>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Orders</h2>
                    <Link href="/orders" className="text-sm text-indigo-400 hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Order #</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Client</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order: any) => (
                                <tr key={order.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                                    <td className="py-3 px-4">
                                        <Link href={`/orders/${order.id}`} className="font-mono text-sm text-slate-900 dark:text-white hover:text-indigo-400">
                                            {order.order_number}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4">{order.client?.company_name}</td>
                                    <td className="py-3 px-4">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(order.grand_total || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </AppLayout>
    );
}
