import { useState } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link } from '@inertiajs/react';
import { 
    Bell, 
    Pin, 
    Cake, 
    PartyPopper,
    Plus,
    Calendar,
    User,
    X,
    Send
} from 'lucide-react';

const NOTICES_MOCK = [
    { id: 1, title: 'Q2 All-Hands Meeting', content: 'Join us for our quarterly all-hands meeting this Friday at 2 PM. We will be discussing Q1 results and Q2 targets.', type: 'announcement', is_pinned: true, posted_by: { name: 'Jane Manager' }, created_at: '2026-04-25' },
    { id: 2, title: 'New Office Policy Update', content: 'Please note the updated office hours: 9 AM - 6 PM effective next Monday.', type: 'general', is_pinned: false, posted_by: { name: 'HR Team' }, created_at: '2024-04-20' },
    { id: 3, title: 'System Maintenance Notice', content: 'The ERP system will be down for maintenance this Sunday from 2 AM - 6 AM.', type: 'general', is_pinned: false, posted_by: { name: 'IT Team' }, created_at: '2026-04-18' },
    { id: 4, title: 'Welcome New Team Members', content: 'Please welcome our new team members joining this week: Alex Johnson (Engineering), Maria Garcia (Sales).', type: 'announcement', is_pinned: false, posted_by: { name: 'HR Team' }, created_at: '2026-04-15' },
];

const BIRTHDAYS_MOCK = [
    { id: 1, first_name: 'Sarah', last_name: 'Johnson', event_date: '2026-04-28', type: 'birthday' },
    { id: 2, first_name: 'Mike', last_name: 'Chen', event_date: '2026-04-30', type: 'birthday' },
];

const ANNIVERSARIES_MOCK = [
    { id: 1, first_name: 'John', last_name: 'Smith', years: 3, event_date: '2026-04-27', type: 'anniversary' },
    { id: 2, first_name: 'Emily', last_name: 'Davis', years: 5, event_date: '2026-05-02', type: 'anniversary' },
];

export default function HrmNoticeboard() {
    const { props } = usePage();
    const notices = (props as any)?.notices?.data || NOTICES_MOCK;
    const birthdays = (props as any)?.birthdays || BIRTHDAYS_MOCK;
    const anniversaries = (props as any)?.anniversaries || ANNIVERSARIES_MOCK;

    const [typeFilter, setTypeFilter] = useState('all');
    const [showComposer, setShowComposer] = useState(false);

    const { post, processing, data, setData, reset } = useForm({
        title: '',
        content: '',
        type: 'announcement',
        is_pinned: false,
        event_date: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        post('/hrm/noticeboard', {
            onSuccess: () => {
                reset();
                setShowComposer(false);
            },
        });
    };

    const typeIcons: Record<string, any> = {
        announcement: Bell,
        birthday: Cake,
        anniversary: PartyPopper,
        general: Bell,
    };

    const typeColors: Record<string, string> = {
        announcement: 'bg-blue-100 text-blue-700',
        birthday: 'bg-pink-100 text-pink-700',
        anniversary: 'bg-purple-100 text-purple-700',
        general: 'bg-slate-100 text-slate-700',
    };

    const navItems = ['Dashboard', 'Employees', 'Attendance', 'Leaves', 'Holidays', 'Payroll', 'Performance', 'Noticeboard'];

    return (
        <AppLayout>
            <Head title="Noticeboard" />

            <div className="flex flex-wrap items-center gap-2 mb-6">
                {navItems.map((item) => (
                    <Link
                        key={item}
                        href={`/hrm/${item.toLowerCase()}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item === 'Noticeboard'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <PageHeader 
                title="Noticeboard" 
                subtitle="Announcements & events"
                action={
                    <button onClick={() => setShowComposer(true)} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Post
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <GlassCard className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Announcements</h3>
                        <div className="flex gap-2">
                            <select 
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="glass-input text-sm"
                            >
                                <option value="all">All Types</option>
                                <option value="announcement">Announcements</option>
                                <option value="general">General</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {notices.filter((n: any) => typeFilter === 'all' || n.type === typeFilter).map((notice: any) => {
                            const Icon = typeIcons[notice.type] || Bell;
                            return (
                                <div 
                                    key={notice.id} 
                                    className={`p-4 rounded-lg ${notice.is_pinned ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[notice.type]}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">{notice.title}</h4>
                                                {notice.is_pinned && (
                                                    <Pin className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{notice.content}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                <span>{notice.posted_by?.name}</span>
                                                <span>•</span>
                                                <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Cake className="w-5 h-5 text-pink-500" /> Upcoming Birthdays
                        </h3>
                        <div className="space-y-3">
                            {birthdays.map((b: any) => (
                                <div key={b.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center text-sm">
                                            {b.first_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{b.first_name} {b.last_name}</p>
                                            <p className="text-xs text-slate-500">{new Date(b.event_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <PartyPopper className="w-5 h-5 text-purple-500" /> Work Anniversaries
                        </h3>
                        <div className="space-y-3">
                            {anniversaries.map((a: any) => (
                                <div key={a.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-sm">
                                            {a.first_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{a.first_name} {a.last_name}</p>
                                            <p className="text-xs text-slate-500">{a.years} year{a.years > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">{new Date(a.event_date).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {showComposer && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <GlassCard className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Compose Notice</h2>
                            <button onClick={() => setShowComposer(false)} className="text-slate-500 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Notice title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Type</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="glass-input w-full"
                                >
                                    <option value="announcement">Announcement</option>
                                    <option value="general">General</option>
                                    <option value="birthday">Birthday</option>
                                    <option value="anniversary">Anniversary</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Content</label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    className="glass-input w-full h-32"
                                    placeholder="Write your notice..."
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_pinned"
                                    checked={data.is_pinned}
                                    onChange={(e) => setData('is_pinned', e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="is_pinned" className="text-sm">Pin to top</label>
                            </div>

                            {(data.type === 'birthday' || data.type === 'anniversary') && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Event Date</label>
                                    <input
                                        type="date"
                                        value={data.event_date}
                                        onChange={(e) => setData('event_date', e.target.value)}
                                        className="glass-input w-full"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowComposer(false)}
                                    className="glass-button-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="glass-button flex items-center gap-2">
                                    <Send className="w-4 h-4" /> Post Notice
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </AppLayout>
    );
}