import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusChips } from '@/Components/ui';
import RichTextEditor from '@/Components/RichTextEditor';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface DealOption {
    id: number;
    type: string;
    stage: string;
    created_at: string;
}

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
];

const dealLabel = (deal: DealOption) => {
    const type = deal.type === 'repeat_business' ? 'Sales Campaign' : 'New Lead';
    const stage = deal.stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const date = new Date(deal.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${type} — ${stage} (${date})`;
};

export default function ProposalEdit() {
    const { client, proposal, deals } = usePage().props as any;

    const { data, setData, put, processing, errors } = useForm({
        title: proposal.title || '',
        status: proposal.status || 'draft',
        deal_id: proposal.deal_id ? String(proposal.deal_id) : '',
        body: proposal.body || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/crm/${client.id}/proposals/${proposal.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit ${proposal.title}`} />

            <div className="mb-6">
                <Link href={`/crm/${client.id}/proposals/${proposal.id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Proposal
                </Link>
            </div>

            <PageHeader title="Edit Proposal" subtitle={client.company_name} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <GlassCard>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="glass-input w-full"
                                required
                            />
                            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                        </div>

                        {deals?.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Linked Deal</label>
                                <select value={data.deal_id} onChange={(e) => setData('deal_id', e.target.value)} className="glass-input w-full">
                                    <option value="">No linked deal</option>
                                    {deals.map((d: DealOption) => (
                                        <option key={d.id} value={d.id}>{dealLabel(d)}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <StatusChips value={data.status} onChange={(v) => setData('status', v)} options={STATUS_OPTIONS} />
                    </div>
                </GlassCard>

                <GlassCard>
                    <label className="block text-sm font-medium mb-2">Proposal Content</label>
                    <RichTextEditor value={data.body} onChange={(html) => setData('body', html)} />
                    {errors.body && <p className="text-red-400 text-sm mt-1">{errors.body}</p>}
                </GlassCard>

                <div className="flex justify-end gap-3">
                    <Link href={`/crm/${client.id}/proposals/${proposal.id}`} className="glass-button-secondary">Cancel</Link>
                    <button type="submit" disabled={processing} className="glass-button">
                        {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
