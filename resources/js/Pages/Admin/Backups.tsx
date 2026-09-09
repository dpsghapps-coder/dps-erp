import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, DataTable } from '@/Components/ui';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, Trash2, DatabaseBackup, Mail } from 'lucide-react';
import Swal from 'sweetalert2';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function AdminBackups() {
    const { backups, emailEnabled, email } = usePage().props as any;

    const { data, setData, put, processing, errors } = useForm({
        backup_email_enabled: Boolean(emailEnabled),
        backup_email: email || '',
    });

    const handleCreateBackup = () => {
        router.post('/admin/backups', {}, { preserveScroll: true });
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/backups/settings', { preserveScroll: true });
    };

    const handleDelete = (backup: any) => {
        Swal.fire({
            title: `Delete "${backup.name}"?`,
            text: 'This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/admin/backups/${encodeURIComponent(backup.name)}`, { preserveScroll: true });
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Database Backups" />

            <div className="mb-6">
                <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Admin
                </Link>
            </div>

            <PageHeader
                title="Database Backups"
                subtitle="On-demand and scheduled backups of the full database"
                action={
                    <button onClick={handleCreateBackup} className="glass-button flex items-center gap-2">
                        <DatabaseBackup className="w-4 h-4" /> Create Backup Now
                    </button>
                }
            />

            <GlassCard className="mb-6">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-slate-400" /> Scheduled Email Backups
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    A backup runs automatically every night. When enabled, a compressed copy is emailed to the address below —
                    a backup that's too large to attach is still created on the server and you'll get a notification instead.
                </p>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="backup_email_enabled"
                            checked={data.backup_email_enabled}
                            onChange={(e) => setData('backup_email_enabled', e.target.checked)}
                            className="w-4 h-4 rounded"
                        />
                        <label htmlFor="backup_email_enabled" className="text-sm font-medium">Email me a copy of the nightly backup</label>
                    </div>
                    <div className="max-w-sm">
                        <label className="block text-sm font-medium mb-2">Recipient Email</label>
                        <input
                            type="email"
                            value={data.backup_email}
                            onChange={(e) => setData('backup_email', e.target.value)}
                            className="glass-input w-full"
                            placeholder="you@example.com"
                        />
                        {errors.backup_email && <p className="text-red-500 text-sm mt-1">{errors.backup_email}</p>}
                    </div>
                    <button type="submit" disabled={processing} className="glass-button">
                        {processing ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>
            </GlassCard>

            <GlassCard>
                <h3 className="text-lg font-semibold mb-4">Backups on This Server</h3>
                <DataTable
                    columns={[
                        { header: 'Name', key: 'name' },
                        { header: 'Size', render: (b: any) => formatBytes(b.size) },
                        { header: 'Created', render: (b: any) => new Date(b.created_at).toLocaleString() },
                        {
                            header: 'Actions',
                            className: 'text-right',
                            render: (b: any) => (
                                <div className="flex items-center justify-end gap-3">
                                    <a href={`/admin/backups/${encodeURIComponent(b.name)}/download`}>
                                        <Download className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                                    </a>
                                    <button onClick={() => handleDelete(b)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    data={backups}
                    emptyMessage="No backups yet — click Create Backup Now to make one."
                />
            </GlassCard>
        </AppLayout>
    );
}
