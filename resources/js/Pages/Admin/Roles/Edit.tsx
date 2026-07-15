import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

export default function RoleEdit({ role, permissions }: { role: any; permissions: any[] }) {
    const form = useForm({
        name: role.name || '',
        display_name: role.display_name || '',
        description: role.description || '',
        permissions: (role.permissions || []).map((p: any) => p.id) as number[],
    });

    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(form.data.permissions);

    const groupedPermissions = permissions.reduce((acc: Record<string, any[]>, perm: any) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
    }, {});

    const togglePermission = (id: number) => {
        setSelectedPermissions((prev) => {
            const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
            form.setData('permissions', next);
            return next;
        });
    };

    const toggleModule = (module: string) => {
        const modulePerms = groupedPermissions[module].map((p: any) => p.id);
        setSelectedPermissions((prev) => {
            const allSelected = modulePerms.every((id: number) => prev.includes(id));
            const next = allSelected
                ? prev.filter((id) => !modulePerms.includes(id))
                : [...new Set([...prev, ...modulePerms])];
            form.setData('permissions', next);
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route('admin.roles.update', role.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${role.display_name}`} />

            <div className="mb-6">
                <Link href={route('admin.roles')} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Roles
                </Link>
            </div>

            <PageHeader title={`Edit ${role.display_name}`} subtitle="Update role details and permissions" />

            <form onSubmit={handleSubmit}>
                <GlassCard>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name (slug)</label>
                            <input
                                className="glass-input w-full"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                            />
                            {form.errors.name && <p className="text-red-500 text-sm mt-1">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                            <input
                                className="glass-input w-full"
                                value={form.data.display_name}
                                onChange={(e) => form.setData('display_name', e.target.value)}
                            />
                            {form.errors.display_name && <p className="text-red-500 text-sm mt-1">{form.errors.display_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                className="glass-input w-full"
                                rows={2}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                            />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="mt-6">
                    <h2 className="text-lg font-semibold mb-4">Permissions</h2>
                    <div className="space-y-4">
                        {Object.entries(groupedPermissions).map(([module, perms]) => {
                            const allSelected = perms.every((p: any) => selectedPermissions.includes(p.id));
                            const someSelected = perms.some((p: any) => selectedPermissions.includes(p.id));

                            return (
                                <div key={module} className="border border-slate-200 rounded-lg p-4">
                                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                                            onChange={() => toggleModule(module)}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                                        />
                                        <span className="font-medium text-slate-900 uppercase text-sm">{module}</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2 ml-7">
                                        {perms.map((perm: any) => (
                                            <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(perm.id)}
                                                    onChange={() => togglePermission(perm.id)}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600"
                                                />
                                                <span className="text-sm text-slate-600">{perm.description || perm.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>

                <div className="mt-6 flex gap-3">
                    <button type="submit" disabled={form.processing} className="glass-button flex items-center">
                        <Save className="w-4 h-4 mr-2" /> {form.processing ? 'Saving...' : 'Update Role'}
                    </button>
                    <Link href={route('admin.roles')} className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        Cancel
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}
