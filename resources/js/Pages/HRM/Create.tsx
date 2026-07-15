import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function HrmCreate() {
    const { departments } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        employee_number: '',
        first_name: '',
        last_name: '',
        department_id: '',
        job_title: '',
        employment_type: 'full_time',
        date_hired: '',
        phone: '',
        salary: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/hrm');
    };

    return (
        <AppLayout>
            <Head title="Add Employee" />

            <div className="mb-6">
                <Link href="/hrm" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to HRM
                </Link>
            </div>

            <PageHeader title="Add Employee" subtitle="Create a new employee record" />

            <form onSubmit={handleSubmit}>
                <GlassCard>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Employee Number *</label>
                            <input 
                                type="text"
                                value={data.employee_number}
                                onChange={(e) => setData('employee_number', e.target.value)}
                                className="glass-input w-full"
                                placeholder="EMP-001"
                            />
                            {errors.employee_number && <p className="text-red-400 text-sm mt-1">{errors.employee_number}</p>}
                        </div>

                        <div></div>

                        <div>
                            <label className="block text-sm font-medium mb-2">First Name *</label>
                            <input 
                                type="text"
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                className="glass-input w-full"
                            />
                            {errors.first_name && <p className="text-red-400 text-sm mt-1">{errors.first_name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Last Name *</label>
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
                                <option value="">Select Department</option>
                                {(departments || []).map((d: any) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
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
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Employment Type *</label>
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
                            <label className="block text-sm font-medium mb-2">Date Hired *</label>
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
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-white/10">
                        <Link href="/hrm" className="glass-button">Cancel</Link>
                        <button type="submit" disabled={processing} className="glass-button">
                            {processing ? 'Creating...' : 'Create Employee'}
                        </button>
                    </div>
                </GlassCard>
            </form>
        </AppLayout>
    );
}