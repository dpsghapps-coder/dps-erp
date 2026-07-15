import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import GPSMapPicker from '@/Components/GPSMapPicker';
import InventoryTabs from '@/Components/InventoryTabs';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Plus, Search, Pencil, Trash2, User, Building2, Mail, MapPin, Smartphone, Map, X } from 'lucide-react';
import { useState } from 'react';

export default function SuppliersIndex() {
    const { suppliers } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);
    const [mappingBranchIndex, setMappingBranchIndex] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);

    const { data, setData, delete: destroy, processing, errors, reset } = useForm({
        company_name: '',
        is_active: true,
    });

    const [branches, setBranches] = useState<Array<{name: string; contact_name: string; mobile: string; email: string; address: string; location: string}>>([]);

    const filteredSuppliers = (suppliers?.data || []).filter((s: any) => {
        if (!search) return true;
        return s.company_name?.toLowerCase().includes(search.toLowerCase()) ||
               s.email?.toLowerCase().includes(search.toLowerCase());
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...data, branches };
        if (editingSupplier) {
            router.put(`/inventory/suppliers/${editingSupplier.id}`, payload, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingSupplier(null);
                    setBranches([]);
                    reset();
                }
            });
        } else {
            router.post('/inventory/suppliers', payload, {
                onSuccess: () => {
                    setShowModal(false);
                    setBranches([]);
                    reset();
                }
            });
        }
    };

    const handleDelete = (id: string) => {
        setDeleteTarget(id);
    };

    const openEdit = (supplier: any) => {
        setEditingSupplier(supplier);
        setData({
            company_name: supplier.company_name,
            is_active: supplier.is_active,
        });
        setBranches(supplier.branches || []);
        setShowModal(true);
    };

    const openCreate = () => {
        setEditingSupplier(null);
        reset();
        setBranches([]);
        setData({
            company_name: '',
            is_active: true,
        });
        setShowModal(true);
    };

    return (
        <AppLayout>
            <Head title="Suppliers" />

            <PageHeader
                title="Suppliers"
                subtitle="Manage your suppliers and vendors"
                action={
                    <button onClick={openCreate} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Supplier
                    </button>
                }
            />

            <InventoryTabs activeTab="suppliers" />

            <GlassCard className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="glass-input w-full pl-10"
                    />
                </div>
            </GlassCard>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier: any) => (
                        <GlassCard key={supplier.id} variant="interactive">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {supplier.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h3 className="font-semibold text-slate-900">{supplier.company_name}</h3>
                            {supplier.branches && supplier.branches.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {supplier.branches.map((b: any) => (
                                        <div key={b.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-sm">
                                            <p className="font-medium text-slate-800 mb-1.5">{b.name}</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                {b.contact_name && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {b.contact_name}</span>}
                                                {b.mobile && <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {b.mobile}</span>}
                                                {b.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {b.email}</span>}
                                            </div>
                                            {b.address && <p className="text-xs text-slate-500 mt-1 flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {b.address}</p>}
                                            {b.location && (
                                                <a href={`https://www.google.com/maps?q=${b.location}`} target="_blank" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1">
                                                    <Map className="w-3 h-3" /> View on Map
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 flex gap-2">
                                <button onClick={() => openEdit(supplier)} className="flex-1 glass-button-secondary text-sm py-2">
                                    <Pencil className="w-4 h-4 mr-1" /> Edit
                                </button>
                                <button onClick={() => handleDelete(supplier.id)} className="px-3 glass-button-secondary text-sm py-2 text-red-600 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </GlassCard>
                    ))
                ) : (
                    <div className="col-span-full">
                        <GlassCard>
                            <EmptyState
                                icon={User}
                                title="No suppliers found"
                                action={
                                    <button onClick={openCreate} className="glass-button">
                                        <Plus className="w-4 h-4 mr-2" /> Add Supplier
                                    </button>
                                }
                            />
                        </GlassCard>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-4">
                            {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                                    <input
                                        type="text"
                                        value={data.company_name || ''}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className="glass-input w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium">Branches / Departments / Contacts</label>
                                        <button
                                            type="button"
                                            onClick={() => setBranches([...branches, { name: '', contact_name: '', mobile: '', email: '', address: '', location: '' }])}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            + Add Branch
                                        </button>
                                    </div>
                                    {branches.length === 0 && (
                                        <p className="text-xs text-slate-400">No branches added</p>
                                    )}
                                    {branches.map((branch, i) => (
                                        <div key={i} className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-slate-500">Branch {i + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setBranches(branches.filter((_, j) => j !== i))}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={branch.name || ''}
                                                    onChange={(e) => {
                                                        const updated = [...branches];
                                                        updated[i] = { ...updated[i], name: e.target.value };
                                                        setBranches(updated);
                                                    }}
                                                    placeholder="Branch / Dept name"
                                                    className="glass-input w-full text-sm"
                                                />
                                                <input
                                                    type="email"
                                                    value={branch.email || ''}
                                                    onChange={(e) => {
                                                        const updated = [...branches];
                                                        updated[i] = { ...updated[i], email: e.target.value };
                                                        setBranches(updated);
                                                    }}
                                                    placeholder="Email"
                                                    className="glass-input w-full text-sm"
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        value={branch.contact_name || ''}
                                                        onChange={(e) => {
                                                            const updated = [...branches];
                                                            updated[i] = { ...updated[i], contact_name: e.target.value };
                                                            setBranches(updated);
                                                        }}
                                                        placeholder="Contact person"
                                                        className="glass-input w-full text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={branch.mobile || ''}
                                                        onChange={(e) => {
                                                            const updated = [...branches];
                                                            updated[i] = { ...updated[i], mobile: e.target.value };
                                                            setBranches(updated);
                                                        }}
                                                        placeholder="Mobile number"
                                                        className="glass-input w-full text-sm"
                                                    />
                                                </div>
                                                <textarea
                                                    value={branch.address || ''}
                                                    onChange={(e) => {
                                                        const updated = [...branches];
                                                        updated[i] = { ...updated[i], address: e.target.value };
                                                        setBranches(updated);
                                                    }}
                                                    placeholder="Address"
                                                    className="glass-input w-full text-sm h-16"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={branch.location || ''}
                                                        onChange={(e) => {
                                                            const updated = [...branches];
                                                            updated[i] = { ...updated[i], location: e.target.value };
                                                            setBranches(updated);
                                                        }}
                                                        placeholder="GPS Location (lat,lng)"
                                                        className="glass-input w-full text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setMappingBranchIndex(i)}
                                                        className="glass-button-secondary px-2 shrink-0"
                                                    >
                                                        <MapPin className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {branch.location && (
                                                    <a href={`https://www.google.com/maps?q=${branch.location}`} target="_blank" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1">
                                                        <Map className="w-3 h-3" /> View on Map
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-medium">Active Supplier</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 glass-button-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="flex-1 glass-button">
                                    {processing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-2">Delete Supplier</h3>
                        <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete this supplier? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 glass-button-secondary">Cancel</button>
                            <button onClick={() => { destroy(`/inventory/suppliers/${deleteTarget}`); setDeleteTarget(null); }} className="flex-1 glass-button bg-red-600 hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {mappingBranchIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-5xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Pick Location for Branch</h3>
                            <button onClick={() => setMappingBranchIndex(null)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <GPSMapPicker
                            initialLocation={branches[mappingBranchIndex]?.location || ''}
                            onSave={(coords) => {
                                const updated = [...branches];
                                updated[mappingBranchIndex] = { ...updated[mappingBranchIndex], location: coords };
                                setBranches(updated);
                                setMappingBranchIndex(null);
                            }}
                            onClose={() => setMappingBranchIndex(null)}
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
