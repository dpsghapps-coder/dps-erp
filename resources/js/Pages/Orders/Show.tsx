import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Check, X } from 'lucide-react';

export default function OrderShow() {
    const { order } = usePage().props as any;
    
    const paymentColors: Record<string, string> = {
        unpaid: 'payment-unpaid',
        partial: 'payment-partial',
        paid: 'payment-paid',
    };

    const statusSteps = ['draft', 'confirmed', 'in_production', 'ready', 'delivered'];
    const currentStep = statusSteps.indexOf(order?.status);

    return (
        <AppLayout>
            <Head title={`Order ${order?.order_number}`} />

            <div className="mb-6">
                <Link href="/orders" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">{order?.order_number}</h1>
                            <p className="text-slate-400">Created {new Date(order?.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                            {order?.status === 'draft' && (
                                <form method="post" action={`/orders/${order?.id}/confirm`}>
                                    <button type="submit" className="glass-button flex items-center gap-2 bg-green-500/20 text-green-400">
                                        <Check className="w-4 h-4" /> Confirm
                                    </button>
                                </form>
                            )}
                            {order?.status !== 'cancelled' && order?.status !== 'delivered' && (
                                <form method="post" action={`/orders/${order?.id}/cancel`}>
                                    <button type="submit" className="glass-button flex items-center gap-2 bg-red-500/20 text-red-400">
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <GlassCard>
                        <div className="flex items-center justify-between">
                            {statusSteps.map((step, i) => (
                                <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                        i <= currentStep ? 'bg-white/20' : 'bg-white/5'
                                    }`}>
                                        {i + 1}
                                    </div>
                                    {i < statusSteps.length - 1 && (
                                        <div className={`w-16 h-px mx-2 ${
                                            i < currentStep ? 'bg-white/30' : 'bg-white/10'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                            <span>Draft</span>
                            <span>Confirmed</span>
                            <span>In Production</span>
                            <span>Ready</span>
                            <span>Delivered</span>
                        </div>
                    </GlassCard>

                    {/* Order Items */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-2 px-2 text-sm font-medium text-slate-400">Product</th>
                                        <th className="text-right py-2 px-2 text-sm font-medium text-slate-400">Qty</th>
                                        <th className="text-right py-2 px-2 text-sm font-medium text-slate-400">Unit Price</th>
                                        <th className="text-right py-2 px-2 text-sm font-medium text-slate-400">Disc %</th>
                                        <th className="text-right py-2 px-2 text-sm font-medium text-slate-400">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order?.items || []).map((item: any) => (
                                        <tr key={item.id} className="border-b border-white/5">
                                            <td className="py-3 px-2">
                                                <p className="font-medium">{item.product?.name}</p>
                                                {item.description && <p className="text-sm text-slate-400">{item.description}</p>}
                                            </td>
                                            <td className="py-3 px-2 text-right">{item.qty}</td>
                                            <td className="py-3 px-2 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                                            <td className="py-3 px-2 text-right">{item.discount_pct}%</td>
                                            <td className="py-3 px-2 text-right font-medium">${parseFloat(item.line_total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Status</h3>
                        <StatusBadge status={order?.status} />
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Client</h3>
                        <Link href={`/crm/${order?.client?.id}`} className="hover:text-blue-400">
                            <p className="font-medium">{order?.client?.company_name}</p>
                        </Link>
                        {order?.contact && (
                            <p className="text-sm text-slate-400 mt-1">
                                {order.contact.first_name} {order.contact.last_name}
                            </p>
                        )}
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Payment</h3>
                        <span className={`status-badge ${paymentColors[order?.payment_status]}`}>
                            {order?.payment_status}
                        </span>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Subtotal</span>
                                <span>${parseFloat(order?.total_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Discount</span>
                                <span>-${parseFloat(order?.discount_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Tax</span>
                                <span>${parseFloat(order?.tax_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-white/10 font-medium">
                                <span>Total</span>
                                <span>${parseFloat(order?.grand_total || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </GlassCard>

                    {order?.delivery_date && (
                        <GlassCard>
                            <h3 className="text-sm font-medium text-slate-400 mb-3">Delivery Date</h3>
                            <p>{new Date(order.delivery_date).toLocaleDateString()}</p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}