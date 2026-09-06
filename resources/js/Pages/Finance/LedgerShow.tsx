import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

export default function LedgerShow() {
    const { entry } = usePage().props as any;
    const formatCurrency = useCurrency();

    const lines = entry?.lines || [];
    const totalDebit = lines.reduce((sum: number, l: any) => sum + Number(l.debit || 0), 0);
    const totalCredit = lines.reduce((sum: number, l: any) => sum + Number(l.credit || 0), 0);

    return (
        <AppLayout>
            <Head title={`Ledger · ${entry?.reference}`} />

            <div className="mb-6">
                <Link href="/finance/ledger" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to General Ledger
                </Link>
            </div>

            <PageHeader title={entry?.reference} subtitle={entry?.description || entry?.type} />

            {entry?.reversed_by && (
                <GlassCard className="mb-6 border border-slate-300 dark:border-slate-600">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        This entry was reversed by{' '}
                        <Link href={`/finance/ledger/${entry.reversed_by.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                            {entry.reversed_by.reference}
                        </Link>.
                    </p>
                </GlassCard>
            )}
            {entry?.reverses && (
                <GlassCard className="mb-6 border border-amber-300 dark:border-amber-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        This is a reversal of{' '}
                        <Link href={`/finance/ledger/${entry.reverses.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                            {entry.reverses.reference}
                        </Link>.
                    </p>
                </GlassCard>
            )}

            <GlassCard className="mb-6">
                <dl className="grid md:grid-cols-3 gap-4 text-sm">
                    <div><dt className="text-slate-400">Date</dt><dd className="text-slate-900 dark:text-white font-medium">{entry?.date}</dd></div>
                    <div><dt className="text-slate-400">Type</dt><dd className="text-slate-900 dark:text-white font-medium capitalize">{entry?.type}</dd></div>
                    <div><dt className="text-slate-400">Recorded By</dt><dd className="text-slate-900 dark:text-white font-medium">{entry?.created_by?.name || '-'}</dd></div>
                </dl>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Journal Lines</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Account</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Description</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Debit</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((line: any) => (
                                <tr key={line.id} className="border-b border-slate-100 dark:border-slate-700/50">
                                    <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">{line.account?.name}</td>
                                    <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{line.description || '-'}</td>
                                    <td className="py-3 px-4 text-right font-mono text-sm text-slate-700 dark:text-slate-300">{Number(line.debit) > 0 ? formatCurrency(line.debit) : '-'}</td>
                                    <td className="py-3 px-4 text-right font-mono text-sm text-slate-700 dark:text-slate-300">{Number(line.credit) > 0 ? formatCurrency(line.credit) : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-200 dark:border-slate-700">
                                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white" colSpan={2}>Total</td>
                                <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(totalDebit)}</td>
                                <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(totalCredit)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </GlassCard>
        </AppLayout>
    );
}
