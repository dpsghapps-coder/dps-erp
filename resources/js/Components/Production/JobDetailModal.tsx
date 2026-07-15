import { Fragment } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { X, Calendar, User, Clock, FileText } from 'lucide-react';

interface JobDetailModalProps {
    open: boolean;
    onClose: () => void;
    job: any;
}

const statusLabels: Record<string, string> = {
    new_jobs: 'NEW JOBS',
    design: 'DESIGN',
    printing: 'PRINTING',
    assembly: 'ASSEMBLY',
    qc_inspection: 'QC & INSPECTION',
    completed: 'COMPLETED',
    paused: 'PAUSED',
    cancelled: 'CANCELLED',
};

const statusColors: Record<string, string> = {
    new_jobs: 'bg-blue-500/20 text-blue-400',
    design: 'bg-indigo-500/20 text-indigo-400',
    printing: 'bg-amber-500/20 text-amber-400',
    assembly: 'bg-orange-500/20 text-orange-400',
    qc_inspection: 'bg-purple-500/20 text-purple-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
    cancelled: 'bg-red-500/20 text-red-400',
};

const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500/20 text-red-400',
    high: 'bg-orange-500/20 text-orange-400',
    normal: 'bg-blue-500/20 text-blue-400',
    low: 'bg-slate-500/20 text-slate-400',
};

export default function JobDetailModal({ open, onClose, job }: JobDetailModalProps) {
    if (!job) return null;

    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="glass-card w-full max-w-lg p-0 overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm text-slate-400">{job.job_number}</span>
                                        <span className={'text-xs px-2 py-0.5 rounded ' + (statusColors[job.status] || '')}>
                                            {statusLabels[job.status] || job.status}
                                        </span>
                                    </div>
                                    <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="px-6 py-4 space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">{job.title}</h3>
                                        {job.description && (
                                            <p className="text-sm text-slate-400 mt-1">{job.description}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className={'px-2 py-0.5 rounded text-xs ' + (priorityColors[job.priority] || '')}>
                                                {job.priority}
                                            </span>
                                            <span className="text-slate-400">Priority</span>
                                        </div>
                                        {job.order && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                <span>{job.order.order_number}</span>
                                            </div>
                                        )}
                                        {job.assigned_to && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span>{job.assigned_to.name}</span>
                                            </div>
                                        )}
                                        {job.due_date && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>{new Date(job.due_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {job.started_at && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span>Started: {new Date(job.started_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {job.completed_at && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-emerald-400" />
                                                <span>Completed: {new Date(job.completed_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {job.status_history && job.status_history.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-300 mb-2">Audit History</h4>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {job.status_history.map((entry: any) => (
                                                    <div key={entry.id} className="flex items-start gap-2 text-xs">
                                                        <div className="w-2 h-2 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                                                        <div>
                                                            <span className="text-slate-400">
                                                                {entry.changed_by?.name || 'System'}
                                                            </span>
                                                            <span className="mx-1 text-slate-600">moved to</span>
                                                            <span className="font-medium">
                                                                {statusLabels[entry.new_status] || entry.new_status}
                                                            </span>
                                                            {entry.old_status && (
                                                                <span className="text-slate-600">
                                                                    {' '}from {statusLabels[entry.old_status] || entry.old_status}
                                                                </span>
                                                            )}
                                                            <span className="text-slate-600 ml-1">
                                                                {new Date(entry.created_at).toLocaleString()}
                                                            </span>
                                                            {entry.notes && (
                                                                <p className="text-slate-500 mt-0.5">{entry.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
