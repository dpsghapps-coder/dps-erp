import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function MeetingsIndex() {
    const { meetings } = usePage().props as any;

    return (
        <AppLayout>
            <Head title="Meetings" />

            <PageHeader
                title="Meetings"
                subtitle="Management meetings"
                action={
                    <Link href="/management/meetings/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Meeting
                    </Link>
                }
            />

            <GlassCard className="overflow-hidden p-0">
                {meetings?.data?.length > 0 ? (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                        <th className="py-3 px-4">Number</th>
                                        <th className="py-3 px-4">Title</th>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">Type</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Organizer</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {meetings.data.map((meeting: any) => (
                                        <tr key={meeting.id} className="hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 text-sm font-mono text-slate-700 dark:text-slate-300">
                                                {meeting.number}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                                                {meeting.title}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {meeting.date ? new Date(meeting.date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[meeting.type] || 'bg-slate-100 text-slate-800'}`}>
                                                    {meeting.type?.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[meeting.status] || 'bg-slate-100 text-slate-800'}`}>
                                                    {meeting.status?.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                {meeting.organizer?.name}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    href={`/management/meetings/${meeting.id}`}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-white/5">
                            {meetings.data.map((meeting: any) => (
                                <Link
                                    key={meeting.id}
                                    href={`/management/meetings/${meeting.id}`}
                                    className="block p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-sm font-mono text-slate-500">{meeting.number}</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{meeting.title}</p>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[meeting.status] || 'bg-slate-100 text-slate-800'}`}>
                                            {meeting.status?.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>{meeting.date ? new Date(meeting.date).toLocaleDateString() : '-'}</span>
                                        <span className={`px-2 py-0.5 rounded-full ${TYPE_STYLES[meeting.type] || 'bg-slate-100 text-slate-800'}`}>
                                            {meeting.type?.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {meetings.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                                <div className="text-sm text-slate-500">
                                    Showing {meetings.from} to {meetings.to} of {meetings.total} meetings
                                </div>
                                <div className="flex items-center gap-2">
                                    {meetings.prev_page_url ? (
                                        <Link
                                            href={meetings.prev_page_url}
                                            className="glass-button-secondary px-3 py-1.5 flex items-center gap-1 text-sm"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Prev
                                        </Link>
                                    ) : (
                                        <span className="px-3 py-1.5 text-sm text-slate-400 flex items-center gap-1">
                                            <ChevronLeft className="w-4 h-4" /> Prev
                                        </span>
                                    )}
                                    {meetings.next_page_url ? (
                                        <Link
                                            href={meetings.next_page_url}
                                            className="glass-button-secondary px-3 py-1.5 flex items-center gap-1 text-sm"
                                        >
                                            Next <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <span className="px-3 py-1.5 text-sm text-slate-400 flex items-center gap-1">
                                            Next <ChevronRight className="w-4 h-4" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={Calendar}
                        title="No meetings found"
                        description="Get started by scheduling your first meeting."
                        action={
                            <Link href="/management/meetings/create" className="glass-button flex items-center gap-2 mt-2">
                                <Plus className="w-4 h-4" /> New Meeting
                            </Link>
                        }
                    />
                )}
            </GlassCard>
        </AppLayout>
    );
}
