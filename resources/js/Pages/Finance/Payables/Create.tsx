import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

const CATEGORIES = ['Materials', 'Rent', 'Electricity', 'Internet', 'Transport', 'Maintenance', 'Marketing', 'Office Supplies', 'Other Expenses'];

export default function CreateBill() {
    const { suppliers } = usePage().props as any;
    const formatCurrency = useCurrency();

    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        category: '',
        bill_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
        items: [{ description: '', quantity: '1', unit_price: '' }],
    });

    const addItem = () => setData('items', [...data.items, { description: '', quantity: '1', unit_price: '' }]);
    const removeItem = (index: number) => setData('items', data.items.filter((_: any, i: number) => i !== index));
    const updateItem = (index: number, field: string, value: string) => {
        const items = [...data.items];
        items[index] = { ...items[index], [field]: value };
        setData('items', items);
    };

    const subtotal = data.items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance/payables');
    };

    return (
        <AppLayout>
            <Head title="New Bill" />

            <div className="mb-6">
                <Link href="/finance/payables" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Payables
                </Link>
            </div>

            <PageHeader title="New Bill" subtitle="Saved as a draft — nothing posts to the ledger until you submit it" />

            <form onSubmit={handleSubmit}>
                <GlassCard className="mb-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Supplier *</label>
                            <select className="glass-input w-full" value={data.supplier_id} onChange={(e) => setData('supplier_id', e.target.value)}>
                                <option value="">Select Supplier</option>
                                {(suppliers || []).map((s: any) => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                            </select>
                            {errors.supplier_id && <p className="text-red-400 text-sm mt-1">{errors.supplier_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Expense Category *</label>
                            <select className="glass-input w-full" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                                <option value="">Select Category</option>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Bill Date *</label>
                            <input type="date" className="glass-input w-full" value={data.bill_date} onChange={(e) => setData('bill_date', e.target.value)} />
                            {errors.bill_date && <p className="text-red-400 text-sm mt-1">{errors.bill_date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Due Date *</label>
                            <input type="date" className="glass-input w-full" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                            {errors.due_date && <p className="text-red-400 text-sm mt-1">{errors.due_date}</p>}
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Line Items</h3>
                        <button type="button" onClick={addItem} className="glass-button-secondary text-sm flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Line
                        </button>
                    </div>
                    <div className="space-y-3">
                        {data.items.map((item: any, index: number) => (
                            <div key={index} className="grid grid-cols-12 gap-3 items-start">
                                <div className="col-span-6">
                                    <input className="glass-input w-full" placeholder="Description" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <input type="number" step="0.01" min="0.01" className="glass-input w-full" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <input type="number" step="0.01" min="0" className="glass-input w-full" placeholder="Unit Price" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', e.target.value)} />
                                </div>
                                <div className="col-span-1 pt-2 text-right text-sm font-mono text-slate-600 dark:text-slate-400">
                                    {formatCurrency((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))}
                                </div>
                                <div className="col-span-1 text-right">
                                    {data.items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(index)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">
                            Subtotal: {formatCurrency(subtotal)}
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="mb-6">
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea className="glass-input w-full h-20 resize-none" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                </GlassCard>

                <div className="flex justify-end gap-4">
                    <Link href="/finance/payables" className="glass-button-secondary">Cancel</Link>
                    <button type="submit" disabled={processing} className="glass-button">
                        {processing ? 'Saving...' : 'Save as Draft'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
