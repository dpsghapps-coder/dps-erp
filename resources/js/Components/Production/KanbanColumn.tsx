import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
    id: string;
    label: string;
    color: string;
    count: number;
    jobs: any[];
    onCardClick: (job: any) => void;
    onMoveForward: (job: any) => void;
    onMoveBackward: (job: any) => void;
    onCancel: (job: any) => void;
    onAddJob: () => void;
    statusFlow: Record<string, string>;
    reverseFlow: Record<string, string>;
}

export default function KanbanColumn({
    id,
    label,
    color,
    count,
    jobs,
    onCardClick,
    onMoveForward,
    onMoveBackward,
    onCancel,
    onAddJob,
    statusFlow,
    reverseFlow,
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    const dropClassName = [
        'flex-1 space-y-2 min-h-[200px] p-2 rounded-lg transition-colors',
        isOver ? 'bg-white/10 ring-2 ring-white/20' : '',
    ].join(' ');

    return (
        <div className="flex flex-col min-w-[280px] max-w-[320px]">
            <div className={`border-t-2 ${color} px-3 py-2 mb-3 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{label}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">{count}</span>
                        <button
                            onClick={onAddJob}
                            className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title={`Add job to ${label}`}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div ref={setNodeRef} className={dropClassName}>
                {jobs.map((job: any) => (
                    <KanbanCard
                        key={job.id}
                        job={job}
                        onClick={() => onCardClick(job)}
                        onMoveForward={() => onMoveForward(job)}
                        onMoveBackward={() => onMoveBackward(job)}
                        onCancel={() => onCancel(job)}
                        canMoveForward={!!statusFlow[job.status]}
                        canMoveBackward={!!reverseFlow[job.status]}
                    />
                ))}

                {jobs.length === 0 && (
                    <div className="text-center text-slate-500 text-sm py-8">
                        No jobs
                    </div>
                )}
            </div>
        </div>
    );
}
