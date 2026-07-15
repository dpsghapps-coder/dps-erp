import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader, StatusBadge, DataTable } from '@/Components/ui';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, Search, Users, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function CrmIndex() {
    const { clients } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredClients = (clients?.data || []).filter((c: any) => {
        const matchSearch = !search || c.company_name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const columns = [
        { header: 'Company', key: 'company_name', className: 'font-semibold' },
        { header: 'Industry', key: 'industry' },
        { header: 'Status', render: (c: any) => <StatusBadge status={c.status} /> },
        { header: 'Actions', className: 'text-right', render: (c: any) => (
            <div className="flex justify-end gap-2">
                <Link href={`/crm/${c.id}/edit`} className="text-blue-600 hover:underline"><Pencil className="w-4 h-4"/></Link>
                <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline"><Trash2 className="w-4 h-4"/></button>
            </div>
        )}
    ];

    const handleDelete = (id: string) => {
        Swal.fire({ title: 'Delete Client?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' })
            .then((res) => { if (res.isConfirmed) {/* call delete */} });
    };

    return (
        <AppLayout>
            <Head title="Client Management" />

            <PageHeader 
                title="Client Management" 
                subtitle="Manage your client relationships"
                action={
                    <Link href="/crm/create" className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Client
                    </Link>
                }
            />

            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search clients..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                    </div>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="glass-input"
                    >
                        <option value="all">All Status</option>
                        <option value="lead">Lead</option>
                        <option value="prospect">Prospect</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden p-0">
                <div className="hidden md:block">
                    <DataTable columns={columns} data={filteredClients} emptyMessage="No clients found" />
                </div>
                <div className="md:hidden space-y-3 p-4">
                    {filteredClients.map((client: any) => (
                        <div key={client.id} className="glass-card p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-semibold text-slate-900">{client.company_name}</p>
                                <StatusBadge status={client.status} />
                            </div>
                            <p className="text-sm text-slate-500 mb-2">{client.industry || 'No industry specified'}</p>
                            <div className="flex justify-end gap-2">
                                <Link href={`/crm/${client.id}/edit`} className="text-blue-600">Edit</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </AppLayout>
    );
}
