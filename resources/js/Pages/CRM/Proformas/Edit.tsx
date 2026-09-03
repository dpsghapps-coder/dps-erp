import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';
import { useMemo } from 'react';

interface LineItem {
    description: string;
    specs: string;
    quantity: number;
    unit_cost: number;
}

export default function ProformaEdit() {
    const { client, proforma } = usePage().props as any;
    const formatCurrency = useCurrency();

    const { data, setData, put, processing, errors } = useForm({
        date: proforma?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        valid_until: proforma?.valid_until?.split('T')[0] || '',
        status: proforma?.status || 'draft',
        items: (proforma?.items || []) as LineItem[],
        discount: proforma?.discount || 0,
        discount_type: proforma?.discount_type || 'flat',
        vat_rate: proforma?.vat_rate || 20,
        deposit_rate: proforma?.deposit_rate || 70,
        rep_name: proforma?.rep_name || '',
        terms: proforma?.terms || '',
        notes: proforma?.notes || '',
    });

    const calc = useMemo(() => {
        const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0);
        const discountValue = data.discount_type === 'percentage'
            ? subtotal * (data.discount / 100)
            : data.discount;
        const discounted = subtotal - discountValue;
        const vatAmount = discounted * (data.vat_rate / 100);
        const total = discounted + vatAmount;
        const depositAmount = total * (data.deposit_rate / 100);
        const balanceAmount = total - depositAmount;
        return { subtotal, discountValue, discounted, vatAmount, total, depositAmount, balanceAmount };
    }, [data.items, data.discount, data.discount_type, data.vat_rate, data.deposit_rate]);

    const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
        const updated = [...data.items];
        updated[index] = { ...updated[index], [field]: value };
        setData('items', updated);
    };

    const addItem = () => {
        setData('items', [...data.items, { description: '', specs: '', quantity: 1, unit_cost: 0 }]);
    };

    const removeItem = (index: number) => {
        if (data.items.length <= 1) return;
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/crm/${client?.id}/proformas/${proforma?.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit ${proforma?.number}`} />

            <div className="mb-6">
                <Link href={`/crm/${client?.id}/proformas`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Proformas
                </Link>
            </div>

            <PageHeader title={`Edit ${proforma?.number}`} subtitle={client?.company_name} />

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Line Items</h2>
                            <div className="space-y-3">
                                {data.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                        <div className="col-span-5">
                                            <input type="text" placeholder="Item description" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="glass-input w-full text-sm" />
                                            <input type="text" placeholder="Specs (optional)" value={item.specs} onChange={(e) => updateItem(index, 'specs', e.target.value)} className="glass-input w-full text-xs mt-1" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" placeholder="Qty" value={item.quantity || ''} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} className="glass-input w-full text-sm" min="1" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" placeholder="Unit cost" value={item.unit_cost || ''} onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)} className="glass-input w-full text-sm" min="0" step="0.01" />
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end text-sm font-medium text-slate-300 pt-2">
                                            {formatCurrency(item.quantity * item.unit_cost)}
                                        </div>
                                        <div className="col-span-1 flex items-center justify-center pt-2">
                                            <button type="button" onClick={() => removeItem(index)} disabled={data.items.length <= 1} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-30">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addItem} className="mt-3 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                            {errors.items && <p className="text-red-400 text-sm mt-2">{errors.items}</p>}
                        </GlassCard>

                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
                            <textarea value={data.terms} onChange={(e) => setData('terms', e.target.value)} className="glass-input w-full h-32 text-sm" placeholder="Terms and conditions..." />
                        </GlassCard>

                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Notes</h2>
                            <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} className="glass-input w-full h-24 text-sm" placeholder="Additional notes..." />
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date *</label>
                                    <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} className="glass-input w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Valid Until</label>
                                    <input type="date" value={data.valid_until} onChange={(e) => setData('valid_until', e.target.value)} className="glass-input w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="glass-input w-full">
                                        <option value="draft">Draft</option>
                                        <option value="sent">Sent</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Sales Rep</label>
                                    <input type="text" value={data.rep_name} onChange={(e) => setData('rep_name', e.target.value)} className="glass-input w-full" placeholder="Rep name" />
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Calculations</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Discount</label>
                                        <input type="number" value={data.discount || ''} onChange={(e) => setData('discount', parseFloat(e.target.value) || 0)} className="glass-input w-full text-sm" min="0" step="0.01" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Discount Type</label>
                                        <select value={data.discount_type} onChange={(e) => setData('discount_type', e.target.value)} className="glass-input w-full text-sm">
                                            <option value="flat">Flat (GHC)</option>
                                            <option value="percentage">Percentage (%)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">VAT Rate (%)</label>
                                        <input type="number" value={data.vat_rate} onChange={(e) => setData('vat_rate', parseFloat(e.target.value) || 0)} className="glass-input w-full text-sm" min="0" max="100" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Deposit (%)</label>
                                        <input type="number" value={data.deposit_rate} onChange={(e) => setData('deposit_rate', parseFloat(e.target.value) || 0)} className="glass-input w-full text-sm" min="0" max="100" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Tax Exclusive Value</span>
                                    <span>{formatCurrency(calc.subtotal)}</span>
                                </div>
                                {calc.discountValue > 0 && (
                                    <div className="flex justify-between text-red-400">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(calc.discountValue)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-slate-400">VAT ({data.vat_rate}%)</span>
                                    <span>{formatCurrency(calc.vatAmount)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-white/10">
                                    <span>Total</span>
                                    <span>{formatCurrency(calc.total)}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-2 text-sm">
                                <div className="flex justify-between text-blue-400">
                                    <span>{data.deposit_rate}% Deposit</span>
                                    <span className="font-medium">{formatCurrency(calc.depositAmount)}</span>
                                </div>
                                <div className="flex justify-between text-amber-400">
                                    <span>{100 - data.deposit_rate}% Balance</span>
                                    <span className="font-medium">{formatCurrency(calc.balanceAmount)}</span>
                                </div>
                            </div>
                        </GlassCard>

                        <div className="flex gap-3">
                            <button type="submit" disabled={processing} className="glass-button flex-1">
                                {processing ? 'Updating...' : 'Update Proforma'}
                            </button>
                            <Link href={`/crm/${client?.id}/proformas`} className="glass-button-secondary flex-1 text-center">
                                Cancel
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
