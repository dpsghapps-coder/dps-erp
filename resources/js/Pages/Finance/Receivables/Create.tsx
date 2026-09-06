import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

const CATEGORIES = ['Product Sales', 'Service Income', 'Printing Services', 'Design Services', 'Photography Services', 'Advertising', 'Other Income'];

export default function CreateInvoice() {
    const { clients } = usePage().props as any;
    const formatCurrency = useCurrency();

    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        category: '',
        invoice_date: new Date().toISOString().split('T')[0],
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
        post('/finance/receivables');
    };

    const nonGreylisted = (clients || []).filter((c: any) => !c.is_greylisted);
    const greylisted = (clients || []).filter((c: any) => c.is_greylisted);

    return (
        <AppLayout>
            <Head title="New Invoice" />

            <div className="mb-6">
                <Link href="/finance/receivables" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Receivables
                </Link>
            </div>

            <PageHeader title="New Invoice" subtitle="Saved as a draft — nothing posts to the ledger until you send it" />

            <form onSubmit={handleSubmit}>
                <GlassCard className="mb-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Client *</label>
                            <select className="glass-input w-full" value={data.client_id} onChange={(e) => setData('client_id', e.target.value)}>
                                <option value="">Select Client</option>
                                {nonGreylisted.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                                {greylisted.length > 0 && (
                                    <optgroup label="Greylisted (cannot invoice)">
                                        {greylisted.map((c: any) => <option key={c.id} value={c.id} disabled>{c.company_name}</option>)}
                                    </optgroup>
                                )}
                            </select>
                            {errors.client_id && <p className="text-red-400 text-sm mt-1">{errors.client_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Income Category *</label>
                            <select className="glass-input w-full" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                                <option value="">Select Category</option>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Invoice Date *</label>
                            <input type="date" className="glass-input w-full" value={data.invoice_date} onChange={(e) => setData('invoice_date', e.target.value)} />
                            {errors.invoice_date && <p className="text-red-400 text-sm mt-1">{errors.invoice_date}</p>}
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
                    <Link href="/finance/receivables" className="glass-button-secondary">Cancel</Link>
                    <button type="submit" disabled={processing} className="glass-button">
                        {processing ? 'Saving...' : 'Save as Draft'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
