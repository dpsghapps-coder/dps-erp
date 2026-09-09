import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { Head, usePage } from '@inertiajs/react';
import { Briefcase, Building2, Calendar, Phone, DollarSign, UserCog, Clock, IdCard, Heart } from 'lucide-react';
import ProfileNav from '@/Components/ProfileNav';
import { useCurrency } from '@/Utils/currency';
import WhatsAppLink from '@/Components/WhatsAppLink';

export default function EmployeeDetails() {
    const { employee } = usePage().props as any;
    const formatCurrency = useCurrency();

    return (
        <AppLayout>
            <Head title="Employee Details" />

            <div className="max-w-4xl mx-auto">
                <PageHeader title="Employee Details" subtitle="Your employee record" />
                <ProfileNav />

                {employee ? (
                    <GlassCard>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field icon={IdCard} label="Employee #" value={employee.employee_number} />
                            <Field icon={Briefcase} label="Job Title" value={employee.job_title || 'Not set'} />
                            <Field icon={Building2} label="Department" value={employee.department?.name || 'Not assigned'} />
                            <Field icon={UserCog} label="Staff Level" value={employee.staff_level?.name || 'Not assigned'} />
                            <Field icon={Clock} label="Employment Type" value={employee.employment_type?.name || 'Not assigned'} />
                            <Field icon={UserCog} label="Supervising Manager" value={employee.supervising_manager ? `${employee.supervising_manager.first_name} ${employee.supervising_manager.last_name}` : 'Not assigned'} />
                            <Field icon={Calendar} label="Date Hired" value={employee.date_hired ? new Date(employee.date_hired).toLocaleDateString() : 'Not set'} />
                            <Field icon={Calendar} label="Pay Frequency" value={employee.pay_frequency ? employee.pay_frequency.replace('_', '-') : 'Not set'} className="capitalize" />
                            <Field icon={DollarSign} label="Salary" value={employee.salary ? formatCurrency(employee.salary) : 'Not set'} />
                            <Field icon={Calendar} label="Annual Leave Days" value={employee.leave_days ?? 'Not set'} />
                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Mobile 1</span>
                                </div>
                                {employee.mobile_1 ? (
                                    <WhatsAppLink phone={employee.mobile_1} className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline">
                                        {employee.mobile_1}
                                    </WhatsAppLink>
                                ) : (
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Not set</p>
                                )}
                            </div>
                            <Field icon={Phone} label="Mobile 2" value={employee.mobile_2 || 'Not set'} />
                            <Field
                                icon={Heart}
                                label="Emergency Contact"
                                value={employee.emergency_contact_name
                                    ? `${employee.emergency_contact_name}${employee.emergency_contact_relation ? ` (${employee.emergency_contact_relation})` : ''}`
                                    : 'Not set'}
                            />
                            <Field
                                icon={Phone}
                                label="Emergency Contact Phone"
                                value={employee.emergency_contact_phone ? (
                                    <WhatsAppLink phone={employee.emergency_contact_phone} className="text-green-600 dark:text-green-400 hover:underline">
                                        {employee.emergency_contact_phone}
                                    </WhatsAppLink>
                                ) : 'Not set'}
                            />
                        </div>
                    </GlassCard>
                ) : (
                    <GlassCard>
                        <EmptyState icon={Briefcase} title="No employee record linked" description="Your user account isn't linked to an employee record yet. Contact HR to get this set up." />
                    </GlassCard>
                )}
            </div>
        </AppLayout>
    );
}

function Field({ icon: Icon, label, value, className }: { icon: any; label: string; value: any; className?: string }) {
    return (
        <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{label}</span>
            </div>
            <p className={`text-sm font-medium text-slate-900 dark:text-slate-100 ${className || ''}`}>{value}</p>
        </div>
    );
}
