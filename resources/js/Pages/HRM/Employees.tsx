import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { SlideDrawer } from '@/Components/HRM';
import { Head, Link } from '@inertiajs/react';
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
    ChevronRight
} from 'lucide-react';

const EMPLOYEES_MOCK = [
    { id: 1, employee_number: 'EMP-001', first_name: 'John', last_name: 'Smith', email: 'john.smith@company.com', phone: '+1 555-0101', department: { name: 'Engineering' }, job_title: 'Senior Developer', employment_type: 'full_time', date_hired: '2023-01-15', leave_balance: 18, salary: 95000 },
    { id: 2, employee_number: 'EMP-002', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.j@company.com', phone: '+1 555-0102', department: { name: 'Sales' }, job_title: 'Sales Manager', employment_type: 'full_time', date_hired: '2022-06-01', leave_balance: 15, salary: 85000 },
    { id: 3, employee_number: 'EMP-003', first_name: 'Mike', last_name: 'Chen', email: 'mike.chen@company.com', phone: '+1 555-0103', department: { name: 'Marketing' }, job_title: 'Marketing Lead', employment_type: 'full_time', date_hired: '2022-09-10', leave_balance: 20, salary: 78000 },
    { id: 4, employee_number: 'EMP-004', first_name: 'Emily', last_name: 'Davis', email: 'emily.d@company.com', phone: '+1 555-0104', department: { name: 'Operations' }, job_title: 'Operations Manager', employment_type: 'full_time', date_hired: '2021-03-20', leave_balance: 12, salary: 72000 },
    { id: 5, employee_number: 'EMP-005', first_name: 'James', last_name: 'Wilson', email: 'james.w@company.com', phone: '+1 555-0105', department: { name: 'Finance' }, job_title: 'Financial Analyst', employment_type: 'full_time', date_hired: '2023-07-15', leave_balance: 19, salary: 68000 },
    { id: 6, employee_number: 'EMP-006', first_name: 'Lisa', last_name: 'Brown', email: 'lisa.b@company.com', phone: '+1 555-0106', department: { name: 'Engineering' }, job_title: 'DevOps Engineer', employment_type: 'full_time', date_hired: '2023-02-01', leave_balance: 17, salary: 82000 },
    { id: 7, employee_number: 'EMP-007', first_name: 'Robert', last_name: 'Taylor', email: 'robert.t@company.com', phone: '+1 555-0107', department: { name: 'Engineering' }, job_title: 'Frontend Developer', employment_type: 'full_time', date_hired: '2024-01-10', leave_balance: 20, salary: 75000 },
    { id: 8, employee_number: 'EMP-008', first_name: 'Amanda', last_name: 'White', email: 'amanda.w@company.com', phone: '+1 555-0108', department: { name: 'Sales' }, job_title: 'Account Executive', employment_type: 'full_time', date_hired: '2023-11-05', leave_balance: 18, salary: 65000 },
];

const DEPARTMENTS_MOCK = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Sales' },
    { id: 3, name: 'Marketing' },
    { id: 4, name: 'Operations' },
    { id: 5, name: 'Finance' },
];

export default function HrmEmployees() {
    const { props } = usePage();
    const employeesData = (props as any)?.employees;
    const employeesList = employeesData?.data || employeesData || EMPLOYEES_MOCK;
    const departmentsData = (props as any)?.departments;
    const departmentsProp = departmentsData || DEPARTMENTS_MOCK;

    const [employees, setEmployees] = useState(employeesList);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        let filtered = [...EMPLOYEES_MOCK];
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
        full_time: 'bg-green-500/20 text-green-400',
        part_time: 'bg-blue-500/20 text-blue-400',
        contract: 'bg-purple-500/20 text-purple-400',
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
                            {departmentsProp.map((d: any) => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
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
                    {employees.length > 0 ? (
                        employees.map((employee: any) => (
                            <div 
                                key={employee.id}
                                onClick={() => handleEmployeeClick(employee)}
                                className="cursor-pointer"
                            >
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
                                {employees.length > 0 ? (
                                    employees.map((employee: any) => (
                                        <tr 
                                            key={employee.id}
                                            className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                                            onClick={() => handleEmployeeClick(employee)}
                                        >
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
                                                <ChevronRight className="w-5 h-5 text-slate-400" />
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

            <SlideDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : 'Employee Profile'}
                size="md"
            >
                {selectedEmployee && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 mb-3">
                                {selectedEmployee.first_name?.charAt(0)}{selectedEmployee.last_name?.charAt(0)}
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
                                    <p className="text-sm">{selectedEmployee.phone}</p>
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
                                    <p className="text-sm">{selectedEmployee.employment_type?.replace('_', ' ')}</p>
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
                                <span className="text-sm text-slate-500">Leave Balance</span>
                                <span className="font-medium">{selectedEmployee.leave_balance} days</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-slate-500">Salary</span>
                                <span className="font-medium">${parseFloat(selectedEmployee.salary || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </SlideDrawer>
        </AppLayout>
    );
}