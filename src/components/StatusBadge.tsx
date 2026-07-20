import { cn } from '../lib/utils';

export function StatusBadge({ status }: { status: 'Active' | 'Inactive' | 'Blocked' | 'Suspended' | 'Pending' | 'Verified' | 'Busy' | 'Offline' | 'Available' }) {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Verified: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    Offline: 'bg-slate-100 text-slate-600 border-slate-200',
    Blocked: 'bg-rose-50 text-rose-700 border-rose-200/80',
    Suspended: 'bg-rose-50 text-rose-700 border-rose-200/80',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
    Busy: 'bg-orange-50 text-orange-700 border-orange-200/80',
  };

  const dots = {
    Active: 'bg-emerald-500 animate-pulse',
    Verified: 'bg-emerald-500 animate-pulse',
    Available: 'bg-emerald-500 animate-pulse',
    Inactive: 'bg-slate-400',
    Offline: 'bg-slate-400',
    Blocked: 'bg-rose-500',
    Suspended: 'bg-rose-500',
    Pending: 'bg-amber-500 animate-pulse',
    Busy: 'bg-orange-500',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs', styles[status] || styles.Inactive)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dots[status] || 'bg-slate-400')} />
      {status}
    </span>
  );
}
