import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, DataTable } from '@/Components/ui';
import ProcurementTabs from '@/Components/ProcurementTabs';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function ProcurementOrdersIndex() {
    const { purchase_orders } = usePage().props as any;
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
        { header: 'Total', className: 'text-right', render: (po: any) => `$${parseFloat(po.total_amount || 0).toFixed(2)}` },
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
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="glass-input"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="ordered">Ordered</option>
                        <option value="purchased">Purchased</option>
                        <option value="inspected">Inspected</option>
                        <option value="closed">Closed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
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
                                    <span className="text-slate-500">Total: ${parseFloat(po.total_amount || 0).toFixed(2)}</span>
                                    <Link href={`/procurement/${po.id}`} className="text-blue-600 font-medium">View</Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-4">No purchase orders found</p>
                    )}
                </div>
            </GlassCard>
        </AppLayout>
    );
}
