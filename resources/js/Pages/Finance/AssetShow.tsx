import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Plus, History, TrendingDown, TrendingUp, Wrench, Archive } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    under_maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    disposed: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

const TYPE_ICONS: Record<string, any> = {
    acquisition: TrendingUp,
    appreciation: TrendingUp,
    depreciation: TrendingDown,
    maintenance: Wrench,
    disposal: Archive,
};

const TYPE_COLORS: Record<string, string> = {
    acquisition: 'text-green-600 dark:text-green-400',
    appreciation: 'text-green-600 dark:text-green-400',
    depreciation: 'text-red-600 dark:text-red-400',
    maintenance: 'text-amber-600 dark:text-amber-400',
    disposal: 'text-slate-500 dark:text-slate-400',
};

export default function AssetShow() {
    const { asset } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'depreciation',
        amount: '',
        date: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/finance/assets/${asset.id}/entries`, {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const entries = asset?.ledger_entries || [];
    const isDisposed = asset?.status === 'disposed';

    return (
        <AppLayout>
            <Head title={`Asset · ${asset?.name}`} />

            <div className="mb-6">
                <Link href="/finance/assets" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Asset Ledger
                </Link>
            </div>

            <PageHeader
                title={asset?.name}
                subtitle={asset?.category}
                action={
                    !isDisposed && (
                        <button onClick={() => setShowForm(!showForm)} className="glass-button flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Record Entry
                        </button>
                    )
                }
            />

            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <GlassCard>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Current Value</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(asset?.current_value)}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Purchase Cost</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(asset?.purchase_cost)}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Purchase Date</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{asset?.purchase_date}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Status</p>
                    <span className={`inline-block mt-1 text-xs px-3 py-1 rounded-full ${STATUS_STYLES[asset?.status]}`}>
                        {asset?.status?.replace('_', ' ')}
                    </span>
                </GlassCard>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Details</h3>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between"><dt className="text-slate-400">Asset Tag</dt><dd className="text-slate-700 dark:text-slate-300">{asset?.asset_tag || '-'}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-400">Department</dt><dd className="text-slate-700 dark:text-slate-300">{asset?.department?.name || '-'}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-400">Location</dt><dd className="text-slate-700 dark:text-slate-300">{asset?.location || '-'}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-400">Added By</dt><dd className="text-slate-700 dark:text-slate-300">{asset?.created_by?.name || '-'}</dd></div>
                    </dl>
                    {asset?.notes && <p className="text-sm text-slate-500 mt-3 italic">{asset.notes}</p>}
                </GlassCard>

                {showForm && !isDisposed && (
                    <GlassCard>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Record Ledger Entry</h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-2">Entry Type</label>
                                <select className="glass-input w-full" value={data.type} onChange={(e) => setData('type', e.target.value)}>
                                    <option value="depreciation">Depreciation</option>
                                    <option value="appreciation">Appreciation</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="disposal">Disposal</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Amount</label>
                                    <input type="number" step="0.01" min="0" className="glass-input w-full" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                                    {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date</label>
                                    <input type="date" className="glass-input w-full" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                                    {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea className="glass-input w-full h-16 resize-none" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="glass-button-secondary">Cancel</button>
                                <button type="submit" disabled={processing} className="glass-button">
                                    {processing ? 'Saving...' : 'Save Entry'}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                )}
            </div>

            <GlassCard>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Ledger History</h3>
                {entries.length > 0 ? (
                    <div className="space-y-3">
                        {entries.map((entry: any) => {
                            const Icon = TYPE_ICONS[entry.type] || History;
                            return (
                                <div key={entry.id} className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700/50 pb-3 last:border-0">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            <Icon className={`w-4 h-4 ${TYPE_COLORS[entry.type]}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{entry.type}</p>
                                            <p className="text-xs text-slate-400">{entry.date}{entry.created_by?.name ? ` · ${entry.created_by.name}` : ''}</p>
                                            {entry.description && <p className="text-xs text-slate-500 mt-1">{entry.description}</p>}
                                        </div>
                                    </div>
                                    <p className={`font-mono font-medium ${TYPE_COLORS[entry.type]}`}>
                                        {['depreciation', 'disposal'].includes(entry.type) ? '-' : '+'}{formatCurrency(entry.amount)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState icon={History} title="No ledger entries yet" description="Depreciation, appreciation, and other entries will appear here" />
                )}
            </GlassCard>
        </AppLayout>
    );
}
