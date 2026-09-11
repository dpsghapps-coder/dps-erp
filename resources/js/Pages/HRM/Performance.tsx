import { useState } from 'react';
import { usePage, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, Pagination, StatusBadge, EmptyState } from '@/Components/ui';
import { Head, Link } from '@inertiajs/react';
import {
    TrendingUp,
    Calendar,
    Plus,
} from 'lucide-react';

export default function HrmPerformance() {
    const { props } = usePage();
    const filters = (props as any)?.filters;
    const reviews = (props as any)?.reviews?.data || [];
    const employees = (props as any)?.employees || [];
    const canInitiate = Boolean((props as any)?.canInitiate);

    const [selectedEmployee, setSelectedEmployee] = useState(filters?.employee_id || 'all');
    const [showInitiateModal, setShowInitiateModal] = useState(false);

    const handleFilterChange = (employeeId: string) => {
        router.get('/hrm/performance', {
            employee_id: employeeId === 'all' ? undefined : employeeId,
        }, {
            preserveState: true,
            replace: true
        });
    };

    const { post, processing, data, setData, reset } = useForm({
        employee_id: '',
        period: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/hrm/performance', {
            onSuccess: () => {
                setShowInitiateModal(false);
                reset();
            },
        });
    };

    const navItems = ['Dashboard', 'Employees', 'Org Chart', 'Attendance', 'Leaves', 'Holidays', 'Payroll', 'Performance', 'Noticeboard'];

    return (
        <AppLayout>
            <Head title="Performance" />

            <div className="flex flex-wrap items-center gap-2 mb-6">
                {navItems.map((item) => (
                    <Link
                        key={item}
                        href={`/hrm/${item.toLowerCase().replace(' ', '-')}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item === 'Performance'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <PageHeader
                title="Performance"
                subtitle="Self-assessment, supervisor & manager review, HR sign-off"
                action={canInitiate ? (
                    <button onClick={() => setShowInitiateModal(true)} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Initiate Review
                    </button>
                ) : undefined}
            />

            {canInitiate && (
                <GlassCard className="mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <select
                            value={selectedEmployee}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedEmployee(val);
                                handleFilterChange(val);
                            }}
                            className="glass-input"
                        >
                            <option value="all">All Employees</option>
                            {employees.map((emp: any) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </GlassCard>
            )}

            {reviews.length === 0 ? (
                <GlassCard>
                    <EmptyState
                        icon={TrendingUp}
                        title="No performance reviews yet"
                        description={canInitiate ? 'Initiate a review for an employee to get started.' : 'Reviews initiated for you will show up here.'}
                    />
                </GlassCard>
            ) : (
                <div className="space-y-3">
                    {reviews.map((review: any) => (
                        <Link key={review.id} href={`/hrm/performance/${review.id}`}>
                            <GlassCard variant="interactive">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-sm font-medium">
                                            {review.employee?.first_name?.charAt(0)}{review.employee?.last_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">
                                                {review.employee?.first_name} {review.employee?.last_name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(review.review_date).toLocaleDateString()}
                                                {review.period && <span className="mx-1">· {review.period}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <StatusBadge status={review.status} />
                                </div>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            )}
            <Pagination meta={(props as any)?.reviews} />

            {showInitiateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <GlassCard className="max-w-lg w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Initiate Performance Review</h2>
                            <button onClick={() => setShowInitiateModal(false)} className="text-slate-500 hover:text-slate-700">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Employee</label>
                                <select
                                    value={data.employee_id}
                                    onChange={(e) => setData('employee_id', e.target.value)}
                                    className="glass-input w-full"
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp: any) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.first_name} {emp.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Period</label>
                                <input
                                    type="text"
                                    value={data.period}
                                    onChange={(e) => setData('period', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="e.g. Q1 2026, Annual Review 2026"
                                    required
                                />
                            </div>

                            <p className="text-sm text-slate-500">
                                This will appear on the employee's profile for them to complete a self-assessment. It then goes to their supervisor, their supervisor's manager (if any), and finally HR.
                            </p>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowInitiateModal(false)}
                                    className="glass-button-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="glass-button">
                                    Initiate Review
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </AppLayout>
    );
}
