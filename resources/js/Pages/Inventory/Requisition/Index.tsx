import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import InventoryTabs from '@/Components/InventoryTabs';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Plus, Search, ClipboardList, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function RequisitionIndex() {
    const { requisitions, products } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRequisition, setEditingRequisition] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        product_id: '',
        material_name: '',
        material_attributes: '',
        qty_requested: '',
        purpose: '',
        requested_by: '',
        department: '',
        assignee: '',
        notes: '',
        status: 'pending',
    });

    const filteredRequisitions = (requisitions?.data || []).filter((r: any) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (r.product?.item_name || r.material_name)?.toLowerCase().includes(q) ||
               r.product?.material_id?.toLowerCase().includes(q) ||
               r.requested_by?.toLowerCase().includes(q) ||
               r.assignee?.toLowerCase().includes(q);
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRequisition) {
            put(`/inventory/requisitions/${editingRequisition.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingRequisition(null);
                    reset();
                }
            });
        } else {
            post('/inventory/requisitions', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        }
    };

    const updateStatus = (id: string, status: string) => {
        router.patch(`/inventory/requisitions/${id}/status`, { status });
    };

    const handleDelete = (id: string) => {
        Swal.fire({
            title: 'Delete Requisition?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete',
        }).then((result) => {
            if (result.isConfirmed) destroy(`/inventory/requisitions/${id}`);
        });
    };

    const openEdit = (req: any) => {
        setEditingRequisition(req);
        setData({
            product_id: req.product_id || '',
            material_name: req.material_name || '',
            material_attributes: req.material_attributes || '',
            qty_requested: req.qty_requested,
            purpose: req.purpose || '',
            requested_by: req.requested_by || '',
            department: req.department || '',
            assignee: req.assignee || '',
            notes: req.notes || '',
            status: req.status,
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditingRequisition(null);
        reset();
        setShowModal(true);
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        cancelled: 'bg-slate-100 text-slate-600',
    };

    return (
        <AppLayout>
            <Head title="Requisition" />

            <PageHeader
                title="Requisition"
                subtitle="Track inventory requests"
                action={
                    <button onClick={openCreate} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Request
                    </button>
                }
            />

            <InventoryTabs activeTab="requisition" />

            <GlassCard className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search requisitions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="glass-input w-full pl-10"
                    />
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Material Name</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Qty</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Assignee</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Purpose</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Request By</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequisitions.length > 0 ? (
                                filteredRequisitions.map((req: any) => (
                                    <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-slate-600">
                                            {req.date_requested ? new Date(req.date_requested).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-slate-900">{req.product?.item_name || req.material_name}</p>
                                            {req.product?.material_id && <p className="text-xs font-mono text-slate-400">{req.product?.material_id}</p>}
                                            {req.material_attributes && <p className="text-xs text-slate-500 italic">{req.material_attributes}</p>}
                                        </td>
                                        <td className="py-3 px-4 text-right font-semibold text-slate-900">{req.qty_requested}</td>
                                        <td className="py-3 px-4 text-slate-600">{req.assignee || '-'}</td>
                                        <td className="py-3 px-4">
                                            {req.purpose ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                    {req.purpose}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-slate-900">{req.requested_by || '-'}</p>
                                            {req.department && <p className="text-xs text-slate-400">{req.department}</p>}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[req.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEdit(req)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(req.id, 'approved')}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(req.id, 'rejected')}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
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
                                            icon={ClipboardList}
                                            title="No requisitions"
                                            action={
                                                <button onClick={openCreate} className="glass-button">
                                                    <Plus className="w-4 h-4 mr-2" /> New Request
                                                </button>
                                            }
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden p-4 space-y-3">
                    {filteredRequisitions.length > 0 ? (
                        filteredRequisitions.map((req: any) => (
                            <div key={req.id} className="glass-card p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-slate-900">{req.product?.item_name || req.material_name}</p>
                                        {req.product?.material_id && <p className="text-xs font-mono text-slate-400">{req.product?.material_id}</p>}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[req.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {req.status}
                                    </span>
                                </div>
                                <div className="space-y-1 text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Date:</span>
                                        <span>{req.date_requested ? new Date(req.date_requested).toLocaleDateString() : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Qty:</span>
                                        <span className="font-semibold">{req.qty_requested}</span>
                                    </div>
                                    {req.assignee && <div className="flex justify-between"><span>Assignee:</span><span>{req.assignee}</span></div>}
                                    {req.purpose && <div className="flex justify-between"><span>Purpose:</span><span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{req.purpose}</span></div>}
                                    {req.notes && <div className="flex justify-between"><span>Notes:</span><span className="text-right text-slate-500 truncate max-w-[200px]">{req.notes}</span></div>}
                                    <div className="flex justify-between">
                                        <span>Request By:</span>
                                        <span className="text-right">{req.requested_by || '-'}{req.department ? ` (${req.department})` : ''}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                                    <button onClick={() => openEdit(req)} className="flex-1 text-xs px-2 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center gap-1">
                                        <Pencil className="w-3 h-3" /> Edit
                                    </button>
                                    {req.status === 'pending' && (
                                        <>
                                            <button onClick={() => updateStatus(req.id, 'approved')} className="flex-1 text-xs px-2 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center justify-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Approve
                                            </button>
                                            <button onClick={() => updateStatus(req.id, 'rejected')} className="flex-1 text-xs px-2 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center gap-1">
                                                <XCircle className="w-3 h-3" /> Reject
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => handleDelete(req.id)} className="flex-1 text-xs px-2 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center gap-1">
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            icon={ClipboardList}
                            title="No requisitions"
                            action={
                                <button onClick={openCreate} className="glass-button">
                                    <Plus className="w-4 h-4 mr-2" /> New Request
                                </button>
                            }
                        />
                    )}
                </div>
            </GlassCard>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            {editingRequisition ? 'Edit Requisition' : 'New Requisition'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Select From Inventory</label>
                                    <select
                                        value={data.product_id}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData('product_id', val);
                                            if (val) {
                                                const p = products.find((x: any) => x.id == val);
                                                if (p) setData('material_name', p.item_name);
                                            }
                                        }}
                                        className="glass-input w-full"
                                    >
                                        <option value="">-- Manual Entry --</option>
                                        {(products || []).map((p: any) => (
                                            <option key={p.id} value={p.id}>
                                                {p.item_name} ({p.material_id}) - Avail: {p.available_stock}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Material Name *</label>
                                    <input
                                        type="text"
                                        value={data.material_name}
                                        onChange={(e) => setData('material_name', e.target.value)}
                                        className="glass-input w-full"
                                        required
                                        placeholder="Enter material name"
                                        disabled={!!data.product_id}
                                    />
                                    {errors.material_name && <p className="text-red-500 text-xs mt-1">{errors.material_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Material Attributes</label>
                                    <textarea
                                        value={data.material_attributes}
                                        onChange={(e) => setData('material_attributes', e.target.value)}
                                        className="glass-input w-full h-16"
                                        placeholder="e.g. Size: Large, Color: Blue"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Qty *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.qty_requested}
                                            onChange={(e) => setData('qty_requested', e.target.value)}
                                            className="glass-input w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Purpose</label>
                                        <select
                                            value={data.purpose}
                                            onChange={(e) => setData('purpose', e.target.value)}
                                            className="glass-input w-full"
                                        >
                                            <option value="">Select purpose</option>
                                            <option value="Sample">Sample</option>
                                            <option value="R&D">R & D</option>
                                            <option value="Order">Order</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Requested By</label>
                                        <input
                                            type="text"
                                            value={data.requested_by}
                                            onChange={(e) => setData('requested_by', e.target.value)}
                                            className="glass-input w-full"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Department</label>
                                        <input
                                            type="text"
                                            value={data.department}
                                            onChange={(e) => setData('department', e.target.value)}
                                            className="glass-input w-full"
                                            placeholder="e.g. Production"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Assignee</label>
                                    <input
                                        type="text"
                                        value={data.assignee}
                                        onChange={(e) => setData('assignee', e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="Person to handle this"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Notes</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="glass-input w-full h-16"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => { setShowModal(false); setEditingRequisition(null); reset(); }} className="flex-1 glass-button-secondary">
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
        </AppLayout>
    );
}
