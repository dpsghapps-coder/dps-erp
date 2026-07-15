import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { ArrowLeft, Shield, Key, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function RolesIndex() {
    const { roles, permissions } = usePage().props;
    const [expandedRole, setExpandedRole] = useState<number | null>(null);
    const [showPermissions, setShowPermissions] = useState(false);

    const groupedPermissions = (permissions || []).reduce((acc: Record<string, any[]>, perm: any) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
    }, {} as Record<string, any[]>);

    const handleDelete = (role: any) => {
        if (role.name === 'admin') {
            Swal.fire('Cannot Delete', 'The admin role cannot be deleted.', 'warning');
            return;
        }
        Swal.fire({
            title: `Delete "${role.display_name}"?`,
            text: 'This action cannot be undone. Users with this role will lose their role assignment.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete',
        }).then((result: any) => {
            if (result.isConfirmed) {
                router.delete(route('admin.roles.destroy', role.id));
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Roles & Permissions" />

            <div className="mb-6">
                <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Administration
                </Link>
            </div>

            <PageHeader
                title="Roles & Permissions"
                subtitle={`${roles.length} roles configured`}
                action={
                    <Link href={route('admin.roles.create')} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Role
                    </Link>
                }
            />

            {/* Permissions Reference - Collapsible */}
            <GlassCard className="mb-6">
                <button
                    onClick={() => setShowPermissions(!showPermissions)}
                    className="w-full flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <Key className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="text-left">
                            <h2 className="font-semibold text-slate-900">Available Permissions</h2>
                            <p className="text-sm text-slate-500">{permissions?.length || 0} permissions across {Object.keys(groupedPermissions).length} modules</p>
                        </div>
                    </div>
                    {showPermissions ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {showPermissions && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(groupedPermissions).map(([module, perms]: [string, any[]]) => (
                                <div key={module}>
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{module}</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {perms.map((perm: any) => (
                                            <span key={perm.id} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                                {perm.description || perm.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </GlassCard>

            {/* Roles Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role: any) => {
                    const permsByModule = (role.permissions || []).reduce((acc: Record<string, any[]>, perm: any) => {
                        if (!acc[perm.module]) acc[perm.module] = [];
                        acc[perm.module].push(perm);
                        return acc;
                    }, {} as Record<string, any[]>);

                    return (
                    <GlassCard
                        key={role.id}
                        variant="interactive"
                        className={`relative ${expandedRole === role.id ? 'ring-2 ring-indigo-500/30' : ''}`}
                    >
                        <div
                            className="cursor-pointer"
                            onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {role.permissions?.length || 0} perms
                                </span>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-0.5">{role.display_name}</h3>
                            <p className="text-sm text-slate-500">{role.name}</p>
                            {role.description && (
                                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{role.description}</p>
                            )}
                        </div>

                        {expandedRole === role.id && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assigned Permissions</h4>
                                {role.permissions?.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                                        {Object.entries(permsByModule).map(([module, perms]) => (
                                            <div key={module}>
                                                <span className="text-xs font-medium text-slate-400 uppercase">{module}</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {perms.map((perm: any) => (
                                                        <span key={perm.id} className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded">
                                                            {perm.description || perm.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm">No permissions assigned</p>
                                )}
                                <div className="mt-4 flex gap-2">
                                    <Link href={route('admin.roles.edit', role.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </Link>
                                    {role.name !== 'admin' && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(role); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </GlassCard>
                    );
                })}
            </div>
        </AppLayout>
    );
}
