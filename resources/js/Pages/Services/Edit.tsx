import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

const COST_FIELDS: { key: 'workmanship_cost' | 'machine_maintenance_cost' | 'process_cost' | 'capital_recovery_fee' | 'profit'; label: string; hint?: string }[] = [
    { key: 'workmanship_cost', label: 'Workmanship' },
    { key: 'machine_maintenance_cost', label: 'Machine Maintenance' },
    { key: 'process_cost', label: 'Process Cost', hint: 'Materials, utilities, cutting, packaging' },
    { key: 'capital_recovery_fee', label: 'Capital Investment Recovery Fee' },
    { key: 'profit', label: 'Profit' },
];

export default function ServiceEdit() {
    const { service, categories, uoms } = usePage().props as any;
    const formatCurrency = useCurrency();

    const { data, setData, put, transform, processing, errors } = useForm({
        code: service.code || '',
        name: service.name || '',
        description: service.description || '',
        category_id: service.category_id || '',
        unit: service.unit || '',
        is_active: service.is_active ?? true,
        workmanship_cost: service.workmanship_cost || 0,
        machine_maintenance_cost: service.machine_maintenance_cost || 0,
        process_cost: service.process_cost || 0,
        capital_recovery_fee: service.capital_recovery_fee || 0,
        profit: service.profit || 0,
        prices: service.prices?.length > 0
            ? service.prices.map((p: any) => ({ min_qty: p.min_qty, max_qty: p.max_qty || '', unit_price: p.unit_price }))
            : [{ min_qty: 1, max_qty: '', unit_price: 0 }],
    });

    const calculatedBasePrice = COST_FIELDS.reduce((sum, f) => sum + (parseFloat(String(data[f.key])) || 0), 0);

    const addPriceTier = () => {
        setData('prices', [...data.prices, { min_qty: 0, max_qty: '', unit_price: 0 }]);
    };

    const removePriceTier = (index: number) => {
        if (index > 0) {
            setData('prices', data.prices.filter((_: any, i: number) => i !== index));
        }
    };

    const updatePriceTier = (index: number, field: string, value: any) => {
        const newPrices = data.prices.map((p: any, i: number) => i === index ? { ...p, [field]: value } : p);
        setData('prices', newPrices);
    };

    transform((formData: any) => ({
        ...formData,
        prices: formData.prices.map((p: any, i: number) => ({
            min_qty: i === 0 ? 1 : (parseInt(p.min_qty) || 1),
            max_qty: p.max_qty !== '' && p.max_qty !== null ? parseInt(p.max_qty) : null,
            unit_price: i === 0 ? calculatedBasePrice : (parseFloat(p.unit_price) || 0),
        })),
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/services/${service.id}`);
    };

    return (
        <AppLayout>
            <Head title="Edit Service" />

            <div className="mb-6">
                <Link href="/services" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Services
                </Link>
            </div>

            <PageHeader title="Edit Service" subtitle="Update service details and pricing" />

            <form onSubmit={handleSubmit}>
                <GlassCard>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Code</label>
                            <input
                                type="text"
                                value={data.code}
                                readOnly
                                disabled
                                className="glass-input w-full opacity-60 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1">Auto-generated, not editable</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="glass-input w-full"
                                placeholder="Service name"
                            />
                            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="glass-input w-full h-24"
                                placeholder="Service description..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="glass-input w-full"
                            >
                                <option value="">Select Category</option>
                                {(categories || []).map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Unit *</label>
                            <select
                                value={data.unit}
                                onChange={(e) => setData('unit', e.target.value)}
                                className="glass-input w-full"
                            >
                                <option value="">Select Unit</option>
                                {(uoms || []).map((u: string) => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-5 h-5 rounded bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20"
                                />
                                <span>Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Cost of Service Section */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-medium mb-1">Cost of Service</h3>
                        <p className="text-sm text-slate-500 mb-4">Base price (qty 1+) is calculated automatically from these costs.</p>

                        <div className="grid md:grid-cols-2 gap-4">
                            {COST_FIELDS.map((f) => (
                                <div key={f.key}>
                                    <label className="block text-sm font-medium mb-2">{f.label}</label>
                                    <input
                                        type="number"
                                        value={data[f.key]}
                                        onChange={(e) => setData(f.key, parseFloat(e.target.value) || 0)}
                                        className="glass-input w-full"
                                        min="0"
                                        step="0.01"
                                    />
                                    {f.hint && <p className="text-xs text-slate-500 mt-1">{f.hint}</p>}
                                    {errors[f.key] && <p className="text-red-400 text-sm mt-1">{errors[f.key]}</p>}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg">
                            <span className="font-medium">Calculated Base Price</span>
                            <span className="text-lg font-semibold text-emerald-400">{formatCurrency(calculatedBasePrice)}</span>
                        </div>
                    </div>

                    {/* Tiered Pricing Section */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Tiered Pricing</h3>
                            <button
                                type="button"
                                onClick={addPriceTier}
                                className="glass-button flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Bulk Tier
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">The base tier's price comes from the cost breakdown above. Add extra tiers for bulk-quantity discounts.</p>

                        <div className="space-y-3">
                            {data.prices.map((price: any, index: number) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={index === 0 ? 1 : price.min_qty}
                                            onChange={(e) => updatePriceTier(index, 'min_qty', e.target.value)}
                                            className="glass-input w-full disabled:opacity-60 disabled:cursor-not-allowed"
                                            placeholder="Min Qty"
                                            min="1"
                                            disabled={index === 0}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={price.max_qty}
                                            onChange={(e) => updatePriceTier(index, 'max_qty', e.target.value)}
                                            className="glass-input w-full"
                                            placeholder="Max Qty (optional)"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={index === 0 ? calculatedBasePrice.toFixed(2) : price.unit_price}
                                            onChange={(e) => updatePriceTier(index, 'unit_price', e.target.value)}
                                            className="glass-input w-full disabled:opacity-60 disabled:cursor-not-allowed"
                                            placeholder="Unit Price"
                                            min="0"
                                            step="0.01"
                                            disabled={index === 0}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removePriceTier(index)}
                                        disabled={index === 0}
                                        className="p-2 text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                        <Link href="/services" className="glass-button">Cancel</Link>
                        <button type="submit" disabled={processing} className="glass-button">
                            {processing ? 'Saving...' : 'Update Service'}
                        </button>
                    </div>
                </GlassCard>
            </form>
        </AppLayout>
    );
}
