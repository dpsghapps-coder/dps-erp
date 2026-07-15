import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Wrench } from 'lucide-react';

export default function ServiceShow() {
    const { service } = usePage().props;

    return (
        <AppLayout>
            <Head title={service.name} />

            <div className="mb-6">
                <Link href="/services" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Services
                </Link>
            </div>

            <PageHeader 
                title={service.name} 
                subtitle={`Code: ${service.code}`}
                action={
                    <Link href={`/services/${service.id}/edit`} className="glass-button flex items-center gap-2">
                        <Pencil className="w-4 h-4" /> Edit Service
                    </Link>
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
                            <span>{service.category || '-'}</span>
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
                    <h3 className="text-lg font-medium mb-4">Tiered Pricing</h3>
                    {service.prices?.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-400">Min Qty</th>
                                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-400">Max Qty</th>
                                    <th className="text-right py-2 px-4 text-sm font-medium text-slate-400">Unit Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {service.prices.map((price: any, index: number) => (
                                    <tr key={index} className="border-b border-white/5">
                                        <td className="py-2 px-4">{price.min_qty}</td>
                                        <td className="py-2 px-4">{price.max_qty || 'Unlimited'}</td>
                                        <td className="py-2 px-4 text-right font-mono">${price.unit_price}</td>
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