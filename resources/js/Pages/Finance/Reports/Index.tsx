import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link } from '@inertiajs/react';
import { TrendingUp, Scale, Receipt } from 'lucide-react';

const REPORTS = [
    { name: 'Profit & Loss', href: '/finance/reports/profit-loss', icon: TrendingUp, description: 'Income and expenses for a period, with net profit' },
    { name: 'Balance Sheet', href: '/finance/reports/balance-sheet', icon: Scale, description: 'Assets, liabilities, and equity as of a given date' },
    { name: 'Transaction Report', href: '/finance/reports/transactions', icon: Receipt, description: 'Every recorded transaction, filterable by date, type, category, and account' },
];

export default function ReportsIndex() {
    return (
        <AppLayout>
            <Head title="Financial Reports" />

            <PageHeader title="Financial Reports" subtitle="Profit & loss, balance sheet, and transaction history" />

            <div className="grid md:grid-cols-3 gap-6">
                {REPORTS.map((report) => (
                    <Link key={report.href} href={report.href}>
                        <GlassCard className="h-full hover:ring-2 hover:ring-indigo-400 transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                                <report.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{report.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{report.description}</p>
                        </GlassCard>
                    </Link>
                ))}
            </div>
        </AppLayout>
    );
}
