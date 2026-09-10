import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, Pencil, Plus, Save, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface MarketingDocumentRow {
    id: number;
    name: string;
    description: string | null;
    path: string;
    original_filename: string;
    mime_type: string | null;
    campaign_id: number | null;
    campaign: { id: number; number: string; title: string } | null;
}

function fileTypeLabel(mime: string | null, filename: string): string {
    if (mime?.startsWith('image/')) return 'Image';
    if (mime === 'application/pdf') return 'PDF';
    if (mime?.includes('word') || filename.endsWith('.doc') || filename.endsWith('.docx')) return 'Word';
    return filename.split('.').pop()?.toUpperCase() || 'File';
}

export default function MarketingDocumentsIndex({ documents, campaigns }: {
    documents: MarketingDocumentRow[];
    campaigns: { id: number; number: string; title: string }[];
}) {
    const page = usePage().props as any;
    const permissions = (page.auth?.permissions as string[]) || [];
    const canManage = permissions.includes('*') || permissions.includes('marketing.edit');
    const canDelete = permissions.includes('*') || permissions.includes('marketing.delete');
    const canCreate = permissions.includes('*') || permissions.includes('marketing.create');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCampaignId, setEditCampaignId] = useState('');
    const [showUpload, setShowUpload] = useState(false);

    const uploadForm = useForm({
        name: '',
        description: '',
        campaign_id: '',
        file: null as File | null,
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post('/marketing/documents', {
            forceFormData: true,
            onSuccess: () => {
                uploadForm.reset();
                setShowUpload(false);
            },
        });
    };

    const startEdit = (doc: MarketingDocumentRow) => {
        setEditingId(doc.id);
        setEditName(doc.name);
        setEditDescription(doc.description || '');
        setEditCampaignId(doc.campaign_id ? String(doc.campaign_id) : '');
    };

    const saveEdit = (doc: MarketingDocumentRow) => {
        router.put(`/marketing/documents/${doc.id}`, {
            name: editName,
            description: editDescription,
            campaign_id: editCampaignId || null,
        }, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (doc: MarketingDocumentRow) => {
        Swal.fire({
            title: `Remove "${doc.name}"?`,
            text: 'This permanently deletes the uploaded file.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Remove',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/marketing/documents/${doc.id}`, { preserveScroll: true });
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Marketing Documents" />

            <div className="mb-6">
                <Link href="/marketing" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Marketing
                </Link>
            </div>

            <PageHeader
                title="Documents"
                subtitle={`${documents.length} document${documents.length === 1 ? '' : 's'}`}
                action={
                    canCreate ? (
                        <button onClick={() => setShowUpload((v) => !v)} className="glass-button flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Upload Document
                        </button>
                    ) : undefined
                }
            />

            {showUpload && (
                <GlassCard className="mb-6">
                    <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name *</label>
                            <input
                                type="text"
                                value={uploadForm.data.name}
                                onChange={(e) => uploadForm.setData('name', e.target.value)}
                                className="glass-input w-full"
                            />
                            {uploadForm.errors.name && <p className="text-red-500 text-sm mt-1">{uploadForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Campaign (optional)</label>
                            <select
                                value={uploadForm.data.campaign_id}
                                onChange={(e) => uploadForm.setData('campaign_id', e.target.value)}
                                className="glass-input w-full"
                            >
                                <option value="">No campaign</option>
                                {campaigns.map((c) => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <input
                                type="text"
                                value={uploadForm.data.description}
                                onChange={(e) => uploadForm.setData('description', e.target.value)}
                                className="glass-input w-full"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">File * (jpg, png, gif, pdf, doc, docx — max 10MB)</label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                                onChange={(e) => uploadForm.setData('file', e.target.files?.[0] ?? null)}
                                className="glass-input w-full"
                            />
                            {uploadForm.errors.file && <p className="text-red-500 text-sm mt-1">{uploadForm.errors.file}</p>}
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowUpload(false)} className="glass-button-secondary">Cancel</button>
                            <button type="submit" disabled={uploadForm.processing} className="glass-button">
                                {uploadForm.processing ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <GlassCard>
                {documents.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No documents uploaded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10">
                                    <th className="text-left py-3 px-4 font-medium text-slate-500">Name</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-500">Description</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-500">Campaign</th>
                                    <th className="text-center py-3 px-4 font-medium text-slate-500">Download</th>
                                    {(canManage || canDelete) && <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="border-b border-slate-100 dark:border-white/5">
                                        {editingId === doc.id ? (
                                            <>
                                                <td className="py-2 px-4">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="glass-input w-full text-sm py-1"
                                                    />
                                                </td>
                                                <td className="py-2 px-4">
                                                    <input
                                                        type="text"
                                                        value={editDescription}
                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                        className="glass-input w-full text-sm py-1"
                                                    />
                                                </td>
                                                <td className="py-2 px-4 text-slate-400">{fileTypeLabel(doc.mime_type, doc.original_filename)}</td>
                                                <td className="py-2 px-4">
                                                    <select
                                                        value={editCampaignId}
                                                        onChange={(e) => setEditCampaignId(e.target.value)}
                                                        className="glass-input w-full text-sm py-1"
                                                    >
                                                        <option value="">No campaign</option>
                                                        {campaigns.map((c) => (
                                                            <option key={c.id} value={c.id}>{c.title}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-2 px-4 text-center">—</td>
                                                <td className="py-2 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => saveEdit(doc)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded">
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-2 px-4 font-medium flex items-center gap-2">
                                                    {doc.mime_type?.startsWith('image/') ? (
                                                        <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                    ) : (
                                                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                    )}
                                                    {doc.name}
                                                </td>
                                                <td className="py-2 px-4 text-slate-500 dark:text-slate-400">{doc.description || '-'}</td>
                                                <td className="py-2 px-4 text-slate-400">{fileTypeLabel(doc.mime_type, doc.original_filename)}</td>
                                                <td className="py-2 px-4">
                                                    {doc.campaign ? (
                                                        <Link href={`/marketing/${doc.campaign.id}`} className="text-indigo-500 hover:underline">
                                                            {doc.campaign.title}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-4 text-center">
                                                    <a
                                                        href={`/storage/${doc.path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex text-indigo-500 hover:text-indigo-600"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </td>
                                                {(canManage || canDelete) && (
                                                    <td className="py-2 px-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {canManage && (
                                                                <button onClick={() => startEdit(doc)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded" aria-label="Edit">
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button onClick={() => handleDelete(doc)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded" aria-label="Remove">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>
        </AppLayout>
    );
}
