import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';

export default function EditEmploymentType() {
  const { employmentType } = usePage().props as any;
  const form = useForm({
    name: employmentType.name || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.put(`/hrm/settings/employment-types/${employmentType.id}`, {
      ...form.data,
      onSuccess: () => router.visit(route('hrm.settings.index')),
    });
  };

  return (
    <AppLayout>
      <Head title="Edit Employment Type" />
      <div className="mb-6">
        <Link href="/hrm/settings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
      </div>
      <PageHeader title="Edit Employment Type" subtitle={employmentType.name} />
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="glass-input w-full" placeholder="Name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} />
          <button type="submit" className="glass-button flex items-center"><Save className="w-4 h-4 mr-2" /> Save</button>
        </form>
      </GlassCard>
    </AppLayout>
  );
}
