import React from 'react';
import { PromoType, DiscountType, PromotionStatus } from '../types/promotion.types';
import { Tag, Zap, Share2, Wallet, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function PromoTypeBadge({ type }: { type: PromoType }) {
  switch (type) {
    case 'coupon':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
          <Tag className="w-3.5 h-3.5" /> Coupon
        </span>
      );
    case 'automatic':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-purple-600" /> Automatic
        </span>
      );
    case 'referral':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-2xs">
          <Share2 className="w-3.5 h-3.5 text-amber-600" /> Referral
        </span>
      );
    case 'cashback':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
          <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Cashback
        </span>
      );
    default:
      return null;
  }
}

export function PromotionStatusBadge({ 
  status, 
  endDate 
}: { 
  status: PromotionStatus; 
  endDate?: string;
}) {
  const isExpired = endDate ? new Date(endDate) < new Date() : false;

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Expired
      </span>
    );
  }

  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <XCircle className="w-3.5 h-3.5" /> Inactive
    </span>
  );
}

export function DiscountBadge({ 
  discountType, 
  discountValue, 
  walletCashback, 
  referralReward 
}: { 
  discountType: DiscountType; 
  discountValue?: number;
  walletCashback?: number;
  referralReward?: number;
}) {
  let label = '';
  if (discountType === 'flat') {
    label = `₹${discountValue || 0} Flat`;
  } else if (discountType === 'percentage') {
    label = `${discountValue || 0}% Off`;
  } else if (discountType === 'free_service') {
    label = 'Free Service';
  }

  if (walletCashback) {
    label += ` (₹${walletCashback} Cashback)`;
  } else if (referralReward) {
    label += ` (₹${referralReward} Reward)`;
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white shadow-2xs">
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority?: number }) {
  if (priority === undefined || priority === null) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
      P{priority}
    </span>
  );
}
