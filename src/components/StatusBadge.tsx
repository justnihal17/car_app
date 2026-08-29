import { cn } from '../lib/utils';

export function StatusBadge({ 
  status,
  className
}: { 
  status: 'Active' | 'Inactive' | 'Blocked' | 'Suspended' | 'Pending' | 'Verified' | 'Busy' | 'Offline' | 'Available',
  className?: string
}) {
  const styles = {
    Active: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    Verified: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    Available: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    Offline: 'bg-slate-100 text-slate-600 border-slate-200',
    Blocked: 'bg-rose-50 text-rose-700 border-rose-200/80',
    Suspended: 'bg-rose-50 text-rose-700 border-rose-200/80',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
    Busy: 'bg-orange-50 text-orange-700 border-orange-200/80',
  };

  return (
    <span className={cn('inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', styles[status] || styles.Inactive, className)}>
      {status}
    </span>
  );
}
