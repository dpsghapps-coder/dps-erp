import { useState, useMemo, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import MetricsBar from './MetricsBar';
import FilterBar from './FilterBar';
import JobDetailModal from './JobDetailModal';
import NewJobModal from './NewJobModal';
import { toast } from 'sonner';

interface KanbanBoardProps {
    jobs: any[];
    users: any[];
}

const STATUS_FLOW: Record<string, string> = {
    new_jobs: 'design',
    design: 'printing',
    printing: 'assembly',
    assembly: 'qc_inspection',
    qc_inspection: 'completed',
};

const REVERSE_FLOW: Record<string, string> = {
    design: 'new_jobs',
    printing: 'design',
    assembly: 'printing',
    qc_inspection: 'assembly',
    completed: 'qc_inspection',
};

const ACTIVE_COLUMNS = [
    { id: 'new_jobs', label: 'NEW JOBS', color: 'border-blue-500' },
    { id: 'design', label: 'DESIGN', color: 'border-indigo-500' },
    { id: 'printing', label: 'PRINTING', color: 'border-amber-500' },
    { id: 'assembly', label: 'ASSEMBLY', color: 'border-orange-500' },
    { id: 'qc_inspection', label: 'QC & INSPECTION', color: 'border-purple-500' },
    { id: 'completed', label: 'COMPLETED', color: 'border-emerald-500' },
];

const PAUSED_CANCELLED_COLUMNS = [
    { id: 'paused', label: 'PAUSED', color: 'border-yellow-500' },
    { id: 'cancelled', label: 'CANCELLED', color: 'border-red-500' },
];

export default function KanbanBoard({ jobs, users }: KanbanBoardProps) {
    const [activeTab, setActiveTab] = useState<'active' | 'paused'>('active');
    const [search, setSearch] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showNewJobModal, setShowNewJobModal] = useState(false);
    const [newJobDefaultStatus, setNewJobDefaultStatus] = useState('new_jobs');
    const [activeId, setActiveId] = useState<string | number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor),
    );

    const filteredJobs = useMemo(() => {
        return jobs.filter((j: any) => {
            const matchSearch =
                !search ||
                j.title.toLowerCase().includes(search.toLowerCase()) ||
                j.job_number.toLowerCase().includes(search.toLowerCase()) ||
                (j.order?.order_number && j.order.order_number.toLowerCase().includes(search.toLowerCase())) ||
                (j.assigned_to?.name && j.assigned_to.name.toLowerCase().includes(search.toLowerCase()));
            const matchPriority = priorityFilter === 'all' || j.priority === priorityFilter;
            return matchSearch && matchPriority;
        });
    }, [jobs, search, priorityFilter]);

    const columns = activeTab === 'active' ? ACTIVE_COLUMNS : PAUSED_CANCELLED_COLUMNS;

    const jobsByStatus = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        columns.forEach((col) => {
            grouped[col.id] = filteredJobs.filter((j: any) => j.status === col.id);
        });
        return grouped;
    }, [filteredJobs, columns]);

    const handleStatusChange = useCallback((jobId: string | number, newStatus: string) => {
        router.patch(`/production/${jobId}/status`, { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Status updated');
            },
            onError: () => {
                toast.error('Failed to update status');
            },
        });
    }, []);

    const handleMoveForward = useCallback((job: any) => {
        const nextStatus = STATUS_FLOW[job.status];
        if (nextStatus) {
            handleStatusChange(job.id, nextStatus);
        }
    }, [handleStatusChange]);

    const handleMoveBackward = useCallback((job: any) => {
        const prevStatus = REVERSE_FLOW[job.status];
        if (prevStatus) {
            handleStatusChange(job.id, prevStatus);
        }
    }, [handleStatusChange]);

    const handleCancel = useCallback((job: any) => {
        if (window.confirm(`Cancel job ${job.job_number}?`)) {
            handleStatusChange(job.id, 'cancelled');
        }
    }, [handleStatusChange]);

    const handleCardClick = useCallback((job: any) => {
        setSelectedJob(job);
        setShowDetailModal(true);
    }, []);

    const handleAddJob = useCallback((status: string) => {
        setNewJobDefaultStatus(status);
        setShowNewJobModal(true);
    }, []);

    const handleDragStart = useCallback((event: any) => {
        setActiveId(event.active.id);
    }, []);

    const handleDragEnd = useCallback((event: any) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const jobId = active.id;
        const newStatus = over.id;
        const job = jobs.find((j: any) => j.id === jobId);

        if (job && job.status !== newStatus) {
            handleStatusChange(jobId, newStatus as string);
        }
    }, [jobs, handleStatusChange]);

    const activeJob = activeId ? jobs.find((j: any) => j.id === activeId) : null;

    const tabCounts = useMemo(() => {
        const activeCount = jobs.filter((j: any) =>
            ACTIVE_COLUMNS.some((c) => c.id === j.status)
        ).length;
        const pausedCount = jobs.filter((j: any) =>
            PAUSED_CANCELLED_COLUMNS.some((c) => c.id === j.status)
        ).length;
        return { active: activeCount, paused: pausedCount };
    }, [jobs]);

    return (
        <>
            <MetricsBar jobs={jobs} />

            <FilterBar
                search={search}
                onSearchChange={setSearch}
                priorityFilter={priorityFilter}
                onPriorityChange={setPriorityFilter}
                onNewJob={() => handleAddJob('new_jobs')}
            />

            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('active')}
                    className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
                        (activeTab === 'active' ? 'bg-white/15 text-white' : 'text-slate-400 hover:bg-white/5')}
                >
                    Active Workflow
                    <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{tabCounts.active}</span>
                </button>
                <button
                    onClick={() => setActiveTab('paused')}
                    className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
                        (activeTab === 'paused' ? 'bg-white/15 text-white' : 'text-slate-400 hover:bg-white/5')}
                >
                    Paused / Cancelled
                    <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{tabCounts.paused}</span>
                </button>
            </div>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            label={col.label}
                            color={col.color}
                            count={jobsByStatus[col.id]?.length || 0}
                            jobs={jobsByStatus[col.id] || []}
                            onCardClick={handleCardClick}
                            onMoveForward={handleMoveForward}
                            onMoveBackward={handleMoveBackward}
                            onCancel={handleCancel}
                            onAddJob={() => handleAddJob(col.id)}
                            statusFlow={STATUS_FLOW}
                            reverseFlow={REVERSE_FLOW}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeJob ? (
                        <div className="opacity-80">
                            <KanbanCard
                                job={activeJob}
                                onClick={() => {}}
                                onMoveForward={() => {}}
                                onMoveBackward={() => {}}
                                onCancel={() => {}}
                                canMoveForward={false}
                                canMoveBackward={false}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <JobDetailModal
                open={showDetailModal}
                onClose={() => { setShowDetailModal(false); setSelectedJob(null); }}
                job={selectedJob}
            />

            <NewJobModal
                open={showNewJobModal}
                onClose={() => setShowNewJobModal(false)}
                users={users}
                defaultStatus={newJobDefaultStatus}
            />
        </>
    );
}
