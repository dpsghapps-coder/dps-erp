import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Mail, Phone, Calendar, Briefcase, DollarSign, Clock, Heart } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useCurrency } from '@/Utils/currency';
import WhatsAppLink from '@/Components/WhatsAppLink';

export default function HrmShow() {
    const { employee } = usePage().props as any;
    const formatCurrency = useCurrency();

    return (
        <AppLayout>
            <Head title={employee ? `${employee.first_name} ${employee.last_name}` : 'Employee'} />

            <div className="mb-6">
                <Link href="/hrm" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Employees
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard>
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center text-2xl font-semibold overflow-hidden">
                                    {employee?.avatar ? (
                                        <img src={`/storage/${employee.avatar}`} alt={`${employee?.first_name} ${employee?.last_name}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{employee?.first_name?.charAt(0)}{employee?.last_name?.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-semibold">{employee?.first_name} {employee?.last_name}</h1>
                                    <p className="text-slate-400">{employee?.job_title || 'No Title'}</p>
                                </div>
                            </div>
                            <Link href={`/hrm/${employee?.id}/edit`} className="glass-button flex items-center gap-2">
                                <Pencil className="w-4 h-4" /> Edit
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {employee?.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p>{employee.email}</p>
                                    </div>
                                </div>
                            )}
                            {employee?.mobile_1 && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Mobile 1</p>
                                        <WhatsAppLink phone={employee.mobile_1} className="text-green-400 hover:underline flex items-center gap-1">
                                            {employee.mobile_1}
                                        </WhatsAppLink>
                                    </div>
                                </div>
                            )}
                            {employee?.mobile_2 && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Mobile 2</p>
                                        <WhatsAppLink phone={employee.mobile_2} className="text-green-400 hover:underline flex items-center gap-1">
                                            {employee.mobile_2}
                                        </WhatsAppLink>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Employment Type</p>
                                    <p>{employee?.employment_type?.name || '-'}</p>
                                </div>
                            </div>
                            {employee?.salary && (
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Salary</p>
                                        <p>{formatCurrency(employee.salary)}</p>
                                    </div>
                                </div>
                            )}
                            {employee?.pay_frequency && (
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Pay Frequency</p>
                                        <p className="capitalize">{employee.pay_frequency.replace('_', '-')}</p>
                                    </div>
                                </div>
                            )}
                            {employee?.leave_days != null && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Leave Days</p>
                                        <p>{employee.leave_days} days</p>
                                    </div>
                                </div>
                            )}
                            {(employee?.emergency_contact_name || employee?.emergency_contact_phone) && (
                                <div className="flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Emergency Contact{employee?.emergency_contact_relation ? ` (${employee.emergency_contact_relation})` : ''}
                                        </p>
                                        {employee?.emergency_contact_phone ? (
                                            <WhatsAppLink phone={employee.emergency_contact_phone} className="hover:underline">
                                                {employee?.emergency_contact_name || employee.emergency_contact_phone}
                                            </WhatsAppLink>
                                        ) : (
                                            <p>{employee?.emergency_contact_name}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Leave Requests */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Leave Requests</h2>
                        {employee?.leave_requests?.length > 0 ? (
                            <div className="space-y-3">
                                {employee.leave_requests.map((leave: any) => (
                                    <div key={leave.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{leave.leave_type}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                leave.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                leave.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                        </p>
                                        {leave.reason && <p className="text-sm text-slate-500 mt-2">{leave.reason}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400">No leave requests</p>
                        )}
                    </GlassCard>

                    {/* Attendance */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Recent Attendance</h2>
                        {employee?.attendance_logs?.length > 0 ? (
                            <div className="space-y-2">
                                {employee.attendance_logs.slice(0, 10).map((log: any) => (
                                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-slate-400" />
                                            <p>{new Date(log.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            {log.check_in && <p className="text-sm">In: {new Date(log.check_in).toLocaleTimeString()}</p>}
                                            {log.check_out && <p className="text-sm text-slate-400">Out: {new Date(log.check_out).toLocaleTimeString()}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400">No attendance records</p>
                        )}
                    </GlassCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Employee ID</h3>
                        <p className="font-mono">{employee?.employee_number || '-'}</p>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Department</h3>
                        <p>{employee?.department?.name || 'Not assigned'}</p>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Staff Level</h3>
                        <p>{employee?.staffLevel?.name || 'Not assigned'}</p>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Hire Date</h3>
                        <p>{employee?.date_hired ? new Date(employee.date_hired).toLocaleDateString() : '-'}</p>
                    </GlassCard>

                    {employee?.date_terminated && (
                        <GlassCard className="border-red-500/30">
                            <h3 className="text-sm font-medium text-red-400 mb-3">Terminated</h3>
                            <p>{new Date(employee.date_terminated).toLocaleDateString()}</p>
                        </GlassCard>
                    )}

                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Status</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            employee?.date_terminated ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                            {employee?.date_terminated ? 'Terminated' : 'Active'}
                        </span>
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
}
