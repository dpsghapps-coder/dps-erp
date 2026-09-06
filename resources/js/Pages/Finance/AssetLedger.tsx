import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, Pagination } from '@/Components/ui';
import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import { Plus, Boxes, Wallet, TrendingDown, Archive } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';
import Swal from 'sweetalert2';

const STATUS_LABELS: Record<string, string> = {
    active: 'Active',
    under_maintenance: 'Under Maintenance',
    disposed: 'Disposed',
};

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    under_maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    disposed: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export default function AssetLedger() {
    const { assets, stats, departments } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        asset_tag: '',
        category: '',
        purchase_date: '',
        purchase_cost: '',
        status: 'active',
        location: '',
        department_id: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance/assets', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: `Delete ${name}?`,
            text: 'This will also remove its ledger history.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) router.delete(`/finance/assets/${id}`);
        });
    };

    const assetList = assets?.data || [];

    return (
        <AppLayout>
            <Head title="Asset Ledger" />

            <PageHeader
                title="Asset Ledger"
                subtitle="Track company assets and how their value changes over time"
                action={
                    <button onClick={() => setShowForm(!showForm)} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Asset
                    </button>
                }
            />

            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <GlassCard>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <Boxes className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Total Assets</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats?.total_assets ?? 0}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Current Value</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats?.total_current_value)}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Total Purchase Cost</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats?.total_purchase_cost)}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                            <Archive className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Disposed</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats?.disposed ?? 0}</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {showForm && (
                <GlassCard className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add Asset</h3>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name *</label>
                            <input className="glass-input w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Asset Tag</label>
                            <input className="glass-input w-full" value={data.asset_tag} onChange={(e) => setData('asset_tag', e.target.value)} placeholder="e.g. AST-001" />
                            {errors.asset_tag && <p className="text-red-400 text-sm mt-1">{errors.asset_tag}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Category *</label>
                            <input className="glass-input w-full" value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="e.g. Vehicle, Equipment" />
                            {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Purchase Date *</label>
                            <input type="date" className="glass-input w-full" value={data.purchase_date} onChange={(e) => setData('purchase_date', e.target.value)} />
                            {errors.purchase_date && <p className="text-red-400 text-sm mt-1">{errors.purchase_date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Purchase Cost *</label>
                            <input type="number" step="0.01" min="0" className="glass-input w-full" value={data.purchase_cost} onChange={(e) => setData('purchase_cost', e.target.value)} />
                            {errors.purchase_cost && <p className="text-red-400 text-sm mt-1">{errors.purchase_cost}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select className="glass-input w-full" value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                <option value="active">Active</option>
                                <option value="under_maintenance">Under Maintenance</option>
                                <option value="disposed">Disposed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Department</label>
                            <select className="glass-input w-full" value={data.department_id} onChange={(e) => setData('department_id', e.target.value)}>
                                <option value="">Select Department</option>
                                {(departments || []).map((d: any) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <input className="glass-input w-full" value={data.location} onChange={(e) => setData('location', e.target.value)} />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium mb-2">Notes</label>
                            <textarea className="glass-input w-full h-20 resize-none" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="glass-button-secondary">Cancel</button>
                            <button type="submit" disabled={processing} className="glass-button">
                                {processing ? 'Saving...' : 'Save Asset'}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Category</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Department</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Purchase Date</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Purchase Cost</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Current Value</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assetList.length > 0 ? (
                                assetList.map((asset: any) => (
                                    <tr key={asset.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                                            <Link href={`/finance/assets/${asset.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                                                {asset.name}
                                            </Link>
                                            {asset.asset_tag && <span className="block text-xs text-slate-400">{asset.asset_tag}</span>}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{asset.category}</td>
                                        <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{asset.department?.name || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{asset.purchase_date}</td>
                                        <td className="py-3 px-4 text-right font-mono text-sm text-slate-600 dark:text-slate-400">{formatCurrency(asset.purchase_cost)}</td>
                                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 dark:text-white">{formatCurrency(asset.current_value)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-3 py-1 rounded-full ${STATUS_STYLES[asset.status]}`}>
                                                {STATUS_LABELS[asset.status] || asset.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/finance/assets/${asset.id}`} className="glass-button-secondary text-xs px-3 py-1.5">
                                                    View Ledger
                                                </Link>
                                                <button onClick={() => handleDelete(asset.id, asset.name)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">
                                                    <Archive className="w-4 h-4 text-slate-400 hover:text-red-600 dark:hover:text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-8">
                                        <EmptyState
                                            icon={Boxes}
                                            title="No assets recorded yet"
                                            description="Add your first asset to start tracking its value over time"
                                            action={
                                                <button onClick={() => setShowForm(true)} className="glass-button">
                                                    <Plus className="w-4 h-4 mr-2" /> Add Asset
                                                </button>
                                            }
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            <Pagination meta={assets} />
        </AppLayout>
    );
}
