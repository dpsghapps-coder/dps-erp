import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

export default function OrdersIndex() {
    const { orders } = usePage().props;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredOrders = (orders?.data || []).filter((o: any) => {
        const matchSearch = !search || o.order_number.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const paymentColors: Record<string, string> = {
        unpaid: 'payment-unpaid',
        partial: 'payment-partial',
        paid: 'payment-paid',
    };

    return (
        <AppLayout>
            <Head title="Orders" />

            <PageHeader 
                title="Orders" 
                subtitle="Manage sales orders"
                action={
                    <Link href="/orders/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Order
                    </Link>
                }
            />

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search orders..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                    </div>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="glass-input"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_production">In Production</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Order #</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Client</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Total</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order: any) => (
                                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 px-4 font-mono">{order.order_number}</td>
                                        <td className="py-3 px-4">{order.client?.company_name}</td>
                                        <td className="py-3 px-4 text-slate-400">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            ${parseFloat(order.grand_total || 0).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link href={`/orders/${order.id}`} className="text-blue-400 hover:underline">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8">
                                        <EmptyState
                                            icon={ShoppingCart}
                                            title="No orders found"
                                            action={
                                                <Link href="/orders/create" className="glass-button">
                                                    <Plus className="w-4 h-4 mr-2" /> Create Order
                                                </Link>
                                            }
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order: any) => (
                            <div key={order.id} className="glass-card p-4 rounded-xl border border-white/10">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-mono text-sm text-slate-400">{order.order_number}</p>
                                        <p className="font-medium text-white">{order.client?.company_name}</p>
                                    </div>
                                    <Link href={`/orders/${order.id}`} className="text-blue-400 hover:underline text-sm">
                                        View
                                    </Link>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="font-medium text-white">
                                        ${parseFloat(order.grand_total || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            icon={ShoppingCart}
                            title="No orders found"
                            action={
                                <Link href="/orders/create" className="glass-button">
                                    <Plus className="w-4 h-4 mr-2" /> Create Order
                                </Link>
                            }
                        />
                    )}
                </div>
            </GlassCard>
        </AppLayout>
    );
}