import React from 'react';
import { OrderStatus } from '../types/order.types';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  'Pending': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Accepted': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Assigned': { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'On Route': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  'In Progress': { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Cancelled': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status] || statusConfig['Pending'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-opacity-20 ${config.bg} ${config.text} border-current ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
};
