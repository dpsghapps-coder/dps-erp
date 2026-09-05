import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Check, X, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';
import NewJobModal from '@/Components/Production/NewJobModal';

const JOB_STATUS_LABELS: Record<string, string> = {
    new_jobs: 'New Jobs',
    design: 'Design',
    printing: 'Printing',
    assembly: 'Assembly',
    qc_inspection: 'QC & Inspection',
    completed: 'Completed',
    paused: 'Paused',
    cancelled: 'Cancelled',
};

const JOB_STATUS_COLORS: Record<string, string> = {
    new_jobs: 'bg-blue-500/20 text-blue-400',
    design: 'bg-indigo-500/20 text-indigo-400',
    printing: 'bg-amber-500/20 text-amber-400',
    assembly: 'bg-orange-500/20 text-orange-400',
    qc_inspection: 'bg-purple-500/20 text-purple-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
    cancelled: 'bg-red-500/20 text-red-400',
};

function JobStatusBadge({ status }: { status: string }) {
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JOB_STATUS_COLORS[status] || 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}>
            {JOB_STATUS_LABELS[status] || status}
        </span>
    );
}

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    confirmed: 'Confirmed',
    payment_received: 'Payment Received',
    in_production: 'In Production',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

function activeProductionJob(order: any): any {
    const jobs = order?.production_jobs || [];
    return jobs.find((j: any) => j.status !== 'cancelled' && j.status !== 'completed') || jobs.find((j: any) => j.status !== 'cancelled') || null;
}

function combinedStatusTimeline(order: any): any[] {
    const orderEntries = (order?.status_history || []).map((e: any) => ({ ...e, kind: 'order' }));
    const jobEntries = (order?.production_jobs || []).flatMap((job: any) =>
        (job.status_history || []).map((e: any) => ({ ...e, kind: 'production', job_number: job.job_number }))
    );

    return [...orderEntries, ...jobEntries].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

function OrderStatusBadge({ order }: { order: any }) {
    const job = activeProductionJob(order);
    const label = order?.status === 'in_production' && job
        ? `${STATUS_LABELS[order.status] || order.status} - ${JOB_STATUS_LABELS[job.status] || job.status}`
        : (STATUS_LABELS[order?.status] || order?.status);

    return (
        <span className={`status-badge status-${order?.status}`}>
            {label}
        </span>
    );
}

const NEXT_STEP: Record<string, { status: string; label: string } | undefined> = {
    draft: { status: 'confirmed', label: 'Confirm Order' },
    confirmed: { status: 'payment_received', label: 'Mark Payment Received' },
    payment_received: { status: 'in_production', label: 'Start Production' },
    in_production: { status: 'ready', label: 'Mark Ready' },
    ready: { status: 'delivered', label: 'Mark Delivered' },
};

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'apps_mobile', label: 'Apps & Mobile' },
];

const MOBILE_MONEY_PROVIDERS = [
    { value: 'mtn_momo', label: 'MTN MOMO' },
    { value: 'telecash', label: 'Telecash' },
    { value: 'at_money', label: 'AT Money' },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.value, m.label]));
const MOBILE_MONEY_PROVIDER_LABELS: Record<string, string> = Object.fromEntries(MOBILE_MONEY_PROVIDERS.map((p) => [p.value, p.label]));

function paymentDetailLabel(payment: any): string {
    const method = PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method;
    const provider = payment.mobile_money_provider ? ` (${MOBILE_MONEY_PROVIDER_LABELS[payment.mobile_money_provider] || payment.mobile_money_provider})` : '';
    const by = payment.recorded_by?.name ? ` by ${payment.recorded_by.name}` : '';

    return `${method}${provider}${by}`;
}

export default function OrderShow() {
    const { order, users } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showNewJobModal, setShowNewJobModal] = useState(false);
    const statusTimeline = combinedStatusTimeline(order);

    const { data: paymentData, setData: setPaymentData, post: postPayment, processing: paymentProcessing, errors: paymentErrors, reset: resetPayment } = useForm({
        payment_method: '',
        mobile_money_provider: '',
        amount: '',
    });

    const handleStatusChange = (status: string) => {
        router.post(`/orders/${order?.id}/status`, { status });
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this order?')) {
            handleStatusChange('cancelled');
        }
    };

    const openPaymentModal = () => {
        resetPayment();
        setPaymentData('amount', order?.payment_balance > 0 ? String(order.payment_balance) : '');
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postPayment(`/orders/${order?.id}/payments`, {
            onSuccess: () => {
                setShowPaymentModal(false);
                resetPayment();
            },
        });
    };

    const paymentColors: Record<string, string> = {
        unpaid: 'payment-unpaid',
        partial: 'payment-partial',
        paid: 'payment-paid',
    };

    const statusSteps = ['draft', 'confirmed', 'payment_received', 'in_production', 'ready', 'delivered'];
    const currentStep = statusSteps.indexOf(order?.status);
    const nextStep = NEXT_STEP[order?.status];

    return (
        <AppLayout>
            <Head title={`Order ${order?.order_number}`} />

            <div className="mb-6">
                <Link href="/orders" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
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
                                <Link href={`/orders/${order?.id}/edit`} className="glass-button flex items-center gap-2">
                                    <Pencil className="w-4 h-4" /> Edit
                                </Link>
                            )}
                            {nextStep && (
                                <button
                                    onClick={() => nextStep.status === 'payment_received' ? openPaymentModal() : handleStatusChange(nextStep.status)}
                                    className="glass-button flex items-center gap-2 bg-green-500/20 text-green-400"
                                >
                                    <Check className="w-4 h-4" /> {nextStep.label}
                                </button>
                            )}
                            {order?.status !== 'cancelled' && order?.status !== 'delivered' && (
                                <button onClick={handleCancel} className="glass-button flex items-center gap-2 bg-red-500/20 text-red-400">
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <GlassCard>
                        <div className="flex items-center justify-between">
                            {statusSteps.map((step, i) => (
                                <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        i <= currentStep
                                            ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                                            : 'bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500'
                                    }`}>
                                        {i + 1}
                                    </div>
                                    {i < statusSteps.length - 1 && (
                                        <div className={`w-16 h-px mx-2 ${
                                            i < currentStep ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-100 dark:bg-white/10'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                            <span>Draft</span>
                            <span>Confirmed</span>
                            <span>Payment</span>
                            <span>In Production</span>
                            <span>Ready</span>
                            <span>Delivered</span>
                        </div>
                    </GlassCard>

                    {/* Status History */}
                    {statusTimeline.length > 0 && (
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Status History</h2>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {statusTimeline.map((entry: any) => {
                                    const isProduction = entry.kind === 'production';
                                    const labels = isProduction ? JOB_STATUS_LABELS : STATUS_LABELS;
                                    return (
                                        <div key={`${entry.kind}-${entry.id}`} className="flex items-start gap-2 text-sm">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isProduction ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                            <div>
                                                <span className="text-slate-400">{entry.changed_by?.name || 'System'}</span>
                                                <span className="mx-1 text-slate-500">moved</span>
                                                {isProduction && (
                                                    <span className="font-mono text-xs text-slate-400 mr-1">{entry.job_number}</span>
                                                )}
                                                <span className="mx-1 text-slate-500">to</span>
                                                <span className="font-medium">{labels[entry.new_status] || entry.new_status}</span>
                                                {entry.old_status && (
                                                    <span className="text-slate-500"> from {labels[entry.old_status] || entry.old_status}</span>
                                                )}
                                                <span className="text-slate-500 ml-2 text-xs">{new Date(entry.created_at).toLocaleString()}</span>
                                                {entry.notes && <p className="text-slate-400 text-xs mt-0.5">{entry.notes}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    )}

                    {/* Order Items */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10">
                                        <th className="text-left py-2 px-2 text-sm font-medium text-slate-400">Product</th>
                                        <th className="text-right py-2 px-2 text-sm font-medium text-slate-400">Qty</th>
                                        <th className="text-right py-2 px-2 text-sm font-medium text-slate-400">Unit Price</th>
                                        <th className="text-right py-2 px-2 text-sm font-medium text-slate-400">Disc %</th>
                                        <th className="text-right py-2 px-2 text-sm font-medium text-slate-400">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order?.items || []).map((item: any) => (
                                        <tr key={item.id} className="border-b border-slate-100 dark:border-white/5">
                                            <td className="py-3 px-2">
                                                <p className="font-medium">{item.product?.name}</p>
                                                {item.description && <p className="text-sm text-slate-400">{item.description}</p>}
                                            </td>
                                            <td className="py-3 px-2 text-right">{item.qty}</td>
                                            <td className="py-3 px-2 text-right">{formatCurrency(item.unit_price)}</td>
                                            <td className="py-3 px-2 text-right">{item.discount_pct}%</td>
                                            <td className="py-3 px-2 text-right font-medium">{formatCurrency(item.line_total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* Production Jobs */}
                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Production Jobs</h2>
                            {order?.status !== 'draft' && order?.status !== 'cancelled' && (
                                <button onClick={() => setShowNewJobModal(true)} className="glass-button text-sm py-1.5 px-3 flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Create Production Job
                                </button>
                            )}
                        </div>
                        {order?.production_jobs?.length > 0 ? (
                            <div className="space-y-2">
                                {order.production_jobs.map((job: any) => (
                                    <Link
                                        key={job.id}
                                        href="/production"
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium font-mono text-sm">{job.job_number}</p>
                                            <p className="text-sm text-slate-400">{job.title}{job.assigned_to?.name ? ` · ${job.assigned_to.name}` : ''}</p>
                                        </div>
                                        <JobStatusBadge status={job.status} />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">No production jobs linked to this order yet.</p>
                        )}
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Status</h3>
                        <OrderStatusBadge order={order} />

                        {order?.production_jobs?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                                <p className="text-xs text-slate-400">Production</p>
                                {order.production_jobs.map((job: any) => (
                                    <div key={job.id} className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-mono text-slate-500 truncate">{job.job_number}</span>
                                        <JobStatusBadge status={job.status} />
                                    </div>
                                ))}
                            </div>
                        )}
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
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-slate-400">Payment</h3>
                            {order?.status !== 'draft' && order?.status !== 'cancelled' && Number(order?.payment_balance) > 0 && (
                                <button onClick={openPaymentModal} className="text-indigo-400 hover:text-indigo-300 text-xs font-medium inline-flex items-center gap-1">
                                    <Plus className="w-3.5 h-3.5" /> Add Payment
                                </button>
                            )}
                        </div>
                        <span className={`status-badge ${paymentColors[order?.payment_status]}`}>
                            {order?.payment_status}
                        </span>

                        <div className="space-y-2 text-sm mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Total Paid</span>
                                <span className="font-medium text-emerald-400">{formatCurrency(order?.total_paid || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Payment Balance</span>
                                <span className="font-medium">{formatCurrency(order?.payment_balance || 0)}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                            <h4 className="text-xs font-medium text-slate-400 mb-2">Payment History</h4>
                            {order?.payments?.length > 0 ? (
                                <div className="space-y-2">
                                    {order.payments.map((payment: any) => (
                                        <div key={payment.id} className="text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 text-xs">{new Date(payment.created_at).toLocaleDateString()}</span>
                                                <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                            </div>
                                            <p className="text-xs text-slate-500">{paymentDetailLabel(payment)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">No payments recorded yet.</p>
                            )}
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Subtotal</span>
                                <span>{formatCurrency(order?.total_amount || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Discount</span>
                                <span>-{formatCurrency(order?.discount_amount || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Tax</span>
                                <span>{formatCurrency(order?.tax_amount || 0)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/10 font-medium">
                                <span>Total</span>
                                <span>{formatCurrency(order?.grand_total || 0)}</span>
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

            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Record Payment</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handlePaymentSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Payment Method *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {PAYMENT_METHODS.map((m) => (
                                            <button
                                                key={m.value}
                                                type="button"
                                                onClick={() => setPaymentData((prev: any) => ({
                                                    ...prev,
                                                    payment_method: m.value,
                                                    mobile_money_provider: m.value === 'mobile_money' ? prev.mobile_money_provider : '',
                                                }))}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                                    paymentData.payment_method === m.value
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20'
                                                }`}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                    {paymentErrors.payment_method && <p className="text-red-400 text-sm mt-1">{paymentErrors.payment_method}</p>}
                                </div>

                                {paymentData.payment_method === 'mobile_money' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Mobile Money Network *</label>
                                        <div className="flex flex-wrap gap-2">
                                            {MOBILE_MONEY_PROVIDERS.map((p) => (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    onClick={() => setPaymentData('mobile_money_provider', p.value)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                                        paymentData.mobile_money_provider === p.value
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20'
                                                    }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                        {paymentErrors.mobile_money_provider && <p className="text-red-400 text-sm mt-1">{paymentErrors.mobile_money_provider}</p>}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2">Amount (GHS) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData('amount', e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="0.00"
                                    />
                                    {order?.payment_balance > 0 && (
                                        <p className="text-xs text-slate-500 mt-1">Balance due: {formatCurrency(order.payment_balance)}</p>
                                    )}
                                    {paymentErrors.amount && <p className="text-red-400 text-sm mt-1">{paymentErrors.amount}</p>}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 glass-button-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={paymentProcessing} className="flex-1 glass-button">
                                    {paymentProcessing ? 'Saving...' : 'Save Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <NewJobModal
                open={showNewJobModal}
                onClose={() => setShowNewJobModal(false)}
                users={users || []}
                orders={order ? [order] : []}
                defaultOrderId={order?.id}
            />
        </AppLayout>
    );
}