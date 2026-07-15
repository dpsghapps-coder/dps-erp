import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ServiceEdit() {
    const { service } = usePage().props;
    
    const { data, setData, put, processing, errors } = useForm({
        code: service.code || '',
        name: service.name || '',
        description: service.description || '',
        category: service.category || '',
        unit: service.unit || 'pcs',
        is_active: service.is_active ?? true,
        prices: service.prices || [],
    });

    const [prices, setPrices] = useState(service.prices?.length > 0 
        ? service.prices.map((p: any) => ({ min_qty: p.min_qty, max_qty: p.max_qty || '', unit_price: p.unit_price }))
        : [{ min_qty: 1, max_qty: '', unit_price: 0 }]
    );

    const addPriceTier = () => {
        setPrices([...prices, { min_qty: 1, max_qty: '', unit_price: 0 }]);
    };

    const removePriceTier = (index: number) => {
        if (prices.length > 1) {
            setPrices(prices.filter((_, i) => i !== index));
        }
    };

    const updatePriceTier = (index: number, field: string, value: any) => {
        const newPrices = [...prices];
        newPrices[index] = { ...newPrices[index], [field]: value };
        setPrices(newPrices);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formattedPrices = prices.map((p: any) => ({
            min_qty: parseInt(p.min_qty) || 1,
            max_qty: p.max_qty ? parseInt(p.max_qty) : null,
            unit_price: parseFloat(p.unit_price) || 0,
        }));

        setData('prices', formattedPrices);
        put(`/services/${service.id}`);
    };

    return (
        <AppLayout>
            <Head title="Edit Service" />

            <div className="mb-6">
                <Link href="/services" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Services
                </Link>
            </div>

            <PageHeader title="Edit Service" subtitle="Update service details and pricing" />

            <form onSubmit={handleSubmit}>
                <GlassCard>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Code *</label>
                            <input 
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className="glass-input w-full"
                                placeholder="e.g., LFP-SAV"
                            />
                            {errors.code && <p className="text-red-400 text-sm mt-1">{errors.code}</p>}
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
                            <input 
                                type="text"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="glass-input w-full"
                                placeholder="e.g., Printing, Design"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Unit *</label>
                            <input 
                                type="text"
                                value={data.unit}
                                onChange={(e) => setData('unit', e.target.value)}
                                className="glass-input w-full"
                                placeholder="pcs, sqm, hr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-5 h-5 rounded bg-white/10 border-white/20"
                                />
                                <span>Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Tiered Pricing Section */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Tiered Pricing</h3>
                            <button 
                                type="button" 
                                onClick={addPriceTier}
                                className="glass-button flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Price Tier
                            </button>
                        </div>

                        <div className="space-y-3">
                            {prices.map((price: any, index: number) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <input 
                                            type="number"
                                            value={price.min_qty}
                                            onChange={(e) => updatePriceTier(index, 'min_qty', e.target.value)}
                                            className="glass-input w-full"
                                            placeholder="Min Qty"
                                            min="1"
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
                                            value={price.unit_price}
                                            onChange={(e) => updatePriceTier(index, 'unit_price', e.target.value)}
                                            className="glass-input w-full"
                                            placeholder="Unit Price"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => removePriceTier(index)}
                                        disabled={prices.length === 1}
                                        className="p-2 text-red-400 hover:bg-white/10 rounded disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-white/10">
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