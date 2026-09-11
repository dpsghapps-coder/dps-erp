import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, EmptyState, Pagination, StatusBadge } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { TrendingUp, Calendar, ClipboardCheck } from 'lucide-react';
import ProfileNav from '@/Components/ProfileNav';

function ReviewRow({ review, subtitle }: { review: any; subtitle?: string }) {
    return (
        <Link href={`/hrm/performance/${review.id}`}>
            <GlassCard variant="interactive">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {subtitle || `${review.employee?.first_name || ''} ${review.employee?.last_name || ''}`.trim()}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(review.review_date).toLocaleDateString()}
                            {review.period && <span>· {review.period}</span>}
                        </div>
                    </div>
                    <StatusBadge status={review.status} />
                </div>
            </GlassCard>
        </Link>
    );
}

export default function Performance() {
    const { hasEmployeeRecord, reviews, awaitingSupervisorInput, awaitingManagerInput } = usePage().props as any;

    const pendingSupervisor = awaitingSupervisorInput || [];
    const pendingManager = awaitingManagerInput || [];

    return (
        <AppLayout>
            <Head title="Performance" />

            <div className="max-w-4xl mx-auto">
                <PageHeader title="Performance" subtitle="Your performance reviews" />
                <ProfileNav />

                {!hasEmployeeRecord ? (
                    <GlassCard>
                        <EmptyState icon={TrendingUp} title="No employee record linked" description="Your user account isn't linked to an employee record yet. Contact HR to get this set up." />
                    </GlassCard>
                ) : (
                    <div className="space-y-8">
                        {(pendingSupervisor.length > 0 || pendingManager.length > 0) && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <ClipboardCheck className="w-4 h-4" /> Awaiting Your Input
                                </h3>
                                <div className="space-y-3">
                                    {pendingSupervisor.map((review: any) => (
                                        <ReviewRow key={`sup-${review.id}`} review={review} subtitle={`${review.employee?.first_name} ${review.employee?.last_name} — Supervisor review`} />
                                    ))}
                                    {pendingManager.map((review: any) => (
                                        <ReviewRow key={`mgr-${review.id}`} review={review} subtitle={`${review.employee?.first_name} ${review.employee?.last_name} — Manager review`} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">My Reviews</h3>
                            {reviews?.data?.length > 0 ? (
                                <div className="space-y-3">
                                    {reviews.data.map((review: any) => (
                                        <ReviewRow key={review.id} review={review} subtitle={review.period || new Date(review.review_date).toLocaleDateString()} />
                                    ))}
                                    <Pagination meta={reviews} />
                                </div>
                            ) : (
                                <GlassCard>
                                    <EmptyState icon={TrendingUp} title="No performance reviews yet" description="Reviews initiated by HR will show up here for you to complete." />
                                </GlassCard>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
