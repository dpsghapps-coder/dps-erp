import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, DataTable } from '@/Components/ui';
import ProcurementTabs from '@/Components/ProcurementTabs';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, FileText } from 'lucide-react';
import { useState } from 'react';

export default function PurchaseRequestsIndex() {
    const { purchaseRequests, filters, pendingCount, deptApprovedCount } = usePage().props as any;
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    const filteredPRs = (purchaseRequests?.data || []).filter((pr: any) => {
        const matchSearch = !search || pr.pr_number.toLowerCase().includes(search.toLowerCase()) ||
            pr.requester?.name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || pr.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const columns = [
        { header: 'PR #', key: 'pr_number', className: 'font-mono' },
        { header: 'Requester', render: (pr: any) => pr.requester?.name },
        { header: 'Department', key: 'department' },
        { header: 'Priority', render: (pr: any) => (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                pr.priority === 'Emergency' ? 'bg-red-100 text-red-800' :
                pr.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                pr.priority === 'Normal' ? 'bg-blue-100 text-blue-800' :
                'bg-slate-100 text-slate-800'
            }`}>{pr.priority}</span>
        )},
        { header: 'Status', render: (pr: any) => <StatusBadge status={pr.status} /> },
        { header: 'Date', render: (pr: any) => new Date(pr.request_date).toLocaleDateString() },
        { header: 'Actions', className: 'text-right', render: (pr: any) => (
            <Link href={`/procurement/purchase-requests/${pr.id}`} className="text-blue-600 hover:underline">View</Link>
        )},
    ];

    const handleSearch = (value: string) => {
        setSearch(value);
        const params = new URLSearchParams(window.location.search);
        if (value) params.set('search', value);
        else params.delete('search');
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        const params = new URLSearchParams(window.location.search);
        if (status !== 'all') params.set('status', status);
        else params.delete('status');
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    };

    return (
        <AppLayout>
            <Head title="Purchase Requests" />

            <PageHeader
                title="Purchase Requests"
                subtitle="Manage procurement requests"
                action={
                    <Link href="/procurement/purchase-requests/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New PR
                    </Link>
                }
            />

            <ProcurementTabs activeTab="requests" />

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search PRs..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'draft', label: 'Draft' },
                            { value: 'pending', label: 'Pending', count: pendingCount },
                            { value: 'dept_approved', label: 'Dept Approved', count: deptApprovedCount },
                            { value: 'finance_approved', label: 'Finance Approved' },
                            { value: 'po_created', label: 'PO Created' },
                            { value: 'rejected', label: 'Rejected' },
                            { value: 'held', label: 'Held' },
                            { value: 'cancelled', label: 'Cancelled' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => handleStatusFilter(tab.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    statusFilter === tab.value
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden p-0">
                <div className="hidden md:block">
                    <DataTable columns={columns} data={filteredPRs} emptyMessage="No purchase requests found" />
                </div>
                <div className="md:hidden space-y-3 p-4">
                    {filteredPRs.length > 0 ? (
                        filteredPRs.map((pr: any) => (
                            <Link
                                key={pr.id}
                                href={`/procurement/purchase-requests/${pr.id}`}
                                className="block glass-card p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        <p className="font-mono font-medium">{pr.pr_number}</p>
                                    </div>
                                    <StatusBadge status={pr.status} />
                                </div>
                                <p className="text-sm text-slate-600 mb-1">{pr.requester?.name} — {pr.department}</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">{new Date(pr.request_date).toLocaleDateString()}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        pr.priority === 'Emergency' ? 'bg-red-100 text-red-800' :
                                        pr.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>{pr.priority}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-4">No purchase requests found</p>
                    )}
                </div>
            </GlassCard>
        </AppLayout>
    );
}
