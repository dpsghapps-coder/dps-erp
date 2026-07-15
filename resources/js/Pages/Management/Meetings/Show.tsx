import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, FileText, CheckCircle2, Pencil } from 'lucide-react';

const TYPE_STYLES: Record<string, string> = {
    board: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    management: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    department: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    ad_hoc: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const STATUS_STYLES: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const ATTENDEE_STATUS_STYLES: Record<string, string> = {
    present: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    apologies: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const DECISION_STATUS_STYLES: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function MeetingShow() {
    const { meeting } = usePage().props as any;

    return (
        <AppLayout>
            <Head title={meeting.title} />

            <div className="mb-4 flex items-center gap-2">
                <Link
                    href="/management/meetings"
                    className="glass-button-secondary inline-flex items-center gap-2 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Meetings
                </Link>
                <Link
                    href={`/management/meetings/${meeting.id}/edit`}
                    className="glass-button-secondary inline-flex items-center gap-2 text-sm"
                >
                    <Pencil className="w-4 h-4" /> Edit
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{meeting.title}</h1>
                    {meeting.number && (
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-mono">{meeting.number}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[meeting.status] || 'bg-slate-100 text-slate-800'}`}>
                        {meeting.status?.replace(/_/g, ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_STYLES[meeting.type] || 'bg-slate-100 text-slate-800'}`}>
                        {meeting.type?.replace(/_/g, ' ')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            Meeting Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Time</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{meeting.time || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Venue</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{meeting.venue || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Organizer</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{meeting.organizer?.name || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Chairperson</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{meeting.chairperson?.name || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Secretary</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{meeting.secretary?.name || '-'}</p>
                                </div>
                            </div>
                        </div>
                        {meeting.notes && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Notes</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{meeting.notes}</p>
                            </div>
                        )}
                    </GlassCard>

                    {meeting.agendas?.length > 0 && (
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Agenda</h3>
                            <div className="space-y-3">
                                {meeting.agendas.map((agenda: any, index: number) => (
                                    <div key={agenda.id} className="glass-card p-4 rounded-lg border border-slate-200 dark:border-white/10">
                                        <div className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{agenda.title}</p>
                                                {agenda.presenter && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        Presenter: {agenda.presenter.name}
                                                    </p>
                                                )}
                                                {agenda.discussion_notes && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap">{agenda.discussion_notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {meeting.decisions?.length > 0 && (
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Linked Decisions</h3>
                            <div className="space-y-3">
                                {meeting.decisions.map((decision: any) => (
                                    <Link
                                        key={decision.id}
                                        href={`/management/decisions/${decision.id}`}
                                        className="block glass-card p-4 rounded-lg border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-slate-500">{decision.number}</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{decision.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DECISION_STATUS_STYLES[decision.status] || 'bg-slate-100 text-slate-800'}`}>
                                                    {decision.status?.replace(/_/g, ' ')}
                                                </span>
                                                {decision.category && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                                        {decision.category.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </GlassCard>
                    )}
                </div>

                <div className="space-y-6">
                    {meeting.attendees?.length > 0 && (
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-slate-400" />
                                Attendees ({meeting.attendees.length})
                            </h3>
                            <div className="space-y-2">
                                {meeting.attendees.map((attendee: any) => (
                                    <div key={attendee.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                                                {attendee.user?.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className="text-sm text-slate-900 dark:text-white">{attendee.user?.name}</span>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ATTENDEE_STATUS_STYLES[attendee.status] || 'bg-slate-100 text-slate-800'}`}>
                                            {attendee.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {meeting.createdBy && (
                        <GlassCard>
                            <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-white">Created By</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{meeting.createdBy.name}</p>
                            {meeting.created_at && (
                                <p className="text-xs text-slate-400 mt-1">{new Date(meeting.created_at).toLocaleString()}</p>
                            )}
                        </GlassCard>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
