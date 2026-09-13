import { Link } from '@inertiajs/react';
import { User, Briefcase, CalendarDays, TrendingUp, Flag, Wrench, ShoppingBag, ListChecks } from 'lucide-react';

const TABS = [
    { name: 'Overview', href: '/profile', icon: User },
    { name: 'Employee Details', href: '/profile/employee', icon: Briefcase },
    { name: 'Leave', href: '/profile/leave', icon: CalendarDays },
    { name: 'Performance', href: '/profile/performance', icon: TrendingUp },
    { name: 'My Tasks', href: '/profile/tasks', icon: ListChecks },
    { name: 'Purchase Request', href: '/procurement/purchase-requests/create', icon: ShoppingBag },
    { name: 'Report an Issue', href: '/profile/report-issue', icon: Flag },
    { name: 'Technical Report', href: '/profile/technical-report', icon: Wrench },
];

export default function ProfileNav() {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="flex gap-1 mb-6 bg-slate-50 dark:bg-white/5 rounded-lg p-1 w-fit flex-wrap">
            {TABS.map((tab) => {
                const active = currentPath === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            active
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
