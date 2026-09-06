import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, Pagination } from '@/Components/ui';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Plus, Receipt, AlertTriangle } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    partially_paid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

export default function ReceivablesIndex() {
    const { invoices, stats, filters } = usePage().props as any;
    const formatCurrency = useCurrency();

    const setStatus = (status: string) => {
        router.get('/finance/receivables', { status }, { preserveState: true });
    };

    const list = invoices?.data || [];

    return (
        <AppLayout>
            <Head title="Accounts Receivable" />

            <PageHeader
                title="Accounts Receivable"
                subtitle="Invoices and money owed to you by customers"
                action={
                    <Link href="/finance/receivables/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Invoice
                    </Link>
                }
            />

            <div className="grid md:grid-cols-2 gap-4 mb-6">
                <GlassCard>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Total Outstanding</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats?.outstanding_total)}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Overdue Invoices</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.overdue_count ?? 0}</p>
                </GlassCard>
            </div>

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-2">
                    {['all', 'draft', 'sent', 'partially_paid', 'paid', 'cancelled'].map((s) => (
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
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Invoice #</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Client</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Due Date</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Total</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Paid</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Balance</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length > 0 ? (
                                list.map((invoice: any) => (
                                    <tr key={invoice.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-3 px-4 text-sm font-mono">
                                            <Link href={`/finance/receivables/${invoice.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                {invoice.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{invoice.client?.company_name}</td>
                                        <td className={`py-3 px-4 text-sm ${invoice.is_overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {invoice.due_date} {invoice.is_overdue && '(overdue)'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-sm text-slate-700 dark:text-slate-300">{formatCurrency(invoice.subtotal)}</td>
                                        <td className="py-3 px-4 text-right font-mono text-sm text-slate-500 dark:text-slate-400">{formatCurrency(invoice.amount_paid)}</td>
                                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 dark:text-white">{formatCurrency(invoice.subtotal - invoice.amount_paid)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-3 py-1 rounded-full ${STATUS_STYLES[invoice.status]}`}>{invoice.status.replace('_', ' ')}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-8">
                                        <EmptyState icon={Receipt} title="No invoices yet" description="Create your first invoice to start tracking receivables" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            <Pagination meta={invoices} />
        </AppLayout>
    );
}
