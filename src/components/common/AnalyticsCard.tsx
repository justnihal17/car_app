import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function AnalyticsCard({ title, value, icon: Icon, trend, trendUp }: Props) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-blue-50 rounded-xl">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </motion.div>
  );
}
