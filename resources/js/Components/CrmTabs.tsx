import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Users, UserPlus, Globe } from 'lucide-react';

const tabs = [
    { name: 'Dashboard', href: '/crm/reports', icon: LayoutDashboard, key: 'dashboard' },
    { name: 'Clients & Accounts', href: '/crm', icon: Users, key: 'clients' },
    { name: 'Sales Management', href: '/crm/leads', icon: UserPlus, key: 'sales' },
    { name: 'Marketing', href: '/marketing', icon: Globe, key: 'marketing', permission: 'marketing' },
];

export default function CrmTabs({ activeTab }: { activeTab: string }) {
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
                                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </Link>
                ))}
        </div>
    );
}
