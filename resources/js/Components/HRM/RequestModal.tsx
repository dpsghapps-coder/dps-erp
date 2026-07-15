import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import Modal from '@/Components/Modal';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  employees: any[];
  defaultEmployeeId?: number;
}

export function RequestModal({ isOpen, onClose, onSubmit, employees, defaultEmployeeId }: RequestModalProps) {
  const [formData, setFormData] = useState({
    employee_id: defaultEmployeeId || '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit the form
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
    // Reset form and close
    setFormData({
      employee_id: defaultEmployeeId || '',
      leave_type: 'annual',
      start_date: '',
      end_date: '',
      reason: '',
    });
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Request Leave
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Employee</label>
            <select
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="glass-input w-full"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Leave Type</label>
            <select
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
              className="glass-input w-full"
              required
            >
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="unpaid">Unpaid Leave</option>
              <option value="maternity">Maternity</option>
              <option value="paternity">Paternity</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
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
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="glass-input w-full pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="glass-input w-full h-24 resize-none"
              placeholder="Optional reason..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="glass-button-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="glass-button">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}