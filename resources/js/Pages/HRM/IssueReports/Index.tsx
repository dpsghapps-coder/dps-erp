import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, StatusBadge, Pagination } from '@/Components/ui';
import { Head, router, usePage } from '@inertiajs/react';
import { Flag, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const STATUS_OPTIONS = ['new', 'in_review', 'resolved', 'dismissed'];

function ReportCard({ report }: { report: any }) {
    const [status, setStatus] = useState(report.status);
    const [notes, setNotes] = useState(report.admin_notes || '');
    const [saving, setSaving] = useState(false);

    const save = () => {
        setSaving(true);
        router.post(`/hrm/issue-reports/${report.id}/status`, { status, admin_notes: notes }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <GlassCard>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{report.category}</p>
                    <p className="text-xs text-slate-400">
                        {report.location ? `${report.location} · ` : ''}{new Date(report.created_at).toLocaleString()}
                    </p>
                </div>
                <StatusBadge status={report.status} />
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-4">{report.description}</p>

            <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="glass-input w-full text-sm">
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Admin Notes</label>
                    <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="glass-input w-full text-sm" placeholder="Internal notes..." />
                </div>
            </div>
            <button
                onClick={save}
                disabled={saving || (status === report.status && notes === (report.admin_notes || ''))}
                className="glass-button text-sm mt-3 disabled:opacity-50"
            >
                {saving ? 'Saving...' : 'Save'}
            </button>
        </GlassCard>
    );
}

export default function IssueReportsIndex() {
    const { reports } = usePage().props as any;

    return (
        <AppLayout>
            <Head title="Office Issue Reports" />

            <PageHeader title="Office Issue Reports" subtitle="Anonymous reports submitted by staff" />

            <GlassCard className="mb-6 !bg-indigo-50 dark:!bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-indigo-900 dark:text-indigo-200">
                        These reports are submitted anonymously — no submitter identity is ever recorded, so there is no way
                        to trace a report back to a specific person.
                    </p>
                </div>
            </GlassCard>

            {reports?.data?.length > 0 ? (
                <div className="space-y-4">
                    {reports.data.map((report: any) => (
                        <ReportCard key={report.id} report={report} />
                    ))}
                    <Pagination meta={reports} />
                </div>
            ) : (
                <GlassCard>
                    <EmptyState icon={Flag} title="No reports yet" description="Anonymous reports submitted by staff will show up here" />
                </GlassCard>
            )}
        </AppLayout>
    );
}
