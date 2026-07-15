import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil, Calendar, Tag, Ruler, Plus, X, Trash2, Building2, User, Mail, Smartphone, MapPin, Map, AlertTriangle, CheckCircle, Package, ImageIcon } from 'lucide-react';
import { useState } from 'react';

export default function ProductCatalogShow() {
    const { product, suppliers, categories, uoms, attributes, categoryAttributes } = usePage().props as any;
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [editAttributeValues, setEditAttributeValues] = useState<Record<string, string>>({});
    const [editPicture, setEditPicture] = useState<File | null>(null);
    const [editProcessing, setEditProcessing] = useState(false);
    const supplierPrices = product.supplier_prices || [];

    const editSelectedCategoryAttrs = editData ? (categoryAttributes?.[editData.item_category] || []) : [];

    const { data, setData, post, processing, reset } = useForm({
        supplier_id: '',
    });

    const openAdd = () => {
        reset();
        setShowAddModal(true);
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/inventory/materials/${product.id}/suppliers`, {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            }
        });
    };

    const handleDelete = (id: string) => {
        setDeleteTarget(id);
    };

    const openEdit = () => {
        setEditData({ ...product });
        setEditAttributeValues(product.attributes || {});
        setEditPicture(null);
        setShowEditPanel(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editData) return;
        setEditProcessing(true);

        const formData = new FormData();
        formData.append('material_id', editData.material_id);
        formData.append('item_name', editData.item_name);
        formData.append('item_description', editData.item_description || '');
        formData.append('item_category', editData.item_category || '');
        formData.append('uom', editData.uom);
        formData.append('item_status', editData.item_status || 'Active');
        formData.append('attributes', JSON.stringify(editAttributeValues));
        formData.append('restock_threshold', String(editData.restock_threshold ?? 0));
        formData.append('_method', 'PUT');
        if (editPicture) formData.append('picture', editPicture);

        router.post(`/inventory/materials/${product.id}`, formData, {
            onSuccess: () => {
                setShowEditPanel(false);
                setEditData(null);
                setEditPicture(null);
                setEditProcessing(false);
            },
            onError: () => setEditProcessing(false),
        });
    };

    return (
        <AppLayout>
            <Head title={product.item_name} />

            <div className="mb-6">
                <Link href="/inventory/materials" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Materials
                </Link>
            </div>

            <PageHeader
                title={product.item_name}
                subtitle={`Material ID: ${product.material_id}`}
                action={
                    <button onClick={openEdit} className="glass-button text-sm py-1.5 px-3 flex items-center gap-2">
                        <Pencil className="w-4 h-4" /> Edit
                    </button>
                }
            />

            <GlassCard className="mb-6">
                <div className="flex gap-6">
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Material ID</p>
                                <p className="font-mono">{product.material_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Name</p>
                                <p className="font-medium">{product.item_name}</p>
                            </div>
                            {product.item_description && (
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Description</p>
                                    <p className="text-slate-600">{product.item_description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> Category
                                    </p>
                                    <p>{product.item_category || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                        <Ruler className="w-3 h-3" /> UOM
                                    </p>
                                    <p>{product.uom}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Status</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    product.item_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {product.item_status}
                                </span>
                            </div>
                            {product.attributes && Object.keys(product.attributes).length > 0 && (
                                <div>
                                    <p className="text-sm text-slate-500 mb-2 font-medium">Attributes</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {Object.entries(product.attributes).map(([key, value]) => (
                                            <div key={key} className="bg-slate-50 rounded-lg px-3 py-2">
                                                <p className="text-xs text-slate-500">{key}</p>
                                                <p className="text-sm font-medium text-slate-900">{value as string}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {product.date_deactivated && (
                                <div>
                                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Date Deactivated
                                    </p>
                                    <p>{new Date(product.date_deactivated).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </GlassCard>

            {product.picture && (
                <GlassCard className="mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-slate-500" /> Picture
                    </h2>
                    <div className="flex justify-center">
                        <img
                            src={'/storage/' + product.picture}
                            alt={product.item_name}
                            className="max-w-full h-auto max-h-96 object-contain rounded-lg border border-slate-200"
                        />
                    </div>
                </GlassCard>
            )}

            <GlassCard className="mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-slate-500" /> Stock Level
                </h2>
                {(() => {
                    const low = product.restock_threshold > 0 && product.available_stock <= product.restock_threshold;
                    return (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">On Hand</p>
                                <p className="text-2xl font-bold text-slate-900">{product.available_stock}</p>
                                <p className="text-xs text-slate-400">{product.uom}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">Restock Threshold</p>
                                <p className="text-2xl font-bold text-slate-900">{product.restock_threshold || '—'}</p>
                                <p className="text-xs text-slate-400">{product.restock_threshold ? product.uom : 'Not set'}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">Status</p>
                                {low ? (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 mt-1">
                                        <AlertTriangle className="w-3 h-3" /> Low Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 mt-1">
                                        <CheckCircle className="w-3 h-3" /> OK
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </GlassCard>

            <GlassCard>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Suppliers</h2>
                    <button onClick={openAdd} className="glass-button text-sm py-1.5 px-3 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Supplier
                    </button>
                </div>
                {supplierPrices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {supplierPrices.map((price: any) => (
                            <div key={price.id} className="glass-card p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                                <button onClick={() => setSelectedSupplier(price.supplier)} className="flex items-center gap-3 text-left flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="font-medium text-slate-900 truncate">{price.supplier?.company_name || 'Unknown'}</span>
                                </button>
                                <button onClick={() => handleDelete(price.id)} className="text-red-500 hover:text-red-700 shrink-0">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm mb-4">No suppliers linked to this material</p>
                        <button onClick={openAdd} className="glass-button text-sm py-1.5 px-3 inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Supplier
                        </button>
                    </div>
                )}
            </GlassCard>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Add Supplier</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div>
                                <label className="block text-sm font-medium mb-2">Supplier *</label>
                                <select
                                    value={data.supplier_id}
                                    onChange={(e) => setData('supplier_id', e.target.value)}
                                    className="glass-input w-full"
                                    required
                                >
                                    <option value="">Select supplier</option>
                                    {(suppliers || []).map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.company_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 glass-button-secondary text-sm py-1.5 px-3">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="flex-1 glass-button text-sm py-1.5 px-3 flex items-center justify-center gap-2">
                                    {processing ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-2">Remove Supplier</h3>
                        <p className="text-sm text-slate-600 mb-6">Remove this supplier from the material? The supplier record itself will not be deleted.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 glass-button-secondary">Cancel</button>
                            <button onClick={() => { router.delete(`/inventory/materials/suppliers/${deleteTarget}`); setDeleteTarget(null); }} className="flex-1 glass-button bg-red-600 hover:bg-red-700">Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedSupplier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">{selectedSupplier.company_name}</h2>
                            <button onClick={() => setSelectedSupplier(null)} className="p-1 hover:bg-slate-100 rounded">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        {selectedSupplier.branches && selectedSupplier.branches.length > 0 ? (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-slate-500">Branches / Contacts</p>
                                {selectedSupplier.branches.map((b: any) => (
                                    <div key={b.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                        <p className="font-medium text-slate-800 text-sm mb-1.5">{b.name}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                            {b.contact_name && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {b.contact_name}</span>}
                                            {b.mobile && <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {b.mobile}</span>}
                                            {b.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {b.email}</span>}
                                        </div>
                                        {b.address && <p className="text-xs text-slate-500 mt-1 flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {b.address}</p>}
                                        {b.location && (
                                            <a href={`https://www.google.com/maps?q=${b.location}`} target="_blank" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1">
                                                <Map className="w-3 h-3" /> View on Map
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">No branch / contact details</p>
                        )}
                        <div className="mt-6">
                            <Link href={`/inventory/suppliers/${selectedSupplier.id}`} className="glass-button text-sm py-1.5 px-3 inline-flex items-center gap-2 w-full justify-center">
                                View Full Details
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {showEditPanel && editData && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setShowEditPanel(false)}>
                    <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center gap-3 z-10">
                            <button onClick={() => setShowEditPanel(false)} className="p-1 hover:bg-slate-100 rounded">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-semibold">Edit {editData.item_name}</h2>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6">
                            <div className="space-y-4">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-xs text-slate-500 mb-1">Material ID</p>
                                    <p className="font-mono text-sm font-medium">{editData.material_id}</p>
                                </div>
                                {editData.picture && !editPicture && (
                                    <div>
                                        <img src={'/storage/' + editData.picture} alt={editData.item_name} className="w-32 h-32 object-cover rounded-lg border border-slate-200" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={editData.item_name}
                                        onChange={(e) => setEditData({ ...editData, item_name: e.target.value })}
                                        className="glass-input w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={editData.item_description || ''}
                                        onChange={(e) => setEditData({ ...editData, item_description: e.target.value })}
                                        className="glass-input w-full h-20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        value={editData.item_category || ''}
                                        onChange={(e) => {
                                            setEditData({ ...editData, item_category: e.target.value });
                                            setEditAttributeValues({});
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
                                        value={editData.uom}
                                        onChange={(e) => setEditData({ ...editData, uom: e.target.value })}
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
                                        onChange={(e) => setEditPicture(e.target.files?.[0] || null)}
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
                                                        value={editAttributeValues[attr] || ''}
                                                        onChange={(e) => setEditAttributeValues(prev => ({ ...prev, [attr]: e.target.value }))}
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
                                            checked={editData.item_status === 'Active'}
                                            onChange={(e) => setEditData({ ...editData, item_status: e.target.checked ? 'Active' : 'Disabled' })}
                                            className="w-4 h-4 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-medium">Active Material</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Restock Threshold</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editData.restock_threshold || 0}
                                        onChange={(e) => setEditData({ ...editData, restock_threshold: parseInt(e.target.value) || 0 })}
                                        className="glass-input w-full"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Low stock alert when qty falls below this value</p>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowEditPanel(false)} className="flex-1 glass-button-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={editProcessing} className="flex-1 glass-button">
                                    {editProcessing ? 'Saving...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
