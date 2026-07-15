import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, LoadingSpinner } from '@/Components/ui';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function ProcurementCreate({ suppliers, materials, goods }: { suppliers: any[], materials: any[], goods: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        expected_date: '',
        notes: '',
        items: [{ type: 'material', product_id: '', qty: 1, unit_cost: 0 }]
    });

    const [selectedItemIndices, setSelectedItemIndices] = useState<number[]>([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkSupplierId, setBulkSupplierId] = useState('');

    const isAllSelected = selectedItemIndices.length === data.items.length && data.items.length > 0;

    const toggleSelectAll = () => {
        if (isAllSelected) setSelectedItemIndices([]);
        else setSelectedItemIndices(data.items.map((_, i) => i));
    };

    const toggleSelectItem = (index: number) => {
        setSelectedItemIndices(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const commonSuppliersForSelection = useMemo(() => {
        if (selectedItemIndices.length === 0) return suppliers;

        let commonIds: number[] | null = null;

        for (const index of selectedItemIndices) {
            const item = data.items[index];
            if (!item || !item.product_id) continue;

            let itemSupplierIds: number[] = [];
            const product = item.type === 'material' 
                ? materials.find(x => x.id == item.product_id)
                : goods.find(x => x.id == item.product_id);

            if (product?.supplier_prices) {
                itemSupplierIds = product.supplier_prices.map((sp: any) => sp.supplier_id);
            } else if (item.type === 'good' && (product as any)?.supplier_id) {
                // Fallback for goods with legacy single supplier_id
                itemSupplierIds = [(product as any).supplier_id];
            }

            if (commonIds === null) commonIds = itemSupplierIds;
            else commonIds = commonIds.filter(id => itemSupplierIds.includes(id));
            
            // If at any point we have no common suppliers, we can stop
            if (commonIds.length === 0) break;
        }

        return suppliers.filter(s => (commonIds || []).includes(s.id));
    }, [selectedItemIndices, data.items, suppliers, materials, goods]);

    const handleBulkAssign = () => {
        if (bulkSupplierId) {
            setData('supplier_id', bulkSupplierId);
            setShowBulkModal(false);
            setSelectedItemIndices([]);
            setBulkSupplierId('');
        }
    };

    const addItem = () => {
        setData('items', [...data.items, { type: 'material', product_id: '', qty: 1, unit_cost: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
        // Reset selection on remove to avoid index out of bounds or stale indices
        setSelectedItemIndices([]);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        (newItems[index] as any)[field] = value;
        
        if (field === 'type') {
            (newItems[index] as any)['product_id'] = '';
        }
        
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/procurement');
    };

    return (
        <AppLayout>
            <Head title="New Purchase Order" />

            <PageHeader 
                title="New Purchase Order" 
                subtitle="Create a new PO for a supplier"
                action={
                    <Link href="/procurement" className="glass-button-secondary flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to List
                    </Link>
                }
            />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard>
                            {selectedItemIndices.length > 0 && (
                                <div className="flex justify-end mb-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowBulkModal(true)} 
                                        className="text-xs glass-button py-1.5 px-4 animate-scale-in"
                                    >
                                        Assign Supplier ({selectedItemIndices.length})
                                    </button>
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                            <th className="py-3 px-2 w-10">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isAllSelected} 
                                                    onChange={toggleSelectAll} 
                                                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500" 
                                                />
                                            </th>
                                            <th className="py-3 px-2 w-32">Type</th>
                                            <th className="py-3 px-2">Item</th>
                                            <th className="py-3 px-2 w-24 text-right">Qty</th>
                                            <th className="py-3 px-2 w-32 text-right">Unit Cost</th>
                                            <th className="py-3 px-2 w-32 text-right">Total</th>
                                            <th className="py-3 px-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.items.map((item, index) => (
                                            <tr key={index} className={selectedItemIndices.includes(index) ? 'bg-indigo-500/5' : ''}>
                                                <td className="py-3 px-2">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedItemIndices.includes(index)} 
                                                        onChange={() => toggleSelectItem(index)} 
                                                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500" 
                                                    />
                                                </td>
                                                <td className="py-3 px-2">
                                                    <select
                                                        className="glass-input w-full text-xs"
                                                        value={item.type}
                                                        onChange={(e) => updateItem(index, 'type', e.target.value)}
                                                    >
                                                        <option value="material">Material</option>
                                                        <option value="good">Good</option>
                                                    </select>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <select 
                                                        className="glass-input w-full"
                                                        value={item.product_id}
                                                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select {item.type === 'material' ? 'Material' : 'Good'}</option>
                                                        {(item.type === 'material' ? materials : goods).map(p => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.item_name} ({p.material_id})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-3 px-2 text-right">
                                                    <input 
                                                        type="number" 
                                                        min="0.01"
                                                        step="0.01"
                                                        className="glass-input w-full text-right"
                                                        value={item.qty}
                                                        onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td className="py-3 px-2 text-right">
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        step="0.01"
                                                        className="glass-input w-full text-right"
                                                        value={item.unit_cost}
                                                        onChange={(e) => updateItem(index, 'unit_cost', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td className="py-3 px-2 text-right font-medium text-slate-600 dark:text-slate-300">
                                                    ${(item.qty * item.unit_cost).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    {data.items.length > 1 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeItem(index)}
                                                            className="text-rose-500 hover:text-rose-400 p-1"
                                                        >
                                                            &times;
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button 
                                type="button" 
                                onClick={addItem}
                                className="mt-4 text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add another item
                            </button>
                        </GlassCard>

                        <GlassCard>
                            <textarea 
                                className="glass-input w-full h-32" 
                                placeholder="Additional instructions for the supplier..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        <GlassCard>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Supplier</label>
                                    <select 
                                        className="glass-input w-full"
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a supplier</option>
                                        {commonSuppliersForSelection.map(s => (
                                            <option key={s.id} value={s.id}>{s.company_name}</option>
                                        ))}
                                    </select>
                                    {data.items.some(i => i.product_id) && commonSuppliersForSelection.length === 0 && (
                                        <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                                            <X className="w-3 h-3" /> No common suppliers for selected items.
                                        </p>
                                    )}
                                    {errors.supplier_id && <p className="text-rose-500 text-xs mt-1.5">{errors.supplier_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Expected Delivery</label>
                                    <input 
                                        type="date" 
                                        className="glass-input w-full"
                                        value={data.expected_date}
                                        onChange={(e) => setData('expected_date', e.target.value)}
                                    />
                                    {errors.expected_date && <p className="text-rose-500 text-xs mt-1.5">{errors.expected_date}</p>}
                                </div>

                                <div className="pt-4 mt-2 border-t border-slate-200 dark:border-white/10">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            ${data.items.reduce((sum, item) => sum + (item.qty * item.unit_cost), 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                                        <span>Total</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">
                                            ${data.items.reduce((sum, item) => sum + (item.qty * item.unit_cost), 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="glass-button w-full flex items-center justify-center gap-2 mt-4"
                                >
                                    {processing ? <LoadingSpinner /> : <Save className="w-4 h-4" />} {processing ? 'Creating...' : 'Create PO'}
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </form>

            {showBulkModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-sm border-none shadow-2xl p-0 overflow-hidden animate-scale-in">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white">
                            <h2 className="text-xl font-bold">Bulk Assign Supplier</h2>
                            <p className="text-white/80 text-sm mt-1">Select a supplier for ({selectedItemIndices.length}) items</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Common Suppliers</label>
                                <select 
                                    className="glass-input w-full" 
                                    value={bulkSupplierId} 
                                    onChange={(e) => setBulkSupplierId(e.target.value)}
                                    autoFocus
                                >
                                    <option value="">Select a common supplier</option>
                                    {commonSuppliersForSelection.map(s => (
                                        <option key={s.id} value={s.id}>{s.company_name}</option>
                                    ))}
                                </select>
                                {commonSuppliersForSelection.length === 0 && (
                                    <p className="text-rose-500 text-xs mt-2">No common suppliers available for this selection.</p>
                                )}
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowBulkModal(false)} 
                                    className="flex-1 glass-button-secondary py-2.5"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleBulkAssign} 
                                    disabled={!bulkSupplierId}
                                    className="flex-1 glass-button py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
