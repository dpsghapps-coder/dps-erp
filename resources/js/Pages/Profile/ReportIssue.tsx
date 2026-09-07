import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Flag, ShieldCheck, Send } from 'lucide-react';
import ProfileNav from '@/Components/ProfileNav';
import { Transition } from '@headlessui/react';

export default function ReportIssue() {
    const { categories } = usePage().props as any;

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        category: '',
        location: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile/report-issue', { onSuccess: () => reset() });
    };

    return (
        <AppLayout>
            <Head title="Report an Issue" />

            <div className="max-w-2xl mx-auto">
                <PageHeader title="Report an Issue" subtitle="Report office issues anonymously" />
                <ProfileNav />

                <GlassCard className="mb-6 !bg-indigo-50 dark:!bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-indigo-900 dark:text-indigo-200">
                            This report is anonymous. Your name, account, and any other identifying information are never
                            recorded or attached to what you submit here — only the category, location, and description below
                            are saved.
                        </p>
                    </div>
                </GlassCard>

                <GlassCard>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            <label className="block text-sm font-medium mb-2">Location (optional)</label>
                            <input type="text" value={data.location} onChange={(e) => setData('location', e.target.value)} className="glass-input w-full" placeholder="e.g. Production floor, 2nd floor office" />
                            {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="glass-input w-full h-40" placeholder="Describe the issue in as much detail as possible..." />
                            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                            <button type="submit" disabled={processing} className="glass-button flex items-center gap-2">
                                <Send className="w-4 h-4" /> {processing ? 'Submitting...' : 'Submit Report'}
                            </button>
                            <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                <p className="text-sm text-green-600 flex items-center gap-1"><Flag className="w-4 h-4" /> Submitted anonymously.</p>
                            </Transition>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </AppLayout>
    );
}
