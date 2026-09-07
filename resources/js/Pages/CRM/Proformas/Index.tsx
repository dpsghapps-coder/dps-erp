import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Pencil, Trash2, Printer } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';
import Swal from 'sweetalert2';

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-400',
    sent: 'bg-blue-500/20 text-blue-400',
    accepted: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
};

export default function ProformaIndex() {
    const { client, proformas } = usePage().props as any;
    const formatCurrency = useCurrency();

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Delete Proforma?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/crm/${client.id}/proformas/${id}`);
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`Proformas — ${client?.company_name}`} />

            <div className="mb-6">
                <Link href={`/crm/${client?.id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to {client?.company_name}
                </Link>
            </div>

            <PageHeader
                title="Proforma / Estimates"
                subtitle={`${proformas?.length || 0} proformas`}
                action={
                    <Link href={`/crm/${client?.id}/proformas/create`} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Proforma
                    </Link>
                }
            />

            {proformas?.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {proformas.map((p: any) => (
                        <Link key={p.id} href={`/crm/${client.id}/proformas/${p.id}`} className="block group">
                            <GlassCard variant="interactive" className="h-full">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">{p.number}</h3>
                                        <p className="text-sm text-slate-400">{p.date ? new Date(p.date).toLocaleDateString() : '-'}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[p.status] || ''}`}>
                                        {p.status?.charAt(0).toUpperCase()}{p.status?.slice(1)}
                                    </span>
                                </div>

                                {p.valid_until && (
                                    <p className="text-xs text-slate-400 mb-2">Valid until {new Date(p.valid_until).toLocaleDateString()}</p>
                                )}

                                {p.items && (
                                    <p className="text-xs text-slate-400 mb-2">{p.items.length} item{p.items.length !== 1 ? 's' : ''}</p>
                                )}

                                <p className="text-xs mb-2">
                                    {p.deal ? (
                                        <span className="text-indigo-400">{p.deal.type === 'repeat_business' ? 'Sales Campaign' : 'New Lead'} · {p.deal.stage.replace(/_/g, ' ')}</span>
                                    ) : (
                                        <span className="text-slate-500">Standalone</span>
                                    )}
                                </p>

                                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                                    <span className="text-lg font-semibold">{formatCurrency(p.total)}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`/crm/${client.id}/proformas/${p.id}`, '_blank'); }}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.visit(`/crm/${client.id}/proformas/${p.id}/edit`); }}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(p.id); }}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
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
        </AppLayout>
    );
}
