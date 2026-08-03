import { cn } from '../lib/utils';

export function StatusBadge({ status }: { status: 'Active' | 'Inactive' | 'Blocked' | 'Suspended' | 'Pending' | 'Verified' | 'Busy' | 'Offline' | 'Available' }) {
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

  const dots = {
    Active: 'bg-[#059669]', // Solid green without pulse
    Verified: 'bg-[#059669]',
    Available: 'bg-[#059669]',
    Inactive: 'bg-slate-400',
    Offline: 'bg-slate-400',
    Blocked: 'bg-rose-500',
    Suspended: 'bg-rose-500',
    Pending: 'bg-amber-500',
    Busy: 'bg-orange-500',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium border', styles[status] || styles.Inactive)}>
      <span className={cn('w-2 h-2 rounded-full', dots[status] || 'bg-slate-400')} />
      {status}
    </span>
  );
}
