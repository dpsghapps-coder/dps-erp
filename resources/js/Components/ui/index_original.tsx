import { PropsWithChildren } from 'react';
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
    <span className={`status-badge ${statusClasses[status] || 'bg-white/10'} ${className || ''}`}>
      {status.replace(/_/g, ' ')}
    </span>
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


