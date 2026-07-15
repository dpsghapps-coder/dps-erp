import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function HrmEdit() {
    const { employee, departments } = usePage().props as any;
    const { data, setData, put, processing, errors } = useForm({
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        department_id: employee?.department_id || '',
        job_title: employee?.job_title || '',
        employment_type: employee?.employment_type || 'full_time',
        date_hired: employee?.date_hired || '',
        date_terminated: employee?.date_terminated || '',
        phone: employee?.phone || '',
        salary: employee?.salary || '',
    });

    return (
        <AppLayout>
            <Head title={`Edit ${employee?.first_name} ${employee?.last_name}`} />

            <div className="mb-6">
                <Link href={`/hrm/${employee?.id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Employee
                </Link>
            </div>

            <PageHeader 
                title="Edit Employee" 
                subtitle={`Editing ${employee?.first_name} ${employee?.last_name}`}
            />

            <div className="max-w-2xl">
                <GlassCard>
                    <form onSubmit={(e) => { e.preventDefault(); put(`/hrm/${employee?.id}`); }}>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    className="glass-input w-full"
                                />
                                {errors.first_name && <p className="text-red-400 text-sm mt-1">{errors.first_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    className="glass-input w-full"
                                />
                                {errors.last_name && <p className="text-red-400 text-sm mt-1">{errors.last_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Department</label>
                                <select
                                    value={data.department_id}
                                    onChange={(e) => setData('department_id', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="">Select department</option>
                                    {(departments || []).map((dept: any) => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Job Title</label>
                                <input
                                    type="text"
                                    value={data.job_title}
                                    onChange={(e) => setData('job_title', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Job title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Employment Type</label>
                                <select
                                    value={data.employment_type}
                                    onChange={(e) => setData('employment_type', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="contract">Contract</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Date Hired</label>
                                <input
                                    type="date"
                                    value={data.date_hired}
                                    onChange={(e) => setData('date_hired', e.target.value)}
                                    className="glass-input w-full"
                                />
                                {errors.date_hired && <p className="text-red-400 text-sm mt-1">{errors.date_hired}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Phone</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Salary</label>
                                <input
                                    type="number"
                                    value={data.salary}
                                    onChange={(e) => setData('salary', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Termination Date</label>
                                <input
                                    type="date"
                                    value={data.date_terminated}
                                    onChange={(e) => setData('date_terminated', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Leave blank if active"
                                />
                                <p className="text-xs text-slate-500 mt-1">Leave blank if employee is still active</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                            <button type="submit" className="glass-button" disabled={processing}>
                                Save Changes
                            </button>
                            <Link href={`/hrm/${employee?.id}`} className="glass-button-secondary">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </AppLayout>
    );
}