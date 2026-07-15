import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, StatusBadge } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, Users, Shield } from 'lucide-react';
import { useState } from 'react';

export default function AdminIndex() {
    const { total_users, active_users, recent_activity } = usePage().props;

    return (
        <AppLayout>
            <Head title="Administration" />

            <PageHeader 
                title="Administration" 
                subtitle="System settings and management"
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <GlassCard>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{total_users || 0}</p>
                            <p className="text-sm text-slate-400">Total Users</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{active_users || 0}</p>
                            <p className="text-sm text-slate-400">Active Users</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <Link href="/admin/users" className="flex items-center gap-3 hover:bg-white/5 -m-2 p-2 rounded-lg transition-colors">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="font-medium">User Management</p>
                            <p className="text-sm text-slate-400">Manage users & roles</p>
                        </div>
                    </Link>
                </GlassCard>
                <GlassCard>
                    <Link href="/admin/settings" className="flex items-center gap-3 hover:bg-white/5 -m-2 p-2 rounded-lg transition-colors">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <p className="font-medium">Settings</p>
                            <p className="text-sm text-slate-400">System configuration</p>
                        </div>
                    </Link>
                </GlassCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/admin/users/create" className="glass-button text-center">Add User</Link>
                        <Link href="/admin/roles" className="glass-button text-center">Manage Roles</Link>
                        <Link href="/admin/settings" className="glass-button text-center">Settings</Link>
                        <Link href="/admin/audit-logs" className="glass-button text-center">Audit Logs</Link>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                    {(recent_activity || []).length > 0 ? (
                        <div className="space-y-3">
                            {recent_activity.map((log: any) => (
                                <div key={log.id} className="p-3 bg-white/5 rounded-lg">
                                    <p className="text-sm">{log.action}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {log.user?.name || 'System'} • {new Date(log.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-4">No recent activity</p>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}