import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState, Pagination } from '@/Components/ui';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Plus, Search, ShoppingCart, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCurrency } from '@/Utils/currency';

export default function OrdersIndex() {
    const { orders, filters } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            router.get('/orders', { search, status: statusFilter }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, statusFilter]);

    const filteredOrders = orders?.data || [];

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
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'all', label: 'All Status' },
                            { value: 'draft', label: 'Draft' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'payment_received', label: 'Payment Received' },
                            { value: 'in_production', label: 'In Production' },
                            { value: 'ready', label: 'Ready' },
                            { value: 'delivered', label: 'Delivered' },
                            { value: 'cancelled', label: 'Cancelled' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(opt.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                    statusFilter === opt.value
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Order #</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Client</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Total</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order: any) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
                                    >
                                        <td className="py-3 px-4 font-mono">{order.order_number}</td>
                                        <td className="py-3 px-4">{order.client?.company_name}</td>
                                        <td className="py-3 px-4 text-slate-400">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {formatCurrency(order.grand_total || 0)}
                                        </td>
                                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <Link href={`/orders/${order.id}`} className="text-blue-400 hover:underline">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8">
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
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className="glass-card p-4 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-mono text-sm text-slate-400">{order.order_number}</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{order.client?.company_name}</p>
                                    </div>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/orders/${order.id}`} className="text-blue-400 hover:underline text-sm">
                                            View
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <StatusBadge status={order.status} />
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {formatCurrency(order.grand_total || 0)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </p>
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
            <Pagination meta={orders} />

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedOrder.order_number}</h3>
                                <p className="text-sm text-slate-400">{selectedOrder.client?.company_name}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Date</span>
                                <span>{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Status</span>
                                <StatusBadge status={selectedOrder.status} />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Payment</span>
                                <span className={`status-badge ${paymentColors[selectedOrder.payment_status]}`}>
                                    {selectedOrder.payment_status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Grand Total</span>
                                <span className="font-medium text-emerald-400">{formatCurrency(selectedOrder.grand_total || 0)}</span>
                            </div>
                        </div>

                        <h4 className="text-sm font-medium mb-3 pt-4 border-t border-slate-200 dark:border-white/10">Order Items</h4>
                        {selectedOrder.items?.length > 0 ? (
                            <div className="space-y-2">
                                {selectedOrder.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg text-sm">
                                        <div className="min-w-0">
                                            <p className="truncate">{item.product?.name}</p>
                                            <p className="text-slate-500 text-xs">{item.qty} × {formatCurrency(item.unit_price)}{item.discount_pct > 0 ? ` (${item.discount_pct}% off)` : ''}</p>
                                        </div>
                                        <span className="text-emerald-400 font-medium shrink-0 ml-2">
                                            {formatCurrency(item.line_total)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm">No items on this order.</p>
                        )}

                        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-white/10">
                            <Link href={`/orders/${selectedOrder.id}`} className="glass-button text-sm">
                                View Full Page
                            </Link>
                            {selectedOrder.status === 'draft' && (
                                <Link href={`/orders/${selectedOrder.id}/edit`} className="glass-button text-sm">
                                    Edit
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
