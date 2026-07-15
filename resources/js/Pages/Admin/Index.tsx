import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Users, UserCheck, Shield, Building2, Settings, Plus, ArrowRight } from 'lucide-react';

export default function AdminIndex() {
    const { total_users, active_users, total_roles, total_departments, recent_activity } = usePage().props as any;

    const stats = [
        { label: 'Total Users', value: total_users || 0, icon: Users, color: 'blue', href: '/admin/users' },
        { label: 'Active Users', value: active_users || 0, icon: UserCheck, color: 'green', href: '/admin/users' },
        { label: 'Roles', value: total_roles || 0, icon: Shield, color: 'purple', href: '/admin/roles' },
        { label: 'Departments', value: total_departments || 0, icon: Building2, color: 'orange', href: '/admin/settings' },
    ];

    const colorClasses: Record<string, { bg: string; icon: string }> = {
        blue: { bg: 'bg-blue-500/10 dark:bg-blue-500/15', icon: 'text-blue-600 dark:text-blue-400' },
        green: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', icon: 'text-emerald-600 dark:text-emerald-400' },
        purple: { bg: 'bg-purple-500/10 dark:bg-purple-500/15', icon: 'text-purple-600 dark:text-purple-400' },
        orange: { bg: 'bg-orange-500/10 dark:bg-orange-500/15', icon: 'text-orange-600 dark:text-orange-400' },
    };

    const managementSections = [
        {
            title: 'User Management',
            description: 'Add, edit, and manage system users, roles, and permissions.',
            icon: Users,
            color: 'blue',
            href: '/admin/users',
        },
        {
            title: 'Roles & Permissions',
            description: 'Configure roles and control what users can access across the system.',
            icon: Shield,
            color: 'purple',
            href: '/admin/roles',
        },
        {
            title: 'System Settings',
            description: 'Manage UOM, categories, attributes, departments, and general settings.',
            icon: Settings,
            color: 'orange',
            href: '/admin/settings',
        },
    ];

    return (
        <AppLayout>
            <Head title="Administration" />

            <PageHeader
                title="Administration"
                subtitle="System settings and management"
            />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.href}>
                        <GlassCard variant="interactive">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[stat.color].bg}`}>
                                    <stat.icon className={`w-6 h-6 ${colorClasses[stat.color].icon}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                </div>
                            </div>
                        </GlassCard>
                    </Link>
                ))}
            </div>

            {/* Management Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {managementSections.map((section) => (
                    <Link key={section.title} href={section.href}>
                        <GlassCard variant="interactive" className="h-full">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[section.color].bg}`}>
                                    <section.icon className={`w-6 h-6 ${colorClasses[section.color].icon}`} />
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{section.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{section.description}</p>
                        </GlassCard>
                    </Link>
                ))}
            </div>

            {/* Bottom Row: Quick Actions + Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/admin/users/create" className="glass-button text-center">
                            <Plus className="w-4 h-4 inline mr-1" /> Add User
                        </Link>
                        <Link href="/admin/roles" className="glass-button text-center">
                            Manage Roles
                        </Link>
                        <Link href="/admin/settings" className="glass-button text-center">
                            Settings
                        </Link>
                        <Link href="/admin/roles/create" className="glass-button text-center">
                            New Role
                        </Link>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
                    {(recent_activity || []).length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                            {recent_activity.map((log: any) => (
                                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-white/[0.03] rounded-lg">
                                    <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                                        {(log.user?.name || 'S').charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{log.action}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                            {log.user?.name || 'System'} &middot; {new Date(log.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 dark:text-slate-500 text-center py-8">No recent activity</p>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
