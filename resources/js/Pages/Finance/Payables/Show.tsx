import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Send, Ban, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';
import Swal from 'sweetalert2';

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    partially_paid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

export default function ShowBill() {
    const { bill, financialAccounts } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        financial_account_id: '',
        reference: '',
        notes: '',
    });

    const handleSubmitBill = () => {
        Swal.fire({
            title: 'Submit this bill?',
            text: 'This will post it to the General Ledger and lock its line items.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Submit',
        }).then((res) => {
            if (res.isConfirmed) router.post(`/finance/payables/${bill.id}/submit`);
        });
    };

    const handleCancel = () => {
        Swal.fire({
            title: 'Cancel this bill?',
            text: 'Its ledger entry (if submitted) will be reversed.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Cancel Bill',
        }).then((res) => {
            if (res.isConfirmed) router.post(`/finance/payables/${bill.id}/cancel`);
        });
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'Delete this draft?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) router.delete(`/finance/payables/${bill.id}`);
        });
    };

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/finance/payables/${bill.id}/payments`, {
            onSuccess: () => { reset(); setShowPaymentForm(false); },
        });
    };

    const balance = bill.subtotal - bill.amount_paid;
    const canRecordPayment = ['submitted', 'partially_paid'].includes(bill.status);

    return (
        <AppLayout>
            <Head title={`Bill ${bill.bill_number}`} />

            <div className="mb-6">
                <Link href="/finance/payables" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Payables
                </Link>
            </div>

            <PageHeader
                title={bill.bill_number}
                subtitle={bill.supplier?.company_name}
                action={
                    <div className="flex gap-2">
                        {bill.status === 'draft' && (
                            <>
                                <button onClick={handleSubmitBill} className="glass-button flex items-center gap-2"><Send className="w-4 h-4" /> Submit</button>
                                <button onClick={handleDelete} className="glass-button-secondary flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
                            </>
                        )}
                        {canRecordPayment && (
                            <>
                                <button onClick={() => setShowPaymentForm(!showPaymentForm)} className="glass-button flex items-center gap-2"><Plus className="w-4 h-4" /> Record Payment</button>
                                <button onClick={handleCancel} className="glass-button-secondary flex items-center gap-2"><Ban className="w-4 h-4" /> Cancel</button>
                            </>
                        )}
                    </div>
                }
            />

            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <GlassCard>
                    <p className="text-sm text-slate-400">Total</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(bill.subtotal)}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-sm text-slate-400">Paid</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(bill.amount_paid)}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-sm text-slate-400">Balance</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(balance)}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-sm text-slate-400">Status</p>
                    <span className={`inline-block mt-1 text-xs px-3 py-1 rounded-full ${STATUS_STYLES[bill.status]}`}>
                        {bill.status.replace('_', ' ')}{bill.is_overdue ? ' · overdue' : ''}
                    </span>
                </GlassCard>
            </div>

            {showPaymentForm && (
                <GlassCard className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Record Payment</h3>
                    <form onSubmit={handlePayment} className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Amount * (balance: {formatCurrency(balance)})</label>
                            <input type="number" step="0.01" min="0.01" max={balance} className="glass-input w-full" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                            {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Date *</label>
                            <input type="date" className="glass-input w-full" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Paid From *</label>
                            <select className="glass-input w-full" value={data.financial_account_id} onChange={(e) => setData('financial_account_id', e.target.value)}>
                                <option value="">Select Account</option>
                                {(financialAccounts || []).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            {errors.financial_account_id && <p className="text-red-400 text-sm mt-1">{errors.financial_account_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Reference</label>
                            <input className="glass-input w-full" value={data.reference} onChange={(e) => setData('reference', e.target.value)} placeholder="Cheque #, transfer ref..." />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowPaymentForm(false)} className="glass-button-secondary">Cancel</button>
                            <button type="submit" disabled={processing} className="glass-button">{processing ? 'Saving...' : 'Record Payment'}</button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Line Items</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <th className="text-left py-2 text-slate-500">Description</th>
                                <th className="text-right py-2 text-slate-500">Qty</th>
                                <th className="text-right py-2 text-slate-500">Unit Price</th>
                                <th className="text-right py-2 text-slate-500">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(bill.items || []).map((item: any) => (
                                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50">
                                    <td className="py-2 text-slate-700 dark:text-slate-300">{item.description}</td>
                                    <td className="py-2 text-right font-mono">{item.quantity}</td>
                                    <td className="py-2 text-right font-mono">{formatCurrency(item.unit_price)}</td>
                                    <td className="py-2 text-right font-mono font-medium">{formatCurrency(item.line_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {bill.notes && <p className="text-sm text-slate-500 mt-4 italic">{bill.notes}</p>}
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment History</h3>
                    {(bill.payments || []).length > 0 ? (
                        <div className="space-y-3">
                            {bill.payments.map((p: any) => (
                                <div key={p.id} className="flex justify-between items-start border-b border-slate-100 dark:border-slate-700/50 pb-2 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{p.financial_account?.name}</p>
                                        <p className="text-xs text-slate-400">{p.date}{p.reference ? ` · ${p.reference}` : ''}</p>
                                    </div>
                                    <p className="font-mono font-medium text-red-600 dark:text-red-400">-{formatCurrency(p.amount)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-6">No payments recorded yet</p>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
