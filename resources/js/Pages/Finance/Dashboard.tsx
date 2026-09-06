import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Wallet, Banknote, Smartphone, Boxes, TrendingUp, TrendingDown, Scale, Receipt, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useCurrency } from '@/Utils/currency';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function FinanceDashboard() {
    const { indicators, recentTransactions, incomeVsExpense, expenseBreakdown, revenueByCategory } = usePage().props as any;
    const formatCurrency = useCurrency();

    const cards = [
        { label: 'Cash Balance', value: indicators?.cash_balance, icon: Banknote, color: 'indigo' },
        { label: 'Bank Balance', value: indicators?.bank_balance, icon: Wallet, color: 'indigo' },
        { label: 'Mobile Money', value: indicators?.mobile_money_balance, icon: Smartphone, color: 'indigo' },
        { label: 'Total Assets', value: indicators?.total_assets, icon: Boxes, color: 'slate' },
        { label: 'Income This Month', value: indicators?.income_this_month, icon: TrendingUp, color: 'green' },
        { label: 'Expenses This Month', value: indicators?.expense_this_month, icon: TrendingDown, color: 'red' },
        { label: 'Net Profit', value: indicators?.net_profit, icon: Scale, color: (indicators?.net_profit ?? 0) >= 0 ? 'green' : 'red' },
    ];

    const colorClasses: Record<string, string> = {
        indigo: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
        slate: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
        green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
        red: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
    };

    return (
        <AppLayout>
            <Head title="Finance Dashboard" />

            <PageHeader title="Finance Dashboard" subtitle="A high-level view of cash, income, expenses, and assets" />

            <div className="grid md:grid-cols-4 gap-4 mb-6">
                {cards.map((card) => (
                    <GlassCard key={card.label}>
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[card.color]}`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 dark:text-slate-500">{card.label}</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(card.value)}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}

                <GlassCard className="opacity-60">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Accounts Receivable</p>
                            <p className="text-sm font-medium text-slate-400">Coming soon</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="opacity-60">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Accounts Payable</p>
                            <p className="text-sm font-medium text-slate-400">Coming soon</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                <GlassCard className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Income vs Expenses</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={incomeVsExpense || []}>
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '12px' }}
                            />
                            <Legend />
                            <Bar dataKey="income" name="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Expense Breakdown</h3>
                    {(expenseBreakdown || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" strokeWidth={0}>
                                    {(expenseBreakdown || []).map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-slate-400 py-16 text-center">No expenses recorded this month</p>
                    )}
                </GlassCard>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue by Category</h3>
                    {(revenueByCategory || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" strokeWidth={0}>
                                    {(revenueByCategory || []).map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-slate-400 py-16 text-center">No income recorded this month</p>
                    )}
                </GlassCard>

                <GlassCard className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
                        <Link href="/finance" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
                    </div>
                    {(recentTransactions || []).length > 0 ? (
                        <div className="space-y-2">
                            {recentTransactions.map((t: any) => (
                                <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{t.category}</p>
                                        <p className="text-xs text-slate-400">{t.date} · {t.financial_account?.name || '-'}</p>
                                    </div>
                                    <p className={`font-mono font-medium text-sm ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={Receipt} title="No transactions yet" description="Recorded income and expenses will show up here" />
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
