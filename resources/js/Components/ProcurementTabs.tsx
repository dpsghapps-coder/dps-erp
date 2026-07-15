import { Link } from '@inertiajs/react';
import { ShoppingBag, Package, FileText, BarChart3 } from 'lucide-react';

const tabs = [
    { name: 'Overview', href: '/procurement', icon: BarChart3, key: 'overview' },
    { name: 'Purchase Requests', href: '/procurement/purchase-requests', icon: FileText, key: 'requests' },
    { name: 'Purchase Orders', href: '/procurement/orders', icon: ShoppingBag, key: 'orders' },
    { name: 'OpEx Items', href: '/procurement/goods', icon: Package, key: 'goods' },
];

export default function ProcurementTabs({ activeTab }: { activeTab: string }) {
    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            {tabs.map((tab) => (
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
