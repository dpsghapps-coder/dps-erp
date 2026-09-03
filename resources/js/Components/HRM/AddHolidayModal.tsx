import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import Modal from '@/Components/Modal';

interface AddHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddHolidayModal({ isOpen, onClose, onSubmit }: AddHolidayModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'public',
    description: '',
    is_recurring: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // Reset form and close on success
      setFormData({
        name: '',
        date: '',
        type: 'public',
        description: '',
        is_recurring: false,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting holiday:', error);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Add New Holiday
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
            <label className="block text-sm font-medium mb-2">Holiday Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="glass-input w-full"
              placeholder="e.g., Independence Day"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="glass-input w-full pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="glass-input w-full"
                required
              >
                <option value="public">Public Holiday</option>
                <option value="company">Company Holiday</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input w-full h-24 resize-none"
              placeholder="Optional holiday description or notes..."
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="is_recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_recurring" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Recurring every year
            </label>
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
              Save Holiday
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
