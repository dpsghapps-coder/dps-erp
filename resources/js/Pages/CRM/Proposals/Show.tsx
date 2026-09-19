import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Upload, FileText, Download, X } from 'lucide-react';
import Swal from 'sweetalert2';

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(mime: string | null, filename: string): string {
    if (mime === 'application/pdf') return 'PDF';
    if (mime?.includes('word') || filename.endsWith('.doc') || filename.endsWith('.docx')) return 'Word';
    if (mime?.includes('sheet') || mime?.includes('excel') || filename.endsWith('.xls') || filename.endsWith('.xlsx')) return 'Excel';
    return filename.split('.').pop()?.toUpperCase() || 'File';
}

export default function ProposalShow({ client, proposal }: { client: any; proposal: any }) {
    const uploadForm = useForm({ file: null as File | null });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadForm.data.file) return;
        uploadForm.post(`/crm/${client.id}/proposals/${proposal.id}/files`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => uploadForm.reset(),
        });
    };

    const handleDeleteFile = (file: any) => {
        Swal.fire({
            title: `Remove "${file.original_filename}"?`,
            text: 'This permanently deletes the uploaded file.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Remove',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/crm/${client.id}/proposals/${proposal.id}/files/${file.id}`, { preserveScroll: true });
            }
        });
    };

    const handleDeleteProposal = () => {
        Swal.fire({
            title: `Delete "${proposal.title}"?`,
            text: 'This permanently deletes the proposal and its attached files.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/crm/${client.id}/proposals/${proposal.id}`);
            }
        });
    };

    return (
        <AppLayout>
            <Head title={proposal.title} />

            <div className="mb-6">
                <Link href={`/crm/${client.id}/proposals`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Proposals
                </Link>
            </div>

            <PageHeader
                title={
                    <div className="flex items-center gap-2 flex-wrap">
                        <span>{proposal.title}</span>
                        <StatusBadge status={proposal.status} />
                    </div>
                }
                subtitle={client.company_name}
                action={
                    <div className="flex items-center gap-2">
                        <Link href={`/crm/${client.id}/proposals/${proposal.id}/edit`} className="glass-button flex items-center gap-2 text-sm">
                            <Pencil className="w-4 h-4" /> Edit
                        </Link>
                        <button onClick={handleDeleteProposal} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-500/20 transition-colors text-sm font-medium">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                }
            />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <GlassCard>
                        {proposal.body ? (
                            <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: proposal.body }} />
                        ) : (
                            <p className="text-slate-400 text-sm">No content written yet.</p>
                        )}
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Created</span>
                                <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                            </div>
                            {proposal.created_by && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Created by</span>
                                    <span>{proposal.created_by.name}</span>
                                </div>
                            )}
                            {proposal.deal && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Linked deal</span>
                                    <span>{proposal.deal.type === 'repeat_business' ? 'Sales Campaign' : 'New Lead'}</span>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Attachments</h3>

                        {proposal.files?.length > 0 ? (
                            <div className="space-y-2 mb-4">
                                {proposal.files.map((file: any) => (
                                    <div key={file.id} className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{file.original_filename}</p>
                                                <p className="text-xs text-slate-400">{fileTypeLabel(file.mime_type, file.original_filename)} · {formatSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <a
                                                href={`/storage/${file.path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 rounded text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                            <button onClick={() => handleDeleteFile(file)} className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" title="Remove">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 mb-4">No files attached yet</p>
                        )}

                        <form onSubmit={handleUpload} className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                            <label className="block text-xs text-slate-400">Upload Word, PDF, or Excel — max 20MB</label>
                            <input
                                type="file"
                                accept=".doc,.docx,.pdf,.xls,.xlsx"
                                onChange={(e) => uploadForm.setData('file', e.target.files?.[0] ?? null)}
                                className="glass-input w-full text-sm"
                            />
                            {uploadForm.errors.file && <p className="text-red-400 text-xs">{uploadForm.errors.file}</p>}
                            <button
                                type="submit"
                                disabled={uploadForm.processing || !uploadForm.data.file}
                                className="glass-button-secondary text-sm w-full flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Upload className="w-4 h-4" /> {uploadForm.processing ? 'Uploading...' : 'Upload File'}
                            </button>
                        </form>
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
}
