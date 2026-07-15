import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, FileText, Eye } from 'lucide-react';

const STATUSES = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'proposed', label: 'Proposed' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

function getPriorityBadge(priority: string) {
    const map: Record<string, string> = {
        critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        low: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    };
    return map[priority] || map.low;
}

function getStatusBadge(status: string) {
    const map: Record<string, string> = {
        draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
        proposed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return map[status] || map.draft;
}

export default function DecisionsIndex() {
    const { decisions, categories } = usePage().props as any;
    const params = new URLSearchParams(window.location.search);
    const currentStatus = params.get('status') || '';

    return (
        <AppLayout>
            <Head title="Decisions" />

            <PageHeader
                title="Decisions"
                subtitle="Track and manage decisions"
                action={
                    <Link href="/management/decisions/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Decision
                    </Link>
                }
            />

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-2">
                    {STATUSES.map((tab) => (
                        <Link
                            key={tab.value}
                            href={tab.value ? `/management/decisions?status=${tab.value}` : '/management/decisions'}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                currentStatus === tab.value || (!currentStatus && !tab.value)
                                    ? 'bg-white text-slate-900 shadow-sm dark:bg-white/20 dark:text-white'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'
                            }`}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden p-0">
                {(decisions?.data || []).length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                                    <th className="py-3 px-4">Number</th>
                                    <th className="py-3 px-4">Title</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Priority</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {decisions.data.map((decision: any) => (
                                    <tr key={decision.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 font-mono text-sm text-slate-900 dark:text-white">
                                            {decision.number}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                                            {decision.title}
                                        </td>
                                        <td className="py-3 px-4">
                                            {decision.category && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                    {decision.category.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(decision.priority)}`}>
                                                {decision.priority}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(decision.status)}`}>
                                                {decision.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                href={`/management/decisions/${decision.id}`}
                                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <Eye className="w-4 h-4" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        icon={FileText}
                        title="No decisions found"
                        description="Start tracking management decisions."
                        action={
                            <Link href="/management/decisions/create" className="glass-button inline-flex items-center gap-2">
                                <Plus className="w-4 h-4" /> New Decision
                            </Link>
                        }
                    />
                )}
            </GlassCard>

            {decisions?.links && decisions.links.length > 3 && (
                <div className="flex justify-center mt-6 gap-1">
                    {decisions.links.map((link: any, i: number) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                link.active
                                    ? 'bg-white text-slate-900 shadow-sm dark:bg-white/20 dark:text-white'
                                    : 'text-slate-600 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10'
                            } ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
