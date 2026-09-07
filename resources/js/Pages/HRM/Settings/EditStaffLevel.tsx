import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';

export default function EditStaffLevel() {
  const { staffLevel } = usePage().props as any;
  const form = useForm({
    name: staffLevel.name || '',
    is_manager: staffLevel.is_manager ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.put(`/hrm/settings/staff-levels/${staffLevel.id}`, {
      onSuccess: () => router.visit(route('hrm.settings.index')),
    });
  };

  return (
    <AppLayout>
      <Head title="Edit Staff Level" />
      <div className="mb-6">
        <Link href="/hrm/settings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
      </div>
      <PageHeader title="Edit Staff Level" subtitle={staffLevel.name} />
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input className="glass-input w-full" placeholder="Name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} />
            {form.errors.name && <p className="text-red-500 text-sm mt-1">{form.errors.name}</p>}
          </div>
          <label className="flex items-start gap-2.5">
            <input type="checkbox" className="mt-0.5" checked={form.data.is_manager} onChange={e => form.setData('is_manager', e.target.checked)} />
            <span className="text-sm">
              <span className="font-medium block">Eligible as department manager</span>
              <span className="text-xs text-gray-500">Employees at this level appear in manager-selection dropdowns across HRM.</span>
            </span>
          </label>
          <button type="submit" className="glass-button flex items-center"><Save className="w-4 h-4 mr-2" /> Save</button>
        </form>
      </GlassCard>
    </AppLayout>
  );
}
