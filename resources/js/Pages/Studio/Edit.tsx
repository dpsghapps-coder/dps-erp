import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusChips } from '@/Components/ui';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import CrewPicker, { CrewMember } from '@/Components/Studio/CrewPicker';

function toDatetimeLocal(value: string) {
    // <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm", not a full ISO string.
    return value ? value.slice(0, 16).replace(' ', 'T') : '';
}

export default function StudioEdit() {
    const { booking, clients, resources, users, shootTypes } = usePage().props as any;
    const { data, setData, put, processing, errors } = useForm({
        title: booking.title || '',
        client_id: booking.client_id ? String(booking.client_id) : '',
        shoot_type_id: booking.shoot_type_id ? String(booking.shoot_type_id) : '',
        status: booking.status,
        start_datetime: toDatetimeLocal(booking.start_datetime),
        end_datetime: toDatetimeLocal(booking.end_datetime),
        notes: booking.notes || '',
        resource_ids: (booking.resources || []).map((r: any) => String(r.id)) as string[],
        crew: (booking.crew || []).map((c: any) => ({ user_id: String(c.id), role_in_shoot: c.pivot?.role_in_shoot || '' })) as CrewMember[],
        rate: booking.rate != null ? String(booking.rate) : '',
        deposit_amount: booking.deposit_amount != null ? String(booking.deposit_amount) : '',
        deposit_paid: Boolean(booking.deposit_paid),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/studio/${booking.id}`);
    };

    const toggleResource = (id: string) => {
        const current = data.resource_ids;
        if (current.includes(id)) {
            setData('resource_ids', current.filter((r: string) => r !== id));
        } else {
            setData('resource_ids', [...current, id]);
        }
    };

    return (
        <AppLayout>
            <Head title={`Edit ${booking.title}`} />

            <div className="mb-6">
                <Link href={`/studio/${booking.id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Booking
                </Link>
            </div>

            <PageHeader title="Edit Booking" subtitle={booking.booking_reference} />

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Title *</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="Booking title"
                                    />
                                    {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Client</label>
                                    <select
                                        value={data.client_id}
                                        onChange={(e) => setData('client_id', e.target.value)}
                                        className="glass-input w-full"
                                    >
                                        <option value="">Select Client</option>
                                        {(clients || []).map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.company_name}</option>
                                        ))}
                                    </select>
                                    {errors.client_id && <p className="text-red-400 text-sm mt-1">{errors.client_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Shoot Type</label>
                                    <select
                                        value={data.shoot_type_id}
                                        onChange={(e) => setData('shoot_type_id', e.target.value)}
                                        className="glass-input w-full"
                                    >
                                        <option value="">Select Shoot Type</option>
                                        {(shootTypes || []).map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Status *</label>
                                    <StatusChips
                                        value={data.status}
                                        onChange={(v) => setData('status', v)}
                                        options={[
                                            { value: 'tentative', label: 'Tentative' },
                                            { value: 'confirmed', label: 'Confirmed' },
                                            { value: 'in_progress', label: 'In Progress' },
                                            { value: 'completed', label: 'Completed' },
                                            { value: 'cancelled', label: 'Cancelled' },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Start Date/Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={data.start_datetime}
                                        onChange={(e) => setData('start_datetime', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                    {errors.start_datetime && <p className="text-red-400 text-sm mt-1">{errors.start_datetime}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">End Date/Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={data.end_datetime}
                                        onChange={(e) => setData('end_datetime', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                    {errors.end_datetime && <p className="text-red-400 text-sm mt-1">{errors.end_datetime}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Notes</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="glass-input w-full h-24"
                                        placeholder="Booking notes..."
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Rate</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.rate}
                                        onChange={(e) => setData('rate', e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Deposit Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.deposit_amount}
                                        onChange={(e) => setData('deposit_amount', e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="deposit_paid"
                                        checked={data.deposit_paid}
                                        onChange={(e) => setData('deposit_paid', e.target.checked)}
                                        className="w-4 h-4 rounded"
                                    />
                                    <label htmlFor="deposit_paid" className="text-sm font-medium">Deposit collected</label>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4">Resources</h3>
                            <p className="text-sm text-slate-400 mb-4">Select resources for this booking</p>
                            {errors.resource_ids && (
                                <p className="text-red-400 text-sm mb-4 bg-red-500/10 rounded-lg p-3">{errors.resource_ids}</p>
                            )}
                            <div className="space-y-2">
                                {(resources || []).map((resource: any) => (
                                    <label key={resource.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10">
                                        <input
                                            type="checkbox"
                                            checked={data.resource_ids.includes(String(resource.id))}
                                            onChange={() => toggleResource(String(resource.id))}
                                            className="w-4 h-4 rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{resource.name}</p>
                                            <p className="text-xs text-slate-400">{resource.type}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4">Crew</h3>
                            <p className="text-sm text-slate-400 mb-4">Assign photographers or assistants to this shoot</p>
                            <CrewPicker users={users || []} crew={data.crew} onChange={(crew) => setData('crew', crew)} />
                        </GlassCard>

                        <GlassCard>
                            <div className="flex flex-col gap-3">
                                <button type="submit" disabled={processing} className="glass-button w-full">
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                                <Link href={`/studio/${booking.id}`} className="glass-button w-full text-center">Cancel</Link>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
