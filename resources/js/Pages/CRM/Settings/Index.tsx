import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Save, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface LookupItem {
    id: number;
    name: string;
    is_active: boolean;
    sort_order: number;
}

function LookupListEditor({ type, title, items }: { type: string; title: string; items: LookupItem[] }) {
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setAdding(true);
        router.post(`/crm/settings/${type}`, { name: newName.trim() }, {
            preserveScroll: true,
            onSuccess: () => setNewName(''),
            onFinish: () => setAdding(false),
        });
    };

    const startEdit = (item: LookupItem) => {
        setEditingId(item.id);
        setEditName(item.name);
    };

    const saveEdit = (item: LookupItem) => {
        if (!editName.trim()) return;
        router.put(`/crm/settings/${type}/${item.id}`, { name: editName.trim(), is_active: item.is_active }, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const toggleActive = (item: LookupItem) => {
        router.put(`/crm/settings/${type}/${item.id}`, { name: item.name, is_active: !item.is_active }, {
            preserveScroll: true,
        });
    };

    const handleDelete = (item: LookupItem) => {
        Swal.fire({
            title: `Remove "${item.name}"?`,
            text: 'Clients already using this value keep it. This only removes it from the dropdown.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Remove',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/crm/settings/${type}/${item.id}`, { preserveScroll: true });
            }
        });
    };

    return (
        <GlassCard>
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={`Add ${title.toLowerCase()}...`}
                    className="glass-input flex-1 text-sm"
                />
                <button type="submit" disabled={adding} className="glass-button-secondary px-3">
                    <Plus className="w-4 h-4" />
                </button>
            </form>
            <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                {items.length === 0 && <p className="text-sm text-slate-400">No entries yet.</p>}
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                        {editingId === item.id ? (
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="glass-input flex-1 text-sm py-1"
                                autoFocus
                            />
                        ) : (
                            <span className={`text-sm truncate ${item.is_active ? '' : 'text-slate-400 line-through'}`}>
                                {item.name}
                            </span>
                        )}
                        <div className="flex items-center gap-1 flex-shrink-0">
                            {editingId === item.id ? (
                                <>
                                    <button onClick={() => saveEdit(item)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded">
                                        <Save className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => startEdit(item)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded" aria-label="Edit">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded" aria-label={item.is_active ? 'Deactivate' : 'Activate'}>
                                        {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </button>
                                    <button onClick={() => handleDelete(item)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded" aria-label="Remove">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}

export default function CrmSettingsIndex({ sources, industries, regions, cities, neighbourhoods }: {
    sources: LookupItem[];
    industries: LookupItem[];
    regions: LookupItem[];
    cities: LookupItem[];
    neighbourhoods: LookupItem[];
}) {
    return (
        <AppLayout>
            <Head title="CRM Settings" />

            <div className="mb-6">
                <Link href="/crm" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Clients
                </Link>
            </div>

            <PageHeader
                title="CRM Settings"
                subtitle="Manage the dropdown lists used on client and contact forms"
            />

            <div className="grid md:grid-cols-2 gap-6">
                <LookupListEditor type="sources" title="Sources" items={sources} />
                <LookupListEditor type="industries" title="Industries" items={industries} />
                <LookupListEditor type="regions" title="Regions" items={regions} />
                <LookupListEditor type="cities" title="Cities" items={cities} />
                <div className="md:col-span-2">
                    <LookupListEditor type="neighbourhoods" title="Neighbourhoods" items={neighbourhoods} />
                </div>
            </div>
        </AppLayout>
    );
}
