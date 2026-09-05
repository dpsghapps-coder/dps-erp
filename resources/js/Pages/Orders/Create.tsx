import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCurrency } from '@/Utils/currency';

const PRODUCT_TYPE = 'App\\Models\\Product';
const SERVICE_TYPE = 'App\\Models\\Service';

interface LineItem {
    product_id: string;
    product_type: string;
    description: string;
    qty: number;
    unit_price: number;
    discount_pct: number;
}

function priceForQuantity(item: any, qty: number): number {
    const tiers = item?.prices || [];
    const applicable = tiers
        .filter((p: any) => qty >= p.min_qty && (p.max_qty === null || p.max_qty === undefined || qty <= p.max_qty))
        .sort((a: any, b: any) => b.min_qty - a.min_qty)[0];

    return applicable ? Number(applicable.unit_price) : Number(item?.default_price || 0);
}

function findPickable(products: any[], services: any[], type: string, id: string) {
    if (type === PRODUCT_TYPE) return (products || []).find((p: any) => String(p.id) === String(id));
    if (type === SERVICE_TYPE) return (services || []).find((s: any) => String(s.id) === String(id));
    return null;
}

export default function OrderCreate() {
    const page = usePage().props as any;
    const { clients, products, services } = page;
    const formatCurrency = useCurrency();
    const isAdmin = page.auth?.user?.role?.name === 'admin';
    const permissions = (page.auth?.permissions as string[]) || [];
    const canApplyDiscount = isAdmin || permissions.includes('*') || permissions.includes('orders.apply_discount');
    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        contact_id: '',
        delivery_date: '',
        notes: '',
        items: [{ product_id: '', product_type: '', description: '', qty: 1, unit_price: 0, discount_pct: 0 }] as LineItem[],
    });

    const [selectedClient, setSelectedClient] = useState<any>(null);

    useEffect(() => {
        if (data.client_id && clients) {
            const client = clients.find((c: any) => c.id == data.client_id);
            setSelectedClient(client);
            if (data.contact_id && !client?.contacts?.some((ct: any) => ct.id == data.contact_id)) {
                setData('contact_id', '');
            }
        } else {
            setSelectedClient(null);
        }
    }, [data.client_id, clients]);

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', product_type: '', description: '', qty: 1, unit_price: 0, discount_pct: 0 }]);
    };

    const removeItem = (index: number) => {
        if (data.items.length > 1) {
            setData('items', data.items.filter((_: any, i: number) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof LineItem, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'product_id') {
            // value arrives as "type|id" from the picker
            const [type, id] = String(value).split('|');
            newItems[index].product_type = type || '';
            newItems[index].product_id = id || '';

            const picked = findPickable(products, services, type, id);
            if (picked) {
                newItems[index].description = picked.name;
                newItems[index].unit_price = priceForQuantity(picked, newItems[index].qty);
            }
        } else if (field === 'qty') {
            const picked = findPickable(products, services, newItems[index].product_type, newItems[index].product_id);
            if (picked) {
                newItems[index].unit_price = priceForQuantity(picked, value);
            }
        }

        setData('items', newItems);
    };

    const calculateLineTotal = (item: LineItem) => {
        return item.qty * item.unit_price * (1 - item.discount_pct / 100);
    };

    const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.unit_price, 0);
    const discount = data.items.reduce((sum, item) => sum + item.qty * item.unit_price * (item.discount_pct / 100), 0);
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
                <Link href="/orders" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
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
                                    <label className="block text-sm font-medium mb-2">Contact</label>
                                    <select
                                        value={data.contact_id}
                                        onChange={(e) => setData('contact_id', e.target.value)}
                                        disabled={!selectedClient?.contacts?.length}
                                        className="glass-input w-full"
                                    >
                                        <option value="">
                                            {selectedClient?.contacts?.length ? 'Select Contact' : 'No contacts for this client'}
                                        </option>
                                        {(selectedClient?.contacts || []).map((ct: any) => (
                                            <option key={ct.id} value={ct.id}>{ct.first_name} {ct.last_name}</option>
                                        ))}
                                    </select>
                                    {errors.contact_id && <p className="text-red-400 text-sm mt-1">{errors.contact_id}</p>}
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
                                        <tr className="border-b border-slate-200 dark:border-white/10">
                                            <th className="text-left py-2 px-2 text-sm font-medium text-slate-400">Product / Service</th>
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
                                            <tr key={index} className="border-b border-slate-100 dark:border-white/5">
                                                <td className="py-2 px-2">
                                                    <select
                                                        value={item.product_type && item.product_id ? `${item.product_type}|${item.product_id}` : ''}
                                                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                        className="glass-input w-full text-sm"
                                                    >
                                                        <option value="">Select</option>
                                                        {(products || []).length > 0 && (
                                                            <optgroup label="Products">
                                                                {products.map((p: any) => (
                                                                    <option key={`p-${p.id}`} value={`${PRODUCT_TYPE}|${p.id}`}>{p.name}</option>
                                                                ))}
                                                            </optgroup>
                                                        )}
                                                        {(services || []).length > 0 && (
                                                            <optgroup label="Services">
                                                                {services.map((s: any) => (
                                                                    <option key={`s-${s.id}`} value={`${SERVICE_TYPE}|${s.id}`}>{s.name}</option>
                                                                ))}
                                                            </optgroup>
                                                        )}
                                                    </select>
                                                    {(errors as any)[`items.${index}.product_id`] && (
                                                        <p className="text-red-400 text-xs mt-1">{(errors as any)[`items.${index}.product_id`]}</p>
                                                    )}
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
                                                    {canApplyDiscount ? (
                                                        <input
                                                            type="number"
                                                            value={item.discount_pct}
                                                            onChange={(e) => updateItem(index, 'discount_pct', parseFloat(e.target.value) || 0)}
                                                            className="glass-input w-full text-sm text-right"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                        />
                                                    ) : (
                                                        <p className="text-sm text-right text-slate-400 px-1">{item.discount_pct || 0}%</p>
                                                    )}
                                                </td>
                                                <td className="py-2 px-2 text-right font-medium">
                                                    {formatCurrency(calculateLineTotal(item))}
                                                </td>
                                                <td className="py-2 px-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        disabled={data.items.length === 1}
                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded disabled:opacity-50"
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
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Discount</span>
                                    <span>-{formatCurrency(discount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Tax</span>
                                    <span>{formatCurrency(tax)}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-white/10 text-lg font-semibold">
                                    <span>Total</span>
                                    <span>{formatCurrency(grandTotal)}</span>
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
