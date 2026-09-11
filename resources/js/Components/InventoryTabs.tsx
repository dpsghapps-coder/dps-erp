import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Truck, Package, Boxes, ClipboardList, ShoppingBag } from 'lucide-react';

const tabs = [
    { name: 'Overview', href: '/inventory', icon: LayoutDashboard, key: 'overview' },
    { name: 'Suppliers', href: '/inventory/suppliers', icon: Truck, key: 'suppliers' },
    { name: 'Materials', href: '/inventory/materials', icon: Package, key: 'materials' },
    { name: 'Procurement', href: '/procurement', icon: ShoppingBag, key: 'procurement', permission: 'procurement' },
    { name: 'Stock', href: '/inventory/stock', icon: Boxes, key: 'stock' },
    { name: 'Requisition', href: '/inventory/requisitions', icon: ClipboardList, key: 'requisition' },
];

export default function InventoryTabs({ activeTab }: { activeTab: string }) {
    const { auth } = usePage().props as any;
    const permissions: string[] = auth?.permissions || [];
    const hasModulePermission = (module: string) =>
        permissions.includes('*') || permissions.some((p) => p.startsWith(module + '.'));

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            {tabs
                .filter((tab) => !tab.permission || hasModulePermission(tab.permission))
                .map((tab) => (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === tab.key
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </Link>
                ))}
        </div>
    );
}
