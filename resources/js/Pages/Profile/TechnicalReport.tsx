import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge } from '@/Components/ui';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Wrench, Info, Send } from 'lucide-react';
import ProfileNav from '@/Components/ProfileNav';
import { Transition } from '@headlessui/react';

export default function TechnicalReport() {
    const { categories, severities, departments, myReports } = usePage().props as any;

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        category: '',
        department_id: '',
        title: '',
        severity: 'medium',
        location: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile/technical-report', { onSuccess: () => reset() });
    };

    return (
        <AppLayout>
            <Head title="Report a Technical Issue" />

            <div className="max-w-2xl mx-auto">
                <PageHeader title="Report a Technical Issue" subtitle="Software, equipment, and facilities problems" />
                <ProfileNav />

                <GlassCard className="mb-6 !bg-indigo-50 dark:!bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-indigo-900 dark:text-indigo-200">
                            This report is tied to your account so IT/Admin can follow up with you if they need more details.
                        </p>
                    </div>
                </GlassCard>

                <GlassCard className="mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="glass-input w-full"
                                placeholder="Short summary, e.g. 'Printer not connecting to network'"
                            />
                            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select value={data.category} onChange={(e) => setData('category', e.target.value)} className="glass-input w-full">
                                    <option value="">Select a category</option>
                                    {(categories || []).map((c: string) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Department</label>
                                <select value={data.department_id} onChange={(e) => setData('department_id', e.target.value)} className="glass-input w-full">
                                    <option value="">Select a department</option>
                                    {(departments || []).map((d: any) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                {errors.department_id && <p className="text-red-400 text-sm mt-1">{errors.department_id}</p>}
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Severity</label>
                                <select value={data.severity} onChange={(e) => setData('severity', e.target.value)} className="glass-input w-full">
                                    {(severities || []).map((s: string) => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                                {errors.severity && <p className="text-red-400 text-sm mt-1">{errors.severity}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Location (optional)</label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="e.g. Production floor, Server room"
                                />
                                {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="glass-input w-full h-40"
                                placeholder="Describe the issue in as much detail as possible..."
                            />
                            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div className="flex items-center gap-4">
                            <button type="submit" disabled={processing} className="glass-button flex items-center gap-2">
                                <Send className="w-4 h-4" /> {processing ? 'Submitting...' : 'Submit Report'}
                            </button>
                            <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                <p className="text-sm text-green-600 flex items-center gap-1"><Wrench className="w-4 h-4" /> Submitted.</p>
                            </Transition>
                        </div>
                    </form>
                </GlassCard>

                {(myReports || []).length > 0 && (
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4">Your Recent Reports</h3>
                        <div className="space-y-3">
                            {myReports.map((r: any) => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg gap-3">
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{r.title}</p>
                                        <p className="text-xs text-slate-400">{r.category} · {new Date(r.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <StatusBadge status={r.status} />
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}
            </div>
        </AppLayout>
    );
}
