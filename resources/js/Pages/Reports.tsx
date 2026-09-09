import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
    const { ordersReports, productionReports } = usePage().props as any;
    const [activeTab, setActiveTab] = useState<'orders' | 'production'>('orders');

    return (
        <AppLayout>
            <Head title="Reports" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reports</h1>
                <p className="text-sm text-slate-500 dark:text-slate-300">View reports for orders and production</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                        activeTab === 'orders'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    Orders Reports
                </button>
                <button
                    onClick={() => setActiveTab('production')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                        activeTab === 'production'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    Production Reports
                </button>
            </div>

            {/* Orders Reports Tab */}
            {activeTab === 'orders' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Orders Report</h2>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                            View detailed reports on all orders including status, values, and trends.
                        </p>
                        <Link
                            href="/orders/reports"
                            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            View Orders Reports
                        </Link>
                    </div>
                </div>
            )}

            {/* Production Reports Tab */}
            {activeTab === 'production' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Production Report</h2>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                            View detailed reports on production jobs including workflow metrics and performance data.
                        </p>
                        <Link
                            href="/production/reports"
                            className="inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                        >
                            View Production Reports
                        </Link>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
