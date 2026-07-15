import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, User, Shield, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const STATUS_TABS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

export default function UsersIndex() {
    const { users, departments } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const departmentTabs = [
        { value: 'all', label: 'All Depts' },
        ...(departments || []).map((d: any) => ({ value: d.name, label: d.name })),
    ];

    const filteredUsers = (users?.data || []).filter((u: any) => {
        const matchSearch = !search ||
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role_id == roleFilter;
        const matchStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && u.is_active) ||
            (statusFilter === 'inactive' && !u.is_active);
        const matchDept = departmentFilter === 'all' || u.department === departmentFilter;
        return matchSearch && matchRole && matchStatus && matchDept;
    });

    return (
        <AppLayout>
            <Head title="User Management" />

            <div className="mb-6">
                <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Administration
                </Link>
            </div>

            <PageHeader
                title="User Management"
                subtitle="Manage system users"
                action={
                    <Link href="/admin/users/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add User
                    </Link>
                }
            />

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="glass-input w-full pl-10"
                        />
                    </div>
                </div>
            </GlassCard>

            {/* Status Tabs */}
            <div className="flex gap-1 mb-2 bg-white/5 rounded-lg p-1 w-fit">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setStatusFilter(tab.value)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            statusFilter === tab.value
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Department Tabs */}
            <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1 w-fit">
                {departmentTabs.map((tab: any) => (
                    <button
                        key={tab.value}
                        onClick={() => setDepartmentFilter(tab.value)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            departmentFilter === tab.value
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">User</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Role</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Department</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Manager</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Created</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user: any) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm">
                                                    {user.name?.charAt(0)}
                                                </div>
                                                <p className="font-medium">{user.name}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">{user.email}</td>
                                        <td className="py-3 px-4">
                                            {user.role ? (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                                                    <Shield className="w-3 h-3" />
                                                    {user.role.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">No Role</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            {user.department ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                                                    {user.department}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-slate-400 text-sm">
                                            {user.department_manager?.name || '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link href={`/admin/users/${user.id}/edit`} className="text-blue-400 hover:underline">
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-8">
                                        <EmptyState icon={User} title="No users found" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </AppLayout>
    );
}
