import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Calendar, User, StickyNote, Camera, Users, Hash, Receipt, Package, Plus, ExternalLink, X, Tag } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';
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

const DELIVERABLE_STATUS_STYLES: Record<string, string> = {
    pending: 'bg-slate-200 dark:bg-white/10 text-slate-500',
    in_progress: 'bg-amber-500/20 text-amber-500',
    delivered: 'bg-green-500/20 text-green-500',
};

function DeliverablesCard({ booking }: { booking: any }) {
    const [adding, setAdding] = useState(false);
    const { data, setData, post, processing, reset } = useForm({ title: '', link: '' });

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/studio/${booking.id}/deliverables`, {
            preserveScroll: true,
            onSuccess: () => { reset(); setAdding(false); },
        });
    };

    const updateStatus = (deliverable: any, status: string) => {
        router.put(`/studio/deliverables/${deliverable.id}`, {
            title: deliverable.title,
            link: deliverable.link,
            status,
        }, { preserveScroll: true });
    };

    const remove = (deliverable: any) => {
        Swal.fire({
            title: `Remove "${deliverable.title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Remove',
        }).then((res) => {
            if (res.isConfirmed) router.delete(`/studio/deliverables/${deliverable.id}`, { preserveScroll: true });
        });
    };

    return (
        <GlassCard>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5 text-slate-400" /> Deliverables
                </h3>
                <button onClick={() => setAdding((v) => !v)} className="glass-button-secondary flex items-center gap-1 text-sm py-1.5">
                    <Plus className="w-4 h-4" /> Add
                </button>
            </div>

            {adding && (
                <form onSubmit={submitAdd} className="mb-4 p-3 bg-slate-50 dark:bg-white/5 rounded-lg space-y-2">
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="e.g. Edited Photos, Final Video"
                        className="glass-input w-full text-sm"
                        autoFocus
                    />
                    <input
                        type="url"
                        value={data.link}
                        onChange={(e) => setData('link', e.target.value)}
                        placeholder="Link (optional)"
                        className="glass-input w-full text-sm"
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setAdding(false)} className="glass-button-secondary text-sm py-1.5 px-3">Cancel</button>
                        <button type="submit" disabled={processing || !data.title} className="glass-button text-sm py-1.5 px-3">Add</button>
                    </div>
                </form>
            )}

            {booking.deliverables?.length > 0 ? (
                <div className="space-y-2">
                    {booking.deliverables.map((d: any) => (
                        <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg gap-2">
                            <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{d.title}</p>
                                {d.link && (
                                    <a href={d.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" /> Open link
                                    </a>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <select
                                    value={d.status}
                                    onChange={(e) => updateStatus(d, e.target.value)}
                                    className={`text-xs px-2 py-1 rounded-full border-0 ${DELIVERABLE_STATUS_STYLES[d.status]}`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                                <button onClick={() => remove(d)} className="text-slate-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !adding && <p className="text-sm text-slate-400">No deliverables tracked yet.</p>
            )}
        </GlassCard>
    );
}

export default function StudioShow() {
    const { booking } = usePage().props as any;
    const formatCurrency = useCurrency();
    const errors = (usePage().props as any).errors || {};

    const generateInvoice = () => {
        router.post(`/studio/${booking.id}/invoice`, {}, { preserveScroll: true });
    };

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
                            <DetailRow label="Shoot Type" icon={Tag}>{booking.shoot_type?.name}</DetailRow>
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

                    <DeliverablesCard booking={booking} />
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

                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-slate-400" /> Pricing & Invoice
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Rate</span>
                                <span className="font-medium">{booking.rate != null ? formatCurrency(booking.rate) : '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Deposit</span>
                                <span className="font-medium">
                                    {booking.deposit_amount != null ? formatCurrency(booking.deposit_amount) : '—'}
                                    {booking.deposit_amount != null && (
                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${booking.deposit_paid ? 'bg-green-500/20 text-green-500' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}`}>
                                            {booking.deposit_paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                            {errors.invoice && <p className="text-red-400 text-sm mb-3">{errors.invoice}</p>}
                            {booking.invoice ? (
                                <Link
                                    href={`/finance/receivables/${booking.invoice.id}`}
                                    className="glass-button-secondary w-full flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" /> View Invoice ({booking.invoice.invoice_number})
                                </Link>
                            ) : (
                                <button onClick={generateInvoice} className="glass-button w-full flex items-center justify-center gap-2">
                                    <Receipt className="w-4 h-4" /> Generate Invoice
                                </button>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
}
