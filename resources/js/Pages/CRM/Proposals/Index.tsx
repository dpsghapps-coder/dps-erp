import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Pencil, Trash2, Paperclip } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProposalIndex() {
    const { client, proposals } = usePage().props as any;

    const handleDelete = (id: number, title: string) => {
        Swal.fire({
            title: `Delete "${title}"?`,
            text: 'This permanently deletes the proposal and its attached files.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/crm/${client.id}/proposals/${id}`);
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`Proposals — ${client?.company_name}`} />

            <div className="mb-6">
                <Link href={`/crm/${client?.id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to {client?.company_name}
                </Link>
            </div>

            <PageHeader
                title="Proposals"
                subtitle={`${proposals?.length || 0} proposals`}
                action={
                    <Link href={`/crm/${client?.id}/proposals/create`} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Proposal
                    </Link>
                }
            />

            {proposals?.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {proposals.map((p: any) => (
                        <Link key={p.id} href={`/crm/${client.id}/proposals/${p.id}`} className="block group">
                            <GlassCard variant="interactive" className="h-full">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">{p.title}</h3>
                                    <StatusBadge status={p.status} />
                                </div>

                                <p className="text-xs text-slate-400 mb-2">{new Date(p.created_at).toLocaleDateString()}</p>

                                <p className="text-xs mb-2">
                                    {p.deal ? (
                                        <span className="text-indigo-400">{p.deal.type === 'repeat_business' ? 'Sales Campaign' : 'New Lead'} · {p.deal.stage.replace(/_/g, ' ')}</span>
                                    ) : (
                                        <span className="text-slate-500">Standalone</span>
                                    )}
                                </p>

                                {p.files_count > 0 && (
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                                        <Paperclip className="w-3 h-3" /> {p.files_count} file{p.files_count !== 1 ? 's' : ''}
                                    </p>
                                )}

                                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.visit(`/crm/${client.id}/proposals/${p.id}/edit`); }}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(p.id, p.title); }}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            ) : (
                <GlassCard>
                    <div className="text-center py-12">
                        <p className="text-slate-400 text-lg">No proposals yet</p>
                        <p className="text-slate-500 text-sm mt-1">Create your first proposal for this client</p>
                    </div>
                </GlassCard>
            )}
        </AppLayout>
    );
}
