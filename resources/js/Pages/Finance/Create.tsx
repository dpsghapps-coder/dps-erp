import AppLayout from '@/Layouts/AppLayout';
import { GlassCard, PageHeader } from '@/Components/ui';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function FinanceCreate() {
    const { data, setData, post, processing, errors } = useForm({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        reference: '',
    });

    const incomeCategories = [
        'Sales Revenue',
        'Service Income',
        'Other Income',
    ];

    const expenseCategories = [
        'Purchase',
        'Rent',
        'Utilities',
        'Salaries',
        'Marketing',
        'Maintenance',
        'Other Expense',
    ];

    const categories = data.type === 'income' ? incomeCategories : expenseCategories;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance');
    };

    return (
        <AppLayout>
            <Head title="Add Transaction" />

            <div className="mb-6">
                <Link href="/finance" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Finance
                </Link>
            </div>

            <PageHeader title="Add Transaction" subtitle="Record a new income or expense" />

            <form onSubmit={handleSubmit}>
                <GlassCard>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Type *</label>
                            <select 
                                value={data.type}
                                onChange={(e) => {
                                    setData('type', e.target.value);
                                    setData('category', '');
                                }}
                                className="glass-input w-full"
                            >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                            {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Category *</label>
                            <select 
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="glass-input w-full"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat: string) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Amount *</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="glass-input w-full"
                                placeholder="0.00"
                            />
                            {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Date *</label>
                            <input 
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className="glass-input w-full"
                            />
                            {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea 
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="glass-input w-full h-24"
                                placeholder="Transaction description..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Reference</label>
                            <input 
                                type="text"
                                value={data.reference}
                                onChange={(e) => setData('reference', e.target.value)}
                                className="glass-input w-full"
                                placeholder="Invoice #, Receipt #"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-white/10">
                        <Link href="/finance" className="glass-button">Cancel</Link>
                        <button type="submit" disabled={processing} className="glass-button">
                            {processing ? 'Saving...' : 'Save Transaction'}
                        </button>
                    </div>
                </GlassCard>
            </form>
        </AppLayout>
    );
}