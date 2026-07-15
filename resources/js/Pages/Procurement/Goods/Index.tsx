import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import ProcurementTabs from '@/Components/ProcurementTabs';
import InputError from '@/Components/InputError';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { Plus, Search, Package, Pencil, Trash2, X, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';

export default function GoodsIndex() {
    const { goods, categories, uoms, attributes, categoryAttributes, suppliers } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingGood, setEditingGood] = useState<any>(null);

    const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
    const [picture, setPicture] = useState<File | null>(null);

    const { data, setData, post, delete: destroy, processing, reset } = useForm({
        item_name: '',
        item_description: '',
        item_category: '',
        uom: 'Pieces',
        item_status: 'Active',
        supplier_id: '',
    });

    const selectedCategoryAttrs = categoryAttributes?.[data.item_category] || [];
    const editSelectedCategoryAttrs = editingGood ? (categoryAttributes?.[editingGood.item_category] || []) : [];

    const filteredGoods = (goods?.data || []).filter((g: any) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return g.item_name.toLowerCase().includes(searchLower) ||
               g.material_id.toLowerCase().includes(searchLower);
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('item_name', data.item_name);
        formData.append('item_description', data.item_description || '');
        formData.append('item_category', data.item_category || '');
        formData.append('uom', data.uom);
        formData.append('item_status', data.item_status || 'Active');
        formData.append('attributes', JSON.stringify(attributeValues));
        if (picture) formData.append('picture', picture);

        post('/procurement/goods', {
            data: formData,
            onSuccess: () => {
                setShowModal(false);
                setPicture(null);
                reset();
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGood) return;

        const formData = new FormData();
        formData.append('material_id', editingGood.material_id);
        formData.append('item_name', editingGood.item_name);
        formData.append('item_description', editingGood.item_description || '');
        formData.append('item_category', editingGood.item_category || '');
        formData.append('uom', editingGood.uom);
        formData.append('item_status', editingGood.item_status || 'Active');
        formData.append('attributes', JSON.stringify(attributeValues));
        formData.append('_method', 'PUT');
        if (picture) formData.append('picture', picture);

        router.post(`/procurement/goods/${editingGood.id}`, formData, {
            onSuccess: () => {
                setEditingGood(null);
                setPicture(null);
            }
        });
    };

    const handleDelete = (id: string) => {
        Swal.fire({
            title: 'Delete Good?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete',
        }).then((result) => {
            if (result.isConfirmed) destroy(`/procurement/goods/${id}`);
        });
    };

    const openCreate = () => {
        reset();
        setPicture(null);
        setData({
            item_name: '',
            item_description: '',
            item_category: '',
            uom: 'Pieces',
            item_status: 'Active',
        });
        setShowModal(true);
    };

    return (
        <AppLayout>
            <Head title="OpEx Items" />

            <PageHeader
                title="OpEx Items"
                subtitle="Manage procurement goods catalog"
                action={
                    <button onClick={openCreate} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Item
                    </button>
                }
            />

            <ProcurementTabs activeTab="goods" />

            <GlassCard className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search goods..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="glass-input w-full pl-10"
                    />
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Good ID</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Description</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Category</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Attributes</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">UOM</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGoods.length > 0 ? (
                                filteredGoods.map((good: any) => (
                                    <tr 
                                        key={good.id} 
                                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                                        onClick={() => window.location.href = `/procurement/goods/${good.id}`}
                                    >
                                        <td className="py-3 px-4 font-mono text-sm text-blue-600">{good.material_id}</td>
                                        <td className="py-3 px-4 font-medium text-slate-900">{good.item_name}</td>
                                        <td className="py-3 px-4 text-slate-600">{good.item_description || '-'}</td>
                                        <td className="py-3 px-4 text-slate-600">{good.item_category || '-'}</td>
                                        <td className="py-3 px-4 text-xs text-slate-500 max-w-[160px] truncate">
                                            {good.attributes && Object.keys(good.attributes).length > 0
                                                ? Object.entries(good.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')
                                                : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">{good.uom}</td>
                                        <td className="py-3 px-4 text-right">
                                            <Link href={`/procurement/goods/${good.id}/edit`} className="text-blue-600 hover:underline mr-3">
                                                <Pencil className="w-4 h-4 inline" />
                                            </Link>
                                            <button onClick={() => handleDelete(good.id)} className="text-red-600 hover:underline">
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-8">
                                        <EmptyState
                                            icon={Package}
                                            title="No goods found"
                                            action={
                                                <button onClick={openCreate} className="glass-button">
                                                    <Plus className="w-4 h-4 mr-2" /> Add Good
                                                </button>
                                            }
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden space-y-3 p-4">
                    {filteredGoods.length > 0 ? (
                        filteredGoods.map((good: any) => (
                            <div key={good.id}
                                className="glass-card p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-slate-900">{good.item_name}</p>
                                        <p className="text-xs font-mono text-slate-500">{good.material_id}</p>
                                    </div>
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => { setEditingGood(good); setAttributeValues(good.attributes || {}); setPicture(null); }} className="text-blue-600">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(good.id)} className="text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-sm text-slate-600">
                                    <span>{good.item_description || '-'}</span>
                                    {good.attributes && Object.keys(good.attributes).length > 0 && (
                                        <span className="text-xs text-slate-400 truncate">
                                            {Object.entries(good.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                        </span>
                                    )}
                                    <div className="flex gap-4">
                                        {good.item_category && (
                                            <span>{good.item_category}</span>
                                        )}
                                        <span>{good.uom}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            icon={Package}
                            title="No goods found"
                            action={
                                <button onClick={openCreate} className="glass-button">
                                    <Plus className="w-4 h-4 mr-2" /> Add Good
                                </button>
                            }
                        />
                    )}
                </div>
            </GlassCard>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-4">Add Good</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                        <label className="block text-sm font-medium mb-2">Name *</label>
                                        <input
                                            type="text"
                                            value={data.item_name}
                                            onChange={(e) => setData('item_name', e.target.value)}
                                            className="glass-input w-full"
                                            required
                                        />
                                        <InputError message={errors.item_name} className="mt-1" />
                                </div>
                                <div>
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
                                    <label className="block text-sm font-medium mb-2">Supplier</label>
                                    <select
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        className="glass-input w-full"
                                    >
                                        <option value="">Select supplier</option>
                                        {(usePage().props.suppliers as any || []).map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.company_name}</option>
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
                                </div>
                                {selectedCategoryAttrs.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Attributes</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedCategoryAttrs.map((attr: string) => (
                                                <div key={attr}>
                                                    <label className="block text-xs text-slate-500 mb-1">{attr}</label>
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
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 glass-button-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="flex-1 glass-button">
                                    {processing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingGood && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setEditingGood(null)}>
                    <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center gap-3 z-10">
                            <button onClick={() => setEditingGood(null)} className="p-1 hover:bg-slate-100 rounded">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-semibold">Edit {editingGood.item_name}</h2>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6">
                            <div className="space-y-4">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-xs text-slate-500 mb-1">Good ID</p>
                                    <p className="font-mono text-sm font-medium">{editingGood.material_id}</p>
                                </div>
                                {editingGood.picture && (
                                    <div>
                                        <img src={'/storage/' + editingGood.picture} alt={editingGood.item_name} className="w-32 h-32 object-cover rounded-lg border border-slate-200" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={editingGood.item_name || ''}
                                        onChange={(e) => setEditingGood({ ...editingGood, item_name: e.target.value })}
                                        className="glass-input w-full"
                                        required
                                    />
                                    <InputError message={errors.item_name} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={editingGood.item_description || ''}
                                        onChange={(e) => setEditingGood({ ...editingGood, item_description: e.target.value })}
                                        className="glass-input w-full h-20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        value={editingGood.item_category || ''}
                                        onChange={(e) => {
                                            setEditingGood({ ...editingGood, item_category: e.target.value });
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
                                        value={editingGood.uom}
                                        onChange={(e) => setEditingGood({ ...editingGood, uom: e.target.value })}
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
                                </div>
                                {editSelectedCategoryAttrs.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Attributes</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {editSelectedCategoryAttrs.map((attr: string) => (
                                                <div key={attr}>
                                                    <label className="block text-xs text-slate-500 mb-1">{attr}</label>
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
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Supplier</label>
                                    <select
                                        value={editingGood.supplier_id || ''}
                                        onChange={(e) => setEditingGood({ ...editingGood, supplier_id: e.target.value })}
                                        className="glass-input w-full"
                                    >
                                        <option value="">Select supplier</option>
                                        {(usePage().props.suppliers as any || []).map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.company_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingGood.item_status === 'Active'}
                                            onChange={(e) => setEditingGood({ ...editingGood, item_status: e.target.checked ? 'Active' : 'Disabled' })}
                                            className="w-4 h-4 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-medium">Active Good</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setEditingGood(null)} className="flex-1 glass-button-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="flex-1 glass-button">
                                    {processing ? 'Saving...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
