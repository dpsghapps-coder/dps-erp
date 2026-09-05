import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Package, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';

export default function ProductCreate() {
    const { categories, inventoryProducts, services, uoms, nextSku } = usePage().props;
    const formatCurrency = useCurrency();
    const { data, setData, post, transform, processing, errors } = useForm({
        sku: nextSku || '',
        name: '',
        description: '',
        type: 'physical',
        category_id: '',
        unit: (uoms && uoms[0]) || '',
        is_active: true,
        components: [],
        prices: [{ min_qty: 1, max_qty: '', unit_price: 0 }] as { min_qty: number | string; max_qty: number | string; unit_price: number | string }[],
    });

    const [components, setComponents] = useState<any[]>([]);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);

    const calculatedBasePrice = components.reduce((sum, c) => sum + (c.unit_price || 0) * (c.quantity || 0), 0);

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

    const addMaterial = (material: any) => {
        const newComponent = {
            component_id: material.id,
            component_type: 'App\\Models\\InventoryProduct',
            component_name: material.item_name,
            component_sku: material.material_id,
            unit_price: material.default_price || 0,
            quantity: 1,
            type: 'material',
        };
        setComponents([...components, newComponent]);
        setShowMaterialModal(false);
    };

    const addService = (service: any) => {
        const newComponent = {
            component_id: service.id,
            component_type: 'App\\Models\\Service',
            component_name: service.name,
            component_sku: service.code,
            unit_price: service.default_price || 0,
            quantity: 1,
            type: 'service',
        };
        setComponents([...components, newComponent]);
        setShowServiceModal(false);
    };

    const removeComponent = (index: number) => {
        setComponents(components.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, qty: number) => {
        const newComponents = [...components];
        newComponents[index].quantity = qty;
        setComponents(newComponents);
    };

    const updateUnitPrice = (index: number, price: number) => {
        const newComponents = [...components];
        newComponents[index].unit_price = price;
        setComponents(newComponents);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((formData: any) => ({
            ...formData,
            components: components.map(c => ({
                component_id: c.component_id,
                component_type: c.component_type,
                quantity: c.quantity,
                unit_price: c.unit_price || 0,
            })),
            prices: formData.prices.map((p: any, i: number) => ({
                min_qty: i === 0 ? 1 : (parseInt(p.min_qty) || 1),
                max_qty: p.max_qty !== '' && p.max_qty !== null ? parseInt(p.max_qty) : null,
                unit_price: i === 0 ? calculatedBasePrice : (parseFloat(p.unit_price) || 0),
            })),
        }));
        post('/products');
    };

    return (
        <AppLayout>
            <Head title="Add Product" />

            <div className="mb-6">
                <Link href="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Products
                </Link>
            </div>

            <PageHeader title="Add Product" subtitle="Create a new product with materials and services" />

            <form onSubmit={handleSubmit}>
                <GlassCard>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">SKU</label>
                            <input
                                type="text"
                                value={data.sku}
                                readOnly
                                disabled
                                className="glass-input w-full opacity-60 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1">Auto-generated</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Name *</label>
                            <input 
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="glass-input w-full"
                                placeholder="Product name"
                            />
                            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea 
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="glass-input w-full h-24"
                                placeholder="Product description..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Type *</label>
                            <select 
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="glass-input w-full"
                            >
                                <option value="physical">Physical Product</option>
                                <option value="service">Service</option>
                                <option value="digital">Digital Product</option>
                            </select>
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
                            {errors.unit && <p className="text-red-400 text-sm mt-1">{errors.unit}</p>}
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

                    {/* Components Section */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Product Components</h3>
                            <div className="flex items-center gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowMaterialModal(true)}
                                    className="glass-button flex items-center gap-2"
                                >
                                    <Package className="w-4 h-4" /> Add Material
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowServiceModal(true)}
                                    className="glass-button flex items-center gap-2"
                                >
                                    <Wrench className="w-4 h-4" /> Add Service
                                </button>
                            </div>
                        </div>

                        {components.length > 0 ? (
                            <div className="space-y-3">
                                {components.map((component: any, index: number) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {component.type === 'material' ? (
                                                    <Package className="w-4 h-4 text-blue-400" />
                                                ) : (
                                                    <Wrench className="w-4 h-4 text-green-400" />
                                                )}
                                                <span className="font-medium">{component.component_name}</span>
                                                <span className="text-sm text-slate-400">({component.component_sku})</span>
                                            </div>
                                        </div>
                                        <div className="w-24">
                                            <input 
                                                type="number"
                                                value={component.quantity}
                                                onChange={(e) => updateQuantity(index, parseFloat(e.target.value) || 1)}
                                                className="glass-input w-full"
                                                min="0.01"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="w-28">
                                            <input
                                                type="number"
                                                value={component.unit_price}
                                                onChange={(e) => updateUnitPrice(index, parseFloat(e.target.value) || 0)}
                                                className="glass-input w-full"
                                                min="0"
                                                step="0.01"
                                                placeholder="Price"
                                            />
                                        </div>
                                        <div className="w-24 text-sm text-emerald-400 text-right shrink-0">
                                            {formatCurrency((component.unit_price || 0) * (component.quantity || 0))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeComponent(index)}
                                            className="p-2 text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex justify-end items-center gap-2 pt-2 text-sm">
                                    <span className="text-slate-400">Estimated Total Cost:</span>
                                    <span className="font-semibold text-emerald-400">
                                        {formatCurrency(components.reduce((sum, c) => sum + (c.unit_price || 0) * (c.quantity || 0), 0))}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <p>No components added yet. Add materials and services to create this product.</p>
                            </div>
                        )}
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
                        <p className="text-sm text-slate-500 mb-4">The base tier's price comes from the component cost above. Add extra tiers for bulk-quantity discounts.</p>

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
                        <Link href="/products" className="glass-button">Cancel</Link>
                        <button type="submit" disabled={processing} className="glass-button">
                            {processing ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </GlassCard>
            </form>

            {/* Material Modal */}
            {showMaterialModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Select Material</h3>
                            <button 
                                onClick={() => setShowMaterialModal(false)}
                                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(inventoryProducts || []).map((material: any) => (
                                <button
                                    key={material.id}
                                    onClick={() => addMaterial(material)}
                                    className="w-full text-left p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <div className="font-medium">{material.item_name}</div>
                                    <div className="text-sm text-slate-400">
                                        {material.material_id} • {formatCurrency(material.default_price)} • {material.available_stock} {material.uom} in stock
                                    </div>
                                </button>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Service Modal */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Select Service</h3>
                            <button 
                                onClick={() => setShowServiceModal(false)}
                                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(services || []).map((service: any) => (
                                <button
                                    key={service.id}
                                    onClick={() => addService(service)}
                                    className="w-full text-left p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <div className="font-medium">{service.name}</div>
                                    <div className="text-sm text-slate-400">
                                        {service.code} • {formatCurrency(service.default_price)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}
        </AppLayout>
    );
}