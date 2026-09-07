import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';

export default function EditLeaveType() {
  const { leaveType, staffLevels } = usePage().props as any;
  const form = useForm({
    name: leaveType.name || '',
    staff_level_id: leaveType.staff_level_id || '',
    days_per_year: leaveType.days_per_year ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.put(`/hrm/settings/leave-types/${leaveType.id}`, {
      onSuccess: () => router.visit(route('hrm.settings.index')),
    });
  };

  return (
    <AppLayout>
      <Head title="Edit Leave Type" />
      <div className="mb-6">
        <Link href="/hrm/settings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
      </div>
      <PageHeader title="Edit Leave Type" subtitle={`${leaveType.name} — ${leaveType.staff_level?.name || ''}`} />
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Leave Type</label>
            <select className="glass-input w-full" value={form.data.name} onChange={e => form.setData('name', e.target.value)}>
              <option value="">Select Leave Type</option>
              <option value="Annual">Annual</option>
              <option value="Sick">Sick</option>
              <option value="Emergency">Emergency</option>
            </select>
            {form.errors.name && <p className="text-red-500 text-sm mt-1">{form.errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Staff Level</label>
            <select className="glass-input w-full" value={form.data.staff_level_id} onChange={e => form.setData('staff_level_id', e.target.value)}>
              <option value="">Select Staff Level</option>
              {(staffLevels || []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {form.errors.staff_level_id && <p className="text-red-500 text-sm mt-1">{form.errors.staff_level_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Days Per Year</label>
            <input type="number" className="glass-input w-full" placeholder="Days" value={form.data.days_per_year} onChange={e => form.setData('days_per_year', e.target.value)} />
            {form.errors.days_per_year && <p className="text-red-500 text-sm mt-1">{form.errors.days_per_year}</p>}
          </div>
          <button type="submit" className="glass-button flex items-center"><Save className="w-4 h-4 mr-2" /> Save</button>
        </form>
      </GlassCard>
    </AppLayout>
  );
}
