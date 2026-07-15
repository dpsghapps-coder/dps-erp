import { Fragment } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';

interface NewJobModalProps {
    open: boolean;
    onClose: () => void;
    users: any[];
    defaultStatus?: string;
}

export default function NewJobModal({ open, onClose, users, defaultStatus = 'new_jobs' }: NewJobModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        order_id: '',
        priority: 'normal',
        assigned_to: '',
        due_date: '',
        status: defaultStatus,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/production', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                            <DialogPanel className="glass-card w-full max-w-lg">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                    <h2 className="text-lg font-semibold">New Job</h2>
                                    <button onClick={handleClose} className="p-1 rounded hover:bg-white/10 text-slate-400">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="glass-input w-full"
                                            required
                                        />
                                        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="glass-input w-full"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                                            <select
                                                value={data.priority}
                                                onChange={(e) => setData('priority', e.target.value)}
                                                className="glass-input w-full"
                                            >
                                                <option value="low">Low</option>
                                                <option value="normal">Normal</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Starting Column</label>
                                            <select
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="glass-input w-full"
                                            >
                                                <option value="new_jobs">New Jobs</option>
                                                <option value="design">Design</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Operator</label>
                                            <select
                                                value={data.assigned_to}
                                                onChange={(e) => setData('assigned_to', e.target.value)}
                                                className="glass-input w-full"
                                            >
                                                <option value="">Unassigned</option>
                                                {users.map((u: any) => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
                                            <input
                                                type="date"
                                                value={data.due_date}
                                                onChange={(e) => setData('due_date', e.target.value)}
                                                className="glass-input w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                        <button type="button" onClick={handleClose} className="glass-button-secondary">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={processing} className="glass-button">
                                            {processing ? 'Creating...' : 'Create Job'}
                                        </button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
