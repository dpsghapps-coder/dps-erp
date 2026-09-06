import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, Pagination } from '@/Components/ui';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';

export default function Ledger() {
    const { entries, filters } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [from, setFrom] = useState(filters?.from || '');
    const [to, setTo] = useState(filters?.to || '');

    const applyFilters = () => {
        router.get('/finance/ledger', { from, to }, { preserveState: true });
    };

    const list = entries?.data || [];

    return (
        <AppLayout>
            <Head title="General Ledger" />

            <PageHeader title="General Ledger" subtitle="Every financial transaction, recorded as balanced debits and credits" />

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-2">From</label>
                        <input type="date" className="glass-input" value={from} onChange={(e) => setFrom(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">To</label>
                        <input type="date" className="glass-input" value={to} onChange={(e) => setTo(e.target.value)} />
                    </div>
                    <button onClick={applyFilters} className="glass-button">Filter</button>
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Reference</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Description</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length > 0 ? (
                                list.map((entry: any) => {
                                    const total = (entry.lines || []).reduce((sum: number, l: any) => sum + Number(l.debit || 0), 0);
                                    const isReversed = !!entry.reversed_by;
                                    return (
                                        <tr key={entry.id} className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isReversed ? 'opacity-50' : ''}`}>
                                            <td className="py-3 px-4 text-sm font-mono">
                                                <Link href={`/finance/ledger/${entry.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                    {entry.reference}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{entry.date}</td>
                                            <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 capitalize">
                                                {entry.type}
                                                {isReversed && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">Reversed</span>}
                                                {entry.reverses && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">Reversal</span>}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{entry.description || '-'}</td>
                                            <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 dark:text-white">{formatCurrency(total)}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8">
                                        <EmptyState icon={BookOpen} title="No ledger entries yet" description="Transactions, transfers, and other postings will appear here" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            <Pagination meta={entries} />
        </AppLayout>
    );
}
