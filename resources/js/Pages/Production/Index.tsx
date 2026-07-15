import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import KanbanBoard from '@/Components/Production/KanbanBoard';

export default function ProductionIndex() {
    const { jobs, users } = usePage().props;

    return (
        <AppLayout>
            <Head title="Production" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Production</h1>
                <p className="text-sm text-slate-400">Manage production jobs and workflow</p>
            </div>

            <KanbanBoard jobs={jobs as any[]} users={users as any[]} />
        </AppLayout>
    );
}
