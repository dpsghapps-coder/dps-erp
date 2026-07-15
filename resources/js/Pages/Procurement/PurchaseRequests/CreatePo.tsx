import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, LoadingSpinner } from '@/Components/ui';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, ShoppingCart } from 'lucide-react';

interface Props {
    purchaseRequest: any;
    suppliers: any[];
}

export default function CreatePoFromPr({ purchaseRequest, suppliers }: Props) {
    const pr = purchaseRequest;

    const { data, setData, post, processing, errors } = useForm({
        supplier_id: pr.supplier_id || '',
        expected_date: '',
        notes: '',
        items: (pr.items || []).map((item: any) => ({
            pr_item_id: item.id,
            item_name: item.item_name,
            qty: item.qty_requested,
            unit_cost: item.estimated_cost,
        })),
    });

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        (newItems[index] as any)[field] = value;
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/procurement/purchase-requests/${pr.id}/store-po`);
    };

    const totalAmount = data.items.reduce((sum: number, item: any) => sum + (item.qty * item.unit_cost), 0);

    return (
        <AppLayout>
            <Head title={`Create PO from ${pr.pr_number}`} />

            <PageHeader
                title="Create Purchase Order"
                subtitle={`From ${pr.pr_number} — ${pr.department}`}
                action={
                    <Link href={`/procurement/purchase-requests/${pr.id}`} className="glass-button-secondary flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to PR
                    </Link>
                }
            />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Supplier & Delivery</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Supplier *</label>
                                    <select
                                        className="glass-input w-full"
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a supplier</option>
                                        {suppliers.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.company_name}</option>
                                        ))}
                                    </select>
                                    {errors.supplier_id && <p className="text-rose-500 text-xs mt-1.5">{errors.supplier_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Expected Delivery</label>
                                    <input
                                        type="date"
                                        className="glass-input w-full"
                                        value={data.expected_date}
                                        onChange={(e) => setData('expected_date', e.target.value)}
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">PO Items</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                            <th className="py-3 px-2">#</th>
                                            <th className="py-3 px-2">Item</th>
                                            <th className="py-3 px-2 text-right">Qty</th>
                                            <th className="py-3 px-2 text-right">Unit Cost</th>
                                            <th className="py-3 px-2 text-right">Line Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.items.map((item: any, index: number) => (
                                            <tr key={index}>
                                                <td className="py-3 px-2 text-sm text-slate-500">{index + 1}</td>
                                                <td className="py-3 px-2 font-medium">{item.item_name}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        className="glass-input w-24 text-right"
                                                        value={item.qty}
                                                        onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                                                        required
                                                    />
                                                </td>
                                                <td className="py-3 px-2 text-right">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="glass-input w-32 text-right"
                                                        value={item.unit_cost}
                                                        onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                                                        required
                                                    />
                                                </td>
                                                <td className="py-3 px-2 text-right font-medium text-slate-600 dark:text-slate-300">
                                                    ${(item.qty * item.unit_cost).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Notes / Instructions</label>
                            <textarea
                                className="glass-input w-full h-24"
                                placeholder="Additional instructions for the supplier..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">PR Number</span>
                                    <span className="font-mono font-medium">{pr.pr_number}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Department</span>
                                    <span>{pr.department}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Items</span>
                                    <span>{data.items.length}</span>
                                </div>
                                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                                    <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                                        <span>PO Total</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">
                                            ${totalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="glass-button w-full flex items-center justify-center gap-2 mt-4"
                                >
                                    {processing ? <LoadingSpinner /> : <ShoppingCart className="w-4 h-4" />}
                                    {processing ? 'Creating...' : 'Create Purchase Order'}
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
