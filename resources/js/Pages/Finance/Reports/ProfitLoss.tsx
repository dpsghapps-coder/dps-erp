import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';

export default function ProfitLoss() {
    const { incomeAccounts, expenseAccounts, totalIncome, totalExpense, netProfit, filters } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [from, setFrom] = useState(filters?.from || '');
    const [to, setTo] = useState(filters?.to || '');

    const applyFilters = () => {
        router.get('/finance/reports/profit-loss', { from, to }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Profit & Loss" />

            <div className="mb-6">
                <Link href="/finance/reports" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Reports
                </Link>
            </div>

            <PageHeader title="Profit & Loss" subtitle={`For the period ${filters?.from} to ${filters?.to}`} />

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
                    <button onClick={applyFilters} className="glass-button">Apply</button>
                </div>
            </GlassCard>

            <GlassCard>
                <div className="max-w-2xl mx-auto font-mono text-sm">
                    <h3 className="text-center text-lg font-sans font-semibold text-slate-900 dark:text-white mb-4">Income</h3>
                    {(incomeAccounts || []).length > 0 ? (
                        (incomeAccounts || []).map((a: any) => (
                            <div key={a.id} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-300">
                                <span>{a.name}</span>
                                <span>{formatCurrency(a.current_balance)}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 py-4 font-sans">No income recorded in this period</p>
                    )}
                    <div className="flex justify-between py-2 mt-1 border-t-2 border-slate-300 dark:border-slate-600 font-semibold text-slate-900 dark:text-white">
                        <span>Total Income</span>
                        <span>{formatCurrency(totalIncome)}</span>
                    </div>

                    <h3 className="text-center text-lg font-sans font-semibold text-slate-900 dark:text-white mt-8 mb-4">Expenses</h3>
                    {(expenseAccounts || []).length > 0 ? (
                        (expenseAccounts || []).map((a: any) => (
                            <div key={a.id} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-300">
                                <span>{a.name}</span>
                                <span>{formatCurrency(a.current_balance)}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 py-4 font-sans">No expenses recorded in this period</p>
                    )}
                    <div className="flex justify-between py-2 mt-1 border-t-2 border-slate-300 dark:border-slate-600 font-semibold text-slate-900 dark:text-white">
                        <span>Total Expenses</span>
                        <span>{formatCurrency(totalExpense)}</span>
                    </div>

                    <div className={`flex justify-between py-3 mt-6 border-t-4 border-double border-slate-400 dark:border-slate-500 text-base font-sans font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <span>NET {netProfit >= 0 ? 'PROFIT' : 'LOSS'}</span>
                        <span>{formatCurrency(Math.abs(netProfit))}</span>
                    </div>
                </div>
            </GlassCard>
        </AppLayout>
    );
}
