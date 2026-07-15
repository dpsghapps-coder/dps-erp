import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, LoadingSpinner } from '@/Components/ui';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';

interface Props {
    purchaseRequest: any;
    products: any[];
    departments: string[];
}

export default function PurchaseRequestEdit({ purchaseRequest, products, departments }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        department: purchaseRequest.department || '',
        priority: purchaseRequest.priority || 'Normal',
        required_by_date: purchaseRequest.required_by_date ? purchaseRequest.required_by_date.split('T')[0] : '',
        purpose: purchaseRequest.purpose || '',
        items: purchaseRequest.items?.map((item: any) => ({
            item_name: item.item_name || '',
            item_description: item.item_description || '',
            product_id: item.product_id || '',
            estimated_cost: item.estimated_cost || 0,
            qty_requested: item.qty_requested || 1,
            uom: item.uom || 'Pieces',
            attachments: [] as File[],
        })) || [{
            item_name: '',
            item_description: '',
            product_id: '',
            estimated_cost: 0,
            qty_requested: 1,
            uom: 'Pieces',
            attachments: [] as File[],
        }],
    });

    const addItem = () => {
        setData('items', [...data.items, {
            item_name: '',
            item_description: '',
            product_id: '',
            estimated_cost: 0,
            qty_requested: 1,
            uom: 'Pieces',
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
                (newItems[index] as any).item_name = product.item_name;
                (newItems[index] as any).uom = product.uom || 'Pieces';
            }
        }

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
        put(`/procurement/purchase-requests/${purchaseRequest.id}`);
    };

    const totalEstimated = data.items.reduce((sum: number, item: any) => sum + (item.estimated_cost * item.qty_requested), 0);

    return (
        <AppLayout>
            <Head title={`Edit PR ${purchaseRequest.pr_number}`} />

            <PageHeader
                title={`Edit ${purchaseRequest.pr_number}`}
                subtitle="Edit purchase request details"
                action={
                    <Link href={`/procurement/purchase-requests/${purchaseRequest.id}`} className="glass-button-secondary flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to PR
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
                                {data.items.map((item: any, index: number) => (
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
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Item Name *</label>
                                                <input
                                                    type="text"
                                                    className="glass-input w-full"
                                                    placeholder="Item name"
                                                    value={item.item_name}
                                                    onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Product (Optional)</label>
                                                <select
                                                    className="glass-input w-full"
                                                    value={item.product_id}
                                                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                >
                                                    <option value="">None</option>
                                                    {products.map((p: any) => (
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
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Qty *</label>
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
                                                <label className="block text-xs font-medium mb-1 text-slate-500">UOM *</label>
                                                <select
                                                    className="glass-input w-full"
                                                    value={item.uom}
                                                    onChange={(e) => updateItem(index, 'uom', e.target.value)}
                                                    required
                                                >
                                                    <option value="Pieces">Pieces</option>
                                                    <option value="Kg">Kg</option>
                                                    <option value="Liters">Liters</option>
                                                    <option value="Meters">Meters</option>
                                                    <option value="Boxes">Boxes</option>
                                                    <option value="Sets">Sets</option>
                                                    <option value="Pairs">Pairs</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Est. Cost (per unit) *</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="glass-input w-full"
                                                    value={item.estimated_cost}
                                                    onChange={(e) => updateItem(index, 'estimated_cost', e.target.value)}
                                                    required
                                                />
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
                                            ${totalEstimated.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="glass-button w-full flex items-center justify-center gap-2 mt-4"
                                >
                                    {processing ? <LoadingSpinner /> : <Save className="w-4 h-4" />}
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
