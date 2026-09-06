import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, Pagination, StatusChips } from '@/Components/ui';
import { SlideDrawer } from '@/Components/HRM';
import { Head, Link } from '@inertiajs/react';
import { useCurrency } from '@/Utils/currency';
import WhatsAppLink from '@/Components/WhatsAppLink';
import { 
    Search, 
    Grid, 
    List as ListIcon, 
    Plus, 
    User, 
    Mail, 
    Phone, 
    Calendar,
    Briefcase,
    Building,
    ChevronRight,
    Pencil
} from 'lucide-react';

export default function HrmEmployees() {
    const { props } = usePage();
    const formatCurrency = useCurrency();
    const employeesData = (props as any)?.employees;
    const employeesList = employeesData?.data || employeesData || [];
    const departmentsData = (props as any)?.departments;
    const departmentsProp = departmentsData || [];
    const isManager = Boolean((props as any)?.isManager);

    const [employees, setEmployees] = useState(employeesList);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        let filtered = [...employeesList];
        if (search) {
            filtered = filtered.filter(e =>
                `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
                e.employee_number.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (departmentFilter !== 'all') {
            filtered = filtered.filter(e => e.department?.name === departmentFilter);
        }
        setEmployees(filtered);
    }, [search, departmentFilter]);

    const handleEmployeeClick = (employee: any) => {
        setSelectedEmployee(employee);
        setDrawerOpen(true);
    };

    const employmentTypeColors: Record<string, string> = {
        'Full-time': 'bg-green-500/20 text-green-400',
        'Part-time': 'bg-blue-500/20 text-blue-400',
        'Contract': 'bg-purple-500/20 text-purple-400',
        'Intern': 'bg-amber-500/20 text-amber-400',
    };

    return (
        <AppLayout>
            <Head title="Employee Directory" />

            <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
                {['Dashboard', 'Employees', 'Attendance', 'Leaves', 'Holidays', 'Payroll', 'Performance', 'Noticeboard'].map((item) => (
                    <Link
                        key={item}
                        href={`/hrm/${item.toLowerCase()}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            item === 'Employees'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <PageHeader 
                title="Employee Directory" 
                subtitle={`${employees.length} employees`}
                action={
                    isManager ? (
                        <Link href="/hrm/create" className="glass-button flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Employee
                        </Link>
                    ) : undefined
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
                        <StatusChips
                            name="Department"
                            value={departmentFilter}
                            onChange={setDepartmentFilter}
                            options={[
                                { value: 'all', label: 'All Departments' },
                                ...departmentsProp.map((d: any) => ({ value: d.name, label: d.name })),
                            ]}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-slate-200 dark:bg-white/20' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-slate-200 dark:bg-white/20' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </GlassCard>

            {view === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {employees.length > 0 ? (
                        employees.map((employee: any) => (
                            <div 
                                key={employee.id}
                                onClick={() => handleEmployeeClick(employee)}
                                className="cursor-pointer"
                            >
                                <GlassCard variant="interactive" className="h-full text-center">
                                    <div className="w-16 h-16 mx-auto mb-3 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
                                        {employee.avatar ? (
                                            <img src={`/storage/${employee.avatar}`} alt={`${employee.first_name} ${employee.last_name}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-semibold">
                                                {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                                    <p className="text-sm text-slate-400">{employee.job_title || 'No Title'}</p>
                                    {employee.department && (
                                        <p className="text-sm text-blue-400 mt-1">{employee.department.name}</p>
                                    )}
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                                        <span className={`text-xs px-2 py-1 rounded-full ${employmentTypeColors[employee.employment_type?.name] || 'bg-slate-100 dark:bg-white/10'}`}>
                                            {employee.employment_type?.name || '-'}
                                        </span>
                                        {isManager && (
                                            <Link
                                                href={`/hrm/${employee.id}/edit`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </GlassCard>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <GlassCard>
                                <EmptyState icon={User} title="No employees found" />
                            </GlassCard>
                        </div>
                    )}
                </div>
            ) : (
                <GlassCard className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Employee</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Department</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Hired</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length > 0 ? (
                                    employees.map((employee: any) => (
                                        <tr 
                                            key={employee.id}
                                            className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
                                            onClick={() => handleEmployeeClick(employee)}
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center text-sm overflow-hidden">
                                                        {employee.avatar ? (
                                                            <img src={`/storage/${employee.avatar}`} alt={`${employee.first_name} ${employee.last_name}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}</span>
                                                        )}
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
                                                <span className={`text-xs px-2 py-1 rounded-full ${employmentTypeColors[employee.employment_type?.name] || 'bg-slate-100 dark:bg-white/10'}`}>
                                                    {employee.employment_type?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-400">
                                                {employee.date_hired ? new Date(employee.date_hired).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {isManager && (
                                                        <Link
                                                            href={`/hrm/${employee.id}/edit`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Link>
                                                    )}
                                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                                </div>
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
            <Pagination meta={employeesData} />

            <SlideDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : 'Employee Profile'}
                size="md"
            >
                {selectedEmployee && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 mb-3 overflow-hidden">
                                {selectedEmployee.avatar ? (
                                    <img src={`/storage/${selectedEmployee.avatar}`} alt={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{selectedEmployee.first_name?.charAt(0)}{selectedEmployee.last_name?.charAt(0)}</span>
                                )}
                            </div>
                            <h2 className="text-xl font-semibold">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
                            <p className="text-slate-500">{selectedEmployee.job_title}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="text-sm">{selectedEmployee.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Phone</p>
                                    <WhatsAppLink phone={selectedEmployee.mobile_1} className="text-sm text-green-400 hover:underline flex items-center gap-1">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                        {selectedEmployee.mobile_1}
                                    </WhatsAppLink>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Department</p>
                                    <p className="text-sm">{selectedEmployee.department?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Employment Type</p>
                                    <p className="text-sm">{selectedEmployee.employment_type?.name || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Date Hired</p>
                                    <p className="text-sm">{new Date(selectedEmployee.date_hired).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Leave Days</span>
                                <span className="font-medium">{selectedEmployee.leave_days} days</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-slate-500">Salary</span>
                                <span className="font-medium">{formatCurrency(selectedEmployee.salary || 0)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <Link
                                href={`/hrm/employees/${selectedEmployee.id}`}
                                className="glass-button flex-1 flex items-center justify-center gap-2"
                            >
                                <User className="w-4 h-4" /> Full Profile
                            </Link>
                            {isManager && (
                                <Link
                                    href={`/hrm/${selectedEmployee.id}/edit`}
                                    className="glass-button flex-1 flex items-center justify-center gap-2"
                                >
                                    <Pencil className="w-4 h-4" /> Edit
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </SlideDrawer>
        </AppLayout>
    );
}