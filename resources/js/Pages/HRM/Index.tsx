import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, User, Mail, Phone, Grid, List as ListIcon } from 'lucide-react';
import { useState } from 'react';

export default function HrmIndex() {
    const { employees, departments } = usePage().props;
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredEmployees = (employees?.data || []).filter((e: any) => {
        const matchSearch = !search || 
            `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
            e.employee_number.toLowerCase().includes(search.toLowerCase());
        const matchDept = departmentFilter === 'all' || e.department_id == departmentFilter;
        const matchStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && !e.date_terminated) ||
            (statusFilter === 'terminated' && e.date_terminated);
        return matchSearch && matchDept && matchStatus;
    });

    const employmentTypeColors: Record<string, string> = {
        full_time: 'bg-green-500/20 text-green-400',
        part_time: 'bg-blue-500/20 text-blue-400',
        contract: 'bg-purple-500/20 text-purple-400',
    };

    return (
        <AppLayout>
            <Head title="Human Resources" />

            <PageHeader 
                title="Human Resources" 
                subtitle="Manage employees and HR"
                action={
                    <Link href="/hrm/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Employee
                    </Link>
                }
            />

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search employees..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                        <select 
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="glass-input"
                        >
                            <option value="all">All Departments</option>
                            {(departments || []).map((d: any) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="glass-input"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </GlassCard>

            {view === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee: any) => (
                            <Link key={employee.id} href={`/hrm/${employee.id}`}>
                                <GlassCard variant="interactive" className="h-full text-center">
                                    <div className="w-16 h-16 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-semibold">
                                            {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                                    <p className="text-sm text-slate-400">{employee.job_title || 'No Title'}</p>
                                    {employee.department && (
                                        <p className="text-sm text-blue-400 mt-1">{employee.department.name}</p>
                                    )}
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <span className={`text-xs px-2 py-1 rounded-full ${employmentTypeColors[employee.employment_type] || 'bg-white/10'}`}>
                                            {employee.employment_type?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {employee.date_terminated && (
                                        <span className="block mt-2 text-xs text-red-400">Terminated</span>
                                    )}
                                </GlassCard>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <GlassCard>
                                <EmptyState 
                                    icon={User}
                                    title="No employees found"
                                    action={
                                        <Link href="/hrm/create" className="glass-button">
                                            <Plus className="w-4 h-4 mr-2" /> Add Employee
                                        </Link>
                                    }
                                />
                            </GlassCard>
                        </div>
                    )}
                </div>
            ) : (
                <GlassCard className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Employee</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Department</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Hired</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((employee: any) => (
                                        <tr key={employee.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm">
                                                        {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                                                        <p className="text-xs text-slate-400">{employee.job_title}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-sm">{employee.employee_number}</td>
                                            <td className="py-3 px-4 text-slate-400">{employee.department?.name || '-'}</td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs px-2 py-1 rounded-full ${employmentTypeColors[employee.employment_type] || 'bg-white/10'}`}>
                                                    {employee.employment_type?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-400">
                                                {employee.date_hired ? new Date(employee.date_hired).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/hrm/${employee.id}`} className="text-blue-400 hover:underline">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8">
                                            <EmptyState icon={User} title="No employees found" />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}
        </AppLayout>
    );
}