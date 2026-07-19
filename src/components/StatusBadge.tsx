import { cn } from '../lib/utils';

export function StatusBadge({ status }: { status: 'Active' | 'Inactive' | 'Blocked' | 'Suspended' | 'Pending' | 'Verified' | 'Busy' | 'Offline' | 'Available' }) {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Inactive: 'bg-slate-100 text-slate-700 border-slate-200',
    Offline: 'bg-slate-100 text-slate-700 border-slate-200',
    Blocked: 'bg-red-50 text-red-700 border-red-200',
    Suspended: 'bg-red-50 text-red-700 border-red-200',
    Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Busy: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', styles[status] || styles.Inactive)}>
      {status}
    </span>
  );
}
