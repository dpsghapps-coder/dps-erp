import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import KanbanBoard from '@/Components/Production/KanbanBoard';

export default function ProductionIndex() {
    const { jobs, users, orders } = usePage().props;

    return (
        <AppLayout>
            <Head title="Production" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Production</h1>
                <p className="text-sm text-slate-500 dark:text-slate-300">Manage production jobs and workflow</p>
            </div>

            <KanbanBoard jobs={jobs as any[]} users={users as any[]} orders={orders as any[]} />
        </AppLayout>
    );
}
