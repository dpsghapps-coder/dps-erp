import AppLayout from '@/Layouts/AppLayout';
import { GlassCard } from '@/Components/ui';
import InventoryTabs from '@/Components/InventoryTabs';
import { Head, usePage, Link } from '@inertiajs/react';
import { Truck, Package, Boxes, ClipboardList, Building2, AlertTriangle, Layers, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function InventoryIndex() {
    const { totalSuppliers, totalBranches, totalMaterials, activeMaterials, disabledMaterials, stockOnHand, pendingRequisitions, categoriesCount, lowStockCount, materialsByCategory, recentStock, recentRequisitions } = usePage().props as any;

    const cards = [
        { label: 'Suppliers', value: totalSuppliers, icon: Truck, href: '/inventory/suppliers', color: 'text-blue-600 bg-blue-50' },
        { label: 'Supplier Branches', value: totalBranches, icon: Building2, href: '/inventory/suppliers', color: 'text-cyan-600 bg-cyan-50' },
        { label: 'Total Materials', value: totalMaterials, icon: Package, href: '/inventory/materials', color: 'text-purple-600 bg-purple-50' },
        { label: 'Active', value: activeMaterials, icon: CheckCircle, href: '/inventory/materials', color: 'text-green-600 bg-green-50' },
        { label: 'Disabled', value: disabledMaterials, icon: XCircle, href: '/inventory/materials', color: 'text-slate-600 bg-slate-50' },
        { label: 'Stock on Hand', value: stockOnHand, icon: Boxes, href: '/inventory/stock', color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Low Stock (≤10)', value: lowStockCount, icon: AlertTriangle, href: '/inventory/stock', color: 'text-red-600 bg-red-50' },
        { label: 'Categories', value: categoriesCount, icon: Layers, href: '/admin', color: 'text-amber-600 bg-amber-50' },
        { label: 'Pending Requisitions', value: pendingRequisitions, icon: ClipboardList, href: '/inventory/requisitions', color: 'text-amber-600 bg-amber-50' },
    ];

    return (
        <AppLayout>
            <Head title="Inventory" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
                    <p className="text-sm text-slate-500 mt-1">Overview of your inventory operations</p>
                </div>
            </div>

            <InventoryTabs activeTab="overview" />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {cards.map((card) => (
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

            {/* Materials by Category */}
            {materialsByCategory && materialsByCategory.length > 0 && (
                <GlassCard className="mb-6">
                    <h2 className="text-lg font-semibold mb-4">Materials by Category</h2>
                    <div className="space-y-3">
                        {materialsByCategory.map((cat: any) => {
                            const max = Math.max(...materialsByCategory.map((c: any) => c.total));
                            const pct = (cat.total / max) * 100;
                            return (
                                <div key={cat.item_category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-700">{cat.item_category}</span>
                                        <span className="text-slate-500 font-medium">{cat.total}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            )}

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Stock */}
                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Recent Stock Additions</h2>
                        <Link href="/inventory/stock" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {recentStock.length > 0 ? (
                        <div className="space-y-3">
                            {recentStock.map((stock: any) => (
                                <div key={stock.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">{stock.product?.item_name || 'Unknown'}</p>
                                        <p className="text-xs text-slate-500">
                                            {stock.qty_purchased} units • {stock.date_purchased ? new Date(stock.date_purchased).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(stock.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">No stock records yet</p>
                    )}
                </GlassCard>

                {/* Recent Requisitions */}
                <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Recent Requisitions</h2>
                        <Link href="/inventory/requisitions" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {recentRequisitions.length > 0 ? (
                        <div className="space-y-3">
                            {recentRequisitions.map((req: any) => (
                                <div key={req.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">{req.product?.item_name || 'Unknown'}</p>
                                        <p className="text-xs text-slate-500">
                                            {req.qty_requested} units • {req.requested_by || 'Unknown'}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">No requisitions yet</p>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
