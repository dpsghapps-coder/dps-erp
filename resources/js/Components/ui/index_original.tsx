import { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const cardVariants = cva('glass-card', {
  variants: {
    variant: {
      default: '',
      bordered: 'border border-slate-200 bg-transparent shadow-none',
      interactive: 'cursor-pointer hover:shadow-md transition-all hover:border-slate-300',
    },
    size: {
      default: 'p-6',
      sm: 'p-4',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export function GlassCard({ 
  className, 
  variant, 
  size, 
  children 
}: PropsWithChildren<{
  className?: string;
  variant?: VariantProps<typeof cardVariants>['variant'];
  size?: VariantProps<typeof cardVariants>['size'];
}>) {
  return (
    <div className={cn(cardVariants({ variant, size }), className)}>
      {children}
    </div>
  );
}

export function PageHeader({ 
  title, 
  subtitle,
  action 
}: { 
  title: string; 
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatusBadge({ 
  status, 
  className 
}: { 
  status: string;
  className?: string;
}) {
  const statusClasses: Record<string, string> = {
    lead: 'status-lead',
    prospect: 'status-prospect',
    active: 'status-active',
    inactive: 'status-inactive',
    draft: 'status-draft',
    confirmed: 'status-confirmed',
    in_production: 'status-in_production',
    ready: 'status-ready',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
    queued: 'status-queued',
    in_progress: 'status-in_progress',
    paused: 'status-paused',
    completed: 'status-completed',
    tentative: 'status-tentative',
    pending: 'status-pending',
    approved: 'statusapproved',
    rejected: 'status-rejected',
    sent: 'status-confirmed',
    partial: 'payment-partial',
    paid: 'payment-paid',
    unpaid: 'payment-unpaid',
    received: 'status-delivered',
  };

  return (
    <span className={`status-badge ${statusClasses[status] || 'bg-slate-100 dark:bg-white/10'} ${className || ''}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function Pagination({ meta }: { meta: any }) {
  if (!meta || !meta.links || meta.last_page <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing {meta.from ?? 0}–{meta.to ?? 0} of {meta.total ?? 0}
      </p>
      <div className="flex items-center gap-1">
        {meta.links.map((link: any, i: number) => (
          link.url ? (
            <Link
              key={i}
              href={link.url}
              preserveScroll
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                link.active
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
              }`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ) : (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 dark:text-slate-600 cursor-default"
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          )
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action 
}: { 
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="w-12 h-12 text-slate-500 dark:text-slate-400 mb-4" />}
      <h3 className="text-lg font-medium mb-1 text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}


