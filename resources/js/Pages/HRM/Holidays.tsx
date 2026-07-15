import { useState } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { MiniCalendar } from '@/Components/HRM';
import { Head, Link } from '@inertiajs/react';
import { 
    Plus, 
    Calendar,
    Filter,
    Building2,
    Globe
} from 'lucide-react';

const HOLIDAYS_MOCK = [
    { id: 1, name: "New Year's Day", date: '2026-01-01', type: 'public' },
    { id: 2, name: 'Martin Luther King Jr. Day', date: '2026-01-19', type: 'public' },
    { id: 3, name: "Presidents' Day", date: '2026-02-16', type: 'public' },
    { id: 4, name: 'Company Foundation Day', date: '2026-03-01', type: 'company' },
    { id: 5, name: 'Good Friday', date: '2026-04-03', type: 'public' },
    { id: 6, name: 'Memorial Day', date: '2026-05-25', type: 'public' },
    { id: 7, name: 'Company Anniversary', date: '2026-06-15', type: 'company' },
    { id: 8, name: 'Independence Day', date: '2026-07-04', type: 'public' },
    { id: 9, name: 'Labor Day', date: '2026-09-07', type: 'public' },
    { id: 10, name: 'Columbus Day', date: '2026-10-12', type: 'public' },
    { id: 11, name: 'Veterans Day', date: '2026-11-11', type: 'public' },
    { id: 12, name: 'Thanksgiving', date: '2026-11-26', type: 'public' },
    { id: 13, name: 'Christmas', date: '2026-12-25', type: 'public' },
    { id: 14, name: 'Boxing Day', date: '2026-12-26', type: 'public' },
    { id: 15, name: 'Company Year End Party', date: '2026-12-31', type: 'company' },
];

export default function HrmHolidays() {
    const { props } = usePage();
    const holidays = (props as any)?.holidays || HOLIDAYS_MOCK;
    const currentYear = (props as any)?.currentYear || new Date().getFullYear();

    const [year, setYear] = useState(currentYear);
    const [typeFilter, setTypeFilter] = useState<'all' | 'company' | 'public'>('all');
    const [showAddModal, setShowAddModal] = useState(false);

    const { post, processing } = useForm({});

    const handleAddHoliday = async (data: any) => {
        try {
            await fetch('/hrm/holidays', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } catch (e) {}
    };

    const filteredHolidays = typeFilter === 'all' 
        ? holidays 
        : holidays.filter((h: any) => h.type === typeFilter);

    const companyCount = holidays.filter((h: any) => h.type === 'company').length;
    const publicCount = holidays.filter((h: any) => h.type === 'public').length;

    const navItems = ['Dashboard', 'Employees', 'Attendance', 'Leaves', 'Holidays', 'Payroll', 'Performance', 'Noticeboard'];

    return (
        <AppLayout>
            <Head title="Holidays" />

            <div className="flex flex-wrap items-center gap-2 mb-6">
                {navItems.map((item) => (
                    <Link
                        key={item}
                        href={`/hrm/${item.toLowerCase()}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item === 'Holidays'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <PageHeader 
                title="Holidays" 
                subtitle={`${holidays.length} holidays in ${year}`}
                action={
                    <button onClick={() => setShowAddModal(true)} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Holiday
                    </button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{holidays.length}</p>
                        <p className="text-sm text-slate-500">Total Holidays</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{companyCount}</p>
                        <p className="text-sm text-slate-500">Company Holidays</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{publicCount}</p>
                        <p className="text-sm text-slate-500">Public Holidays</p>
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <select 
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                            className="glass-input"
                        >
                            <option value="all">All Types</option>
                            <option value="company">Company</option>
                            <option value="public">Public</option>
                        </select>
                        <select 
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="glass-input"
                        >
                            <option value={2026}>2026</option>
                            <option value={2025}>2025</option>
                            <option value={2024}>2024</option>
                        </select>
                    </div>
                </div>
            </GlassCard>

            <MiniCalendar year={year} holidays={holidays} />

            <GlassCard className="mt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Holiday List</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Holiday</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHolidays.map((holiday: any) => (
                                <tr key={holiday.id} className="border-b border-white/5">
                                    <td className="py-3 px-4">
                                        {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="py-3 px-4 font-medium">{holiday.name}</td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            holiday.type === 'company' 
                                                ? 'bg-indigo-100 text-indigo-700' 
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {holiday.type}
                                        </span>
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