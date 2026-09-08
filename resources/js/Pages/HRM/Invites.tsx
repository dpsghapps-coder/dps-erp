import { useState } from 'react';
import { usePage, Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { ArrowLeft, ClipboardList, Copy, Check, Trash2, ArrowRight } from 'lucide-react';
import { copyToClipboard } from '@/Utils/clipboard';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-slate-100 dark:bg-white/10 text-slate-500',
    submitted: 'bg-amber-500/20 text-amber-500',
    approved: 'bg-green-500/20 text-green-500',
    expired: 'bg-red-500/20 text-red-500',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Awaiting Applicant',
    submitted: 'Ready to Review',
    approved: 'Approved',
    expired: 'Expired',
};

export default function HrmInvites() {
    const { props } = usePage();
    const invites = ((props as any)?.invites || []) as any[];
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const copyLink = async (invite: any) => {
        const link = `${window.location.origin}/onboarding/${invite.token}`;
        if (await copyToClipboard(link)) {
            setCopiedId(invite.id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const revokeInvite = (invite: any) => {
        if (!confirm('Revoke this invite link? It will stop working immediately.')) return;
        router.delete(`/hrm/invites/${invite.id}`, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Employee Applications" />

            <div className="mb-6">
                <Link href="/hrm/employees" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Employees
                </Link>
            </div>

            <PageHeader title="Employee Applications" subtitle="Self-onboarding invite links and their submissions" />

            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Applicant</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Created By</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Expires</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invites.length > 0 ? (
                                invites.map((invite: any) => (
                                    <tr key={invite.id} className="border-b border-slate-100 dark:border-white/5">
                                        <td className="py-3 px-4">
                                            {invite.first_name ? (
                                                <div>
                                                    <p className="font-medium">{invite.first_name} {invite.last_name}</p>
                                                    <p className="text-xs text-slate-400">{invite.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-sm">Not submitted yet</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[invite.status]}`}>
                                                {STATUS_LABELS[invite.status]}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400 text-sm">{invite.created_by?.name || '-'}</td>
                                        <td className="py-3 px-4 text-slate-400 text-sm">
                                            {new Date(invite.expires_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {invite.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => copyLink(invite)}
                                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                            title="Copy link"
                                                        >
                                                            {copiedId === invite.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => revokeInvite(invite)}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                                                            title="Revoke"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {invite.status === 'submitted' && (
                                                    <Link
                                                        href={`/hrm/invites/${invite.id}/review`}
                                                        className="glass-button-secondary flex items-center gap-1 text-sm py-1.5"
                                                    >
                                                        Review <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                )}
                                                {invite.status === 'expired' && (
                                                    <button
                                                        onClick={() => revokeInvite(invite)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8">
                                        <EmptyState icon={ClipboardList} title="No invites yet" description="Generate an invite link from the Employee Directory to get started." />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </AppLayout>
    );
}
