import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EditDepartment() {
  const { department } = usePage().props as any;
  const form = useForm({
    name: department.name || '',
    code: department.code || '',
    manager_id: department.manager_id || '',
    description: department.description || '',
    is_active: department.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.put(`/hrm/settings/departments/${department.id}`, {
      ...form.data,
      onSuccess: () => {
        // redirect back to settings index
        router.visit(route('hrm.settings.index'));
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Edit Department" />
      <div className="mb-6">
        <Link href="/hrm/settings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
      </div>
      <PageHeader title="Edit Department" subtitle={department.name} />
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="glass-input w-full" placeholder="Name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} />
          <input className="glass-input w-full" placeholder="Code" value={form.data.code} onChange={e => form.setData('code', e.target.value)} />
          <textarea className="glass-input w-full" placeholder="Description" value={form.data.description} onChange={e => form.setData('description', e.target.value)} />
          <div className="flex items-center space-x-2">
            <input type="checkbox" checked={form.data.is_active} onChange={e => form.setData('is_active', e.target.checked)} />
            <span>Active</span>
          </div>
          <button type="submit" className="glass-button flex items-center">
            <Save className="w-4 h-4 mr-2" /> Save
          </button>
        </form>
      </GlassCard>
    </AppLayout>
  );
}
