import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, Calendar as CalendarIcon, Camera } from 'lucide-react';
import { useState } from 'react';

const statusColors: Record<string, string> = {
    tentative: 'status-tentative',
    confirmed: 'status-confirmed',
    in_progress: 'status-in_progress',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
};

export default function StudioIndex() {
    const { bookings } = usePage().props;
    const [view, setView] = useState<'calendar' | 'list'>('list');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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
                    <Link href="/studio/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Booking
                    </Link>
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
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="glass-input"
                        >
                            <option value="all">All Status</option>
                            <option value="tentative">Tentative</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setView('calendar')}
                            className={`p-2 rounded-lg transition-colors ${view === 'calendar' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        >
                            <CalendarIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </GlassCard>

            {view === 'calendar' ? (
                <GlassCard>
                    <div className="text-center py-12 text-slate-400">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Calendar view coming soon</p>
                        <p className="text-sm">Week/Month calendar will be available here</p>
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
                                        <div className="mt-3 pt-3 border-t border-white/10">
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
        </AppLayout>
    );
}