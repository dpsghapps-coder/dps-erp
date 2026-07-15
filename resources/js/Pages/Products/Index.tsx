import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, EmptyState } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, Pencil, Trash2, Package, Wrench } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function ProductsIndex() {
    const { products, categories } = usePage().props;
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

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
                    <select 
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="glass-input"
                    >
                        <option value="all">All Types</option>
                        <option value="physical">Physical</option>
                        <option value="service">Service</option>
                        <option value="digital">Digital</option>
                    </select>
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="glass-input"
                    >
                        <option value="all">All Categories</option>
                        {(categories || []).map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </GlassCard>

            {/* Products Table - Desktop */}
            <GlassCard className="overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">SKU</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Category</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Unit</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product: any) => (
                                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 px-4 font-mono text-sm">{product.sku}</td>
                                        <td className="py-3 px-4">{product.name}</td>
                                        <td className="py-3 px-4 text-slate-400">{product.category?.name || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`status-badge type-${product.type}`}>
                                                {product.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">{product.unit}</td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/products/${product.id}/edit`} className="p-2 hover:bg-white/10 rounded transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button className="p-2 hover:bg-white/10 rounded transition-colors text-red-400">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8">
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
                            <div key={product.id} className="glass-card p-4 rounded-xl border border-white/10">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-white">{product.name}</p>
                                        <p className="text-xs font-mono text-slate-400">{product.sku}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/products/${product.id}/edit`} className="p-2 hover:bg-white/10 rounded transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <button className="p-2 hover:bg-white/10 rounded transition-colors text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-sm text-slate-400">
                                    {product.category?.name && <span>{product.category.name}</span>}
                                    <span className={`status-badge type-${product.type}`}>{product.type}</span>
                                    <span>{product.unit}</span>
                                </div>
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
        </AppLayout>
    );
}