import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function StudioCreate() {
    const { clients, resources } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        client_id: '',
        status: 'tentative',
        start_datetime: '',
        end_datetime: '',
        notes: '',
        resource_ids: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/studio');
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
            <Head title="Create Booking" />

            <div className="mb-6">
                <Link href="/studio" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Studio
                </Link>
            </div>

            <PageHeader title="Create Booking" subtitle="Schedule a studio booking" />

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
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Status *</label>
                                    <select 
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="glass-input w-full"
                                    >
                                        <option value="tentative">Tentative</option>
                                        <option value="confirmed">Confirmed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Start Date/Time *</label>
                                    <input 
                                        type="datetime-local"
                                        value={data.start_datetime}
                                        onChange={(e) => setData('start_datetime', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">End Date/Time *</label>
                                    <input 
                                        type="datetime-local"
                                        value={data.end_datetime}
                                        onChange={(e) => setData('end_datetime', e.target.value)}
                                        className="glass-input w-full"
                                    />
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
                    </div>

                    <div className="space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4">Resources</h3>
                            <p className="text-sm text-slate-400 mb-4">Select resources for this booking</p>
                            <div className="space-y-2">
                                {(resources || []).map((resource: any) => (
                                    <label key={resource.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
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
                            <div className="flex flex-col gap-3">
                                <button type="submit" disabled={processing} className="glass-button w-full">
                                    {processing ? 'Creating...' : 'Create Booking'}
                                </button>
                                <Link href="/studio" className="glass-button w-full text-center">Cancel</Link>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}