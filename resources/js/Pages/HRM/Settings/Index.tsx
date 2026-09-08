import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, DataTable } from '@/Components/ui';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Save } from 'lucide-react';
import Swal from 'sweetalert2';

function LeaveTypeMatrix({ leaveTypes, leaveTypeNames, staffLevels }: { leaveTypes: any[]; leaveTypeNames: string[]; staffLevels: any[] }) {
    const initialMatrix = useMemo(() => {
        const m: Record<number, Record<string, string>> = {};
        staffLevels.forEach((s: any) => {
            m[s.id] = {};
            leaveTypeNames.forEach((name) => { m[s.id][name] = ''; });
        });
        leaveTypes.forEach((lt: any) => {
            if (m[lt.staff_level_id]) {
                m[lt.staff_level_id][lt.name] = String(lt.days_per_year);
            }
        });
        return m;
    }, [leaveTypes, leaveTypeNames, staffLevels]);

    const [matrix, setMatrix] = useState(initialMatrix);
    const [saving, setSaving] = useState(false);
    const errors = (usePage().props as any).errors || {};

    const setCell = (staffLevelId: number, name: string, value: string) => {
        setMatrix((prev) => ({
            ...prev,
            [staffLevelId]: { ...prev[staffLevelId], [name]: value },
        }));
    };

    const save = () => {
        const entries: { staff_level_id: number; name: string; days_per_year: number | null }[] = [];
        staffLevels.forEach((s: any) => {
            leaveTypeNames.forEach((name) => {
                const raw = matrix[s.id]?.[name] ?? '';
                entries.push({
                    staff_level_id: s.id,
                    name,
                    days_per_year: raw === '' ? null : parseInt(raw, 10),
                });
            });
        });

        setSaving(true);
        router.post('/hrm/settings/leave-types/matrix', { entries }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div>
            <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10">
                            <th className="text-left py-2 pr-3 font-medium text-slate-500">Staff Level</th>
                            {leaveTypeNames.map((name) => (
                                <th key={name} className="text-left py-2 px-2 font-medium text-slate-500">{name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {staffLevels.map((s: any) => (
                            <tr key={s.id} className="border-b border-slate-100 dark:border-white/5">
                                <td className="py-2 pr-3 font-medium whitespace-nowrap">{s.name}</td>
                                {leaveTypeNames.map((name) => (
                                    <td key={name} className="py-2 px-2">
                                        <input
                                            type="number"
                                            min={0}
                                            placeholder="—"
                                            className="glass-input w-20"
                                            value={matrix[s.id]?.[name] ?? ''}
                                            onChange={(e) => setCell(s.id, name, e.target.value)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {staffLevels.length === 0 && (
                            <tr><td colSpan={leaveTypeNames.length + 1} className="py-4 text-center text-slate-400">Add a staff level first.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {errors.entries && <p className="text-red-500 text-xs mt-3">{errors.entries}</p>}
            <div className="flex justify-end mt-4">
                <button onClick={save} disabled={saving || staffLevels.length === 0} className="glass-button flex items-center gap-2">
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Leave Types'}
                </button>
            </div>
        </div>
    );
}

export default function HrmSettingsIndex() {
    const { departments, employmentTypes, leaveTypes, leaveTypeNames, staffLevels } = usePage().props as any;

    const deptForm = useForm({ name: '' });
    const empTypeForm = useForm({ name: '' });
    const staffLevelForm = useForm({ name: '' });

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
                        { header: 'Actions', className: 'text-right', render: (d: any) => (
                            <div className="flex items-center justify-end gap-3">
                                <Link href={`/hrm/settings/departments/${d.id}/edit`}><Pencil className="w-4 h-4 text-slate-400 hover:text-slate-700" /></Link>
                                <button onClick={() => handleDelete(`/hrm/settings/departments/${d.id}`, d.name)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                            </div>
                        ) }
                    ]} data={departments} />
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
                        { header: 'Actions', className: 'text-right', render: (e: any) => (
                            <div className="flex items-center justify-end gap-3">
                                <Link href={`/hrm/settings/employment-types/${e.id}/edit`}><Pencil className="w-4 h-4 text-slate-400 hover:text-slate-700" /></Link>
                                <button onClick={() => handleDelete(`/hrm/settings/employment-types/${e.id}`, e.name)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                            </div>
                        ) }
                    ]} data={employmentTypes} />
                </GlassCard>

                <GlassCard><div className="flex justify-between items-center mb-2"><h2 className="text-lg font-semibold">Staff Levels</h2><span className="text-sm text-gray-500">{staffLevels.length} items</span></div>
                    <form onSubmit={(e) => { e.preventDefault(); staffLevelForm.post('/hrm/settings/staff-levels', { onSuccess: () => staffLevelForm.reset() }); }}>
                        <div className="flex gap-2 mb-4">
                            <select className="glass-input flex-1" value={staffLevelForm.data.name} onChange={e => staffLevelForm.setData('name', e.target.value)}>
                                <option value="">Select Staff Level</option>
                                <option value="Managing Director">Managing Director</option>
                                <option value="General Manager">General Manager</option>
                                <option value="Manager">Manager</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Assistant Supervisor">Assistant Supervisor</option>
                                <option value="Senior Worker">Senior Worker</option>
                                <option value="Junior Worker">Junior Worker</option>
                                <option value="Intern">Intern</option>
                            </select>
                            <button className="glass-button" disabled={!staffLevelForm.data.name}><Plus className="w-4 h-4" /></button>
                        </div>
                    </form>
                    <DataTable columns={[
                        { header: 'Name', key: 'name' },
                        { header: 'Manager?', render: (s: any) => s.is_manager ? <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">Yes</span> : <span className="text-xs text-gray-400">—</span> },
                        { header: 'Actions', className: 'text-right', render: (s: any) => (
                            <div className="flex items-center justify-end gap-3">
                                <Link href={`/hrm/settings/staff-levels/${s.id}/edit`}><Pencil className="w-4 h-4 text-slate-400 hover:text-slate-700" /></Link>
                                <button onClick={() => handleDelete(`/hrm/settings/staff-levels/${s.id}`, s.name)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                            </div>
                        ) }
                    ]} data={staffLevels} />
                </GlassCard>
            </div>

            <GlassCard className="mt-6">
                <div className="flex justify-between items-center mb-2"><h2 className="text-lg font-semibold">Leave Types</h2><span className="text-sm text-gray-500">{leaveTypes.length} items</span></div>
                <p className="text-xs text-gray-500 mb-3">Set days per year for each leave type, per staff level — fill in a whole row (e.g. Manager) at once, then Save.</p>
                <LeaveTypeMatrix leaveTypes={leaveTypes} leaveTypeNames={leaveTypeNames} staffLevels={staffLevels} />
            </GlassCard>
        </AppLayout>
    );
}
