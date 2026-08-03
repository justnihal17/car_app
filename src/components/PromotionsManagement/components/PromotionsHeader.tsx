import React from 'react';
import { Plus, Tag, CheckCircle2, XCircle, RefreshCw, BadgePercent } from 'lucide-react';
import { Promotion, PromotionStats } from '../types/promotion.types';

interface PromotionsHeaderProps {
  promotions: Promotion[];
  loading?: boolean;
  stats?: PromotionStats | null;
  onCreateClick: () => void;
}

export function PromotionsHeader({ promotions, loading, stats, onCreateClick }: PromotionsHeaderProps) {
  // Use stats from API if available, fallback to computing from current page
  const totalPromotions = stats?.totalOffers ?? promotions.filter(p => !p.isDeleted).length;
  const activeCount = stats?.activeOffers ?? promotions.filter(p => p.status === 'ACTIVE' && (!p.endDate || new Date(p.endDate) >= new Date())).length;
  const inactiveCount = stats?.expiredOffers ?? (totalPromotions - activeCount);
  
  const totalRedemptions = stats?.totalUsage ?? promotions.filter(p => !p.isDeleted).reduce((acc, curr) => acc + (curr.usedCount || 0), 0);
  const totalDiscountGiven = promotions.filter(p => !p.isDeleted).reduce((acc, curr) => {
    const val = curr.discountValue || curr.walletCashback || curr.referralReward || 150;
    return acc + (curr.usedCount || 0) * val;
  }, 0);

  return (
    <div className="space-y-6 mb-6">
      {/* Breadcrumb & Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Promotions & Offers</h1>
        </div>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 text-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Promotion
        </button>
      </div>

      {/* Summary Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[105px] bg-slate-200/70 animate-pulse rounded-2xl p-5 border border-slate-200/50 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-slate-300 rounded" />
                <div className="w-8 h-8 bg-slate-300 rounded-xl" />
              </div>
              <div className="h-6 w-12 bg-slate-300 rounded mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: 'Total Promos', value: totalPromotions, icon: Tag, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Configured campaigns' },
            { label: 'Active', value: activeCount, icon: CheckCircle2, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Currently live' },
            { label: 'Inactive / Expired', value: inactiveCount, icon: XCircle, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Paused or ended' },
            { label: 'Redemptions', value: totalRedemptions.toLocaleString(), icon: RefreshCw, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Times applied' },
            { label: 'Discount Given', value: `₹${totalDiscountGiven.toLocaleString()}`, icon: BadgePercent, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Customer savings' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div 
                key={i} 
                className={`bg-white p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between group border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold tracking-tight transition-colors uppercase text-slate-500 group-hover:text-slate-800`}>{card.label}</span>
                  <div className={`p-2 rounded-xl border ${card.color} transition-all duration-300 group-hover:scale-110 shadow-xs`}>
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.sub}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
