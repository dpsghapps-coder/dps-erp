import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function UserCreate() {
    const { roles, managers, departments } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
        is_active: true,
        department: '',
        department_manager_id: '',
    });

    return (
        <AppLayout>
            <Head title="Add User" />

            <div className="mb-6">
                <Link href="/admin/users" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Users
                </Link>
            </div>

            <PageHeader
                title="Add User"
                subtitle="Create a new system user"
            />

            <div className="max-w-2xl">
                <GlassCard>
                    <form onSubmit={(e) => { e.preventDefault(); post('/admin/users'); }}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Full name"
                                />
                                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="email@example.com"
                                />
                                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Minimum 8 characters"
                                />
                                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Role</label>
                                <select
                                    value={data.role_id}
                                    onChange={(e) => setData('role_id', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="">Select a role</option>
                                    {(roles || []).map((role: any) => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                                {errors.role_id && <p className="text-red-400 text-sm mt-1">{errors.role_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Department</label>
                                <select
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="">No Department</option>
                                    {(departments || []).map((dept: any) => (
                                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                                {errors.department && <p className="text-red-400 text-sm mt-1">{errors.department}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Department Manager</label>
                                <select
                                    value={data.department_manager_id}
                                    onChange={(e) => setData('department_manager_id', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="">No Manager</option>
                                    {(managers || []).map((manager: any) => (
                                        <option key={manager.id} value={manager.id}>{manager.name}</option>
                                    ))}
                                </select>
                                {errors.department_manager_id && <p className="text-red-400 text-sm mt-1">{errors.department_manager_id}</p>}
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <label htmlFor="is_active" className="text-sm">Active</label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                            <button type="submit" className="glass-button" disabled={processing}>
                                Create User
                            </button>
                            <Link href="/admin/users" className="glass-button-secondary">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </AppLayout>
    );
}
