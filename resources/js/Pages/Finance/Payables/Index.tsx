import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, Pagination } from '@/Components/ui';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Plus, ClipboardList, AlertTriangle } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    partially_paid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

export default function PayablesIndex() {
    const { bills, stats, filters } = usePage().props as any;
    const formatCurrency = useCurrency();

    const setStatus = (status: string) => {
        router.get('/finance/payables', { status }, { preserveState: true });
    };

    const list = bills?.data || [];

    return (
        <AppLayout>
            <Head title="Accounts Payable" />

            <PageHeader
                title="Accounts Payable"
                subtitle="Bills and money you owe to suppliers"
                action={
                    <Link href="/finance/payables/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Bill
                    </Link>
                }
            />

            <div className="grid md:grid-cols-2 gap-4 mb-6">
                <GlassCard>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Total Outstanding</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats?.outstanding_total)}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Overdue Bills</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.overdue_count ?? 0}</p>
                </GlassCard>
            </div>

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-2">
                    {['all', 'draft', 'submitted', 'partially_paid', 'paid', 'cancelled'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                (filters?.status || 'all') === s
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20'
                            }`}
                        >
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Bill #</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Supplier</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Due Date</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Total</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Paid</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Balance</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length > 0 ? (
                                list.map((bill: any) => (
                                    <tr key={bill.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-3 px-4 text-sm font-mono">
                                            <Link href={`/finance/payables/${bill.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                {bill.bill_number}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{bill.supplier?.company_name}</td>
                                        <td className={`py-3 px-4 text-sm ${bill.is_overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {bill.due_date} {bill.is_overdue && '(overdue)'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-sm text-slate-700 dark:text-slate-300">{formatCurrency(bill.subtotal)}</td>
                                        <td className="py-3 px-4 text-right font-mono text-sm text-slate-500 dark:text-slate-400">{formatCurrency(bill.amount_paid)}</td>
                                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 dark:text-white">{formatCurrency(bill.subtotal - bill.amount_paid)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-3 py-1 rounded-full ${STATUS_STYLES[bill.status]}`}>{bill.status.replace('_', ' ')}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-8">
                                        <EmptyState icon={ClipboardList} title="No bills yet" description="Create your first bill to start tracking payables" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            <Pagination meta={bills} />
        </AppLayout>
    );
}
