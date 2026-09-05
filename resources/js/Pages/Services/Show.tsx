import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Wrench } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';
import Swal from 'sweetalert2';

export default function ServiceShow() {
    const { service } = usePage().props as any;
    const formatCurrency = useCurrency();

    const handleDelete = () => {
        const usageWarning = service.product_components_count > 0
            ? `<p class="mt-2">This service is used in ${service.product_components_count} product${service.product_components_count === 1 ? '' : 's'}. Deleting it won't change those products' saved pricing, but it will disappear from their component list.</p>`
            : '';

        Swal.fire({
            title: 'Delete Service?',
            html: `<p>This action cannot be undone.</p>${usageWarning}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/services/${service.id}`);
            }
        });
    };

    return (
        <AppLayout>
            <Head title={service.name} />

            <div className="mb-6">
                <Link href="/services" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Services
                </Link>
            </div>

            <PageHeader
                title={service.name}
                subtitle={`Code: ${service.code}`}
                action={
                    <div className="flex items-center gap-2">
                        <Link href={`/services/${service.id}/edit`} className="glass-button flex items-center gap-2">
                            <Pencil className="w-4 h-4" /> Edit Service
                        </Link>
                        <button onClick={handleDelete} className="glass-button flex items-center gap-2 bg-red-500/20 text-red-400">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                }
            />

            <div className="grid md:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-lg font-medium mb-4">Service Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Code</span>
                            <span>{service.code}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Category</span>
                            <span>{service.category?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Unit</span>
                            <span>{service.unit}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Status</span>
                            <span className={`status-badge ${service.is_active ? 'status-active' : 'status-inactive'}`}>
                                {service.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-medium mb-4">Description</h3>
                    <p className="text-slate-400">{service.description || 'No description provided.'}</p>
                </GlassCard>

                <GlassCard className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-4">Cost of Service</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Workmanship</span>
                            <span>{formatCurrency(service.workmanship_cost || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Machine Maintenance</span>
                            <span>{formatCurrency(service.machine_maintenance_cost || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Process Cost</span>
                            <span>{formatCurrency(service.process_cost || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Capital Investment Recovery Fee</span>
                            <span>{formatCurrency(service.capital_recovery_fee || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Profit</span>
                            <span>{formatCurrency(service.profit || 0)}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-white/10 font-medium">
                            <span>Calculated Base Price</span>
                            <span className="text-emerald-400">{formatCurrency(service.calculated_base_price || 0)}</span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-4">Tiered Pricing</h3>
                    {service.prices?.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10">
                                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-400">Min Qty</th>
                                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-400">Max Qty</th>
                                    <th className="text-right py-2 px-4 text-sm font-medium text-slate-400">Unit Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {service.prices.map((price: any, index: number) => (
                                    <tr key={index} className="border-b border-slate-100 dark:border-white/5">
                                        <td className="py-2 px-4">{price.min_qty}</td>
                                        <td className="py-2 px-4">{price.max_qty || 'Unlimited'}</td>
                                        <td className="py-2 px-4 text-right font-mono">{formatCurrency(price.unit_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-slate-400">No pricing tiers defined.</p>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}