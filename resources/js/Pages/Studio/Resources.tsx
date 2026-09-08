import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, DataTable } from '@/Components/ui';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Pencil, Trash2, X } from 'lucide-react';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2';
import { useCurrency } from '@/Utils/currency';

const TYPE_LABELS: Record<string, string> = {
    studio_room: 'Studio Room',
    camera: 'Camera',
    lighting: 'Lighting',
    prop: 'Prop',
    vehicle: 'Vehicle',
};

function ResourceModal({ isOpen, onClose, resource, types }: { isOpen: boolean; onClose: () => void; resource: any; types: string[] }) {
    const isEdit = Boolean(resource);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: resource?.name || '',
        type: resource?.type || types[0] || '',
        description: resource?.description || '',
        is_available: resource ? Boolean(resource.is_available) : true,
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = { onSuccess: handleClose, preserveScroll: true, preserveState: true };
        if (isEdit) {
            put(`/studio/resources/${resource.id}`, options);
        } else {
            post('/studio/resources', options);
        }
    };

    return (
        <Modal show={isOpen} onClose={handleClose}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">{isEdit ? 'Edit Resource' : 'Add Resource'}</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="glass-input w-full"
                            placeholder="e.g. Studio Room A"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Type *</label>
                        <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="glass-input w-full">
                            {types.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="glass-input w-full h-20"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_available"
                            checked={data.is_available}
                            onChange={(e) => setData('is_available', e.target.checked)}
                            className="w-4 h-4 rounded"
                        />
                        <label htmlFor="is_available" className="text-sm font-medium">Available for booking</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={handleClose} className="glass-button-secondary">Cancel</button>
                        <button type="submit" disabled={processing} className="glass-button">
                            {processing ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

function ShootTypeModal({ isOpen, onClose, shootType }: { isOpen: boolean; onClose: () => void; shootType: any }) {
    const isEdit = Boolean(shootType);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: shootType?.name || '',
        price: shootType?.price != null ? String(shootType.price) : '',
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = { onSuccess: handleClose, preserveScroll: true, preserveState: true };
        if (isEdit) {
            put(`/studio/shoot-types/${shootType.id}`, options);
        } else {
            post('/studio/shoot-types', options);
        }
    };

    return (
        <Modal show={isOpen} onClose={handleClose}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">{isEdit ? 'Edit Shoot Type' : 'Add Shoot Type'}</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="glass-input w-full"
                            placeholder="e.g. Wedding, Portrait, Product"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Default Price</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            className="glass-input w-full"
                            placeholder="0.00"
                        />
                        <p className="text-xs text-slate-400 mt-1">Suggested rate when this shoot type is picked on a booking — still editable per booking.</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={handleClose} className="glass-button-secondary">Cancel</button>
                        <button type="submit" disabled={processing} className="glass-button">
                            {processing ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Shoot Type'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default function StudioResources() {
    const { resources, types, shootTypes, canManagePricing } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<any>(null);
    const [shootTypeModalOpen, setShootTypeModalOpen] = useState(false);
    const [editingShootType, setEditingShootType] = useState<any>(null);

    const openCreate = () => { setEditingResource(null); setModalOpen(true); };
    const openEdit = (resource: any) => { setEditingResource(resource); setModalOpen(true); };

    const openCreateShootType = () => { setEditingShootType(null); setShootTypeModalOpen(true); };
    const openEditShootType = (shootType: any) => { setEditingShootType(shootType); setShootTypeModalOpen(true); };

    const handleDelete = (resource: any) => {
        Swal.fire({
            title: `Delete "${resource.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) router.delete(`/studio/resources/${resource.id}`, { preserveScroll: true });
        });
    };

    const handleDeleteShootType = (shootType: any) => {
        Swal.fire({
            title: `Delete "${shootType.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) router.delete(`/studio/shoot-types/${shootType.id}`, { preserveScroll: true });
        });
    };

    return (
        <AppLayout>
            <Head title="Studio Settings" />

            <div className="mb-6">
                <Link href="/studio" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Studio
                </Link>
            </div>

            <PageHeader
                title="Studio Settings"
                subtitle="Resources, shoot types and pricing"
                action={
                    <button onClick={openCreate} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Resource
                    </button>
                }
            />

            <GlassCard>
                <DataTable
                    columns={[
                        { header: 'Name', key: 'name' },
                        { header: 'Type', render: (r: any) => TYPE_LABELS[r.type] || r.type },
                        {
                            header: 'Status',
                            render: (r: any) => (
                                <span className={`text-xs px-2 py-1 rounded-full ${r.is_available ? 'bg-green-500/20 text-green-500' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}`}>
                                    {r.is_available ? 'Available' : 'Unavailable'}
                                </span>
                            ),
                        },
                        { header: 'Description', render: (r: any) => r.description || '—' },
                        {
                            header: 'Actions',
                            className: 'text-right',
                            render: (r: any) => (
                                <div className="flex items-center justify-end gap-3">
                                    <button onClick={() => openEdit(r)}><Pencil className="w-4 h-4 text-slate-400 hover:text-slate-700" /></button>
                                    <button onClick={() => handleDelete(r)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                                </div>
                            ),
                        },
                    ]}
                    data={resources}
                    emptyMessage="No resources yet — add a studio room, camera, or other equipment to get started."
                />
            </GlassCard>

            <div className="flex items-center justify-between mt-8 mb-2">
                <h2 className="text-lg font-semibold">Shoot Types</h2>
                {canManagePricing && (
                    <button onClick={openCreateShootType} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Shoot Type
                    </button>
                )}
            </div>
            <p className="text-sm text-slate-400 mb-4">Selectable when creating a booking, with a suggested default price.</p>

            <GlassCard>
                <DataTable
                    columns={[
                        { header: 'Name', key: 'name' },
                        { header: 'Default Price', render: (s: any) => s.price != null ? formatCurrency(s.price) : '—' },
                        ...(canManagePricing ? [{
                            header: 'Actions',
                            className: 'text-right',
                            render: (s: any) => (
                                <div className="flex items-center justify-end gap-3">
                                    <button onClick={() => openEditShootType(s)}><Pencil className="w-4 h-4 text-slate-400 hover:text-slate-700" /></button>
                                    <button onClick={() => handleDeleteShootType(s)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                                </div>
                            ),
                        }] : []),
                    ]}
                    data={shootTypes}
                    emptyMessage="No shoot types yet — add Portrait, Wedding, Product, etc."
                />
            </GlassCard>

            <ResourceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} resource={editingResource} types={types} />
            <ShootTypeModal isOpen={shootTypeModalOpen} onClose={() => setShootTypeModalOpen(false)} shootType={editingShootType} />
        </AppLayout>
    );
}
