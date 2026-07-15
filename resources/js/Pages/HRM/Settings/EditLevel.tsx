import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';

export default function EditLevel() {
  const { level } = usePage().props as any;
  const form = useForm({
    name: level.name || '',
    job_title: level.job_title || '',
    description: level.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.put(`/hrm/settings/levels/${level.id}`, {
      ...form.data,
      onSuccess: () => router.visit(route('hrm.settings.index')),
    });
  };

  return (
    <AppLayout>
      <Head title="Edit Level" />
      <div className="mb-6">
        <Link href="/hrm/settings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
      </div>
      <PageHeader title="Edit Level" subtitle={level.name} />
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="glass-input w-full" placeholder="Name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} />
          <input className="glass-input w-full" placeholder="Job Title" value={form.data.job_title} onChange={e => form.setData('job_title', e.target.value)} />
          <textarea className="glass-input w-full" placeholder="Description" value={form.data.description} onChange={e => form.setData('description', e.target.value)} />
          <button type="submit" className="glass-button flex items-center"><Save className="w-4 h-4 mr-2" /> Save</button>
        </form>
      </GlassCard>
    </AppLayout>
  );
}
