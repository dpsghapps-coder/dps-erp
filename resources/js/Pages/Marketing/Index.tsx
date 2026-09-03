import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Calendar, Eye, Pencil, Trash2, Globe } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, startOfDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Swal from 'sweetalert2';
import { useCurrency } from '@/Utils/currency';

const locales = {
    'en-US': {
        format,
        parse,
        startOfWeek,
        getDay,
        locales: {} as any,
    },
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales: {} as any,
});

const TYPE_COLORS: Record<string, string> = {
    social: '#3b82f6',
    email: '#8b5cf6',
    event: '#10b981',
    ad: '#f59e0b',
    print: '#ef4444',
    other: '#6b7280',
};

const TYPE_LABELS: Record<string, string> = {
    social: 'Social Media',
    email: 'Email',
    event: 'Event',
    ad: 'Advertising',
    print: 'Print',
    other: 'Other',
};

interface CampaignEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    type: string;
    status: string;
    campaign: any;
}

export default function MarketingIndex() {
    const { campaigns } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [currentView, setCurrentView] = useState<View>(Views.MONTH);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    const events: CampaignEvent[] = useMemo(() => {
        if (!campaigns) return [];
        return campaigns.map((campaign: any) => ({
            id: campaign.id,
            title: campaign.title,
            start: startOfDay(new Date(campaign.start_date)),
            end: startOfDay(new Date(campaign.end_date)),
            type: campaign.type,
            status: campaign.status,
            campaign,
        }));
    }, [campaigns]);

    const eventStyleGetter = useCallback((event: CampaignEvent) => {
        const color = TYPE_COLORS[event.type] || '#6b7280';
        return {
            style: {
                backgroundColor: color,
                borderRadius: '6px',
                opacity: event.status === 'completed' ? 0.6 : 1,
                color: 'white',
                border: 'none',
                fontSize: '12px',
                padding: '2px 6px',
            },
        };
    }, []);

    const handleSelectEvent = useCallback((event: CampaignEvent) => {
        setSelectedCampaign(event.campaign);
    }, []);

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Cancel Campaign?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Cancel Campaign',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/marketing/${id}`);
            }
        });
    };

    const activeCampaigns = campaigns?.filter((c: any) => c.status === 'active').length || 0;
    const upcomingCampaigns = campaigns?.filter((c: any) => c.status === 'scheduled').length || 0;
    const totalBudget = campaigns?.reduce((sum: number, c: any) => sum + (parseFloat(c.budget) || 0), 0) || 0;

    return (
        <AppLayout>
            <Head title="Marketing" />

            <PageHeader
                title="Marketing"
                subtitle={`${campaigns?.length || 0} campaigns total`}
                action={
                    <Link href="/marketing/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Campaign
                    </Link>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <GlassCard variant="bordered" size="sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{activeCampaigns}</p>
                            <p className="text-sm text-slate-500">Active Campaigns</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard variant="bordered" size="sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{upcomingCampaigns}</p>
                            <p className="text-sm text-slate-500">Upcoming</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard variant="bordered" size="sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-lg">💵</span>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{formatCurrency(totalBudget)}</p>
                            <p className="text-sm text-slate-500">Total Budget</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="overflow-hidden p-0">
                <div className="p-4" style={{ height: '600px' }}>
                    <BigCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                        view={currentView}
                        date={currentDate}
                        onView={(view) => setCurrentView(view as View)}
                        onNavigate={(date) => setCurrentDate(date)}
                        eventPropGetter={eventStyleGetter}
                        onSelectEvent={handleSelectEvent}
                        popup
                        selectable
                    />
                </div>
            </GlassCard>

            {selectedCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedCampaign(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-mono text-slate-500">{selectedCampaign.number}</p>
                                <h3 className="text-lg font-semibold">{selectedCampaign.title}</h3>
                            </div>
                            <StatusBadge status={selectedCampaign.status} />
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Type</span>
                                <span className="font-medium">{TYPE_LABELS[selectedCampaign.type] || selectedCampaign.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Duration</span>
                                <span className="font-medium">
                                    {new Date(selectedCampaign.start_date).toLocaleDateString()} - {new Date(selectedCampaign.end_date).toLocaleDateString()}
                                </span>
                            </div>
                            {selectedCampaign.client && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Client</span>
                                    <span className="font-medium">{selectedCampaign.client.company_name}</span>
                                </div>
                            )}
                            {selectedCampaign.budget && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Budget</span>
                                    <span className="font-medium">{formatCurrency(selectedCampaign.budget)}</span>
                                </div>
                            )}
                            {selectedCampaign.assigned_to && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Assigned To</span>
                                    <span className="font-medium">{selectedCampaign.assigned_to.name}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between pt-4 border-t">
                            <div className="flex gap-2">
                                <Link href={`/marketing/${selectedCampaign.id}`} className="glass-button-secondary px-3 py-1.5 text-sm flex items-center gap-1">
                                    <Eye className="w-4 h-4" /> View
                                </Link>
                                <Link href={`/marketing/${selectedCampaign.id}/edit`} className="glass-button-secondary px-3 py-1.5 text-sm flex items-center gap-1">
                                    <Pencil className="w-4 h-4" /> Edit
                                </Link>
                                <button onClick={() => { setSelectedCampaign(null); handleDelete(selectedCampaign.id); }} className="glass-button-secondary px-3 py-1.5 text-sm flex items-center gap-1 text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" /> Cancel
                                </button>
                            </div>
                            <button onClick={() => setSelectedCampaign(null)} className="glass-button-secondary px-3 py-1.5 text-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
