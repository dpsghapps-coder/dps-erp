import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState, Pagination, StatusChips } from '@/Components/ui';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Plus, Search, Pencil, Trash2, Package, Wrench, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useCurrency } from '@/Utils/currency';
import Swal from 'sweetalert2';

function tierLabel(price: any): string {
    if (price.max_qty) return `${price.min_qty}-${price.max_qty}`;
    return `${price.min_qty}+`;
}

function sortedPrices(product: any): any[] {
    return [...(product.prices || [])].sort((a: any, b: any) => a.min_qty - b.min_qty);
}

export default function ProductsIndex() {
    const { products, categories } = usePage().props;
    const formatCurrency = useCurrency();

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Delete Product?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/products/${id}`);
            }
        });
    };
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const filteredProducts = useMemo(() => (products?.data || []).filter((p: any) => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || p.type === typeFilter;
        const matchCategory = categoryFilter === 'all' || p.category_id == categoryFilter;
        return matchSearch && matchType && matchCategory;
    }), [products?.data, search, typeFilter, categoryFilter]);

    return (
        <AppLayout>
            <Head title="Products" />

            <PageHeader 
                title="Products" 
                subtitle="Manage your product catalog"
                action={
                    <div className="flex items-center gap-2">
                        <Link href="/services/create" className="glass-button flex items-center gap-2">
                            <Wrench className="w-4 h-4" /> Add Service
                        </Link>
                        <Link href="/products/create" className="glass-button flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Product
                        </Link>
                    </div>
                }
            />

            {/* Filters */}
            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search by name or SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                    <StatusChips
                        name="Type"
                        value={typeFilter}
                        onChange={setTypeFilter}
                        options={[
                            { value: 'all', label: 'All Types' },
                            { value: 'physical', label: 'Physical' },
                            { value: 'service', label: 'Service' },
                            { value: 'digital', label: 'Digital' },
                        ]}
                    />
                    {(categories || []).length > 0 && (
                        <>
                            <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />
                            <StatusChips
                                name="Category"
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                options={[
                                    { value: 'all', label: 'All Categories' },
                                    ...(categories || []).map((c: any) => ({ value: String(c.id), label: c.name })),
                                ]}
                            />
                        </>
                    )}
                </div>
            </GlassCard>

            {/* Products Table - Desktop */}
            <GlassCard className="overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">SKU</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Category</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Unit</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Tiered Pricing</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Total Value</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product: any) => (
                                    <tr
                                        key={product.id}
                                        onClick={() => setSelectedProduct(product)}
                                        className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
                                    >
                                        <td className="py-3 px-4 font-mono text-sm">{product.sku}</td>
                                        <td className="py-3 px-4 hover:text-indigo-400 transition-colors">{product.name}</td>
                                        <td className="py-3 px-4 text-slate-400">{product.category?.name || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`status-badge type-${product.type}`}>
                                                {product.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">{product.unit}</td>
                                        <td className="py-3 px-4">
                                            {sortedPrices(product).length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {sortedPrices(product).map((price: any) => (
                                                        <span key={price.id} className="text-xs px-2 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-300 whitespace-nowrap">
                                                            {tierLabel(price)}: <span className="text-emerald-400 font-medium">{formatCurrency(price.unit_price)}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 text-sm">No pricing set</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right text-emerald-400 font-medium">{formatCurrency(product.total_value || 0)}</td>
                                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/products/${product.id}/edit`} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors text-red-400">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-8">
                                        <EmptyState
                                            icon={Package}
                                            title="No products found"
                                            description="Get started by adding your first product"
                                            action={
                                                <Link href="/products/create" className="glass-button">
                                                    <Plus className="w-4 h-4 mr-2" /> Add Product
                                                </Link>
                                            }
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product: any) => (
                            <div
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className="glass-card p-4 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                                        <p className="text-xs font-mono text-slate-400">{product.sku}</p>
                                    </div>
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/products/${product.id}/edit`} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-sm text-slate-400 mb-2">
                                    {product.category?.name && <span>{product.category.name}</span>}
                                    <span className={`status-badge type-${product.type}`}>{product.type}</span>
                                    <span>{product.unit}</span>
                                </div>
                                <p className="text-sm text-emerald-400 font-medium mb-2">{formatCurrency(product.total_value || 0)}</p>
                                {sortedPrices(product).length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {sortedPrices(product).map((price: any) => (
                                            <span key={price.id} className="text-xs px-2 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-300 whitespace-nowrap">
                                                {tierLabel(price)}: <span className="text-emerald-400 font-medium">{formatCurrency(price.unit_price)}</span>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-slate-500 text-xs">No pricing set</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            icon={Package}
                            title="No products found"
                            description="Get started by adding your first product"
                            action={
                                <Link href="/products/create" className="glass-button">
                                    <Plus className="w-4 h-4 mr-2" /> Add Product
                                </Link>
                            }
                        />
                    )}
                </div>
            </GlassCard>
            <Pagination meta={products} />

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedProduct.name}</h3>
                                <p className="text-sm text-slate-400 font-mono">{selectedProduct.sku}</p>
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Type</span>
                                <span className="capitalize">{selectedProduct.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Category</span>
                                <span>{selectedProduct.category?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Unit</span>
                                <span>{selectedProduct.unit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Status</span>
                                <span className={`status-badge ${selectedProduct.is_active ? 'status-active' : 'status-inactive'}`}>
                                    {selectedProduct.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        {selectedProduct.description && (
                            <p className="text-sm text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-white/10">{selectedProduct.description}</p>
                        )}

                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">Components</h4>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Total Value</p>
                                <p className="text-lg font-semibold text-emerald-400">{formatCurrency(selectedProduct.total_value || 0)}</p>
                            </div>
                        </div>

                        {selectedProduct.components?.length > 0 ? (
                            <div className="space-y-2">
                                {selectedProduct.components.map((component: any) => {
                                    const isMaterial = component.component_type === 'App\\Models\\InventoryProduct';
                                    return (
                                        <div key={component.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg text-sm">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {isMaterial ? (
                                                    <Package className="w-4 h-4 text-blue-400 shrink-0" />
                                                ) : (
                                                    <Wrench className="w-4 h-4 text-green-400 shrink-0" />
                                                )}
                                                <span className="truncate">{isMaterial ? component.component?.item_name : component.component?.name}</span>
                                                <span className="text-slate-500 text-xs shrink-0">× {component.quantity}</span>
                                            </div>
                                            <span className="text-emerald-400 font-medium shrink-0 ml-2">
                                                {formatCurrency(component.unit_price * component.quantity)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm">No components added to this product.</p>
                        )}

                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                            <h4 className="text-sm font-medium mb-3">Tiered Pricing</h4>
                            {sortedPrices(selectedProduct).length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {sortedPrices(selectedProduct).map((price: any) => (
                                        <span key={price.id} className="text-xs px-2 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-300 whitespace-nowrap">
                                            {tierLabel(price)}: <span className="text-emerald-400 font-medium">{formatCurrency(price.unit_price)}</span>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm">No pricing tiers defined.</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-white/10">
                            <Link href={`/products/${selectedProduct.id}`} className="glass-button text-sm">
                                View Full Page
                            </Link>
                            <Link href={`/products/${selectedProduct.id}/edit`} className="glass-button text-sm">
                                Edit
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}