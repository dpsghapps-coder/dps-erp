import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Calendar, DollarSign, User, Users, Building, Clock, Tag, Bell, FileText, Download, Link2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';

const ATTACHABLE_PARENT_TYPES = ['sale', 'promotion'];

const TYPE_LABELS: Record<string, string> = {
    social: 'Social Media',
    email: 'Email',
    event: 'Event',
    ad: 'Advertising',
    print: 'Print',
    sale: 'Sale',
    promotion: 'Promotion',
    other: 'Other',
};

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function CampaignShow() {
    const { campaign, attachableCampaigns } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [selectedChildId, setSelectedChildId] = useState('');

    const isAttachableParent = ATTACHABLE_PARENT_TYPES.includes(campaign.type);
    const availableToAttach = (attachableCampaigns || []).filter(
        (c: any) => c.parent_campaign_id !== campaign.id
    );

    const handleAttach = () => {
        if (!selectedChildId) return;
        router.post(`/marketing/${campaign.id}/attach-campaign`, { child_campaign_id: selectedChildId }, {
            onSuccess: () => setSelectedChildId(''),
        });
    };

    const handleDetach = (childId: number) => {
        Swal.fire({
            title: 'Detach campaign?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Detach',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/marketing/${campaign.id}/detach-campaign/${childId}`);
            }
        });
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'Cancel Campaign?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Cancel Campaign',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/marketing/${campaign.id}`);
            }
        });
    };

    return (
        <AppLayout>
            <Head title={campaign.title} />

            <div className="mb-6">
                <Link href="/marketing" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Marketing
                </Link>
            </div>

            <PageHeader
                title={campaign.title}
                subtitle={campaign.number}
                action={
                    <div className="flex items-center gap-2">
                        <StatusBadge status={campaign.status} />
                        <Link href={`/marketing/${campaign.id}/edit`} className="glass-button-secondary flex items-center gap-2">
                            <Pencil className="w-4 h-4" /> Edit
                        </Link>
                        <button onClick={handleDelete} className="glass-button-secondary flex items-center gap-2 text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" /> Cancel
                        </button>
                    </div>
                }
            />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Campaign Info */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Duration</p>
                                    <p className="font-medium">
                                        {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Tag className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Type</p>
                                    <div className="flex items-center gap-2">
                                        {campaign.color && (
                                            <span className="w-3 h-3 rounded-full inline-block" style={{ background: campaign.color }} />
                                        )}
                                        <p className="font-medium">{TYPE_LABELS[campaign.type] || campaign.type}</p>
                                    </div>
                                </div>
                            </div>
                            {campaign.client && (
                                <div className="flex items-center gap-3">
                                    <Building className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Client</p>
                                        <Link href={`/crm/${campaign.client.id}`} className="font-medium text-indigo-600 hover:underline">
                                            {campaign.client.company_name}
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {campaign.assigned_to && (
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Assigned To</p>
                                        <p className="font-medium">{campaign.assigned_to.name}</p>
                                    </div>
                                </div>
                            )}
                            {campaign.team_members && campaign.team_members.length > 0 && (
                                <div className="flex items-center gap-3 col-span-2">
                                    <Users className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Team Members</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {campaign.team_members.map((member: any) => (
                                                <span key={member.id} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-sm">
                                                    {member.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {campaign.description && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Description</p>
                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{campaign.description}</p>
                            </div>
                        )}
                        {campaign.parent_campaign && (
                            <div className="mt-4 pt-4 border-t flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-slate-400 dark:text-slate-300" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">Part of:</span>
                                <Link href={`/marketing/${campaign.parent_campaign.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
                                    {campaign.parent_campaign.title}
                                </Link>
                            </div>
                        )}
                    </GlassCard>

                    {/* Attached Campaigns */}
                    {isAttachableParent && (
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Link2 className="w-5 h-5" /> Attached Campaigns
                            </h2>
                            {campaign.child_campaigns && campaign.child_campaigns.length > 0 ? (
                                <div className="space-y-2 mb-4">
                                    {campaign.child_campaigns.map((child: any) => (
                                        <div key={child.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                            <div className="min-w-0">
                                                <Link href={`/marketing/${child.id}`} className="text-sm font-medium text-indigo-600 hover:underline truncate block">
                                                    {child.title}
                                                </Link>
                                                <p className="text-xs text-slate-400 truncate">{TYPE_LABELS[child.type] || child.type}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDetach(child.id)}
                                                className="text-slate-400 hover:text-red-500 flex-shrink-0"
                                                title="Detach"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 dark:text-slate-300 mb-4">No campaigns attached yet</p>
                            )}
                            <div className="flex gap-2">
                                <select
                                    value={selectedChildId}
                                    onChange={(e) => setSelectedChildId(e.target.value)}
                                    className="glass-input flex-1"
                                >
                                    <option value="">Select a campaign to attach...</option>
                                    {availableToAttach.map((c: any) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title} ({TYPE_LABELS[c.type] || c.type})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAttach}
                                    disabled={!selectedChildId}
                                    className="glass-button-secondary flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Link2 className="w-4 h-4" /> Attach
                                </button>
                            </div>
                        </GlassCard>
                    )}

                    {/* Notes */}
                    {campaign.notes && (
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Notes</h2>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{campaign.notes}</p>
                        </GlassCard>
                    )}

                    {/* Documents */}
                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Documents
                            </h2>
                            <Link href={`/marketing/${campaign.id}/edit`} className="text-sm text-indigo-600 hover:underline">
                                + Add document
                            </Link>
                        </div>
                        {campaign.documents && campaign.documents.length > 0 ? (
                            <div className="space-y-2">
                                {campaign.documents.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{doc.name}</p>
                                            {doc.description && <p className="text-xs text-slate-400 truncate">{doc.description}</p>}
                                        </div>
                                        <a
                                            href={`/storage/${doc.path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-500 hover:text-indigo-600 flex-shrink-0"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 dark:text-slate-300">No documents linked</p>
                        )}
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    {/* Budget */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Budget</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Planned Budget</span>
                                <span className="font-semibold text-lg">
                                    {campaign.budget ? formatCurrency(campaign.budget) : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Actual Cost</span>
                                <span className="font-semibold text-lg">
                                    {campaign.actual_cost ? formatCurrency(campaign.actual_cost) : '-'}
                                </span>
                            </div>
                            {campaign.budget && campaign.actual_cost && (
                                <div className="pt-2 border-t">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Remaining</span>
                                        <span className={`font-semibold ${parseFloat(campaign.budget) - parseFloat(campaign.actual_cost) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(parseFloat(campaign.budget) - parseFloat(campaign.actual_cost))}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Tags */}
                    {campaign.tags && campaign.tags.length > 0 && (
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {campaign.tags.map((tag: string) => (
                                    <span key={tag} className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* Reminders */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5" /> Reminders
                        </h2>
                        {campaign.reminders && campaign.reminders.length > 0 ? (
                            <div className="space-y-2">
                                {campaign.reminders.map((reminder: any) => (
                                    <div key={reminder.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-300" />
                                            <span className="text-sm">{new Date(reminder.remind_at).toLocaleString()}</span>
                                        </div>
                                        {reminder.sent && (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Sent</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 dark:text-slate-300">No reminders set</p>
                        )}
                        <Link href={`/marketing/${campaign.id}/edit`} className="text-sm text-indigo-600 hover:underline mt-3 inline-block">
                            + Add reminder
                        </Link>
                    </GlassCard>

                    {/* Meta */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Info</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Created By</span>
                                <span>{campaign.created_by?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Created At</span>
                                <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Updated At</span>
                                <span>{new Date(campaign.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
}
