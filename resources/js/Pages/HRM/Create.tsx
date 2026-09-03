import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Camera } from 'lucide-react';
import { useState, useRef } from 'react';

export default function HrmCreate() {
    const { departments, employmentTypes, staffLevels, managers, employeeNumber } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        employee_number: employeeNumber || '',
        first_name: '',
        last_name: '',
        email: '',
        department_id: '',
        staff_level_id: '',
        supervising_manager_id: '',
        employment_type_id: '',
        job_title: '',
        salary: '',
        mobile_1: '',
        mobile_2: '',
        emergency_person: '',
        pay_frequency: '',
        leave_days: '',
        date_hired: '',
        avatar: null as File | null,
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/hrm', data, { forceFormData: true });
    };

    return (
        <AppLayout>
            <Head title="Add Employee" />

            <div className="mb-6">
                <Link href="/hrm" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to HRM
                </Link>
            </div>

            <PageHeader title="Add Employee" subtitle="Create a new employee record" />

            <form onSubmit={handleSubmit}>
                <GlassCard>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative w-20 h-20 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-indigo-400 transition-colors shrink-0"
                            >
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="w-6 h-6 text-slate-400" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <div>
                                <p className="text-sm font-medium">Profile Picture</p>
                                <p className="text-xs text-slate-500">JPG, PNG up to 2MB</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Employee Number *</label>
                            <input 
                                type="text"
                                value={data.employee_number}
                                readOnly
                                className="glass-input w-full bg-slate-50 dark:bg-white/5"
                            />
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
                            <label className="block text-sm font-medium mb-2">Email *</label>
                            <input 
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="glass-input w-full"
                                placeholder="employee@company.com"
                            />
                            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
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
                            <label className="block text-sm font-medium mb-2">Staff Level</label>
                            <select 
                                value={data.staff_level_id}
                                onChange={(e) => setData('staff_level_id', e.target.value)}
                                className="glass-input w-full"
                            >
                                <option value="">Select Staff Level</option>
                                {(staffLevels || []).map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Supervising Manager</label>
                            <select 
                                value={data.supervising_manager_id}
                                onChange={(e) => setData('supervising_manager_id', e.target.value)}
                                className="glass-input w-full"
                            >
                                <option value="">Select Supervising Manager</option>
                                {(managers || []).map((m: any) => (
                                    <option key={m.id} value={m.id}>{m.first_name} {m.last_name} - {m.staff_level?.name || m.job_title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Employment Type *</label>
                            <select 
                                value={data.employment_type_id}
                                onChange={(e) => setData('employment_type_id', e.target.value)}
                                className="glass-input w-full"
                            >
                                <option value="">Select Employment Type</option>
                                {(employmentTypes || []).map((et: any) => (
                                    <option key={et.id} value={et.id}>{et.name}</option>
                                ))}
                            </select>
                            {errors.employment_type_id && <p className="text-red-400 text-sm mt-1">{errors.employment_type_id}</p>}
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
                            <label className="block text-sm font-medium mb-2">Job Title</label>
                            <input 
                                type="text"
                                value={data.job_title}
                                onChange={(e) => setData('job_title', e.target.value)}
                                className="glass-input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Mobile 1</label>
                            <input 
                                type="text"
                                value={data.mobile_1}
                                onChange={(e) => setData('mobile_1', e.target.value)}
                                className="glass-input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Mobile 2</label>
                            <input 
                                type="text"
                                value={data.mobile_2}
                                onChange={(e) => setData('mobile_2', e.target.value)}
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
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Pay Frequency</label>
                            <select 
                                value={data.pay_frequency}
                                onChange={(e) => setData('pay_frequency', e.target.value)}
                                className="glass-input w-full"
                            >
                                <option value="">Select Pay Frequency</option>
                                <option value="weekly">Weekly</option>
                                <option value="bi_weekly">Bi-Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Leave Days</label>
                            <input 
                                type="number"
                                value={data.leave_days}
                                onChange={(e) => setData('leave_days', e.target.value)}
                                className="glass-input w-full"
                                placeholder="0"
                                step="0.5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Emergency Person</label>
                            <input 
                                type="text"
                                value={data.emergency_person}
                                onChange={(e) => setData('emergency_person', e.target.value)}
                                className="glass-input w-full"
                                placeholder="Name - Phone"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
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
