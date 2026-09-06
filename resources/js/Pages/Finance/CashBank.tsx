import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, usePage, useForm } from '@inertiajs/react';
import { ArrowLeftRight, Wallet, Banknote, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/Utils/currency';

const SUBTYPE_ICONS: Record<string, any> = {
    cash: Banknote,
    bank: Wallet,
    mobile_money: Smartphone,
};

export default function CashBank() {
    const { accounts, totalBalance } = usePage().props as any;
    const formatCurrency = useCurrency();
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance/cash-bank/transfer', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const list = accounts || [];

    return (
        <AppLayout>
            <Head title="Cash & Bank" />

            <PageHeader
                title="Cash & Bank"
                subtitle="Cash, bank, and mobile money accounts with running balances"
                action={
                    <button onClick={() => setShowForm(!showForm)} className="glass-button flex items-center gap-2">
                        <ArrowLeftRight className="w-4 h-4" /> Transfer Funds
                    </button>
                }
            />

            <GlassCard className="mb-6">
                <p className="text-sm text-slate-400 dark:text-slate-500">Total Balance</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalBalance)}</p>
            </GlassCard>

            {showForm && (
                <GlassCard className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Transfer Funds</h3>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">From Account *</label>
                            <select className="glass-input w-full" value={data.from_account_id} onChange={(e) => setData('from_account_id', e.target.value)}>
                                <option value="">Select Account</option>
                                {list.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.current_balance)})</option>)}
                            </select>
                            {errors.from_account_id && <p className="text-red-400 text-sm mt-1">{errors.from_account_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">To Account *</label>
                            <select className="glass-input w-full" value={data.to_account_id} onChange={(e) => setData('to_account_id', e.target.value)}>
                                <option value="">Select Account</option>
                                {list.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.current_balance)})</option>)}
                            </select>
                            {errors.to_account_id && <p className="text-red-400 text-sm mt-1">{errors.to_account_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Amount *</label>
                            <input type="number" step="0.01" min="0.01" className="glass-input w-full" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                            {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Date *</label>
                            <input type="date" className="glass-input w-full" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <input className="glass-input w-full" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Optional note" />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="glass-button-secondary">Cancel</button>
                            <button type="submit" disabled={processing} className="glass-button">
                                {processing ? 'Transferring...' : 'Transfer'}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <div className="grid md:grid-cols-3 gap-4">
                {list.map((account: any) => {
                    const Icon = SUBTYPE_ICONS[account.subtype] || Wallet;
                    return (
                        <GlassCard key={account.id}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 dark:text-slate-500">{account.name}</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(account.current_balance)}</p>
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>
        </AppLayout>
    );
}
