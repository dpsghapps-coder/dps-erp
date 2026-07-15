import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, LoadingSpinner } from '@/Components/ui';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    meeting: any;
    employees: any[];
}

export default function MeetingEdit({ meeting, employees }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: meeting.title ?? '',
        type: meeting.type ?? 'board',
        date: meeting.date?.slice(0, 10) ?? '',
        time: meeting.time?.slice(0, 5) ?? '',
        venue: meeting.venue ?? '',
        organizer_id: meeting.organizer_id ?? '',
        chairperson_id: meeting.chairperson_id ?? '',
        secretary_id: meeting.secretary_id ?? '',
        notes: meeting.notes ?? '',
        status: meeting.status ?? 'scheduled',
    });

    const [attendees, setAttendees] = useState<{ user_id: string; status: string }[]>(
        meeting.attendees?.length > 0
            ? meeting.attendees.map((a: any) => ({
                  user_id: String(a.user_id),
                  status: a.status ?? 'present',
              }))
            : [{ user_id: '', status: 'present' }]
    );

    const [agendas, setAgendas] = useState<{ title: string; presenter_id: string }[]>(
        meeting.agendas?.length > 0
            ? meeting.agendas.map((a: any) => ({
                  title: a.title ?? '',
                  presenter_id: a.presenter_id ? String(a.presenter_id) : '',
              }))
            : [{ title: '', presenter_id: '' }]
    );

    const addAttendee = () => setAttendees([...attendees, { user_id: '', status: 'present' }]);
    const removeAttendee = (index: number) => {
        if (attendees.length <= 1) return;
        const updated = [...attendees]; updated.splice(index, 1); setAttendees(updated);
    };
    const updateAttendee = (index: number, field: string, value: string) => {
        const updated = [...attendees]; (updated[index] as any)[field] = value; setAttendees(updated);
    };

    const addAgenda = () => setAgendas([...agendas, { title: '', presenter_id: '' }]);
    const removeAgenda = (index: number) => {
        if (agendas.length <= 1) return;
        const updated = [...agendas]; updated.splice(index, 1); setAgendas(updated);
    };
    const updateAgenda = (index: number, field: string, value: string) => {
        const updated = [...agendas]; (updated[index] as any)[field] = value; setAgendas(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/management/meetings/${meeting.id}`, {
            forceFormData: true,
            ...data,
            attendees,
            agendas,
        } as any);
    };

    return (
        <AppLayout>
            <Head title={`Edit Meeting — ${meeting.number}`} />

            <div className="mb-4">
                <Link
                    href={`/management/meetings/${meeting.id}`}
                    className="glass-button-secondary inline-flex items-center gap-2 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Meeting
                </Link>
            </div>

            <PageHeader
                title={`Edit ${meeting.number}`}
                subtitle={meeting.title}
            />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Meeting Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Title *</label>
                                    <input
                                        type="text"
                                        className="glass-input w-full"
                                        placeholder="Meeting title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    {errors.title && <p className="text-rose-500 text-xs mt-1.5">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Type *</label>
                                    <select
                                        className="glass-input w-full"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        required
                                    >
                                        <option value="board">Board</option>
                                        <option value="management">Management</option>
                                        <option value="department">Department</option>
                                        <option value="ad_hoc">Ad Hoc</option>
                                    </select>
                                    {errors.type && <p className="text-rose-500 text-xs mt-1.5">{errors.type}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Date *</label>
                                    <input
                                        type="date"
                                        className="glass-input w-full"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        required
                                    />
                                    {errors.date && <p className="text-rose-500 text-xs mt-1.5">{errors.date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Time</label>
                                    <input
                                        type="time"
                                        className="glass-input w-full"
                                        value={data.time}
                                        onChange={(e) => setData('time', e.target.value)}
                                    />
                                    {errors.time && <p className="text-rose-500 text-xs mt-1.5">{errors.time}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Venue</label>
                                    <input
                                        type="text"
                                        className="glass-input w-full"
                                        placeholder="Meeting venue"
                                        value={data.venue}
                                        onChange={(e) => setData('venue', e.target.value)}
                                    />
                                    {errors.venue && <p className="text-rose-500 text-xs mt-1.5">{errors.venue}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Status</label>
                                    <select
                                        className="glass-input w-full"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    {errors.status && <p className="text-rose-500 text-xs mt-1.5">{errors.status}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Organizer</label>
                                    <select
                                        className="glass-input w-full"
                                        value={data.organizer_id}
                                        onChange={(e) => setData('organizer_id', e.target.value)}
                                    >
                                        <option value="">Select employee</option>
                                        {employees.map((emp: any) => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                    {errors.organizer_id && <p className="text-rose-500 text-xs mt-1.5">{errors.organizer_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Chairperson</label>
                                    <select
                                        className="glass-input w-full"
                                        value={data.chairperson_id}
                                        onChange={(e) => setData('chairperson_id', e.target.value)}
                                    >
                                        <option value="">Select employee</option>
                                        {employees.map((emp: any) => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                    {errors.chairperson_id && <p className="text-rose-500 text-xs mt-1.5">{errors.chairperson_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Secretary</label>
                                    <select
                                        className="glass-input w-full"
                                        value={data.secretary_id}
                                        onChange={(e) => setData('secretary_id', e.target.value)}
                                    >
                                        <option value="">Select employee</option>
                                        {employees.map((emp: any) => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                    {errors.secretary_id && <p className="text-rose-500 text-xs mt-1.5">{errors.secretary_id}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1.5 text-slate-500 dark:text-slate-400">Notes</label>
                                    <textarea
                                        className="glass-input w-full h-24"
                                        placeholder="Additional notes..."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                    {errors.notes && <p className="text-rose-500 text-xs mt-1.5">{errors.notes}</p>}
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Attendees</h3>
                            <div className="space-y-3">
                                {attendees.map((attendee, index) => (
                                    <div key={index} className="glass-card p-4 rounded-lg border border-slate-200 dark:border-white/10">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-sm font-medium text-slate-500">Attendee {index + 1}</span>
                                            {attendees.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttendee(index)}
                                                    className="text-rose-500 hover:text-rose-400 p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Employee *</label>
                                                <select
                                                    className="glass-input w-full"
                                                    value={attendee.user_id}
                                                    onChange={(e) => updateAttendee(index, 'user_id', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select employee</option>
                                                    {employees.map((emp: any) => (
                                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Status *</label>
                                                <select
                                                    className="glass-input w-full"
                                                    value={attendee.status}
                                                    onChange={(e) => updateAttendee(index, 'status', e.target.value)}
                                                    required
                                                >
                                                    <option value="present">Present</option>
                                                    <option value="absent">Absent</option>
                                                    <option value="apologies">Apologies</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addAttendee}
                                className="mt-4 text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add attendee
                            </button>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Agenda Items</h3>
                            <div className="space-y-3">
                                {agendas.map((agenda, index) => (
                                    <div key={index} className="glass-card p-4 rounded-lg border border-slate-200 dark:border-white/10">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-sm font-medium text-slate-500">Agenda {index + 1}</span>
                                            {agendas.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeAgenda(index)}
                                                    className="text-rose-500 hover:text-rose-400 p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Title *</label>
                                                <input
                                                    type="text"
                                                    className="glass-input w-full"
                                                    placeholder="Agenda item title"
                                                    value={agenda.title}
                                                    onChange={(e) => updateAgenda(index, 'title', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-slate-500">Presenter</label>
                                                <select
                                                    className="glass-input w-full"
                                                    value={agenda.presenter_id}
                                                    onChange={(e) => updateAgenda(index, 'presenter_id', e.target.value)}
                                                >
                                                    <option value="">Select presenter</option>
                                                    {employees.map((emp: any) => (
                                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addAgenda}
                                className="mt-4 text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add agenda item
                            </button>
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Attendees</span>
                                    <span className="font-medium">{attendees.filter(a => a.user_id).length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Agenda Items</span>
                                    <span className="font-medium">{agendas.filter(a => a.title).length}</span>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="glass-button flex-1 flex items-center justify-center gap-2"
                                    >
                                        {processing ? <LoadingSpinner /> : <Save className="w-4 h-4" />}
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <Link
                                        href={`/management/meetings/${meeting.id}`}
                                        className="glass-button-secondary flex-1 flex items-center justify-center gap-2"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
