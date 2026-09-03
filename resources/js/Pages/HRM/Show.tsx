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
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
                            {employee?.emergency_person && (
                                <div className="flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Emergency Person</p>
                                        <p>{employee.emergency_person}</p>
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
