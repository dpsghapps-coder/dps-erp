import { Search, Plus } from 'lucide-react';

interface FilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    priorityFilter: string;
    onPriorityChange: (value: string) => void;
    onNewJob: () => void;
}

export default function FilterBar({
    search,
    onSearchChange,
    priorityFilter,
    onPriorityChange,
    onNewJob,
}: FilterBarProps) {
    return (
        <div className="glass-card mb-4 px-4 py-3">
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="glass-input w-full pl-10"
                        />
                    </div>
                    <select
                        value={priorityFilter}
                        onChange={(e) => onPriorityChange(e.target.value)}
                        className="glass-input"
                    >
                        <option value="all">All Priorities</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <button onClick={onNewJob} className="glass-button flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Job
                </button>
            </div>
        </div>
    );
}
