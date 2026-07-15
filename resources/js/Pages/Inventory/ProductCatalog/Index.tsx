import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import InventoryTabs from '@/Components/InventoryTabs';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { Plus, Search, Package, Pencil, Trash2, X, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';

export default function ProductCatalogIndex() {
    const { products, categories, uoms, attributes, categoryAttributes } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
    const [picture, setPicture] = useState<File | null>(null);

    const { data, setData, post, delete: destroy, processing, reset } = useForm({
        item_name: '',
        item_description: '',
        item_category: '',
        uom: 'Pieces',
        item_status: 'Active',
        restock_threshold: 0,
    });

    const selectedCategoryAttrs = categoryAttributes?.[data.item_category] || [];
    const editSelectedCategoryAttrs = editingProduct ? (categoryAttributes?.[editingProduct.item_category] || []) : [];

    const filteredProducts = (products?.data || []).filter((p: any) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return p.item_name.toLowerCase().includes(searchLower) ||
               p.material_id.toLowerCase().includes(searchLower);
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('item_name', data.item_name);
        formData.append('item_description', data.item_description || '');
        formData.append('item_category', data.item_category || '');
        formData.append('uom', data.uom);
        formData.append('item_status', data.item_status || 'Active');
        formData.append('restock_threshold', String(data.restock_threshold ?? 0));
        formData.append('attributes', JSON.stringify(attributeValues));
        if (picture) formData.append('picture', picture);

        post('/inventory/materials', {
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
        if (!editingProduct) return;

        const formData = new FormData();
        formData.append('material_id', editingProduct.material_id);
        formData.append('item_name', editingProduct.item_name);
        formData.append('item_description', editingProduct.item_description || '');
        formData.append('item_category', editingProduct.item_category || '');
        formData.append('uom', editingProduct.uom);
        formData.append('item_status', editingProduct.item_status || 'Active');
        formData.append('restock_threshold', String(editingProduct.restock_threshold ?? 0));
        formData.append('attributes', JSON.stringify(attributeValues));
        formData.append('_method', 'PUT');
        if (picture) formData.append('picture', picture);

        router.post(`/inventory/materials/${editingProduct.id}`, formData, {
            onSuccess: () => {
                setEditingProduct(null);
                setPicture(null);
            }
        });
    };

    const handleDelete = (id: string) => {
        Swal.fire({
            title: 'Delete Product?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete',
        }).then((result) => {
            if (result.isConfirmed) destroy(`/inventory/materials/${id}`);
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
        });
        setShowModal(true);
    };

    return (
        <AppLayout>
            <Head title="Materials" />

            <PageHeader
                title="Materials"
                subtitle="Manage inventory products"
                action={
                    <button onClick={openCreate} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Material
                    </button>
                }
            />

            <InventoryTabs activeTab="materials" />

            <GlassCard className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
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
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Material ID</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Description</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Category</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Stock Level</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Attributes</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">UOM</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product: any) => (
                                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                                        onClick={() => window.location.href = `/inventory/materials/${product.id}`}
                                    >
                                        <td className="py-3 px-4 font-mono text-sm text-blue-600 hover:underline">{product.material_id}</td>
                                        <td className="py-3 px-4 font-medium text-slate-900">{product.item_name}</td>
                                        <td className="py-3 px-4 text-slate-600">{product.item_description || '-'}</td>
                                        <td className="py-3 px-4 text-slate-600">{product.item_category || '-'}</td>
                                        <td className="py-3 px-4 text-right">
                                            {(() => {
                                                const low = product.restock_threshold > 0 && product.available_stock <= product.restock_threshold;
                                                return low ? (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                                                        <AlertTriangle className="w-3 h-3" /> {product.available_stock} {product.uom}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-semibold text-slate-900">{product.available_stock} {product.uom}</span>
                                                );
                                            })()}
                                        </td>
                                        <td className="py-3 px-4">
                                            {product.attributes && Object.keys(product.attributes).length > 0 ? (
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {Object.entries(product.attributes).map(([k, v]) => (
                                                        <span key={k} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                                                            <span className="text-indigo-400">{k}:</span> {String(v)}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">{product.uom}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setAttributeValues(product.attributes || {}); setPicture(null); }} className="text-blue-600 hover:underline mr-3">
                                                <Pencil className="w-4 h-4 inline" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }} className="text-red-600 hover:underline">
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-8">
                                        <EmptyState
                                            icon={Package}
                                            title="No products found"
                                            action={
                                                <button onClick={openCreate} className="glass-button">
                                                    <Plus className="w-4 h-4 mr-2" /> Add Material
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
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product: any) => (
                            <div key={product.id}
                                className="glass-card p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                                onClick={() => window.location.href = `/inventory/materials/${product.id}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-slate-900 hover:text-blue-600">{product.item_name}</p>
                                        <p className="text-xs font-mono text-slate-500">{product.material_id}</p>
                                    </div>
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => { setEditingProduct(product); setAttributeValues(product.attributes || {}); setPicture(null); }} className="text-blue-600">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-sm text-slate-600">
                                    <span>{product.item_description || '-'}</span>
                                    {product.attributes && Object.keys(product.attributes).length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(product.attributes).map(([k, v]) => (
                                                <span key={k} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                                                    <span className="text-indigo-400">{k}:</span> {String(v)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        {product.item_category && (
                                            <span>{product.item_category}</span>
                                        )}
                                        <span>{product.uom}</span>
                                        <span>
                                            {(() => {
                                                const low = product.restock_threshold > 0 && product.available_stock <= product.restock_threshold;
                                                return low ? (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                                                        <AlertTriangle className="w-3 h-3" /> Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Stock: {product.available_stock}</span>
                                                );
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            icon={Package}
                            title="No products found"
                            action={
                                <button onClick={openCreate} className="glass-button">
                                    <Plus className="w-4 h-4 mr-2" /> Add Material
                                </button>
                            }
                        />
                    )}
                </div>
            </GlassCard>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-4">Add Material</h2>
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
                                    <label className="block text-sm font-medium mb-2">Picture</label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                        onChange={(e) => setPicture(e.target.files?.[0] || null)}
                                        className="glass-input w-full file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
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

            {editingProduct && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setEditingProduct(null)}>
                    <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center gap-3 z-10">
                            <button onClick={() => setEditingProduct(null)} className="p-1 hover:bg-slate-100 rounded">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-semibold">Edit {editingProduct.item_name}</h2>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6">
                            <div className="space-y-4">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-xs text-slate-500 mb-1">Material ID</p>
                                    <p className="font-mono text-sm font-medium">{editingProduct.material_id}</p>
                                </div>
                                {editingProduct.picture && (
                                    <div>
                                        <img src={'/storage/' + editingProduct.picture} alt={editingProduct.item_name} className="w-32 h-32 object-cover rounded-lg border border-slate-200" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={editingProduct.item_name || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, item_name: e.target.value })}
                                        className="glass-input w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={editingProduct.item_description || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, item_description: e.target.value })}
                                        className="glass-input w-full h-20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        value={editingProduct.item_category || ''}
                                        onChange={(e) => {
                                            setEditingProduct({ ...editingProduct, item_category: e.target.value });
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
                                        value={editingProduct.uom}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, uom: e.target.value })}
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
                                <div>
                                    <label className="block text-sm font-medium mb-2">Restock Threshold</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editingProduct.restock_threshold ?? 0}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, restock_threshold: parseInt(e.target.value) || 0 })}
                                        className="glass-input w-full"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Low stock alert when qty falls below this value</p>
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
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingProduct.item_status === 'Active'}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, item_status: e.target.checked ? 'Active' : 'Disabled' })}
                                            className="w-4 h-4 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-medium">Active Material</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 glass-button-secondary">
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
