import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react';

interface KanbanCardProps {
    job: any;
    onClick: () => void;
    onMoveForward: () => void;
    onMoveBackward: () => void;
    onCancel: () => void;
    canMoveForward: boolean;
    canMoveBackward: boolean;
}

const priorityConfig: Record<string, { label: string; className: string }> = {
    urgent: { label: 'Urgent', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    high: { label: 'High', className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
    normal: { label: 'Normal', className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    low: { label: 'Low', className: 'bg-slate-500/20 text-slate-400 border border-slate-500/30' },
};

export default function KanbanCard({
    job,
    onClick,
    onMoveForward,
    onMoveBackward,
    onCancel,
    canMoveForward,
    canMoveBackward,
}: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: job.id,
        data: { job },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    const priority = priorityConfig[job.priority] || priorityConfig.normal;
    const isOverdue = job.due_date && new Date(job.due_date) < new Date() && job.status !== 'completed' && job.status !== 'cancelled';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="glass-card p-3 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors group"
        >
            <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priority.className}`}>
                    {priority.label}
                </span>
                <span className="text-xs font-mono text-slate-500">{job.job_number}</span>
            </div>

            <h4
                className="text-sm font-medium mb-1 hover:text-amber-400 transition-colors cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                {job.title}
            </h4>

            {job.order && (
                <p className="text-xs text-slate-400 mb-1.5">Order: {job.order.order_number}</p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                {job.due_date && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className={isOverdue ? 'text-red-400 font-medium' : ''}>
                            {new Date(job.due_date).toLocaleDateString()}
                        </span>
                    </div>
                )}
                {job.assigned_to && (
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{job.assigned_to.name}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                    {canMoveBackward && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveBackward();
                            }}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Move backward"
                        >
                            <ArrowLeft className="w-3 h-3" />
                        </button>
                    )}
                    {canMoveForward && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveForward();
                            }}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Move forward"
                        >
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                    }}
                    className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    title="Cancel job"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
