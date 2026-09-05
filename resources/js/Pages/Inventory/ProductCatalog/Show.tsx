import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil, Calendar, Tag, Ruler, Plus, X, Trash2, Building2, User, Mail, Smartphone, MapPin, Map, AlertTriangle, CheckCircle, Package, ImageIcon, DollarSign, Edit2 } from 'lucide-react';
import { useState } from 'react';
import WhatsAppLink from '@/Components/WhatsAppLink';

export default function ProductCatalogShow() {
    const { product, suppliers, users, categories, uoms, attributes, costTypes, categoryAttributes } = usePage().props as any;
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

    const [showPriceModal, setShowPriceModal] = useState(false);
    const [editingPrice, setEditingPrice] = useState<any>(null);
    const [deletePriceTarget, setDeletePriceTarget] = useState<any>(null);
    const emptyPriceForm = {
        supplier_id: '',
        units_purchased: '1',
        qty_per_unit: '',
        material_cost: '',
        cost_items: [] as { label: string; amount: string }[],
        collected_by: '',
        collection_date: '',
    };
    const { data: priceData, setData: setPriceData, post: postPrice, put: putPrice, processing: priceProcessing, reset: resetPrice, errors: priceErrors } = useForm(emptyPriceForm);

    const priceQty = Number(priceData.units_purchased || 0) * Number(priceData.qty_per_unit || 0);
    const priceExtraCostsTotal = priceData.cost_items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const priceTotalCost = Number(priceData.material_cost || 0) + priceExtraCostsTotal;
    const priceUnitPrice = priceQty > 0 ? priceTotalCost / priceQty : 0;

    const addPriceCostItem = () => setPriceData('cost_items', [...priceData.cost_items, { label: costTypes?.[0] || '', amount: '' }]);
    const removePriceCostItem = (index: number) => setPriceData('cost_items', priceData.cost_items.filter((_, i) => i !== index));
    const updatePriceCostItem = (index: number, field: 'label' | 'amount', value: string) => {
        const items = [...priceData.cost_items];
        items[index] = { ...items[index], [field]: value };
        setPriceData('cost_items', items);
    };

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

    const openAddPrice = () => {
        setEditingPrice(null);
        setPriceData({ ...emptyPriceForm });
        setShowPriceModal(true);
    };

    const openEditPrice = (price: any) => {
        setEditingPrice(price);
        setPriceData({
            supplier_id: price.supplier_id,
            units_purchased: String(price.units_purchased ?? 1),
            qty_per_unit: String(price.qty_per_unit ?? price.qty ?? ''),
            material_cost: String(price.material_cost ?? ''),
            cost_items: (price.cost_items || []).map((item: any) => ({ label: item.label, amount: String(item.amount) })),
            collected_by: price.collected_by || '',
            collection_date: price.collection_date ? new Date(price.collection_date).toISOString().split('T')[0] : '',
        });
        setShowPriceModal(true);
    };

    const handlePriceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPrice) {
            putPrice(`/inventory/materials/prices/${editingPrice.id}`, {
                onSuccess: () => { setShowPriceModal(false); setEditingPrice(null); resetPrice(); },
            });
        } else {
            postPrice(`/inventory/materials/${product.id}/prices`, {
                onSuccess: () => { setShowPriceModal(false); resetPrice(); },
            });
        }
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
                                <div>
                                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> Primary Supplier
                                    </p>
                                    <p>{product.primary_supplier?.company_name || '-'}</p>
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

            {/* Prices Section */}
            <GlassCard className="mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-slate-500" /> Prices
                    </h2>
                    <button onClick={openAddPrice} className="glass-button text-sm py-1.5 px-3 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Price
                    </button>
                </div>
                {product.prices && product.prices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 px-3 font-medium text-slate-500">ID</th>
                                    <th className="text-left py-2 px-3 font-medium text-slate-500">Supplier</th>
                                    <th className="text-right py-2 px-3 font-medium text-slate-500 whitespace-nowrap">Qty</th>
                                    <th className="text-right py-2 px-3 font-medium text-slate-500 whitespace-nowrap">Total Cost</th>
                                    <th className="text-right py-2 px-3 font-medium text-slate-500 whitespace-nowrap">Unit Price</th>
                                    <th className="text-left py-2 px-3 font-medium text-slate-500 whitespace-nowrap">Collected By</th>
                                    <th className="text-left py-2 px-3 font-medium text-slate-500 whitespace-nowrap">Collection Date</th>
                                    <th className="text-left py-2 px-3 font-medium text-slate-500 whitespace-nowrap">Date Added</th>
                                    <th className="text-left py-2 px-3 font-medium text-slate-500 whitespace-nowrap">Added By</th>
                                    <th className="text-right py-2 px-3 font-medium text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.prices.map((p: any) => (
                                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-2 px-3 font-mono text-xs">#{p.id}</td>
                                        <td className="py-2 px-3">{p.supplier?.company_name || '-'}</td>
                                        <td className="py-2 px-3 text-right text-slate-600 whitespace-nowrap">
                                            {p.qty} {product.uom}
                                            <span className="block text-xs text-slate-400">{p.units_purchased} × {p.qty_per_unit}</span>
                                        </td>
                                        <td className="py-2 px-3 text-right text-slate-600 whitespace-nowrap">GH₵ {Number(p.total_cost).toFixed(2)}</td>
                                        <td className="py-2 px-3 text-right font-medium whitespace-nowrap">GH₵ {Number(p.price).toFixed(2)}</td>
                                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{p.collected_by?.name || '-'}</td>
                                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{p.collection_date ? new Date(p.collection_date).toLocaleDateString() : '-'}</td>
                                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{p.added_by?.name || '-'}</td>
                                        <td className="py-2 px-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditPrice(p)} className="text-blue-500 hover:text-blue-700">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeletePriceTarget(p.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm mb-4">No prices recorded for this material</p>
                        <button onClick={openAddPrice} className="glass-button text-sm py-1.5 px-3 inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Price
                        </button>
                    </div>
                )}
            </GlassCard>

            {/* Price Modal */}
            {showPriceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">{editingPrice ? 'Edit Price' : 'Add Price'}</h2>
                            <button onClick={() => { setShowPriceModal(false); setEditingPrice(null); }} className="p-1 hover:bg-slate-100 rounded">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handlePriceSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Supplier *</label>
                                    <select
                                        value={priceData.supplier_id}
                                        onChange={(e) => setPriceData('supplier_id', e.target.value)}
                                        className="glass-input w-full"
                                        required
                                    >
                                        <option value="">Select supplier</option>
                                        {supplierPrices.map((sp: any) => (
                                            <option key={sp.supplier?.id} value={sp.supplier?.id}>{sp.supplier?.company_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Units Purchased *</label>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={priceData.units_purchased}
                                            onChange={(e) => setPriceData('units_purchased', e.target.value)}
                                            className="glass-input w-full"
                                            required
                                        />
                                        {priceErrors.units_purchased && <p className="text-red-400 text-sm mt-1">{priceErrors.units_purchased}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Qty per Unit ({product.uom}) *</label>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={priceData.qty_per_unit}
                                            onChange={(e) => setPriceData('qty_per_unit', e.target.value)}
                                            className="glass-input w-full"
                                            required
                                        />
                                        {priceErrors.qty_per_unit && <p className="text-red-400 text-sm mt-1">{priceErrors.qty_per_unit}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Total Quantity</label>
                                    <div className="glass-input w-full flex items-center h-10 px-3 bg-slate-50 text-slate-700 font-semibold">
                                        {priceQty} {product.uom}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Material Cost (GH₵) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={priceData.material_cost}
                                        onChange={(e) => setPriceData('material_cost', e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="0.00"
                                        required
                                    />
                                    {priceErrors.material_cost && <p className="text-red-400 text-sm mt-1">{priceErrors.material_cost}</p>}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium">Extra Costs</label>
                                        <button type="button" onClick={addPriceCostItem} className="text-indigo-600 hover:text-indigo-800 text-sm inline-flex items-center gap-1">
                                            <Plus className="w-3.5 h-3.5" /> Add cost
                                        </button>
                                    </div>
                                    {priceData.cost_items.length > 0 && (
                                        <div className="space-y-2">
                                            {priceData.cost_items.map((item, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <select
                                                        value={item.label}
                                                        onChange={(e) => updatePriceCostItem(index, 'label', e.target.value)}
                                                        className="glass-input flex-1"
                                                        required
                                                    >
                                                        <option value="">Select type</option>
                                                        {(costTypes || []).map((type: string) => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="Amount"
                                                        value={item.amount}
                                                        onChange={(e) => updatePriceCostItem(index, 'amount', e.target.value)}
                                                        className="glass-input w-28"
                                                        required
                                                    />
                                                    <button type="button" onClick={() => removePriceCostItem(index)} className="p-2 text-red-400 hover:bg-slate-100 rounded">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Total Cost</label>
                                        <div className="glass-input w-full flex items-center h-10 px-3 bg-slate-50 text-slate-700 font-semibold">
                                            GH₵ {priceTotalCost.toFixed(2)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Price per Unit</label>
                                        <div className="glass-input w-full flex items-center h-10 px-3 bg-slate-50 text-slate-700 font-semibold">
                                            GH₵ {priceUnitPrice.toFixed(2)} / {product.uom}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Collected By</label>
                                    <select
                                        value={priceData.collected_by}
                                        onChange={(e) => setPriceData('collected_by', e.target.value)}
                                        className="glass-input w-full"
                                    >
                                        <option value="">Select user</option>
                                        {(users || []).map((u: any) => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Collection Date *</label>
                                    <input
                                        type="date"
                                        value={priceData.collection_date}
                                        onChange={(e) => setPriceData('collection_date', e.target.value)}
                                        className="glass-input w-full"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => { setShowPriceModal(false); setEditingPrice(null); }} className="flex-1 glass-button-secondary text-sm py-1.5 px-3">
                                    Cancel
                                </button>
                                <button type="submit" disabled={priceProcessing} className="flex-1 glass-button text-sm py-1.5 px-3 flex items-center justify-center gap-2">
                                    {priceProcessing ? 'Saving...' : editingPrice ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Price Confirmation */}
            {deletePriceTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-2">Delete Price</h3>
                        <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete this price record?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletePriceTarget(null)} className="flex-1 glass-button-secondary">Cancel</button>
                            <button onClick={() => { router.delete(`/inventory/materials/prices/${deletePriceTarget}`); setDeletePriceTarget(null); }} className="flex-1 glass-button bg-red-600 hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}

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
                                            {b.mobile && <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> <WhatsAppLink phone={b.mobile} className="text-green-600 hover:underline">{b.mobile}</WhatsAppLink></span>}
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
