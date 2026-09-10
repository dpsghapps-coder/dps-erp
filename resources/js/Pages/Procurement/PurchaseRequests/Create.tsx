import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, LoadingSpinner } from '@/Components/ui';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

interface Props {
    products: any[];
    suppliers: any[];
    users: any[];
    departments: string[];
    uoms: string[];
    costTypes: string[];
}

interface CostItem {
    label: string;
    amount: string | number;
}

export default function PurchaseRequestCreate({ products, suppliers, users, departments, costTypes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        department: '',
        priority: 'Normal',
        required_by_date: '',
        purpose: '',
        items: [{
            item_description: '',
            product_id: '',
            estimated_cost: 0,
            qty_requested: 1,
            uom: '',
            cost_items: [] as CostItem[],
            attachments: [] as File[],
        }],
    });

    const addItem = () => {
        setData('items', [...data.items, {
            item_description: '',
            product_id: '',
            estimated_cost: 0,
            qty_requested: 1,
            uom: '',
            cost_items: [],
            attachments: [],
        }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        (newItems[index] as any)[field] = value;

        if (field === 'product_id' && value) {
            const product = products.find(p => p.id === value);
            if (product) {
                (newItems[index] as any).uom = product.uom || '';
            }
        }

        setData('items', newItems);
    };

    const addCostItem = (itemIndex: number) => {
        const newItems = [...data.items];
        (newItems[itemIndex] as any).cost_items = [...(newItems[itemIndex] as any).cost_items, { label: costTypes?.[0] || '', amount: '' }];
        setData('items', newItems);
    };

    const removeCostItem = (itemIndex: number, costIndex: number) => {
        const newItems = [...data.items];
        (newItems[itemIndex] as any).cost_items = (newItems[itemIndex] as any).cost_items.filter((_: any, i: number) => i !== costIndex);
        setData('items', newItems);
    };

    const updateCostItem = (itemIndex: number, costIndex: number, field: 'label' | 'amount', value: string) => {
        const newItems = [...data.items];
        const costItems = [...(newItems[itemIndex] as any).cost_items];
        costItems[costIndex] = { ...costItems[costIndex], [field]: value };
        (newItems[itemIndex] as any).cost_items = costItems;
        setData('items', newItems);
    };

    const handleFileChange = (index: number, files: FileList | null) => {
        if (!files) return;
        const newItems = [...data.items];
        (newItems[index] as any).attachments = Array.from(files);
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/procurement/purchase-requests');
    };

    const itemTotal = (item: typeof data.items[number]) => {
        const extra = (item.cost_items || []).reduce((sum: number, c: CostItem) => sum + Number(c.amount || 0), 0);
        return Number(item.estimated_cost || 0) * Number(item.qty_requested || 0) + extra;
    };

    const totalEstimated = data.items.reduce((sum, item) => sum + itemTotal(item), 0);
    const formatCurrency = useCurrency();

    return (
        <AppLayout>
            <Head title="New Purchase Request" />

            <PageHeader
                title="New Purchase Request"
                subtitle="Create a new purchase request"
                action={
                    <Link href="/procurement/purchase-requests" className="glass-button-secondary flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to List
                    </Link>
                }
            />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Request Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Department *</label>
                                    <select
                                        className="glass-input w-full"
                                        value={data.department}
                                        onChange={(e) => setData('department', e.target.value)}
                                        required
                                    >
                                        <option value="">Select department</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                    {errors.department && <p className="text-rose-500 text-xs mt-1.5">{errors.department}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Priority *</label>
                                    <select
                                        className="glass-input w-full"
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                        required
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Normal">Normal</option>
                                        <option value="High">High</option>
                                        <option value="Emergency">Emergency</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Required By</label>
                                    <input
                                        type="date"
                                        className="glass-input w-full"
                                        value={data.required_by_date}
                                        onChange={(e) => setData('required_by_date', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Purpose / Justification</label>
                                    <textarea
                                        className="glass-input w-full h-24"
                                        placeholder="Why is this purchase needed?"
                                        value={data.purpose}
                                        onChange={(e) => setData('purpose', e.target.value)}
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Items</h3>
                            <div className="space-y-4">
                                {data.items.map((item, index) => (
                                    <div key={index} className="glass-card p-4 rounded-lg border border-slate-200 dark:border-white/10">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-sm font-medium text-slate-500">Item {index + 1}</span>
                                            {data.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-rose-500 hover:text-rose-400 p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="md:col-span-3">
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Product *</label>
                                                <select
                                                    className="glass-input w-full"
                                                    value={item.product_id}
                                                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select product</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.item_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Description</label>
                                                <input
                                                    type="text"
                                                    className="glass-input w-full"
                                                    placeholder="Additional details"
                                                    value={item.item_description}
                                                    onChange={(e) => updateItem(index, 'item_description', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-slate-500">
                                                    Units {item.uom ? `(${item.uom})` : ''} *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    className="glass-input w-full"
                                                    value={item.qty_requested}
                                                    onChange={(e) => updateItem(index, 'qty_requested', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Est. Cost (per unit) *</label>
                                                {(() => {
                                                    const prices = products.find(p => p.id === item.product_id)?.prices || [];
                                                    return prices.length > 0 && (
                                                        <select
                                                            className="glass-input w-full mb-1 text-xs"
                                                            value=""
                                                            onChange={(e) => e.target.value && updateItem(index, 'estimated_cost', e.target.value)}
                                                        >
                                                            <option value="">Use a collected price...</option>
                                                            {prices.map((price: any) => (
                                                                <option key={price.id} value={price.price}>
                                                                    {formatCurrency(price.price)} — {price.supplier?.company_name || 'Unknown supplier'} ({new Date(price.collection_date).toLocaleDateString()})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    );
                                                })()}
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="glass-input w-full"
                                                    placeholder="Or type your own"
                                                    value={item.estimated_cost}
                                                    onChange={(e) => updateItem(index, 'estimated_cost', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Line Total</label>
                                                <div className="glass-input w-full flex items-center h-9 px-3 bg-slate-50 text-slate-700 font-semibold text-sm">
                                                    {formatCurrency(itemTotal(item))}
                                                </div>
                                            </div>
                                            <div className="md:col-span-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-xs font-medium text-slate-500">Additional Costs</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => addCostItem(index)}
                                                        className="text-indigo-500 hover:text-indigo-600 text-xs inline-flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> Add cost
                                                    </button>
                                                </div>
                                                {item.cost_items.length > 0 && (
                                                    <div className="space-y-2">
                                                        {item.cost_items.map((cost, costIndex) => (
                                                            <div key={costIndex} className="flex gap-2 items-center">
                                                                <select
                                                                    value={cost.label}
                                                                    onChange={(e) => updateCostItem(index, costIndex, 'label', e.target.value)}
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
                                                                    value={cost.amount}
                                                                    onChange={(e) => updateCostItem(index, costIndex, 'amount', e.target.value)}
                                                                    className="glass-input w-28"
                                                                    required
                                                                />
                                                                <button type="button" onClick={() => removeCostItem(index, costIndex)} className="p-2 text-red-400 hover:bg-slate-100 rounded">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Attachments</label>
                                                <label className="glass-input w-full flex items-center gap-2 cursor-pointer">
                                                    <Upload className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-500">
                                                        {item.attachments?.length > 0
                                                            ? `${item.attachments.length} file(s) selected`
                                                            : 'Upload specs, invoices, photos'}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        className="hidden"
                                                        onChange={(e) => handleFileChange(index, e.target.files)}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="mt-4 text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add another item
                            </button>
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Items</span>
                                    <span className="font-medium">{data.items.length}</span>
                                </div>
                                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                                    <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                                        <span>Estimated Total</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">
                                            {formatCurrency(totalEstimated)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="glass-button w-full flex items-center justify-center gap-2 mt-4"
                                >
                                    {processing ? <LoadingSpinner /> : <Save className="w-4 h-4" />}
                                    {processing ? 'Saving...' : 'Save as Draft'}
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
