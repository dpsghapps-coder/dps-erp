import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Package, Wrench } from 'lucide-react';
import { useCurrency } from '@/Utils/currency';

export default function ProductShow() {
    const { product, totalCost } = usePage().props as any;
    const formatCurrency = useCurrency();

    return (
        <AppLayout>
            <Head title={product.name} />

            <div className="mb-6">
                <Link href="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Products
                </Link>
            </div>

            <PageHeader
                title={product.name}
                subtitle={`SKU: ${product.sku}`}
                action={
                    <Link href={`/products/${product.id}/edit`} className="glass-button flex items-center gap-2">
                        <Pencil className="w-4 h-4" /> Edit Product
                    </Link>
                }
            />

            <div className="grid md:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-lg font-medium mb-4">Product Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-400">SKU</span>
                            <span className="font-mono">{product.sku}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Type</span>
                            <span className="capitalize">{product.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Category</span>
                            <span>{product.category?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Unit</span>
                            <span>{product.unit}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Status</span>
                            <span className={`status-badge ${product.is_active ? 'status-active' : 'status-inactive'}`}>
                                {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-medium mb-4">Description</h3>
                    <p className="text-slate-400">{product.description || 'No description provided.'}</p>
                </GlassCard>

                <GlassCard className="md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Product Components</h3>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Total Cost</p>
                            <p className="text-xl font-semibold text-emerald-400">{formatCurrency(totalCost)}</p>
                        </div>
                    </div>
                    {product.components?.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10">
                                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-400">Component</th>
                                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-400">SKU/Code</th>
                                    <th className="text-right py-2 px-4 text-sm font-medium text-slate-400">Quantity</th>
                                    <th className="text-right py-2 px-4 text-sm font-medium text-slate-400">Unit Price</th>
                                    <th className="text-right py-2 px-4 text-sm font-medium text-slate-400">Line Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.components.map((component: any) => {
                                    const isMaterial = component.component_type === 'App\\Models\\InventoryProduct';
                                    return (
                                        <tr key={component.id} className="border-b border-slate-100 dark:border-white/5">
                                            <td className="py-2 px-4">
                                                <div className="flex items-center gap-2">
                                                    {isMaterial ? (
                                                        <Package className="w-4 h-4 text-blue-400" />
                                                    ) : (
                                                        <Wrench className="w-4 h-4 text-green-400" />
                                                    )}
                                                    {isMaterial ? component.component?.item_name : component.component?.name}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 text-slate-400 font-mono text-sm">
                                                {isMaterial ? component.component?.material_id : component.component?.code}
                                            </td>
                                            <td className="py-2 px-4 text-right">{component.quantity}</td>
                                            <td className="py-2 px-4 text-right font-mono">{formatCurrency(component.unit_price)}</td>
                                            <td className="py-2 px-4 text-right font-mono text-emerald-400">
                                                {formatCurrency(component.unit_price * component.quantity)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-slate-400">No components added to this product.</p>
                    )}
                </GlassCard>

                <GlassCard className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-4">Tiered Pricing</h3>
                    {product.prices?.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10">
                                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-400">Min Qty</th>
                                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-400">Max Qty</th>
                                    <th className="text-right py-2 px-4 text-sm font-medium text-slate-400">Unit Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.prices.map((price: any, index: number) => (
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
