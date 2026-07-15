import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, StatusBadge } from '@/Components/ui';
import ProcurementTabs from '@/Components/ProcurementTabs';
import { Head, usePage, Link } from '@inertiajs/react';
import { FileText, ShoppingCart, Truck, AlertTriangle, Clock, CheckCircle, Pause, Eye, ArrowRight, Package } from 'lucide-react';

export default function ProcurementIndex() {
    const { totalPrs, pendingPrs, deptApprovedPrs, financeApprovedPrs, poCreatedPrs, heldPrs, totalPos, draftPos, activePos, closedPos, totalSuppliers, recentPrs, recentPos } = usePage().props as any;

    const prCards = [
        { label: 'Total PRs', value: totalPrs, icon: FileText, href: '/procurement/purchase-requests', color: 'text-blue-600 bg-blue-50' },
        { label: 'Pending', value: pendingPrs, icon: Clock, href: '/procurement/purchase-requests?status=pending', color: 'text-amber-600 bg-amber-50' },
        { label: 'Dept Approved', value: deptApprovedPrs, icon: CheckCircle, href: '/procurement/purchase-requests?status=dept_approved', color: 'text-green-600 bg-green-50' },
        { label: 'Finance Approved', value: financeApprovedPrs, icon: CheckCircle, href: '/procurement/purchase-requests?status=finance_approved', color: 'text-emerald-600 bg-emerald-50' },
        { label: 'PO Created', value: poCreatedPrs, icon: ShoppingCart, href: '/procurement/purchase-requests?status=po_created', color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Held', value: heldPrs, icon: Pause, href: '/procurement/purchase-requests?status=held', color: 'text-purple-600 bg-purple-50' },
    ];

    const poCards = [
        { label: 'Total POs', value: totalPos, icon: ShoppingCart, href: '/procurement/orders', color: 'text-blue-600 bg-blue-50' },
        { label: 'Draft', value: draftPos, icon: FileText, href: '/procurement/orders', color: 'text-slate-600 bg-slate-50' },
        { label: 'Active', value: activePos, icon: Package, href: '/procurement/orders', color: 'text-orange-600 bg-orange-50' },
        { label: 'Closed', value: closedPos, icon: CheckCircle, href: '/procurement/orders', color: 'text-green-600 bg-green-50' },
        { label: 'Active Suppliers', value: totalSuppliers, icon: Truck, href: '/procurement/goods', color: 'text-cyan-600 bg-cyan-50' },
    ];

    return (
        <AppLayout>
            <Head title="Procurement" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Procurement</h1>
                    <p className="text-sm text-slate-500 mt-1">Overview of procurement operations</p>
                </div>
            </div>

            <ProcurementTabs activeTab="overview" />

            {/* Purchase Request Stats */}
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Purchase Requests</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {prCards.map((card) => (
                        <Link key={card.label} href={card.href} className="block">
                            <GlassCard className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2.5 rounded-lg ${card.color}`}>
                                        <card.icon className="w-5 h-5" />
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 mt-3">{card.value}</p>
                                <p className="text-sm text-slate-500 mt-1">{card.label}</p>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Purchase Order Stats */}
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Purchase Orders</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {poCards.map((card) => (
                        <Link key={card.label} href={card.href} className="block">
                            <GlassCard className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2.5 rounded-lg ${card.color}`}>
                                        <card.icon className="w-5 h-5" />
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 mt-3">{card.value}</p>
                                <p className="text-sm text-slate-500 mt-1">{card.label}</p>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent PRs */}
                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Recent Purchase Requests</h2>
                        <Link href="/procurement/purchase-requests" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {recentPrs.length > 0 ? (
                        <div className="space-y-3">
                            {recentPrs.map((pr: any) => (
                                <Link
                                    key={pr.id}
                                    href={`/procurement/purchase-requests/${pr.id}`}
                                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm font-mono">{pr.pr_number}</p>
                                        <p className="text-xs text-slate-500">
                                            {pr.department} &middot; {pr.requester?.name || 'Unknown'}
                                        </p>
                                    </div>
                                    <StatusBadge status={pr.status} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">No purchase requests yet</p>
                    )}
                </GlassCard>

                {/* Recent POs */}
                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Recent Purchase Orders</h2>
                        <Link href="/procurement/orders" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {recentPos.length > 0 ? (
                        <div className="space-y-3">
                            {recentPos.map((po: any) => (
                                <Link
                                    key={po.id}
                                    href={`/procurement/${po.id}`}
                                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm font-mono">{po.po_number}</p>
                                        <p className="text-xs text-slate-500">
                                            {po.supplier?.company_name || 'No supplier'} &middot; ${parseFloat(po.total_amount || 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <StatusBadge status={po.status} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">No purchase orders yet</p>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
