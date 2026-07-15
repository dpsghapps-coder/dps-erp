import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function GoodEdit() {
    const { good, suppliers, categories, uoms, attributes, categoryAttributes } = usePage().props as any;

    const goodAttributes = good.attributes || {};
    const [attributeValues, setAttributeValues] = useState<Record<string, string>>(goodAttributes);
    const [picture, setPicture] = useState<File | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        material_id: good.material_id,
        item_name: good.item_name,
        item_description: good.item_description || '',
        item_category: good.item_category || '',
        uom: good.uom,
        item_status: good.item_status,
        restock_threshold: good.restock_threshold ?? 0,
        supplier_id: good.supplier_id || '',
    });

    const selectedCategoryAttrs = categoryAttributes?.[data.item_category] || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('material_id', data.material_id);
        formData.append('item_name', data.item_name);
        formData.append('item_description', data.item_description || '');
        formData.append('item_category', data.item_category || '');
        formData.append('uom', data.uom);
        formData.append('item_status', data.item_status || 'Active');
        formData.append('attributes', JSON.stringify(attributeValues));
        formData.append('supplier_id', data.supplier_id || '');
        if (picture) formData.append('picture', picture);
        formData.append('_method', 'PUT');

        put(`/procurement/goods/${good.id}`, {
            data: formData,
            onSuccess: () => {
                window.location.href = `/procurement/goods/${good.id}`;
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit ${good.item_name}`} />

            <div className="mb-6">
                <Link href={`/procurement/goods/${good.id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Details
                </Link>
            </div>

            <PageHeader
                title={`Edit ${good.item_name}`}
                subtitle={`Good ID: ${good.material_id}`}
            />

            <form onSubmit={handleSubmit}>
                <div className="max-w-4xl">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Good ID *</label>
                                <input
                                    type="text"
                                    value={data.material_id}
                                    onChange={(e) => setData('material_id', e.target.value)}
                                    className="glass-input w-full"
                                    required
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Supplier</label>
                                <select
                                    value={data.supplier_id}
                                    onChange={(e) => setData('supplier_id', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="">Select supplier</option>
                                    {(suppliers || []).map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.company_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={data.item_name}
                                    onChange={(e) => setData('item_name', e.target.value)}
                                    className="glass-input w-full"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={data.item_description}
                                    onChange={(e) => setData('item_description', e.target.value)}
                                    className="glass-input w-full h-20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                value={data.item_category}
                                onChange={(e) => {
                                    setData('item_category', e.target.value);
                                    setAttributeValues({});
                                }}
                                className="glass-input w-full"
                            >
                                    <option value="">Select category</option>
                                    {(categories || []).map((c: any) => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">UOM *</label>
                                <select
                                    value={data.uom}
                                    onChange={(e) => setData('uom', e.target.value)}
                                    className="glass-input w-full"
                                    required
                                >
                                    {(uoms || []).map((u: string) => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Picture</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                    onChange={(e) => setPicture(e.target.files?.[0] || null)}
                                    className="glass-input w-full file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {good.picture && !picture && (
                                    <p className="text-xs text-slate-400 mt-1">Current: {good.picture.split('/').pop()}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.item_status === 'Active'}
                                        onChange={(e) => setData('item_status', e.target.checked ? 'Active' : 'Disabled')}
                                        className="w-4 h-4 rounded border-slate-300"
                                    />
                                    <span className="text-sm font-medium">Active Good</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Restock Threshold</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.restock_threshold}
                                    onChange={(e) => setData('restock_threshold', parseInt(e.target.value) || 0)}
                                    className="glass-input w-full"
                                />
                                <p className="text-xs text-slate-400 mt-1">Low stock alert when qty falls below this value</p>
                            </div>
                        </div>
                    </GlassCard>

                    {selectedCategoryAttrs.length > 0 && (
                        <GlassCard className="mt-6">
                            <h2 className="text-lg font-semibold mb-4">Attributes</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedCategoryAttrs.map((attr: string) => (
                                    <div key={attr}>
                                        <label className="block text-sm font-medium mb-2">{attr}</label>
                                        <input
                                            type="text"
                                            value={attributeValues[attr] || ''}
                                            onChange={(e) => setAttributeValues(prev => ({ ...prev, [attr]: e.target.value }))}
                                            className="glass-input w-full"
                                            placeholder={`Enter ${attr.toLowerCase()}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}
                </div>

                <div className="flex gap-4 mt-6">
                    <Link href={`/procurement/goods/${good.id}`} className="flex-1 glass-button-secondary text-center">
                        Cancel
                    </Link>
                    <button type="submit" disabled={processing} className="flex-1 glass-button">
                        {processing ? 'Saving...' : 'Update Good'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
