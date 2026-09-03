import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, DataTable, Pagination } from '@/Components/ui';
import ProcurementTabs from '@/Components/ProcurementTabs';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';

export default function ProcurementOrdersIndex() {
    const { purchase_orders } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredPOs = (purchase_orders?.data || []).filter((po: any) => {
        const matchSearch = !search || po.po_number.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || po.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const columns = [
        { header: 'PO #', key: 'po_number', className: 'font-mono' },
        { header: 'Supplier', render: (po: any) => po.supplier?.company_name },
        { header: 'Status', render: (po: any) => <StatusBadge status={po.status} /> },
        { header: 'Expected', render: (po: any) => po.expected_date ? new Date(po.expected_date).toLocaleDateString() : '-' },
        { header: 'Total', className: 'text-right', render: (po: any) => formatCurrency(po.total_amount || 0) },
        { header: 'Actions', className: 'text-right', render: (po: any) => <Link href={`/procurement/${po.id}`} className="text-blue-600 hover:underline">View</Link> }
    ];

    return (
        <AppLayout>
            <Head title="Purchase Orders" />

            <PageHeader
                title="Purchase Orders"
                subtitle="Manage supplier purchase orders"
                action={
                    <Link href="/procurement/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New PO
                    </Link>
                }
            />

            <ProcurementTabs activeTab="orders" />

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search POs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'all', label: 'All Status' },
                            { value: 'draft', label: 'Draft' },
                            { value: 'ordered', label: 'Ordered' },
                            { value: 'purchased', label: 'Purchased' },
                            { value: 'inspected', label: 'Inspected' },
                            { value: 'closed', label: 'Closed' },
                            { value: 'cancelled', label: 'Cancelled' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(opt.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                    statusFilter === opt.value
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden p-0">
                <div className="hidden md:block">
                    <DataTable columns={columns} data={filteredPOs} emptyMessage="No purchase orders found" />
                </div>
                <div className="md:hidden space-y-3 p-4">
                    {filteredPOs.length > 0 ? (
                        filteredPOs.map((po: any) => (
                            <div key={po.id} className="glass-card p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-mono font-medium">{po.po_number}</p>
                                    <StatusBadge status={po.status} />
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{po.supplier?.company_name}</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Total: {formatCurrency(po.total_amount || 0)}</span>
                                    <Link href={`/procurement/${po.id}`} className="text-blue-600 font-medium">View</Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-4">No purchase orders found</p>
                    )}
                </div>
            </GlassCard>
            <Pagination meta={purchase_orders} />
        </AppLayout>
    );
}
