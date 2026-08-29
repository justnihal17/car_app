import React from 'react';
import { Plus, Tag, CheckCircle2, XCircle, RefreshCw, BadgePercent, ChevronRight } from 'lucide-react';
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
    <div className="space-y-3.5 sm:space-y-4 mb-4">
      {/* Breadcrumb & Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          <button 
            type="button"
            className="cursor-pointer hover:text-red-600 transition-colors font-medium uppercase tracking-wider"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate_view', { detail: 'dashboard' }))}
          >
            Dashboard
          </button> 
          <ChevronRight className="w-3 h-3 text-slate-400" /> 
          <span className="text-red-600 font-semibold">
            Offer Management
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-xs transition-all active:scale-95 text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" /> Create Promotion
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-3.5 w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[90px] bg-slate-200/70 animate-pulse rounded-xl p-3.5 border border-slate-200/50 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-2.5 w-16 bg-slate-300 rounded" />
                <div className="w-6 h-6 bg-slate-300 rounded-lg" />
              </div>
              <div className="h-5 w-12 bg-slate-300 rounded mt-1" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-3.5 w-full">
          {[
            { label: 'Total Promos', value: totalPromotions, icon: Tag, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Configured campaigns' },
            { label: 'Active', value: activeCount, icon: CheckCircle2, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Currently live' },
            { label: 'Inactive / Expired', value: inactiveCount, icon: XCircle, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Paused or ended' },
            { label: 'Redemptions', value: totalRedemptions.toLocaleString(), icon: RefreshCw, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Times applied' },
            { label: 'Discount Given', value: `AED ${totalDiscountGiven.toLocaleString()}`, icon: BadgePercent, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Customer savings' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div 
                key={i} 
                className="bg-white p-3.5 sm:p-4 rounded-xl transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 min-h-[88px] sm:min-h-[92px] border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10.5px] font-semibold tracking-wider transition-colors uppercase leading-none text-slate-500 group-hover:text-slate-800">{card.label}</span>
                  <div className={`p-1.5 rounded-lg border ${card.color} transition-all duration-200 group-hover:scale-105 shadow-2xs`}>
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
                <div className="flex flex-col w-full mt-3">
                  <span className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight leading-none">{card.value}</span>
                  <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis" title={card.sub}>{card.sub}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
