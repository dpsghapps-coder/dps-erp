import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LineItem {
    product_id: string;
    description: string;
    qty: number;
    unit_price: number;
    discount_pct: number;
}

export default function OrderCreate() {
    const { clients } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        contact_id: '',
        delivery_date: '',
        notes: '',
        items: [{ product_id: '', description: '', qty: 1, unit_price: 0, discount_pct: 0 }] as LineItem[],
    });

    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        if (data.client_id && clients) {
            const client = clients.find((c: any) => c.id == data.client_id);
            setSelectedClient(client);
        }
    }, [data.client_id, clients]);

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', description: '', qty: 1, unit_price: 0, discount_pct: 0 }]);
    };

    const removeItem = (index: number) => {
        if (data.items.length > 1) {
            setData('items', data.items.filter((_: any, i: number) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof LineItem, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        if (field === 'product_id' && value) {
            const product = products.find((p: any) => p.id == value);
            if (product) {
                newItems[index].description = product.name;
                newItems[index].unit_price = product.default_price || 0;
            }
        }
        
        setData('items', newItems);
    };

    const calculateLineTotal = (item: LineItem) => {
        return item.qty * item.unit_price * (1 - item.discount_pct / 100);
    };

    const subtotal = data.items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    const discount = 0;
    const tax = 0;
    const grandTotal = subtotal - discount + tax;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/orders');
    };

    return (
        <AppLayout>
            <Head title="Create Order" />

            <div className="mb-6">
                <Link href="/orders" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                </Link>
            </div>

            <PageHeader title="Create Order" subtitle="Create a new sales order" />

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Client *</label>
                                    <select 
                                        value={data.client_id}
                                        onChange={(e) => setData('client_id', e.target.value)}
                                        className="glass-input w-full"
                                    >
                                        <option value="">Select Client</option>
                                        {(clients || []).map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.company_name}</option>
                                        ))}
                                    </select>
                                    {errors.client_id && <p className="text-red-400 text-sm mt-1">{errors.client_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Delivery Date</label>
                                    <input 
                                        type="date"
                                        value={data.delivery_date}
                                        onChange={(e) => setData('delivery_date', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-2">Notes</label>
                                <textarea 
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="glass-input w-full h-20"
                                    placeholder="Order notes..."
                                />
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Line Items</h2>
                                <button type="button" onClick={addItem} className="glass-button flex items-center gap-2 text-sm">
                                    <Plus className="w-4 h-4" /> Add Item
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-2 px-2 text-sm font-medium text-slate-400">Product</th>
                                            <th className="text-left py-2 px-2 text-sm font-medium text-slate-400">Description</th>
                                            <th className="text-right py-2 px-2 text-sm font-medium text-slate-400 w-20">Qty</th>
                                            <th className="text-right py-2 px-2 text-sm font-medium text-slate-400 w-24">Unit Price</th>
                                            <th className="text-right py-2 px-2 text-sm font-medium text-slate-400 w-20">Disc %</th>
                                            <th className="text-right py-2 px-2 text-sm font-medium text-slate-400 w-24">Total</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item, index) => (
                                            <tr key={index} className="border-b border-white/5">
                                                <td className="py-2 px-2">
                                                    <select 
                                                        value={item.product_id}
                                                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                        className="glass-input w-full text-sm"
                                                    >
                                                        <option value="">Select</option>
                                                        {(products || []).map((p: any) => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input 
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        className="glass-input w-full text-sm"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input 
                                                        type="number"
                                                        value={item.qty}
                                                        onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                                                        className="glass-input w-full text-sm text-right"
                                                        min="0.01"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input 
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        className="glass-input w-full text-sm text-right"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input 
                                                        type="number"
                                                        value={item.discount_pct}
                                                        onChange={(e) => updateItem(index, 'discount_pct', parseFloat(e.target.value) || 0)}
                                                        className="glass-input w-full text-sm text-right"
                                                        min="0"
                                                        max="100"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td className="py-2 px-2 text-right font-medium">
                                                    ${calculateLineTotal(item).toFixed(2)}
                                                </td>
                                                <td className="py-2 px-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        disabled={data.items.length === 1}
                                                        className="p-1 hover:bg-white/10 rounded disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Summary</h2>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Discount</span>
                                    <span>-${discount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Tax</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-white/10 text-lg font-semibold">
                                    <span>Total</span>
                                    <span>${grandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-6">
                                <button type="submit" disabled={processing} className="glass-button">
                                    {processing ? 'Saving...' : 'Save as Draft'}
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}