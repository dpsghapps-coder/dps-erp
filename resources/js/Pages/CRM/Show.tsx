import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusChips, StatusBadge } from '@/Components/ui';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Clock, History as HistoryIcon, DollarSign, ShoppingBag, FileText, Calendar, ArrowRight, ShoppingCart, AlertTriangle, Rocket, ShieldAlert, ShieldCheck, Briefcase } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';
import { useState, useMemo } from 'react';
import WhatsAppLink from '@/Components/WhatsAppLink';
import ClientContacts from '@/Components/CRM/ClientContacts';
import Swal from 'sweetalert2';

const STAGE_LABELS: Record<string, string> = {
    new_lead: 'New Lead',
    contacted: 'Contacted',
    meeting_scheduled: 'Meeting Scheduled',
    proposal_sent: 'Proposal Sent',
    negotiating: 'Negotiating',
    converted: 'Converted',
    lost: 'Lost',
};

const OPEN_PIPELINE_STAGES = ['new_lead', 'contacted', 'meeting_scheduled', 'proposal_sent', 'negotiating'];

const TABS = ['Details', 'Deals', 'Interactions', 'Proforma', 'Orders', 'History'] as const;
type Tab = typeof TABS[number];

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-400',
    sent: 'bg-blue-500/20 text-blue-400',
    accepted: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
};

function DetailRow({ label, children }: { label: string; children?: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            {children ? children : <span className="text-slate-600">—</span>}
        </div>
    );
}

function formatFieldName(name: string) {
    return name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getActionBadge(action: string) {
    switch (action) {
        case 'created_client':
            return { label: 'Created Client', style: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' };
        case 'updated_client':
            return { label: 'Updated Client', style: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' };
        case 'deleted_client':
            return { label: 'Deleted Client', style: 'bg-red-500/20 text-red-300 border border-red-500/30' };
        case 'created_contact':
            return { label: 'Added Contact', style: 'bg-teal-500/20 text-teal-300 border border-teal-500/30' };
        case 'updated_contact':
            return { label: 'Updated Contact', style: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' };
        case 'deleted_contact':
            return { label: 'Removed Contact', style: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' };
        default:
            return { label: action, style: 'bg-slate-500/20 text-slate-300 border border-slate-500/30' };
    }
}

function renderValuesDiff(entry: any) {
    const oldVals = entry.old_values || {};
    const newVals = entry.new_values || {};

    if (entry.action === 'created_client' || entry.action === 'created_contact') {
        return (
            <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-xs space-y-1 border border-slate-200 dark:border-white/10 mt-1">
                <span className="text-slate-400 font-medium">Created record with initial details:</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                    {Object.entries(newVals).map(([k, v]) => {
                        if (!v || k.startsWith('_') || k === 'id' || k === 'client_id') return null;
                        return (
                            <div key={k} className="text-slate-300">
                                <span className="text-slate-500">{formatFieldName(k)}:</span> {String(v)}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (entry.action === 'updated_client' || entry.action === 'updated_contact') {
        const keys = Array.from(new Set([...Object.keys(oldVals), ...Object.keys(newVals)])).filter(
            (k) => !k.startsWith('_') && k !== 'updated_at' && k !== 'id'
        );

        if (keys.length === 0) return null;

        return (
            <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-xs space-y-2 border border-slate-200 dark:border-white/10 mt-1">
                {oldVals._contact_name && (
                    <p className="text-slate-400 font-medium mb-1">
                        Contact: <span className="text-slate-900 dark:text-white">{oldVals._contact_name}</span>
                    </p>
                )}
                {keys.map((key) => {
                    const oldV = oldVals[key];
                    const newV = newVals[key];
                    return (
                        <div key={key} className="flex flex-wrap items-center gap-2">
                            <span className="text-slate-400 font-medium min-w-[120px]">{formatFieldName(key)}:</span>
                            <span className="line-through text-red-400/80 bg-red-500/10 px-1.5 py-0.5 rounded">
                                {oldV !== null && oldV !== undefined && oldV !== '' ? String(oldV) : 'Empty'}
                            </span>
                            <span className="text-slate-500">➔</span>
                            <span className="text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                {newV !== null && newV !== undefined && newV !== '' ? String(newV) : 'Empty'}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (entry.action === 'deleted_contact') {
        return (
            <div className="bg-red-500/10 text-red-400 rounded-lg p-3 text-xs border border-red-500/20 mt-1">
                Removed contact: {oldVals.first_name} {oldVals.last_name} {oldVals.job_title ? `(${oldVals.job_title})` : ''}
            </div>
        );
    }

    return null;
}

export default function ClientShow() {
    const page = usePage().props as any;
    const { client, auditLogs, regions = [], cities = [], neighbourhoods = [] } = page;
    const historyList = auditLogs || [];
    const permissions = (page.auth?.permissions as string[]) || [];
    const canApproveGreylist = permissions.includes('*') || permissions.includes('crm.approve-greylist');
    const formatCurrency = useCurrency();
    const [activeTab, setActiveTab] = useState<Tab>('Details');
    const [interactionTypeFilter, setInteractionTypeFilter] = useState('all');

    const deals = client?.deals || [];
    const openDeal = useMemo(() => deals.find((d: any) => OPEN_PIPELINE_STAGES.includes(d.stage)), [deals]);

    const handleGreylistToggle = () => {
        if (client.is_greylisted) {
            router.post(`/crm/${client.id}/greylist`, { greylisted: false }, { preserveScroll: true });
            return;
        }

        Swal.fire({
            title: 'Greylist this client?',
            input: 'text',
            inputPlaceholder: 'Reason (optional)',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Greylist',
        }).then((res) => {
            if (res.isConfirmed) {
                router.post(`/crm/${client.id}/greylist`, { greylisted: true, reason: res.value || null }, { preserveScroll: true });
            }
        });
    };

    const ltv = useMemo(() => {
        if (!client?.orders?.length) return 0;
        return client.orders
            .filter((o: any) => o.status !== 'cancelled')
            .reduce((sum: number, o: any) => sum + (parseFloat(o.grand_total) || 0), 0);
    }, [client?.orders]);

    const activeOrdersCount = useMemo(() => {
        if (!client?.orders?.length) return 0;
        return client.orders.filter((o: any) => ['confirmed', 'payment_received', 'in_production', 'ready'].includes(o.status)).length;
    }, [client?.orders]);

    const proformasTotal = useMemo(() => {
        if (!client?.proformas?.length) return 0;
        return client.proformas.reduce((sum: number, p: any) => sum + (parseFloat(p.total) || 0), 0);
    }, [client?.proformas]);

    const filteredInteractions = useMemo(() => {
        if (!client?.interactions?.length) return [];
        if (interactionTypeFilter === 'all') return client.interactions;
        return client.interactions.filter((i: any) => i.type === interactionTypeFilter);
    }, [client?.interactions, interactionTypeFilter]);

    const interactionForm = useForm({
        type: 'note',
        subject: '',
        body: '',
        occurred_at: new Date().toISOString().slice(0, 16),
    });

    const handleInteractionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        interactionForm.post(`/crm/${client?.id}/interactions`, {
            onSuccess: () => interactionForm.reset('subject', 'body'),
        });
    };

    return (
        <AppLayout>
            <Head title={client?.company_name || 'Client'} />

            <div className="mb-6">
                <Link href="/crm" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Clients
                </Link>
            </div>

            <PageHeader
                title={
                    <div className="flex items-center gap-2 flex-wrap">
                        <span>{client?.company_name}</span>
                        {client?.is_greylisted && <StatusBadge status="greylisted" />}
                        {client?.status && <StatusBadge status={client.status} />}
                    </div>
                }
                subtitle={client?.industry}
                action={
                    <div className="flex items-center gap-2">
                        {!openDeal && (
                            <button
                                onClick={() => router.post(`/crm/${client?.id}/deals`, {}, { preserveScroll: true })}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 transition-colors text-sm font-medium"
                            >
                                <Rocket className="w-4 h-4" /> Start Sale Campaign
                            </button>
                        )}
                        {client?.is_greylisted ? (
                            <button
                                onClick={handleGreylistToggle}
                                disabled={!canApproveGreylist}
                                title={!canApproveGreylist ? 'Only a manager can approve removing a greylist' : undefined}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/20 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ShieldCheck className="w-4 h-4" /> Approve & Lift Greylist
                            </button>
                        ) : (
                            <button
                                onClick={handleGreylistToggle}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-500/20 transition-colors text-sm font-medium"
                            >
                                <ShieldAlert className="w-4 h-4" /> Greylist Client
                            </button>
                        )}
                        <Link href={`/crm/${client?.id}/edit`} className="glass-button flex items-center gap-2">
                            <Pencil className="w-4 h-4" /> Edit
                        </Link>
                    </div>
                }
            />

            {/* Top KPI Summary Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <GlassCard className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Lifetime Value (LTV)</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{formatCurrency(ltv)}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Active Orders</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{activeOrdersCount}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Proformas / Quotes</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                                {client?.proformas?.length || 0}{' '}
                                <span className="text-xs text-slate-400 font-normal">({formatCurrency(proformasTotal)})</span>
                            </p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Next Follow-Up</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                                {openDeal?.next_follow_up_at ? new Date(openDeal.next_follow_up_at).toLocaleDateString() : 'Not set'}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-slate-50 dark:bg-white/5 rounded-lg p-1 w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                    >
                        {tab}
                        {tab === 'Deals' && deals.length > 0 && (
                            <span className="ml-1.5 text-xs bg-slate-200 dark:bg-white/20 px-1.5 py-0.5 rounded-full">{deals.length}</span>
                        )}
                        {tab === 'Proforma' && client?.proformas?.length > 0 && (
                            <span className="ml-1.5 text-xs bg-slate-200 dark:bg-white/20 px-1.5 py-0.5 rounded-full">{client.proformas.length}</span>
                        )}
                        {tab === 'Orders' && client?.orders?.length > 0 && (
                            <span className="ml-1.5 text-xs bg-slate-200 dark:bg-white/20 px-1.5 py-0.5 rounded-full">{client.orders.length}</span>
                        )}
                        {tab === 'History' && historyList.length > 0 && (
                            <span className="ml-1.5 text-xs bg-slate-200 dark:bg-white/20 px-1.5 py-0.5 rounded-full">{historyList.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'Details' && (
                <div>
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Tier</p>
                                    <StatusChips
                                        value={client?.status}
                                        onChange={(v) => {
                                            router.patch(`/crm/${client?.id}/status`, { status: v }, { preserveScroll: true });
                                        }}
                                        options={[
                                            { value: 'bronze', label: 'Bronze' },
                                            { value: 'silver', label: 'Silver' },
                                            { value: 'gold', label: 'Gold' },
                                            { value: 'platinum', label: 'Platinum' },
                                        ]}
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Current Deal</p>
                                    {openDeal ? (
                                        <span className="status-badge text-xs bg-indigo-500/20 text-indigo-400">
                                            {openDeal.type === 'repeat_business' ? 'Repeat' : 'New'} — {STAGE_LABELS[openDeal.stage] || openDeal.stage}
                                        </span>
                                    ) : (
                                        <span className="text-slate-600">No active deal</span>
                                    )}
                                </div>
                                <DetailRow label="Company/Client Name">{client?.company_name}</DetailRow>
                                <DetailRow label="Industry">{client?.industry}</DetailRow>
                                <DetailRow label="Source">{client?.source}</DetailRow>
                                <DetailRow label="Website">
                                    {client?.website && (
                                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                            {client.website}
                                        </a>
                                    )}
                                </DetailRow>
                                <DetailRow label="Phone">
                                    {client?.phone && (
                                        <WhatsAppLink phone={client.phone} className="text-green-400 hover:underline flex items-center gap-1">
                                            {client.phone}
                                        </WhatsAppLink>
                                    )}
                                </DetailRow>
                                <DetailRow label="Email">
                                    {client?.email && <a href={`mailto:${client.email}`} className="text-blue-400 hover:underline break-all">{client.email}</a>}
                                </DetailRow>
                            </div>
                        </GlassCard>

                        {/* Contact Information */}
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <DetailRow label="Region">{client?.region}</DetailRow>
                                <DetailRow label="City">{client?.city}</DetailRow>
                                <DetailRow label="Neighbourhood">{client?.neighbourhood}</DetailRow>
                                <DetailRow label="Country">{client?.country}</DetailRow>
                                <div className="md:col-span-2">
                                    <DetailRow label="Address">
                                        {client?.address && <p className="whitespace-pre-wrap">{client.address}</p>}
                                    </DetailRow>
                                </div>
                                <DetailRow label="GPS Location">
                                    {client?.location && (
                                        <a href={`https://www.google.com/maps?q=${client.location}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                            {client.location}
                                        </a>
                                    )}
                                </DetailRow>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                                <ClientContacts
                                    clientId={client.id}
                                    contacts={client?.contacts || []}
                                    regions={regions}
                                    cities={cities}
                                    neighbourhoods={neighbourhoods}
                                />
                            </div>
                        </GlassCard>

                        {/* Notes */}
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Notes</h2>
                            <DetailRow label="Notes">
                                {client?.notes && <p className="whitespace-pre-wrap text-slate-300">{client.notes}</p>}
                            </DetailRow>
                        </GlassCard>

                        {/* Social Media */}
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Social Media</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <DetailRow label="LinkedIn">
                                    {client?.linkedin && <a href={client.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{client.linkedin}</a>}
                                </DetailRow>
                                <DetailRow label="Facebook">
                                    {client?.facebook && <a href={client.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{client.facebook}</a>}
                                </DetailRow>
                                <DetailRow label="Instagram">
                                    {client?.instagram && <a href={client.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{client.instagram}</a>}
                                </DetailRow>
                                <DetailRow label="Twitter / X">
                                    {client?.twitter && <a href={client.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{client.twitter}</a>}
                                </DetailRow>
                                <DetailRow label="TikTok">
                                    {client?.tiktok && <a href={client.tiktok} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{client.tiktok}</a>}
                                </DetailRow>
                            </div>
                        </GlassCard>
                    </div>

                </div>
            )}

            {activeTab === 'Deals' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold">Deal History</h2>
                            <p className="text-sm text-slate-400">Every sales campaign run for this client, from first contact to won or lost</p>
                        </div>
                        {!openDeal && (
                            <button
                                onClick={() => router.post(`/crm/${client?.id}/deals`, {}, { preserveScroll: true })}
                                className="glass-button flex items-center gap-2 text-sm"
                            >
                                <Rocket className="w-4 h-4" /> Start Sale Campaign
                            </button>
                        )}
                    </div>

                    {deals.length > 0 ? (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {deals.map((deal: any) => {
                                const outcomeStyle =
                                    deal.stage === 'converted'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : deal.stage === 'lost'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-indigo-500/20 text-indigo-400';

                                return (
                                    <GlassCard key={deal.id} className="h-full">
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <Briefcase className="w-3 h-3" /> {deal.type === 'repeat_business' ? 'Repeat Business' : 'New Business'}
                                            </span>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${outcomeStyle}`}>
                                                {STAGE_LABELS[deal.stage] || deal.stage}
                                            </span>
                                        </div>

                                        {deal.estimated_value > 0 && (
                                            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{formatCurrency(deal.estimated_value)}</p>
                                        )}

                                        {deal.stage === 'lost' && deal.lost_reason && (
                                            <div className="flex items-start gap-2 text-red-400 text-sm mb-2">
                                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <span>{deal.lost_reason}{deal.lost_note ? ` — ${deal.lost_note}` : ''}</span>
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-white/10 mt-2">
                                            Started {new Date(deal.created_at).toLocaleDateString()}
                                            {deal.converted_at && <> • Won {new Date(deal.converted_at).toLocaleDateString()}</>}
                                            {deal.lost_at && <> • Lost {new Date(deal.lost_at).toLocaleDateString()}</>}
                                        </p>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    ) : (
                        <GlassCard>
                            <div className="text-center py-12">
                                <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 text-lg font-medium">No deals yet</p>
                                <p className="text-slate-500 text-sm mt-1">Start a sale campaign to begin tracking a deal for this client</p>
                            </div>
                        </GlassCard>
                    )}
                </div>
            )}

            {activeTab === 'Interactions' && (
                <div className="max-w-4xl space-y-6">
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Log New Interaction</h2>
                        <form onSubmit={handleInteractionSubmit} className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg space-y-3">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Type</label>
                                    <select
                                        value={interactionForm.data.type}
                                        onChange={(e) => interactionForm.setData('type', e.target.value as any)}
                                        className="glass-input w-full"
                                    >
                                        <option value="note">Note</option>
                                        <option value="call">Call</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="email">Email</option>
                                        <option value="meeting">Meeting</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={interactionForm.data.occurred_at}
                                        onChange={(e) => interactionForm.setData('occurred_at', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Subject *</label>
                                <input
                                    type="text"
                                    value={interactionForm.data.subject}
                                    onChange={(e) => interactionForm.setData('subject', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Call with client, sent proposal..."
                                />
                                {interactionForm.errors.subject && <p className="text-red-400 text-xs mt-1">{interactionForm.errors.subject}</p>}
                                {interactionForm.errors.occurred_at && <p className="text-red-400 text-xs mt-1">{interactionForm.errors.occurred_at}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Details</label>
                                <textarea
                                    value={interactionForm.data.body}
                                    onChange={(e) => interactionForm.setData('body', e.target.value)}
                                    className="glass-input w-full h-20"
                                    placeholder="Notes about the interaction..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={interactionForm.processing} className="glass-button text-sm">
                                    {interactionForm.processing ? 'Logging...' : 'Log Interaction'}
                                </button>
                            </div>
                        </form>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <h2 className="text-lg font-semibold">Interactions</h2>
                            <div className="flex gap-1.5 flex-wrap">
                                {['all', 'note', 'call', 'whatsapp', 'email', 'meeting'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setInteractionTypeFilter(type)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                            interactionTypeFilter === type
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {type === 'all' ? 'All' : type === 'whatsapp' ? 'WhatsApp' : type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredInteractions.length > 0 ? (
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100 dark:bg-white/10"></div>
                                <div className="space-y-4">
                                    {filteredInteractions.map((interaction: any) => (
                                        <div key={interaction.id} className="flex gap-4 relative">
                                            <div className="w-8 h-8 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center z-10">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium">{interaction.subject}</span>
                                                    <span className={`status-badge text-xs ${
                                                        interaction.type === 'whatsapp'
                                                            ? 'text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full'
                                                            : interaction.type === 'call'
                                                            ? 'text-blue-400'
                                                            : interaction.type === 'email'
                                                            ? 'text-yellow-400'
                                                            : 'text-slate-400'
                                                    }`}>
                                                        {interaction.type === 'whatsapp' ? 'WhatsApp' : interaction.type}
                                                    </span>
                                                </div>
                                                {interaction.body && <p className="text-sm text-slate-400">{interaction.body}</p>}
                                                <p className="text-xs text-slate-500 mt-2">
                                                    {interaction.user?.name} • {new Date(interaction.occurred_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400">No interactions logged yet</p>
                        )}
                    </GlassCard>
                </div>
            )}

            {activeTab === 'Proforma' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Proforma / Estimates</h2>
                        <Link href={`/crm/${client?.id}/proformas/create`} className="glass-button flex items-center gap-2 text-sm">
                            <Plus className="w-4 h-4" /> New Proforma
                        </Link>
                    </div>
                    {client?.proformas?.length > 0 ? (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {client.proformas.map((p: any) => (
                                <Link key={p.id} href={`/crm/${client.id}/proformas/${p.id}`} className="block group">
                                    <GlassCard variant="interactive" className="h-full">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">{p.number}</h3>
                                                <p className="text-sm text-slate-400">{new Date(p.date).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[p.status] || ''}`}>
                                                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                                            <span className="text-lg font-semibold">{formatCurrency(p.total)}</span>
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.visit(`/orders/create?client_id=${client.id}&proforma_id=${p.id}`); }}
                                                className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 border border-indigo-500/30 transition-colors flex items-center gap-1 shrink-0"
                                            >
                                                Convert <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </GlassCard>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <GlassCard>
                            <div className="text-center py-12">
                                <p className="text-slate-400 text-lg">No proformas yet</p>
                                <p className="text-slate-500 text-sm mt-1">Create your first proforma for this client</p>
                            </div>
                        </GlassCard>
                    )}
                </div>
            )}

            {activeTab === 'Orders' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold">Orders</h2>
                            <p className="text-sm text-slate-400">All sales and production orders for this client</p>
                        </div>
                        <Link href={`/orders/create?client_id=${client?.id}`} className="glass-button flex items-center gap-2 text-sm">
                            <Plus className="w-4 h-4" /> New Order
                        </Link>
                    </div>

                    {client?.orders?.length > 0 ? (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {client.orders.map((o: any) => {
                                const orderStatusStyle =
                                    o.status === 'completed' || o.status === 'delivered'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : o.status === 'processing' || o.status === 'in_production' || o.status === 'ready'
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : o.status === 'confirmed'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : o.status === 'cancelled'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-slate-500/20 text-slate-400';

                                const paymentStatusStyle =
                                    o.payment_status === 'paid'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : o.payment_status === 'partial'
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : 'bg-red-500/20 text-red-400';

                                return (
                                    <Link key={o.id} href={`/orders/${o.id}`} className="block group">
                                        <GlassCard variant="interactive" className="h-full flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <div>
                                                        <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">
                                                            {o.order_number}
                                                        </h3>
                                                        <p className="text-xs text-slate-400">
                                                            {new Date(o.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${orderStatusStyle}`}>
                                                            {o.status ? o.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Draft'}
                                                        </span>
                                                        {o.payment_status && (
                                                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${paymentStatusStyle}`}>
                                                                {o.payment_status.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {o.items && o.items.length > 0 && (
                                                    <p className="text-xs text-slate-400 mb-2">
                                                        {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                                                    </p>
                                                )}

                                                {o.delivery_date && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>Delivery: {new Date(o.delivery_date).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                                                <span className="text-sm text-slate-400">Total</span>
                                                <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(o.grand_total || 0)}</span>
                                            </div>
                                        </GlassCard>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <GlassCard>
                            <div className="text-center py-12">
                                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 text-lg font-medium">No orders yet</p>
                                <p className="text-slate-500 text-sm mt-1 mb-4">Create the first production or sales order for this client</p>
                                <Link href={`/orders/create?client_id=${client?.id}`} className="glass-button inline-flex items-center gap-2 text-sm">
                                    <Plus className="w-4 h-4" /> Create First Order
                                </Link>
                            </div>
                        </GlassCard>
                    )}
                </div>
            )}

            {activeTab === 'History' && (
                <GlassCard>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
                        <div>
                            <h2 className="text-lg font-semibold">Change History</h2>
                            <p className="text-sm text-slate-400">Audit trail of changes made to this client and contacts</p>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {historyList.length} {historyList.length === 1 ? 'record' : 'records'}
                        </span>
                    </div>

                    {historyList.length > 0 ? (
                        <div className="space-y-6">
                            {historyList.map((entry: any, index: number) => {
                                const isLast = index === historyList.length - 1;
                                const actionBadge = getActionBadge(entry.action);

                                return (
                                    <div key={entry.id || index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 flex items-center justify-center shrink-0">
                                                <Clock className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            {!isLast && <div className="w-0.5 flex-1 bg-slate-100 dark:bg-white/10 my-2" />}
                                        </div>

                                        <div className="flex-1 pb-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 dark:text-white">
                                                        {entry.user?.name || 'System / Admin'}
                                                    </span>
                                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${actionBadge.style}`}>
                                                        {actionBadge.label}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(entry.created_at).toLocaleString()}
                                                </span>
                                            </div>

                                            {renderValuesDiff(entry)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-lg font-medium">No audit history recorded yet</p>
                            <p className="text-slate-500 text-sm mt-1">Changes made to this client or its contacts will automatically appear here.</p>
                        </div>
                    )}
                </GlassCard>
            )}

        </AppLayout>
    );
}
