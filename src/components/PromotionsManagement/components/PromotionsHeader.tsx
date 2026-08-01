import React from 'react';
import { Plus, Tag, CheckCircle2, XCircle, RefreshCw, BadgePercent } from 'lucide-react';
import { Promotion } from '../types/promotion.types';

interface PromotionsHeaderProps {
  promotions: Promotion[];
  loading?: boolean;
  onCreateClick: () => void;
}

export function PromotionsHeader({ promotions, loading, onCreateClick }: PromotionsHeaderProps) {
  const activePromos = promotions.filter(p => !p.isDeleted);
  const totalPromotions = activePromos.length;
  const activeCount = activePromos.filter(p => p.status === 'active' && (!p.endDate || new Date(p.endDate) >= new Date())).length;
  const inactiveCount = totalPromotions - activeCount;
  
  const totalRedemptions = activePromos.reduce((acc, curr) => acc + (curr.usedCount || 0), 0);
  const totalDiscountGiven = activePromos.reduce((acc, curr) => {
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[105px] bg-slate-200/70 animate-pulse rounded-3xl p-5 border border-slate-200/50 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-slate-300 rounded" />
                <div className="w-8 h-8 bg-slate-300 rounded-xl" />
              </div>
              <div className="h-6 w-12 bg-slate-300 rounded mt-2" />
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="text-left bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group relative overflow-hidden hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Total Promos</span>
            <div className="p-2 rounded-xl bg-blue-50 transition-all duration-300 group-hover:scale-110">
              <Tag className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalPromotions}</span>
            <span className="text-[11px] font-semibold text-slate-400">Configured campaigns</span>
          </div>
        </div>

        <div className="text-left bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group relative overflow-hidden hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Active</span>
            <div className="p-2 rounded-xl bg-emerald-50 transition-all duration-300 group-hover:scale-110">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{activeCount}</span>
            <span className="text-[11px] font-semibold text-emerald-600">Currently live</span>
          </div>
        </div>

        <div className="text-left bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group relative overflow-hidden hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Inactive / Expired</span>
            <div className="p-2 rounded-xl bg-slate-100 transition-all duration-300 group-hover:scale-110">
              <XCircle className="w-5 h-5 text-slate-500" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{inactiveCount}</span>
            <span className="text-[11px] font-semibold text-slate-400">Paused or ended</span>
          </div>
        </div>

        <div className="text-left bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group relative overflow-hidden hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Redemptions</span>
            <div className="p-2 rounded-xl bg-purple-50 transition-all duration-300 group-hover:scale-110">
              <RefreshCw className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalRedemptions.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-purple-600">Times applied</span>
          </div>
        </div>

        <div className="text-left bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group relative overflow-hidden hover:-translate-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Discount Given</span>
            <div className="p-2 rounded-xl bg-amber-50 transition-all duration-300 group-hover:scale-110">
              <BadgePercent className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">₹{totalDiscountGiven.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-amber-600">Customer savings</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
