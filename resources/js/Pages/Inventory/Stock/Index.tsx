import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import InventoryTabs from '@/Components/InventoryTabs';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Plus, Search, Package, Calendar, Pencil, Trash2, DollarSign, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

type SubTab = 'purchases' | 'levels';

export default function StockIndex() {
    const { stocks, products, stockLevels, suppliers, categories } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [subTab, setSubTab] = useState<SubTab>('purchases');
    const [showModal, setShowModal] = useState(false);
    const [editingStock, setEditingStock] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [thresholdModal, setThresholdModal] = useState<{ open: boolean; item: any; value: string; saving: boolean }>({ open: false, item: null, value: '', saving: false });

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        product_id: '',
        supplier_id: '',
        qty_purchased: '',
        price: '',
        date_purchased: new Date().toISOString().split('T')[0],
        notes: '',
        purchased_by: '',
    });

    const totalCost = Number(data.qty_purchased || 0) * Number(data.price || 0);

    const filteredProducts = selectedCategory
        ? (products || []).filter((p: any) => p.item_category === selectedCategory)
        : (products || []);

    const filteredStocks = (stocks?.data || []).filter((s: any) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return s.product?.item_name?.toLowerCase().includes(q) ||
               s.product?.material_id?.toLowerCase().includes(q);
    });

    const filteredLevels = (stockLevels || []).filter((s: any) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return s.item_name?.toLowerCase().includes(q) ||
               s.material_id?.toLowerCase().includes(q);
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStock) {
            put(`/inventory/stock/${editingStock.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingStock(null);
                    reset();
                }
            });
        } else {
            post('/inventory/stock', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (id: string) => {
        Swal.fire({
            title: 'Delete Stock Record?',
            text: 'This will reduce the product quantity and cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete',
        }).then((result) => {
            if (result.isConfirmed) destroy(`/inventory/stock/${id}`);
        });
    };

    const openEdit = (stock: any) => {
        setEditingStock(stock);
        setSelectedCategory(stock.product?.item_category || '');
        setData({
            product_id: stock.product_id,
            supplier_id: stock.supplier_id || '',
            qty_purchased: stock.qty_purchased,
            price: stock.price,
            date_purchased: stock.date_purchased ? stock.date_purchased.split('T')[0] : new Date().toISOString().split('T')[0],
            notes: stock.notes || '',
            purchased_by: stock.purchased_by || '',
        });
        setShowModal(true);
    };

    const openThreshold = (item: any) => {
        setThresholdModal({ open: true, item, value: String(item.restock_threshold || 0), saving: false });
    };

    const saveThreshold = () => {
        setThresholdModal(prev => ({ ...prev, saving: true }));
        router.patch(`/inventory/materials/${thresholdModal.item.id}/threshold`, {
            restock_threshold: Number(thresholdModal.value) || 0,
        }, {
            onSuccess: () => setThresholdModal({ open: false, item: null, value: '', saving: false }),
            onError: () => setThresholdModal(prev => ({ ...prev, saving: false })),
        });
    };

    const openCreate = () => {
        setEditingStock(null);
        setSelectedCategory('');
        reset();
        setData({
            product_id: '',
            supplier_id: '',
            qty_purchased: '',
            price: '',
            date_purchased: new Date().toISOString().split('T')[0],
            notes: '',
            purchased_by: '',
        });
        setShowModal(true);
    };

    return (
        <AppLayout>
            <Head title="Stock" />

            <PageHeader
                title="Stock"
                subtitle="Track inventory purchases and levels"
                action={
                    subTab === 'purchases' ? (
                        <button onClick={openCreate} className="glass-button flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Purchase
                        </button>
                    ) : null
                }
            />

            <InventoryTabs activeTab="stock" />

            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
                <button
                    onClick={() => setSubTab('purchases')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${subTab === 'purchases' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                >
                    Purchases
                </button>
                <button
                    onClick={() => setSubTab('levels')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${subTab === 'levels' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                >
                    Stock Levels
                </button>
            </div>

            <GlassCard className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={subTab === 'purchases' ? 'Search purchases...' : 'Search materials...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="glass-input w-full pl-10"
                    />
                </div>
            </GlassCard>

            {subTab === 'purchases' && (
                <GlassCard className="overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date Purchased</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Material Name</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Qty</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Price</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Total Cost</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Note</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Supplier</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Purchased By</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Added By</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date Added</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStocks.length > 0 ? (
                                    filteredStocks.map((stock: any) => (
                                        <tr key={stock.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4 text-slate-600">
                                                {stock.date_purchased ? new Date(stock.date_purchased).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-slate-900">{stock.product?.item_name}</p>
                                                <p className="text-xs font-mono text-slate-400">{stock.product?.material_id}</p>
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium text-slate-900">{stock.qty_purchased}</td>
                                            <td className="py-3 px-4 text-right text-slate-600">
                                                {stock.price ? `$${Number(stock.price).toFixed(2)}` : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium text-slate-900">
                                                {stock.total_cost ? `$${Number(stock.total_cost).toFixed(2)}` : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">{stock.notes || '-'}</td>
                                            <td className="py-3 px-4 text-slate-700">{stock.supplier?.company_name || '-'}</td>
                                            <td className="py-3 px-4 text-slate-700">{stock.purchased_by || '-'}</td>
                                            <td className="py-3 px-4 text-slate-500 text-sm">{stock.added_by || '-'}</td>
                                            <td className="py-3 px-4 text-slate-500 text-sm">
                                                {new Date(stock.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button onClick={() => openEdit(stock)} className="text-blue-600 hover:underline mr-3">
                                                    <Pencil className="w-4 h-4 inline" />
                                                </button>
                                                <button onClick={() => handleDelete(stock.id)} className="text-red-600 hover:underline">
                                                    <Trash2 className="w-4 h-4 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="py-8">
                                            <EmptyState
                                                icon={Package}
                                                title="No purchase records"
                                                action={
                                                    <button onClick={openCreate} className="glass-button">
                                                        <Plus className="w-4 h-4 mr-2" /> Add Purchase
                                                    </button>
                                                }
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden p-4 space-y-3">
                        {filteredStocks.length > 0 ? (
                            filteredStocks.map((stock: any) => (
                                <div key={stock.id} className="glass-card p-4 rounded-xl border border-slate-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-slate-900">{stock.product?.item_name}</p>
                                            <p className="text-xs font-mono text-slate-400">{stock.product?.material_id}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(stock)} className="text-blue-600">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(stock.id)} className="text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-sm text-slate-600">
                                        <div className="flex justify-between"><span>Date:</span><span>{stock.date_purchased ? new Date(stock.date_purchased).toLocaleDateString() : '-'}</span></div>
                                        <div className="flex justify-between"><span>Qty:</span><span className="font-medium">{stock.qty_purchased}</span></div>
                                        {stock.price > 0 && <div className="flex justify-between"><span>Price:</span><span>${Number(stock.price).toFixed(2)}</span></div>}
                                        {stock.total_cost > 0 && <div className="flex justify-between"><span>Total:</span><span className="font-semibold">${Number(stock.total_cost).toFixed(2)}</span></div>}
                                        {stock.supplier?.company_name && <div className="flex justify-between"><span>Supplier:</span><span>{stock.supplier.company_name}</span></div>}
                                        {stock.purchased_by && <div className="flex justify-between"><span>Purchased By:</span><span>{stock.purchased_by}</span></div>}
                                        {stock.added_by && <div className="flex justify-between"><span>Added By:</span><span className="text-slate-400">{stock.added_by}</span></div>}
                                    </div>
                                    {stock.notes && <p className="text-sm text-slate-500 mt-2 pt-2 border-t border-slate-100">{stock.notes}</p>}
                                </div>
                            ))
                        ) : (
                            <EmptyState icon={Package} title="No purchase records" action={<button onClick={openCreate} className="glass-button"><Plus className="w-4 h-4 mr-2" /> Add Purchase</button>} />
                        )}
                    </div>
                </GlassCard>
            )}

            {subTab === 'levels' && (
                <GlassCard className="overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Material</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Category</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Stock Level</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Threshold</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Last Updated</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLevels.length > 0 ? (
                                    filteredLevels.map((item: any) => {
                                        const low = item.restock_threshold > 0 && item.available_stock <= item.restock_threshold;
                                        return (
                                            <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 ${low ? 'bg-red-50' : ''}`}>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-slate-900">{item.item_name}</p>
                                                    <p className="text-xs font-mono text-slate-400">{item.material_id}</p>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">{item.item_category || '-'}</td>
                                                <td className="py-3 px-4 text-right font-semibold text-slate-900">{item.available_stock} {item.uom}</td>
                                                <td className="py-3 px-4 text-right text-slate-600">{item.restock_threshold || '—'}</td>
                                                <td className="py-3 px-4 text-slate-500 text-sm">
                                                    {item.last_updated ? new Date(item.last_updated).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {low ? (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                                                            <AlertTriangle className="w-3 h-3" /> Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                            <CheckCircle className="w-3 h-3" /> OK
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button onClick={() => openThreshold(item)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center gap-1">
                                                        <RefreshCw className="w-3.5 h-3.5" /> Reorder
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-8">
                                            <EmptyState icon={Package} title="No materials found" />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden p-4 space-y-3">
                        {filteredLevels.length > 0 ? (
                            filteredLevels.map((item: any) => {
                                const low = item.restock_threshold > 0 && item.available_stock <= item.restock_threshold;
                                return (
                                    <div key={item.id} className={`glass-card p-4 rounded-xl border ${low ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium text-slate-900">{item.item_name}</p>
                                                <p className="text-xs font-mono text-slate-400">{item.material_id}</p>
                                            </div>
                                            {low ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Low</span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> OK</span>
                                            )}
                                        </div>
                                        <div className="space-y-1 text-sm text-slate-600">
                                            <div className="flex justify-between"><span>Category:</span><span>{item.item_category || '-'}</span></div>
                                            <div className="flex justify-between"><span>Stock Level:</span><span className="font-semibold">{item.available_stock} {item.uom}</span></div>
                                            <div className="flex justify-between"><span>Threshold:</span><span>{item.restock_threshold || '—'}</span></div>
                                            <div className="flex justify-between"><span>Last Updated:</span><span>{item.last_updated ? new Date(item.last_updated).toLocaleDateString() : '—'}</span></div>
                                        </div>
                                        <button onClick={() => openThreshold(item)} className="mt-3 w-full text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg py-1.5 flex items-center justify-center gap-1">
                                            <RefreshCw className="w-3.5 h-3.5" /> Reorder
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <EmptyState icon={Package} title="No materials found" />
                        )}
                    </div>
                </GlassCard>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            {editingStock ? 'Edit Purchase' : 'Add Purchase'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category *</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            setData('product_id', '');
                                        }}
                                        className="glass-input w-full"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {(categories || []).map((cat: string) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Material Name *</label>
                                    <select
                                        value={data.product_id}
                                        onChange={(e) => setData('product_id', e.target.value)}
                                        className="glass-input w-full"
                                        required
                                        disabled={!selectedCategory}
                                    >
                                        <option value="">{selectedCategory ? 'Select material' : 'Select a category first'}</option>
                                        {filteredProducts.map((p: any) => (
                                            <option key={p.id} value={p.id}>
                                                {p.item_name} ({p.material_id})
                                            </option>
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
                                        {(suppliers || []).map((s: any) => (
                                            <option key={s.id} value={s.id}>
                                                {s.company_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Date Purchased *</label>
                                        <input
                                            type="date"
                                            value={data.date_purchased}
                                            onChange={(e) => setData('date_purchased', e.target.value)}
                                            className="glass-input w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Qty *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.qty_purchased}
                                            onChange={(e) => setData('qty_purchased', e.target.value)}
                                            className="glass-input w-full"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Price ($) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            className="glass-input w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Total Cost</label>
                                        <div className="glass-input w-full flex items-center h-10 px-3 bg-slate-50 text-slate-700 font-semibold">
                                            ${totalCost.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Note</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="glass-input w-full h-20"
                                        placeholder="Optional note..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Purchased By</label>
                                    <input
                                        type="text"
                                        value={data.purchased_by}
                                        onChange={(e) => setData('purchased_by', e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="Who made the purchase?"
                                    />
                                </div>
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
            {thresholdModal.open && thresholdModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h2 className="text-lg font-semibold mb-1">Set Restock Threshold</h2>
                        <p className="text-sm text-slate-500 mb-4">
                            {thresholdModal.item.item_name} ({thresholdModal.item.material_id})
                        </p>
                        <p className="text-sm text-slate-600 mb-3">
                            Current stock level: <span className="font-semibold">{thresholdModal.item.available_stock} {thresholdModal.item.uom}</span>
                        </p>
                        <label className="block text-sm font-medium mb-2">Minimum stock level before alert</label>
                        <input
                            type="number"
                            min="0"
                            value={thresholdModal.value}
                            onChange={(e) => setThresholdModal(prev => ({ ...prev, value: e.target.value }))}
                            className="glass-input w-full"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setThresholdModal({ open: false, item: null, value: '', saving: false })}
                                className="flex-1 glass-button-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveThreshold}
                                disabled={thresholdModal.saving}
                                className="flex-1 glass-button"
                            >
                                {thresholdModal.saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
