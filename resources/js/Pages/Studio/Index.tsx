import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState, Pagination } from '@/Components/ui';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Plus, Search, Calendar as CalendarIcon, Camera, Settings } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales: {} as any,
});

const STATUS_COLORS: Record<string, string> = {
    tentative: '#94a3b8',
    confirmed: '#3b82f6',
    in_progress: '#f59e0b',
    completed: '#10b981',
    cancelled: '#ef4444',
};

interface BookingEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    status: string;
    booking: any;
}

export default function StudioIndex() {
    const { bookings, calendarBookings } = usePage().props as any;
    const [view, setView] = useState<'calendar' | 'list'>('list');
    const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const events: BookingEvent[] = useMemo(() => (calendarBookings || []).map((b: any) => ({
        id: b.id,
        title: b.title,
        start: new Date(b.start_datetime),
        end: new Date(b.end_datetime),
        status: b.status,
        booking: b,
    })), [calendarBookings]);

    const eventStyleGetter = useCallback((event: BookingEvent) => ({
        style: {
            backgroundColor: STATUS_COLORS[event.status] || '#6b7280',
            borderRadius: '6px',
            opacity: event.status === 'cancelled' ? 0.5 : 1,
            color: 'white',
            border: 'none',
            fontSize: '12px',
            padding: '2px 6px',
        },
    }), []);

    const handleSelectEvent = useCallback((event: BookingEvent) => {
        router.visit(`/studio/${event.id}`);
    }, []);

    const filteredBookings = (bookings?.data || []).filter((b: any) => {
        const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.booking_reference.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <AppLayout>
            <Head title="Studio" />

            <PageHeader
                title="Studio"
                subtitle="Manage photo/video studio bookings"
                action={
                    <div className="flex items-center gap-2">
                        <Link href="/studio/resources" className="glass-button-secondary flex items-center gap-2">
                            <Settings className="w-4 h-4" /> Manage Resources
                        </Link>
                        <Link href="/studio/create" className="glass-button flex items-center gap-2">
                            <Plus className="w-4 h-4" /> New Booking
                        </Link>
                    </div>
                }
            />

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search bookings..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'all', label: 'All Status' },
                                { value: 'tentative', label: 'Tentative' },
                                { value: 'confirmed', label: 'Confirmed' },
                                { value: 'in_progress', label: 'In Progress' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'cancelled', label: 'Cancelled' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setStatusFilter(opt.value)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                        statusFilter === opt.value
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setView('calendar')}
                            className={`p-2 rounded-lg transition-colors ${view === 'calendar' ? 'bg-slate-200 dark:bg-white/20' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
                        >
                            <CalendarIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-slate-200 dark:bg-white/20' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </GlassCard>

            {view === 'calendar' ? (
                <GlassCard className="overflow-hidden p-0">
                    <div className="p-4" style={{ height: '650px' }}>
                        <BigCalendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                            view={calendarView}
                            date={calendarDate}
                            onView={(v) => setCalendarView(v as View)}
                            onNavigate={(date) => setCalendarDate(date)}
                            eventPropGetter={eventStyleGetter}
                            onSelectEvent={handleSelectEvent}
                            popup
                        />
                    </div>
                </GlassCard>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking: any) => (
                            <Link key={booking.id} href={`/studio/${booking.id}`}>
                                <GlassCard variant="interactive" className="h-full">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-xs font-mono text-slate-400">{booking.booking_reference}</span>
                                        <StatusBadge status={booking.status} />
                                    </div>
                                    <h3 className="font-semibold mb-2">{booking.title}</h3>
                                    {booking.client && (
                                        <p className="text-sm text-slate-400 mb-2">{booking.client.company_name}</p>
                                    )}
                                    <div className="text-sm text-slate-400">
                                        <p>{new Date(booking.start_datetime).toLocaleString()}</p>
                                        <p>to {new Date(booking.end_datetime).toLocaleString()}</p>
                                    </div>
                                    {booking.resources?.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                                            <p className="text-xs text-slate-400">
                                                {booking.resources.length} resource(s)
                                            </p>
                                        </div>
                                    )}
                                </GlassCard>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <GlassCard>
                                <EmptyState 
                                    icon={Camera}
                                    title="No bookings found"
                                    action={
                                        <Link href="/studio/create" className="glass-button">
                                            <Plus className="w-4 h-4 mr-2" /> Create Booking
                                        </Link>
                                    }
                                />
                            </GlassCard>
                        </div>
                    )}
                </div>
            )}
            <Pagination meta={bookings} />
        </AppLayout>
    );
}