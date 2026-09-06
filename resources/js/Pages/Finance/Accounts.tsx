import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCurrency } from '@/Utils/currency';
import Swal from 'sweetalert2';

const TYPES = ['asset', 'liability', 'equity', 'income', 'expense'];
const SUBTYPES = ['cash', 'bank', 'mobile_money', 'receivable', 'inventory', 'fixed_asset', 'other'];

const TYPE_LABELS: Record<string, string> = {
    asset: 'Asset',
    liability: 'Liability',
    equity: 'Equity',
    income: 'Income',
    expense: 'Expense',
};

function buildTree(accounts: any[]) {
    const byParent: Record<string, any[]> = {};
    accounts.forEach((a) => {
        const key = a.parent_id ?? 'root';
        (byParent[key] = byParent[key] || []).push(a);
    });
    return byParent;
}

export default function Accounts() {
    const { accounts } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

    const byParent = useMemo(() => buildTree(accounts || []), [accounts]);

    const emptyForm = { code: '', name: '', type: 'asset', subtype: '', parent_id: '', description: '', opening_balance: '0' };
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);

    const openCreate = () => {
        setEditing(null);
        reset();
        setData(emptyForm as any);
        setShowForm(true);
    };

    const openEdit = (account: any) => {
        setEditing(account);
        setData({
            code: account.code || '',
            name: account.name,
            type: account.type,
            subtype: account.subtype || '',
            parent_id: account.parent_id || '',
            description: account.description || '',
            opening_balance: String(account.opening_balance ?? 0),
        });
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            put(`/finance/accounts/${editing.id}`, { onSuccess: () => { setShowForm(false); setEditing(null); } });
        } else {
            post('/finance/accounts', { onSuccess: () => { setShowForm(false); reset(); } });
        }
    };

    const handleDelete = (account: any) => {
        Swal.fire({
            title: `Delete ${account.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        }).then((res) => {
            if (res.isConfirmed) router.delete(`/finance/accounts/${account.id}`);
        });
    };

    const toggle = (id: number) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

    const renderRows = (parentKey: string | number, depth: number): JSX.Element[] => {
        const rows = byParent[parentKey] || [];
        return rows.flatMap((account: any) => {
            const hasChildren = (byParent[account.id] || []).length > 0;
            const isCollapsed = collapsed[account.id];
            const row = (
                <tr key={account.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2 px-4 text-sm font-mono text-slate-400">{account.code || '-'}</td>
                    <td className="py-2 px-4 text-sm text-slate-900 dark:text-white" style={{ paddingLeft: `${16 + depth * 20}px` }}>
                        <div className="flex items-center gap-1">
                            {hasChildren ? (
                                <button onClick={() => toggle(account.id)} className="p-0.5">
                                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                            ) : (
                                <span className="w-4 inline-block" />
                            )}
                            {account.name}
                            {!account.is_active && <span className="ml-2 text-xs text-slate-400">(inactive)</span>}
                        </div>
                    </td>
                    <td className="py-2 px-4 text-sm text-slate-500 dark:text-slate-400">{TYPE_LABELS[account.type]}</td>
                    <td className="py-2 px-4 text-sm text-slate-400">{account.subtype || '-'}</td>
                    <td className="py-2 px-4 text-right font-mono text-sm text-slate-700 dark:text-slate-300">{formatCurrency(account.current_balance)}</td>
                    <td className="py-2 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(account)} className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors group">
                                <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                            </button>
                            <button onClick={() => handleDelete(account)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">
                                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400" />
                            </button>
                        </div>
                    </td>
                </tr>
            );
            return isCollapsed ? [row] : [row, ...renderRows(account.id, depth + 1)];
        });
    };

    return (
        <AppLayout>
            <Head title="Chart of Accounts" />

            <PageHeader
                title="Chart of Accounts"
                subtitle="The foundation of the accounting system — assets, liabilities, equity, income, and expenses"
                action={
                    <button onClick={openCreate} className="glass-button flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Account
                    </button>
                }
            />

            {showForm && (
                <GlassCard className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{editing ? 'Edit Account' : 'Add Account'}</h3>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Code</label>
                            <input className="glass-input w-full" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="e.g. 5115" />
                            {errors.code && <p className="text-red-400 text-sm mt-1">{errors.code}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Name *</label>
                            <input className="glass-input w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Type *</label>
                            <select className="glass-input w-full" value={data.type} onChange={(e) => setData('type', e.target.value)}>
                                {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Subtype</label>
                            <select className="glass-input w-full" value={data.subtype} onChange={(e) => setData('subtype', e.target.value)}>
                                <option value="">None</option>
                                {SUBTYPES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Parent Account</label>
                            <select className="glass-input w-full" value={data.parent_id} onChange={(e) => setData('parent_id', e.target.value)}>
                                <option value="">None (top-level)</option>
                                {(accounts || []).filter((a: any) => !editing || a.id !== editing.id).map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.code ? `${a.code} — ${a.name}` : a.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Opening Balance</label>
                            <input type="number" step="0.01" className="glass-input w-full" value={data.opening_balance} onChange={(e) => setData('opening_balance', e.target.value)} />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea className="glass-input w-full h-16 resize-none" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-3">
                            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="glass-button-secondary">Cancel</button>
                            <button type="submit" disabled={processing} className="glass-button">
                                {processing ? 'Saving...' : editing ? 'Update Account' : 'Save Account'}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Code</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Subtype</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Balance</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderRows('root', 0)}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </AppLayout>
    );
}
