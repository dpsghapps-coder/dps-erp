interface BalanceBarProps {
  label: string;
  used: number;
  total: number;
  color?: string;
}

export function BalanceBar({ label, used, total, color = 'bg-indigo-500' }: BalanceBarProps) {
  const percentage = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const remaining = Math.max(0, total - used);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-sm text-slate-500">
          {used} / {total} days
        </span>
      </div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">{remaining} remaining</p>
    </div>
  );
}