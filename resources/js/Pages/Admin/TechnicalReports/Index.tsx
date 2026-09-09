import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, StatusBadge, Pagination } from '@/Components/ui';
import { Head, router, usePage } from '@inertiajs/react';
import { Wrench } from 'lucide-react';
import { useState } from 'react';

const STATUS_OPTIONS = ['new', 'in_progress', 'resolved', 'closed'];

const SEVERITY_STYLES: Record<string, string> = {
    low: 'bg-slate-200 dark:bg-white/10 text-slate-500',
    medium: 'bg-amber-500/20 text-amber-500',
    high: 'bg-orange-500/20 text-orange-500',
    critical: 'bg-red-500/20 text-red-500',
};

function ReportCard({ report, users }: { report: any; users: any[] }) {
    const [status, setStatus] = useState(report.status);
    const [assignedTo, setAssignedTo] = useState(report.assigned_to || '');
    const [notes, setNotes] = useState(report.resolution_notes || '');
    const [saving, setSaving] = useState(false);

    const dirty = status !== report.status || assignedTo !== (report.assigned_to || '') || notes !== (report.resolution_notes || '');

    const save = () => {
        setSaving(true);
        router.post(`/admin/technical-reports/${report.id}/status`, {
            status,
            assigned_to: assignedTo || null,
            resolution_notes: notes,
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <GlassCard>
            <div className="flex items-start justify-between mb-3 gap-3">
                <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{report.title}</p>
                    <p className="text-xs text-slate-400">
                        {report.category}{report.department ? ` · ${report.department.name}` : ''}{report.location ? ` · ${report.location}` : ''}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Reported by {report.user?.name || 'Unknown'} · {new Date(report.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${SEVERITY_STYLES[report.severity] || SEVERITY_STYLES.medium}`}>
                        {report.severity}
                    </span>
                    <StatusBadge status={report.status} />
                </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-4">{report.description}</p>

            <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="glass-input w-full text-sm">
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Assigned To</label>
                    <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="glass-input w-full text-sm">
                        <option value="">Unassigned</option>
                        {users.map((u: any) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Resolution Notes</label>
                    <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="glass-input w-full text-sm" placeholder="Internal notes..." />
                </div>
            </div>
            <button
                onClick={save}
                disabled={saving || !dirty}
                className="glass-button text-sm mt-3 disabled:opacity-50"
            >
                {saving ? 'Saving...' : 'Save'}
            </button>
        </GlassCard>
    );
}

export default function TechnicalReportsIndex() {
    const { reports, users } = usePage().props as any;

    return (
        <AppLayout>
            <Head title="Technical Reports" />

            <PageHeader title="Technical Reports" subtitle="Software, equipment, and facilities issues reported by staff" />

            {reports?.data?.length > 0 ? (
                <div className="space-y-4">
                    {reports.data.map((report: any) => (
                        <ReportCard key={report.id} report={report} users={users || []} />
                    ))}
                    <Pagination meta={reports} />
                </div>
            ) : (
                <GlassCard>
                    <EmptyState icon={Wrench} title="No reports yet" description="Technical reports submitted by staff will show up here" />
                </GlassCard>
            )}
        </AppLayout>
    );
}
