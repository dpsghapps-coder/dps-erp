import { useState } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { TrendChart } from '@/Components/HRM';
import { Head, Link } from '@inertiajs/react';
import { 
    DollarSign, 
    FileText, 
    Download, 
    TrendingUp,
    Building2,
    User
} from 'lucide-react';

const PAYSLIPS_MOCK = [
    { id: 1, employee: { id: 1, first_name: 'John', last_name: 'Smith' }, month: '2026-04', basic_salary: 7917, allowances: 500, overtime: 200, bonuses: 0, deductions_tax: 1800, deductions_insurance: 400, deductions_retirement: 800, gross_pay: 8617, net_pay: 5617, status: 'paid' },
    { id: 2, employee: { id: 1, first_name: 'John', last_name: 'Smith' }, month: '2026-03', basic_salary: 7917, allowances: 500, overtime: 150, bonuses: 500, deductions_tax: 1850, deductions_insurance: 400, deductions_retirement: 800, gross_pay: 9067, net_pay: 6017, status: 'paid' },
    { id: 3, employee: { id: 1, first_name: 'John', last_name: 'Smith' }, month: '2026-02', basic_salary: 7917, allowances: 500, overtime: 0, bonuses: 0, deductions_tax: 1750, deductions_insurance: 400, deductions_retirement: 800, gross_pay: 8417, net_pay: 5467, status: 'paid' },
    { id: 4, employee: { id: 1, first_name: 'John', last_name: 'Smith' }, month: '2026-01', basic_salary: 7917, allowances: 500, overtime: 300, bonuses: 1000, deductions_tax: 2000, deductions_insurance: 400, deductions_retirement: 800, gross_pay: 9717, net_pay: 6517, status: 'paid' },
    { id: 5, employee: { id: 1, first_name: 'John', last_name: 'Smith' }, month: '2025-12', basic_salary: 7917, allowances: 500, overtime: 0, bonuses: 1500, deductions_tax: 2100, deductions_insurance: 400, deductions_retirement: 800, gross_pay: 9917, net_pay: 6617, status: 'paid' },
    { id: 6, employee: { id: 1, first_name: 'John', last_name: 'Smith' }, month: '2025-11', basic_salary: 7917, allowances: 500, overtime: 100, bonuses: 0, deductions_tax: 1750, deductions_insurance: 400, deductions_retirement: 800, gross_pay: 8517, net_pay: 5567, status: 'paid' },
];

const EMPLOYEES_MOCK = [
    { id: 1, first_name: 'John', last_name: 'Smith' },
    { id: 2, first_name: 'Sarah', last_name: 'Johnson' },
    { id: 3, first_name: 'Mike', last_name: 'Chen' },
];

const TREND_DATA_MOCK = [
    { month: 'Nov', value: 5567 },
    { month: 'Dec', value: 6617 },
    { month: 'Jan', value: 6517 },
    { month: 'Feb', value: 5467 },
    { month: 'Mar', value: 6017 },
    { month: 'Apr', value: 5617 },
];

export default function HrmPayroll() {
    const { props } = usePage();
    const payslipsData = (props as any)?.payslips;
    const payslips = payslipsData?.data || payslipsData || PAYSLIPS_MOCK;
    const employeesData = (props as any)?.employees;
    const employees = employeesData || EMPLOYEES_MOCK;
    const trendData = (props as any)?.trendData;
    const trendData_ = trendData?.data || trendData || TREND_DATA_MOCK;

    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

    const statusColors: Record<string, string> = {
        draft: 'bg-slate-100 text-slate-700',
        calculated: 'bg-blue-100 text-blue-700',
        approved: 'bg-yellow-100 text-yellow-700',
        paid: 'bg-green-100 text-green-700',
    };

    const navItems = ['Dashboard', 'Employees', 'Attendance', 'Leaves', 'Holidays', 'Payroll', 'Performance', 'Noticeboard'];

    return (
        <AppLayout>
            <Head title="Payroll" />

            <div className="flex flex-wrap items-center gap-2 mb-6">
                {navItems.map((item) => (
                    <Link
                        key={item}
                        href={`/hrm/${item.toLowerCase()}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item === 'Payroll'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <PageHeader title="Payroll" subtitle="Salary management & payslips" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">$5,617</p>
                        <p className="text-sm text-slate-500">This Month</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">$6,017</p>
                        <p className="text-sm text-slate-500">Avg Monthly</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{Array.isArray(payslips) ? payslips.length : 0}</p>
                        <p className="text-sm text-slate-500">Payslips</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">6</p>
                        <p className="text-sm text-slate-500">Payrolls Run</p>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">6-Month Take-Home Trend</h3>
                    <TrendChart data={trendData_} />
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Filters</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Employee</label>
                            <select 
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="glass-input w-full"
                            >
                                <option value="all">All Employees</option>
                                {employees.map((emp: any) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.first_name} {emp.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Month</label>
                            <select 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="glass-input w-full"
                            >
                                <option value="all">All Months</option>
                                {payslips.map((ps: any) => (
                                    <option key={ps.month} value={ps.month}>{ps.month}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Payslip History</h3>
                    <button className="glass-button flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Month</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Employee</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Basic</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Allowances</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Deductions</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Net Pay</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payslips.map((payslip: any) => (
                                <tr key={payslip.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4 font-mono text-sm">{payslip.month}</td>
                                    <td className="py-3 px-4">
                                        {payslip.employee?.first_name} {payslip.employee?.last_name}
                                    </td>
                                    <td className="py-3 px-4 text-right">${payslip.basic_salary?.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right">${((payslip.allowances || 0) + (payslip.overtime || 0) + (payslip.bonuses || 0)).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right text-red-500">
                                        -${((payslip.deductions_tax || 0) + (payslip.deductions_insurance || 0) + (payslip.deductions_retirement || 0)).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium">${payslip.net_pay?.toLocaleString()}</td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[payslip.status]}`}>
                                            {payslip.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button className="text-blue-500 hover:underline text-sm">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </AppLayout>
    );
}