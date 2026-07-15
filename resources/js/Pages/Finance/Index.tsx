import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState } from '@/Components/ui';
import { TableLoading, CardLoading, StatCardSkeleton } from '@/Components/ui/Loading';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, Pencil, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

export default function FinanceIndex() {
    const { transactions, stats } = usePage().props as { transactions: { data: any[] }, stats: { total_income: number, total_expense: number, balance: number } };
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const isLoading = false;

    const categories = [...new Set((transactions?.data || []).map((t: any) => t.category).filter(Boolean))];

    const filteredTransactions = (transactions?.data || []).filter((t: any) => {
        const matchSearch = !search || 
            t.description?.toLowerCase().includes(search.toLowerCase()) || 
            t.reference?.toLowerCase().includes(search.toLowerCase()) ||
            t.category?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || t.type === typeFilter;
        return matchSearch && matchType;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    return (
        <AppLayout>
            <Head title="Finance" />

            <PageHeader 
                title="Finance" 
                subtitle="Track income and expenses"
                action={
                    <Link href="/finance/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Transaction
                    </Link>
                }
            />

            {/* Stats Cards */}
            {isLoading ? (
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 dark:text-slate-500">Income</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats?.total_income)}</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 dark:text-slate-500">Expense</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(stats?.total_expense)}</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 dark:text-slate-500">Balance</p>
                                <p className={`text-xl font-bold ${(stats?.balance || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatCurrency(stats?.balance)}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Filters */}
            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <input 
                                type="text"
                                placeholder="Search transactions..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                    </div>
                    <select 
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="glass-input max-w-[150px]"
                    >
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>
            </GlassCard>

            {/* Transactions Table */}
            <GlassCard className="overflow-hidden">
                {isLoading ? (
                    <TableLoading rows={5} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Category</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Description</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Reference</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Amount</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction: any, index: number) => (
                                        <tr key={transaction.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" style={{ animationDelay: `${index * 50}ms` }}>
                                            <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{transaction.date}</td>
                                            <td className="py-3 px-4">
                                                <span className={`status-badge ${transaction.type === 'income' ? 'status-active' : 'status-inactive'}`}>
                                                    {transaction.type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{transaction.category}</td>
                                            <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{transaction.description || '-'}</td>
                                            <td className="py-3 px-4 text-sm text-slate-400 dark:text-slate-500">{transaction.reference || '-'}</td>
                                            <td className={`py-3 px-4 text-right font-mono font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/finance/${transaction.id}/edit`} className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors group">
                                                        <Pencil className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                                    </Link>
                                                    <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600 dark:hover:text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-8">
                                            <EmptyState 
                                                icon={DollarSign}
                                                title="No transactions found"
                                                description="Get started by adding your first transaction"
                                                action={
                                                    <Link href="/finance/create" className="glass-button">
                                                        <Plus className="w-4 h-4 mr-2" /> Add Transaction
                                                    </Link>
                                                }
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>
        </AppLayout>
    );
}