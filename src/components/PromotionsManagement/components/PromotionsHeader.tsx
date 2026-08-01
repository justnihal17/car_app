import React from 'react';
import { Plus, Tag, CheckCircle2, XCircle, RefreshCw, BadgePercent } from 'lucide-react';
import { Promotion } from '../types/promotion.types';

interface PromotionsHeaderProps {
  promotions: Promotion[];
  onCreateClick: () => void;
}

export function PromotionsHeader({ promotions, onCreateClick }: PromotionsHeaderProps) {
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
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Master Management</span>
            <span>/</span>
            <span className="text-red-600 font-bold">Promotions & Offers</span>
          </nav>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Promotions & Offers</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Create, manage, schedule, and monitor promotional campaigns.
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 text-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Promotion
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Promos</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalPromotions}</p>
          <p className="text-[11px] font-semibold text-slate-400">Configured campaigns</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{activeCount}</p>
          <p className="text-[11px] font-semibold text-emerald-600">Currently live</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Inactive / Expired</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{inactiveCount}</p>
          <p className="text-[11px] font-semibold text-slate-400">Paused or ended</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Redemptions</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalRedemptions.toLocaleString()}</p>
          <p className="text-[11px] font-semibold text-purple-600">Times applied</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Discount Given</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BadgePercent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">₹{totalDiscountGiven.toLocaleString()}</p>
          <p className="text-[11px] font-semibold text-amber-600">Customer savings</p>
        </div>
      </div>
    </div>
  );
}
