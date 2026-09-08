import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Calendar, User, StickyNote, Camera, Users, Hash } from 'lucide-react';
import Swal from 'sweetalert2';

function DetailRow({ label, icon: Icon, children }: { label: string; icon?: any; children?: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            {Icon && <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />}
            <div>
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <div className="text-sm font-medium">{children ?? <span className="text-slate-400 font-normal">—</span>}</div>
            </div>
        </div>
    );
}

export default function StudioShow() {
    const { booking } = usePage().props as any;

    const handleDelete = () => {
        Swal.fire({
            title: `Delete booking "${booking.title}"?`,
            text: 'This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) router.delete(`/studio/${booking.id}`);
        });
    };

    return (
        <AppLayout>
            <Head title={booking.title} />

            <div className="mb-6">
                <Link href="/studio" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Studio
                </Link>
            </div>

            <PageHeader
                title={booking.title}
                subtitle={booking.booking_reference}
                action={
                    <div className="flex items-center gap-2">
                        <Link href={`/studio/${booking.id}/edit`} className="glass-button-secondary flex items-center gap-2">
                            <Pencil className="w-4 h-4" /> Edit
                        </Link>
                        <button onClick={handleDelete} className="glass-button-secondary flex items-center gap-2 text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                }
            />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Booking Details</h3>
                            <StatusBadge status={booking.status} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <DetailRow label="Reference" icon={Hash}>{booking.booking_reference}</DetailRow>
                            <DetailRow label="Client" icon={User}>{booking.client?.company_name}</DetailRow>
                            <DetailRow label="Starts" icon={Calendar}>{new Date(booking.start_datetime).toLocaleString()}</DetailRow>
                            <DetailRow label="Ends" icon={Calendar}>{new Date(booking.end_datetime).toLocaleString()}</DetailRow>
                        </div>
                        {booking.notes && (
                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                                <DetailRow label="Notes" icon={StickyNote}>
                                    <p className="font-normal whitespace-pre-wrap">{booking.notes}</p>
                                </DetailRow>
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-400" /> Crew
                        </h3>
                        {booking.crew?.length > 0 ? (
                            <div className="space-y-2">
                                {booking.crew.map((member: any) => (
                                    <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                        <span className="font-medium">{member.name}</span>
                                        <span className="text-xs text-slate-400">{member.pivot?.role_in_shoot}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">No crew assigned yet.</p>
                        )}
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Camera className="w-5 h-5 text-slate-400" /> Resources
                        </h3>
                        {booking.resources?.length > 0 ? (
                            <div className="space-y-2">
                                {booking.resources.map((resource: any) => (
                                    <div key={resource.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                        <p className="font-medium">{resource.name}</p>
                                        <p className="text-xs text-slate-400">{resource.type?.replace(/_/g, ' ')}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">No resources assigned.</p>
                        )}
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
}
