import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import Modal from '@/Components/Modal';
import { CampaignColorPicker } from '@/Components/Marketing/CampaignColorPicker';

interface AddSalesPromoEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export function AddSalesPromoEventModal({ isOpen, onClose, onSubmit }: AddSalesPromoEventModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        type: 'sale',
        color: '',
        start_date: '',
        end_date: '',
        isMultiDay: false,
        description: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit({
                title: formData.title,
                type: formData.type,
                color: formData.color || null,
                status: 'scheduled',
                start_date: formData.start_date,
                end_date: formData.isMultiDay && formData.end_date ? formData.end_date : formData.start_date,
                description: formData.description || null,
            });
            setFormData({
                title: '',
                type: 'sale',
                color: '',
                start_date: '',
                end_date: '',
                isMultiDay: false,
                description: '',
            });
            onClose();
        } catch (error) {
            console.error('Error submitting sales/promo event:', error);
        }
    };

    return (
        <Modal show={isOpen} onClose={onClose}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Add Sales/Promo Event
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Event Name</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="glass-input w-full"
                            placeholder="e.g., Black Friday Sale"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="glass-input w-full"
                            required
                        >
                            <option value="sale">Sale</option>
                            <option value="promotion">Promotion</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Calendar Color</label>
                        <CampaignColorPicker value={formData.color} onChange={(v) => setFormData({ ...formData, color: v })} />
                    </div>

                    <div className="flex items-center gap-2 py-1">
                        <input
                            type="checkbox"
                            id="isMultiDay"
                            checked={formData.isMultiDay}
                            onChange={(e) => setFormData({ ...formData, isMultiDay: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="isMultiDay" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Runs over multiple days
                        </label>
                    </div>

                    <div className={`grid gap-4 ${formData.isMultiDay ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <div>
                            <label className="block text-sm font-medium mb-2">{formData.isMultiDay ? 'Start Date' : 'Date'}</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="glass-input w-full pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {formData.isMultiDay && (
                            <div>
                                <label className="block text-sm font-medium mb-2">End Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        min={formData.start_date || undefined}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="glass-input w-full pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="glass-input w-full h-24 resize-none"
                            placeholder="Optional notes about this event..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="glass-button-secondary"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="glass-button">
                            Save Event
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
