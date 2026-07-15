export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" style={{ animation: 'pulseSubtle 2s ease-in-out infinite' }}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton h-10 flex-1" />
          <div className="skeleton h-10 w-24" />
          <div className="skeleton h-10 w-24" />
          <div className="skeleton h-10 w-32" />
        </div>
      ))}
    </div>
  );
}

export function CardLoading() {
  return (
    <div className="glass-card">
      <div className="flex items-center gap-4 mb-4">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <div className="skeleton h-4 w-32 mb-2" />
          <div className="skeleton h-3 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="skeleton h-16 rounded-lg" />
        <div className="skeleton h-16 rounded-lg" />
        <div className="skeleton h-16 rounded-lg" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card">
      <div className="flex items-center gap-3">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <div className="skeleton h-3 w-16 mb-2" />
          <div className="skeleton h-6 w-24" />
        </div>
      </div>
    </div>
  );
}