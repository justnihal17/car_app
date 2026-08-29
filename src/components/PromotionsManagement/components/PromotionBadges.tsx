import React from 'react';
import { PromoType, DiscountType, PromotionStatus } from '../types/promotion.types';
import { Tag, Zap, Share2, Wallet, Clock } from 'lucide-react';

export function PromoTypeBadge({ type }: { type: PromoType }) {
  switch (type) {
    case 'COUPON':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
          <Tag className="w-3 h-3 text-blue-600" /> Coupon
        </span>
      );
    case 'AUTOMATIC':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 shadow-2xs">
          <Zap className="w-3 h-3 text-purple-600" /> Automatic
        </span>
      );
    case 'REFERRAL':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-2xs">
          <Share2 className="w-3 h-3 text-amber-600" /> Referral
        </span>
      );
    case 'CASHBACK':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
          <Wallet className="w-3 h-3 text-emerald-600" /> Cashback
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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
        Expired
      </span>
    );
  }

  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
      Inactive
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
  if (discountType === 'FLAT') {
    label = `AED ${discountValue || 0} Flat`;
  } else if (discountType === 'PERCENTAGE') {
    label = `${discountValue || 0}% Off`;
  } else if (discountType === 'FREE_SERVICE') {
    label = 'Free Service';
  }

  if (walletCashback) {
    label += ` (AED ${walletCashback} Cashback)`;
  } else if (referralReward) {
    label += ` (AED ${referralReward} Reward)`;
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-white shadow-2xs">
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority?: number }) {
  if (priority === undefined || priority === null) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
      P{priority}
    </span>
  );
}
