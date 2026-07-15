import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, Pencil, Trash2, Wrench } from 'lucide-react';
import { useState } from 'react';

export default function ServicesIndex() {
    const { services } = usePage().props;
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const categories = [...new Set((services?.data || []).map((s: any) => s.category).filter(Boolean))];

    const filteredServices = (services?.data || []).filter((s: any) => {
        const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'all' || s.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    return (
        <AppLayout>
            <Head title="Services" />

            <PageHeader 
                title="Services" 
                subtitle="Manage your services with tiered pricing"
                action={
                    <Link href="/services/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Service
                    </Link>
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
                                placeholder="Search by name or code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                    </div>
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="glass-input"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat: any) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </GlassCard>

            {/* Services Table - Desktop */}
            <GlassCard className="overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Code</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Category</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Unit</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.length > 0 ? (
                                filteredServices.map((service: any) => (
                                    <tr key={service.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 px-4 font-mono text-sm">{service.code}</td>
                                        <td className="py-3 px-4">{service.name}</td>
                                        <td className="py-3 px-4 text-slate-400">{service.category || '-'}</td>
                                        <td className="py-3 px-4 text-slate-400">{service.unit}</td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/services/${service.id}/edit`} className="p-2 hover:bg-white/10 rounded transition-colors">
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
                                    <td colSpan={5} className="py-8">
                                        <EmptyState
                                            icon={Wrench}
                                            title="No services found"
                                            description="Get started by adding your first service"
                                            action={
                                                <Link href="/services/create" className="glass-button">
                                                    <Plus className="w-4 h-4 mr-2" /> Add Service
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
                    {filteredServices.length > 0 ? (
                        filteredServices.map((service: any) => (
                            <div key={service.id} className="glass-card p-4 rounded-xl border border-white/10">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-white">{service.name}</p>
                                        <p className="text-xs font-mono text-slate-400">{service.code}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/services/${service.id}/edit`} className="p-2 hover:bg-white/10 rounded transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <button className="p-2 hover:bg-white/10 rounded transition-colors text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-sm text-slate-400">
                                    {service.category && <span>{service.category}</span>}
                                    <span>{service.unit}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            icon={Wrench}
                            title="No services found"
                            description="Get started by adding your first service"
                            action={
                                <Link href="/services/create" className="glass-button">
                                    <Plus className="w-4 h-4 mr-2" /> Add Service
                                </Link>
                            }
                        />
                    )}
                </div>
            </GlassCard>
        </AppLayout>
    );
}