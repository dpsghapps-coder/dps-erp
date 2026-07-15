import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, DataTable } from '@/Components/ui';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function HrmSettingsIndex() {
    const { departments, levels, employmentTypes, leaveTypes } = usePage().props as any;

    const deptForm = useForm({ name: '' });
    const levelForm = useForm({ name: '', job_title: '' });
    const empTypeForm = useForm({ name: '' });
    const leaveTypeForm = useForm({ name: '', level_id: '', days_per_year: '' });

    const handleDelete = (url: string, name: string) => {
        Swal.fire({
            title: `Delete ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete'
        }).then((res) => {
            if (res.isConfirmed) router.delete(url);
        });
    };

    return (
        <AppLayout>
            <Head title="HRM Settings" />
            <PageHeader title="HRM Settings" subtitle="Configure organization structure" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard><div className="flex justify-between items-center mb-2"><h2 className="text-lg font-semibold">Departments</h2><span className="text-sm text-gray-500">{departments.length} items</span></div>
                    <form onSubmit={(e) => { e.preventDefault(); deptForm.post('/hrm/settings/departments', { onSuccess: () => deptForm.reset() }); }}>
                        <div className="flex gap-2 mb-4">
                            <input className="glass-input flex-1" placeholder="New Dept" value={deptForm.data.name} onChange={e => deptForm.setData('name', e.target.value)} />
                            <button className="glass-button"><Plus className="w-4 h-4" /></button>
                        </div>
                    </form>
                    <DataTable columns={[
                        { header: 'Name', key: 'name' },
                        { header: 'Actions', className: 'text-right', render: (d: any) => <button onClick={() => handleDelete(`/hrm/settings/departments/${d.id}`, d.name)}><Trash2 className="w-4 h-4 text-red-500" /></button> }
                    ]} data={departments} />
                </GlassCard>

                <GlassCard><div className="flex justify-between items-center mb-2"><h2 className="text-lg font-semibold">Levels</h2><span className="text-sm text-gray-500">{levels.length} items</span></div>
                    <form onSubmit={(e) => { e.preventDefault(); levelForm.post('/hrm/settings/levels', { onSuccess: () => levelForm.reset() }); }}>
                        <div className="flex gap-2 mb-4">
                            <input className="glass-input flex-1" placeholder="New Level" value={levelForm.data.name} onChange={e => levelForm.setData('name', e.target.value)} />
                            <input className="glass-input flex-1" placeholder="Job Title" value={levelForm.data.job_title} onChange={e => levelForm.setData('job_title', e.target.value)} />
                            <button className="glass-button"><Plus className="w-4 h-4" /></button>
                        </div>
                    </form>
                    <DataTable columns={[
                        { header: 'Level', key: 'name' },
                        { header: 'Job Title', key: 'job_title' },
                        { header: 'Actions', className: 'text-right', render: (l: any) => <button onClick={() => handleDelete(`/hrm/settings/levels/${l.id}`, l.name)}><Trash2 className="w-4 h-4 text-red-500" /></button> }
                    ]} data={levels} />
                </GlassCard>

                <GlassCard><div className="flex justify-between items-center mb-2"><h2 className="text-lg font-semibold">Employment Types</h2><span className="text-sm text-gray-500">{employmentTypes.length} items</span></div>
                    <form onSubmit={(e) => { e.preventDefault(); empTypeForm.post('/hrm/settings/employment-types', { onSuccess: () => empTypeForm.reset() }); }}>
                        <div className="flex gap-2 mb-4">
                            <input className="glass-input flex-1" placeholder="New Type" value={empTypeForm.data.name} onChange={e => empTypeForm.setData('name', e.target.value)} />
                            <button className="glass-button"><Plus className="w-4 h-4" /></button>
                        </div>
                    </form>
                    <DataTable columns={[
                        { header: 'Name', key: 'name' },
                        { header: 'Actions', className: 'text-right', render: (e: any) => <button onClick={() => handleDelete(`/hrm/settings/employment-types/${e.id}`, e.name)}><Trash2 className="w-4 h-4 text-red-500" /></button> }
                    ]} data={employmentTypes} />
                </GlassCard>

                <GlassCard><div className="flex justify-between items-center mb-2"><h2 className="text-lg font-semibold">Leave Types</h2><span className="text-sm text-gray-500">{leaveTypes.length} items</span></div>
                    <form onSubmit={(e) => { e.preventDefault(); leaveTypeForm.post('/hrm/settings/leave-types', { onSuccess: () => leaveTypeForm.reset() }); }}>
                        <div className="space-y-2 mb-4">
                            <input className="glass-input w-full" placeholder="Leave Name (e.g., Manager)" value={leaveTypeForm.data.name} onChange={e => leaveTypeForm.setData('name', e.target.value)} />
                            <div className="flex gap-2">
                                <select className="glass-input flex-1" value={leaveTypeForm.data.level_id} onChange={e => leaveTypeForm.setData('level_id', e.target.value)}>
                                    <option value="">Select Level</option>
                                    {levels.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                                <input type="number" className="glass-input w-24" placeholder="Days" value={leaveTypeForm.data.days_per_year} onChange={e => leaveTypeForm.setData('days_per_year', e.target.value)} />
                                <button className="glass-button"><Plus className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </form>
                    <DataTable columns={[
                        { header: 'Type', key: 'name' },
                        { header: 'Level', render: (l: any) => l.level?.name },
                        { header: 'Days', key: 'days_per_year' },
                        { header: 'Actions', className: 'text-right', render: (lt: any) => <button onClick={() => handleDelete(`/hrm/settings/leave-types/${lt.id}`, lt.name)}><Trash2 className="w-4 h-4 text-red-500" /></button> }
                    ]} data={leaveTypes} />
                </GlassCard>
            </div>
        </AppLayout>
    );
}
