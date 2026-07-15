import { useState } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link } from '@inertiajs/react';
import { 
    Star, 
    TrendingUp, 
    Target, 
    Calendar,
    User,
    Plus,
    FileText
} from 'lucide-react';

const REVIEWS_MOCK = [
    { id: 1, employee: { id: 1, first_name: 'John', last_name: 'Smith' }, review_date: '2026-03-15', rating: 4, goals: 'Complete React certification, Lead team project', achievements: 'Delivered Q1 dashboard ahead of schedule', comments: 'Excellent performance, strong leadership', reviewer_name: 'Jane Manager', status: 'completed' },
    { id: 2, employee: { id: 2, first_name: 'Sarah', last_name: 'Johnson' }, review_date: '2026-03-10', rating: 5, goals: 'Exceed sales targets by 20%, Train new hires', achievements: 'Achieved 150% of target, mentored 3 new team members', comments: 'Outstanding results, great mentor', reviewer_name: 'Jane Manager', status: 'completed' },
    { id: 3, employee: { id: 3, first_name: 'Mike', last_name: 'Chen' }, review_date: '2026-02-20', rating: 3, goals: 'Improve SEO rankings, Launch new campaigns', achievements: 'Rankings improved by 30%, launched 2 campaigns', comments: 'Good progress, room for improvement in analytics', reviewer_name: 'Jane Manager', status: 'completed' },
    { id: 4, employee: { id: 4, first_name: 'Emily', last_name: 'Davis' }, review_date: '2026-02-05', rating: 4, goals: 'Streamline operations, Reduce costs', achievements: 'Reduced operational costs by 15%, improved workflow', comments: 'Strong operational skills', reviewer_name: 'Jane Manager', status: 'completed' },
];

const EMPLOYEES_MOCK = [
    { id: 1, first_name: 'John', last_name: 'Smith' },
    { id: 2, first_name: 'Sarah', last_name: 'Johnson' },
    { id: 3, first_name: 'Mike', last_name: 'Chen' },
    { id: 4, first_name: 'Emily', last_name: 'Davis' },
];

export default function HrmPerformance() {
    const { props } = usePage();
    const reviews = (props as any)?.reviews?.data || REVIEWS_MOCK;
    const employees = (props as any)?.employees || EMPLOYEES_MOCK;

    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    const { post, processing, data, setData } = useForm({
        employee_id: '',
        review_date: '',
        rating: 3,
        goals: '',
        achievements: '',
        comments: '',
        reviewer_name: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        post('/hrm/performance', {
            onSuccess: () => setShowAddModal(false),
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                    />
                ))}
            </div>
        );
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return 'text-green-500';
        if (rating >= 3) return 'text-yellow-500';
        return 'text-red-500';
    };

    const avgRating = reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length;

    const navItems = ['Dashboard', 'Employees', 'Attendance', 'Leaves', 'Holidays', 'Payroll', 'Performance', 'Noticeboard'];

    return (
        <AppLayout>
            <Head title="Performance" />

            <div className="flex flex-wrap items-center gap-2 mb-6">
                {navItems.map((item) => (
                    <Link
                        key={item}
                        href={`/hrm/${item.toLowerCase()}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item === 'Performance'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <PageHeader 
                title="Performance" 
                subtitle="Goals, reviews & ratings"
                action={
                    <button onClick={() => setShowAddModal(true)} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Review
                    </button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgRating.toFixed(1)}</p>
                        <p className="text-sm text-slate-500">Avg Rating</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{reviews.length}</p>
                        <p className="text-sm text-slate-500">Reviews</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">85%</p>
                        <p className="text-sm text-slate-500">Goals Achieved</p>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">4</p>
                        <p className="text-sm text-slate-500">This Quarter</p>
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <select 
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="glass-input"
                    >
                        <option value="all">All Employees</option>
                        {employees.map((emp: any) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            </GlassCard>

            <div className="space-y-4">
                {reviews.map((review: any) => (
                    <GlassCard key={review.id}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-lg font-medium">
                                    {review.employee?.first_name?.charAt(0)}{review.employee?.last_name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        {review.employee?.first_name} {review.employee?.last_name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(review.review_date).toLocaleDateString()}
                                        <span className="mx-2">|</span>
                                        <User className="w-4 h-4" />
                                        {review.reviewer_name}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {renderStars(review.rating)}
                                <span className={`font-medium ${getRatingColor(review.rating)}`}>
                                    {review.rating}/5
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-slate-400 mb-2">Goals</h4>
                                <p className="text-sm">{review.goals}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-400 mb-2">Achievements</h4>
                                <p className="text-sm">{review.achievements}</p>
                            </div>
                        </div>

                        {review.comments && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <h4 className="text-sm font-medium text-slate-400 mb-2">Comments</h4>
                                <p className="text-sm italic">{review.comments}</p>
                            </div>
                        )}
                    </GlassCard>
                ))}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <GlassCard className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Add Performance Review</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-700">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Employee</label>
                                <select
                                    value={data.employee_id}
                                    onChange={(e) => setData('employee_id', e.target.value)}
                                    className="glass-input w-full"
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp: any) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.first_name} {emp.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Review Date</label>
                                    <input
                                        type="date"
                                        value={data.review_date}
                                        onChange={(e) => setData('review_date', e.target.value)}
                                        className="glass-input w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Rating</label>
                                    <select
                                        value={data.rating}
                                        onChange={(e) => setData('rating', parseInt(e.target.value))}
                                        className="glass-input w-full"
                                    >
                                        <option value={1}>1 Star</option>
                                        <option value={2}>2 Stars</option>
                                        <option value={3}>3 Stars</option>
                                        <option value={4}>4 Stars</option>
                                        <option value={5}>5 Stars</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Goals</label>
                                <textarea
                                    value={data.goals}
                                    onChange={(e) => setData('goals', e.target.value)}
                                    className="glass-input w-full h-20"
                                    placeholder="Set goals for next review period..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Achievements</label>
                                <textarea
                                    value={data.achievements}
                                    onChange={(e) => setData('achievements', e.target.value)}
                                    className="glass-input w-full h-20"
                                    placeholder="What was achieved..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Comments</label>
                                <textarea
                                    value={data.comments}
                                    onChange={(e) => setData('comments', e.target.value)}
                                    className="glass-input w-full h-20"
                                    placeholder="Additional comments..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Reviewer Name</label>
                                <input
                                    type="text"
                                    value={data.reviewer_name}
                                    onChange={(e) => setData('reviewer_name', e.target.value)}
                                    className="glass-input w-full"
                                    placeholder="Manager name"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="glass-button-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="glass-button">
                                    Save Review
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </AppLayout>
    );
}