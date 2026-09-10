import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Camera } from 'lucide-react';
import { useState, useRef } from 'react';
import { RELATIONSHIP_OPTIONS } from '@/Utils/relationships';

export default function HrmEdit() {
    const { employee, departments, employmentTypes, staffLevels, managers } = usePage().props as any;
    const { data, setData, post, transform, processing, errors } = useForm({
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        email: employee?.email || '',
        employee_number: employee?.employee_number || '',
        department_id: employee?.department_id || '',
        staff_level_id: employee?.staff_level_id || '',
        supervising_manager_id: employee?.supervising_manager_id || '',
        employment_type_id: employee?.employment_type_id || '',
        job_title: employee?.job_title || '',
        salary: employee?.salary || '',
        mobile_1: employee?.mobile_1 || '',
        mobile_2: employee?.mobile_2 || '',
        emergency_contact_name: employee?.emergency_contact_name || '',
        emergency_contact_phone: employee?.emergency_contact_phone || '',
        emergency_contact_relation: employee?.emergency_contact_relation || '',
        pay_frequency: employee?.pay_frequency || '',
        leave_days: employee?.leave_days || '',
        date_hired: employee?.date_hired ? employee.date_hired.slice(0, 10) : '',
        date_terminated: employee?.date_terminated ? employee.date_terminated.slice(0, 10) : '',
        avatar: null as File | null,
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        employee?.avatar ? `/storage/${employee.avatar}` : null
    );
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

    return (
        <AppLayout>
            <Head title={`Edit ${employee?.first_name} ${employee?.last_name}`} />

            <div className="mb-6">
                <Link href={`/hrm/${employee?.id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Employee
                </Link>
            </div>

            <PageHeader 
                title="Edit Employee" 
                subtitle={`Editing ${employee?.first_name} ${employee?.last_name}`}
            />

            <div className="max-w-2xl">
                <GlassCard>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        // PHP does not parse multipart bodies on PUT requests, so spoof via POST + _method
                        // (Inertia's put() doesn't do this automatically when forcing FormData).
                        transform((data) => ({ ...data, _method: 'put' }));
                        post(`/hrm/${employee?.id}`, { forceFormData: true });
                    }}>
                        <div className="grid md:grid-cols-2 gap-4">
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
                                    {errors.avatar && <p className="text-red-400 text-sm mt-1">{errors.avatar}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Employee Number</label>
                                <input
                                    type="text"
                                    value={data.employee_number}
                                    readOnly
                                    className="glass-input w-full bg-slate-50 dark:bg-white/5 cursor-not-allowed"
                                />
                            </div>

                            <div></div>

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
                                <label className="block text-sm font-medium mb-2">Email</label>
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
                                    <option value="">Select department</option>
                                    {(departments || []).map((dept: any) => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                                {errors.department_id && <p className="text-red-400 text-sm mt-1">{errors.department_id}</p>}
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
                                {errors.staff_level_id && <p className="text-red-400 text-sm mt-1">{errors.staff_level_id}</p>}
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
                                {errors.supervising_manager_id && <p className="text-red-400 text-sm mt-1">{errors.supervising_manager_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Employment Type</label>
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
                                <label className="block text-sm font-medium mb-2">Job Title</label>
                                <input
                                    type="text"
                                    value={data.job_title}
                                    onChange={(e) => setData('job_title', e.target.value)}
                                    className="glass-input w-full"
                                />
                                {errors.job_title && <p className="text-red-400 text-sm mt-1">{errors.job_title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Mobile 1</label>
                                <input
                                    type="text"
                                    value={data.mobile_1}
                                    onChange={(e) => setData('mobile_1', e.target.value)}
                                    className="glass-input w-full"
                                />
                                {errors.mobile_1 && <p className="text-red-400 text-sm mt-1">{errors.mobile_1}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Mobile 2</label>
                                <input
                                    type="text"
                                    value={data.mobile_2}
                                    onChange={(e) => setData('mobile_2', e.target.value)}
                                    className="glass-input w-full"
                                />
                                {errors.mobile_2 && <p className="text-red-400 text-sm mt-1">{errors.mobile_2}</p>}
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
                                {errors.salary && <p className="text-red-400 text-sm mt-1">{errors.salary}</p>}
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
                                {errors.pay_frequency && <p className="text-red-400 text-sm mt-1">{errors.pay_frequency}</p>}
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
                                {errors.leave_days && <p className="text-red-400 text-sm mt-1">{errors.leave_days}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Emergency Contact Name</label>
                                <input
                                    type="text"
                                    value={data.emergency_contact_name}
                                    onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                    className="glass-input w-full"
                                />
                                {errors.emergency_contact_name && <p className="text-red-400 text-sm mt-1">{errors.emergency_contact_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Emergency Contact Phone</label>
                                <input
                                    type="text"
                                    value={data.emergency_contact_phone}
                                    onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                    className="glass-input w-full"
                                />
                                {errors.emergency_contact_phone && <p className="text-red-400 text-sm mt-1">{errors.emergency_contact_phone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Relationship to Employee</label>
                                <select
                                    value={data.emergency_contact_relation}
                                    onChange={(e) => setData('emergency_contact_relation', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="">Select Relationship</option>
                                    {RELATIONSHIP_OPTIONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                {errors.emergency_contact_relation && <p className="text-red-400 text-sm mt-1">{errors.emergency_contact_relation}</p>}
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
                                {errors.date_terminated && <p className="text-red-400 text-sm mt-1">{errors.date_terminated}</p>}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
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
