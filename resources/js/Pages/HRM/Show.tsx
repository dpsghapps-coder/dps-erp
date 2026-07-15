import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Mail, Phone, Calendar, Briefcase, DollarSign } from 'lucide-react';
import { usePage } from '@inertiajs/react';

export default function HrmShow() {
    const { employee } = usePage().props as any;

    const employmentTypeLabels: Record<string, string> = {
        full_time: 'Full Time',
        part_time: 'Part Time',
        contract: 'Contract',
    };

    return (
        <AppLayout>
            <Head title={employee ? `${employee.first_name} ${employee.last_name}` : 'Employee'} />

            <div className="mb-6">
                <Link href="/hrm" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Employees
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard>
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-semibold">
                                    {employee?.first_name?.charAt(0)}{employee?.last_name?.charAt(0)}
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
                            {employee?.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Phone</p>
                                        <p>{employee.phone}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Employment Type</p>
                                    <p>{employmentTypeLabels[employee?.employment_type] || employee?.employment_type}</p>
                                </div>
                            </div>
                            {employee?.salary && (
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Salary</p>
                                        <p>${parseFloat(employee.salary).toLocaleString()}</p>
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
                                    <div key={leave.id} className="p-3 bg-white/5 rounded-lg">
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
                                    <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-slate-400" />
                                            <p>{new Date(log.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            {log.clock_in && <p className="text-sm">In: {new Date(log.clock_in).toLocaleTimeString()}</p>}
                                            {log.clock_out && <p className="text-sm text-slate-400">Out: {new Date(log.clock_out).toLocaleTimeString()}</p>}
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