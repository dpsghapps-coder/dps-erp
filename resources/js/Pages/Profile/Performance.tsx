import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, Pagination } from '@/Components/ui';
import { Head, usePage } from '@inertiajs/react';
import { TrendingUp, Star } from 'lucide-react';
import ProfileNav from '@/Components/ProfileNav';

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`w-4 h-4 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
            ))}
        </div>
    );
}

export default function Performance() {
    const { hasEmployeeRecord, reviews } = usePage().props as any;

    return (
        <AppLayout>
            <Head title="Performance" />

            <div className="max-w-4xl mx-auto">
                <PageHeader title="Performance" subtitle="Your performance review history" />
                <ProfileNav />

                {!hasEmployeeRecord ? (
                    <GlassCard>
                        <EmptyState icon={TrendingUp} title="No employee record linked" description="Your user account isn't linked to an employee record yet. Contact HR to get this set up." />
                    </GlassCard>
                ) : reviews?.data?.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.data.map((review: any) => (
                            <GlassCard key={review.id}>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            {new Date(review.review_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        {review.reviewer_name && <p className="text-xs text-slate-400">Reviewed by {review.reviewer_name}</p>}
                                    </div>
                                    <Stars rating={review.rating} />
                                </div>
                                {review.goals && (
                                    <div className="mb-2">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Goals</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{review.goals}</p>
                                    </div>
                                )}
                                {review.achievements && (
                                    <div className="mb-2">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Achievements</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{review.achievements}</p>
                                    </div>
                                )}
                                {review.comments && (
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Comments</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{review.comments}</p>
                                    </div>
                                )}
                            </GlassCard>
                        ))}
                        <Pagination meta={reviews} />
                    </div>
                ) : (
                    <GlassCard>
                        <EmptyState icon={TrendingUp} title="No performance reviews yet" description="Reviews from your manager will show up here" />
                    </GlassCard>
                )}
            </div>
        </AppLayout>
    );
}
