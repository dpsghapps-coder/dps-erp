import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';

export default function BalanceSheet() {
    const { assetAccounts, liabilityAccounts, equityAccounts, netIncomeUnclosed, totalAssets, totalLiabilities, totalEquity, filters } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [asOf, setAsOf] = useState(filters?.as_of || '');

    const applyFilter = () => {
        router.get('/finance/reports/balance-sheet', { as_of: asOf }, { preserveState: true });
    };

    const balances = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;

    return (
        <AppLayout>
            <Head title="Balance Sheet" />

            <div className="mb-6">
                <Link href="/finance/reports" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Reports
                </Link>
            </div>

            <PageHeader title="Balance Sheet" subtitle={`As of ${filters?.as_of}`} />

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-2">As of</label>
                        <input type="date" className="glass-input" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
                    </div>
                    <button onClick={applyFilter} className="glass-button">Apply</button>
                </div>
            </GlassCard>

            <div className="grid md:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Assets</h3>
                    <div className="font-mono text-sm space-y-1.5">
                        {(assetAccounts || []).map((a: any) => (
                            <div key={a.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                                <span>{a.name}</span>
                                <span>{formatCurrency(a.current_balance)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between pt-2 mt-2 border-t-2 border-slate-300 dark:border-slate-600 font-semibold text-slate-900 dark:text-white">
                            <span>Total Assets</span>
                            <span>{formatCurrency(totalAssets)}</span>
                        </div>
                    </div>
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Liabilities</h3>
                        <div className="font-mono text-sm space-y-1.5">
                            {(liabilityAccounts || []).length > 0 ? (
                                (liabilityAccounts || []).map((a: any) => (
                                    <div key={a.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                                        <span>{a.name}</span>
                                        <span>{formatCurrency(a.current_balance)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-center py-2 font-sans">No liabilities recorded</p>
                            )}
                            <div className="flex justify-between pt-2 mt-2 border-t-2 border-slate-300 dark:border-slate-600 font-semibold text-slate-900 dark:text-white">
                                <span>Total Liabilities</span>
                                <span>{formatCurrency(totalLiabilities)}</span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Equity</h3>
                        <div className="font-mono text-sm space-y-1.5">
                            {(equityAccounts || []).map((a: any) => (
                                <div key={a.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>{a.name}</span>
                                    <span>{formatCurrency(a.current_balance)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-slate-500 dark:text-slate-400 italic">
                                <span>Current Period Net Income (unclosed)</span>
                                <span>{formatCurrency(netIncomeUnclosed)}</span>
                            </div>
                            <div className="flex justify-between pt-2 mt-2 border-t-2 border-slate-300 dark:border-slate-600 font-semibold text-slate-900 dark:text-white">
                                <span>Total Equity</span>
                                <span>{formatCurrency(totalEquity)}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            <GlassCard className="mt-6">
                <div className={`flex items-center gap-2 text-sm font-medium ${balances ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {balances ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {balances
                        ? `Balanced — Assets (${formatCurrency(totalAssets)}) = Liabilities + Equity (${formatCurrency(totalLiabilities + totalEquity)})`
                        : `Out of balance — Assets (${formatCurrency(totalAssets)}) ≠ Liabilities + Equity (${formatCurrency(totalLiabilities + totalEquity)})`}
                </div>
            </GlassCard>
        </AppLayout>
    );
}
