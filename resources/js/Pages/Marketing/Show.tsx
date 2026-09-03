import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Calendar, DollarSign, User, Building, Clock, Tag, Bell } from 'lucide-react';
import Swal from 'sweetalert2';
import { useCurrency } from '@/Utils/currency';

const TYPE_LABELS: Record<string, string> = {
    social: 'Social Media',
    email: 'Email',
    event: 'Event',
    ad: 'Advertising',
    print: 'Print',
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
    const { campaign } = usePage().props as any;
    const formatCurrency = useCurrency();

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
                <Link href="/marketing" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
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
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">Duration</p>
                                    <p className="font-medium">
                                        {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Tag className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">Type</p>
                                    <p className="font-medium">{TYPE_LABELS[campaign.type] || campaign.type}</p>
                                </div>
                            </div>
                            {campaign.client && (
                                <div className="flex items-center gap-3">
                                    <Building className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-500">Client</p>
                                        <Link href={`/crm/${campaign.client.id}`} className="font-medium text-indigo-600 hover:underline">
                                            {campaign.client.company_name}
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {campaign.assigned_to && (
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-500">Assigned To</p>
                                        <p className="font-medium">{campaign.assigned_to.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {campaign.description && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-slate-500 mb-1">Description</p>
                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{campaign.description}</p>
                            </div>
                        )}
                    </GlassCard>

                    {/* Notes */}
                    {campaign.notes && (
                        <GlassCard>
                            <h2 className="text-lg font-semibold mb-4">Notes</h2>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{campaign.notes}</p>
                        </GlassCard>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Budget */}
                    <GlassCard>
                        <h2 className="text-lg font-semibold mb-4">Budget</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Planned Budget</span>
                                <span className="font-semibold text-lg">
                                    {campaign.budget ? formatCurrency(campaign.budget) : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Actual Cost</span>
                                <span className="font-semibold text-lg">
                                    {campaign.actual_cost ? formatCurrency(campaign.actual_cost) : '-'}
                                </span>
                            </div>
                            {campaign.budget && campaign.actual_cost && (
                                <div className="pt-2 border-t">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Remaining</span>
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
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm">{new Date(reminder.remind_at).toLocaleString()}</span>
                                        </div>
                                        {reminder.sent && (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Sent</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">No reminders set</p>
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
                                <span className="text-slate-500">Created By</span>
                                <span>{campaign.created_by?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Created At</span>
                                <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Updated At</span>
                                <span>{new Date(campaign.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
}
