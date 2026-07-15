interface MetricsBarProps {
    jobs: any[];
}

const statusFlow: Record<string, string> = {
    new_jobs: 'design',
    design: 'printing',
    printing: 'assembly',
    assembly: 'qc_inspection',
    qc_inspection: 'completed',
};

const terminalStatuses = ['paused', 'cancelled'];

export default function MetricsBar({ jobs }: MetricsBarProps) {
    const total = jobs.length;
    const onShopFloor = jobs.filter((j: any) => j.status === 'printing' || j.status === 'assembly').length;
    const queued = jobs.filter((j: any) => j.status === 'new_jobs' || j.status === 'design').length;
    const completed = jobs.filter((j: any) => j.status === 'completed').length;
    const urgent = jobs.filter(
        (j: any) => j.priority === 'urgent' && j.status !== 'completed' && j.status !== 'cancelled'
    ).length;

    const metrics = [
        { label: 'Total', value: total, color: 'text-white' },
        { label: 'On Shop Floor', value: onShopFloor, color: 'text-amber-400' },
        { label: 'Queued', value: queued, color: 'text-blue-400' },
        { label: 'Completed', value: completed, color: 'text-emerald-400' },
        { label: 'Urgent', value: urgent, color: 'text-red-400' },
    ];

    return (
        <div className="flex flex-wrap gap-4 mb-4">
            {metrics.map((m) => (
                <div key={m.label} className="glass-card px-4 py-2 flex items-center gap-2">
                    <span className={`text-lg font-bold ${m.color}`}>{m.value}</span>
                    <span className="text-sm text-slate-400">{m.label}</span>
                </div>
            ))}
        </div>
    );
}
