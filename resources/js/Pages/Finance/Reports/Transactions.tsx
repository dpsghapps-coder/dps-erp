import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, Pagination } from '@/Components/ui';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { ArrowLeft, Receipt } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';

export default function TransactionReport() {
    const { transactions, financialAccounts, filters } = usePage().props as any;
    const formatCurrency = useCurrency();

    const [from, setFrom] = useState(filters?.from || '');
    const [to, setTo] = useState(filters?.to || '');
    const [type, setType] = useState(filters?.type || 'all');
    const [category, setCategory] = useState(filters?.category || '');
    const [financialAccountId, setFinancialAccountId] = useState(filters?.financial_account_id || '');

    const applyFilters = () => {
        router.get('/finance/reports/transactions', {
            from, to, type, category, financial_account_id: financialAccountId,
        }, { preserveState: true });
    };

    const list = transactions?.data || [];

    return (
        <AppLayout>
            <Head title="Transaction Report" />

            <div className="mb-6">
                <Link href="/finance/reports" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Reports
                </Link>
            </div>

            <PageHeader title="Transaction Report" subtitle="Every recorded income and expense, filterable by date, type, category, and account" />

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
                    <div>
                        <label className="block text-sm font-medium mb-2">Type</label>
                        <select className="glass-input" value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <input className="glass-input" placeholder="Search category..." value={category} onChange={(e) => setCategory(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Account</label>
                        <select className="glass-input" value={financialAccountId} onChange={(e) => setFinancialAccountId(e.target.value)}>
                            <option value="">All Accounts</option>
                            {(financialAccounts || []).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <button onClick={applyFilters} className="glass-button">Filter</button>
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Category</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Account</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Description</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Recorded By</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length > 0 ? (
                                list.map((t: any) => (
                                    <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{t.date}</td>
                                        <td className="py-3 px-4">
                                            <span className={`status-badge ${t.type === 'income' ? 'status-active' : 'status-inactive'}`}>{t.type}</span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{t.category}</td>
                                        <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{t.financial_account?.name || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{t.description || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-slate-400">{t.created_by?.name || '-'}</td>
                                        <td className={`py-3 px-4 text-right font-mono font-medium ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-8">
                                        <EmptyState icon={Receipt} title="No transactions match these filters" description="Try widening the date range or clearing a filter" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            <Pagination meta={transactions} />
        </AppLayout>
    );
}
