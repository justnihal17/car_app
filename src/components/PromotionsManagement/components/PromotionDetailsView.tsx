import React from 'react';
import { ArrowLeft, Edit2, Copy, Tag, Calendar, ShieldAlert, CheckCircle2, Layers } from 'lucide-react';
import { Promotion } from '../types/promotion.types';
import { PromoTypeBadge, PromotionStatusBadge, DiscountBadge, PriorityBadge } from './PromotionBadges';


interface PromotionDetailsViewProps {
  promotion: Promotion;
  onBack: () => void;
  onEdit: () => void;
}

export function PromotionDetailsView({ promotion, onBack, onEdit }: PromotionDetailsViewProps) {
  const usageLimitText = promotion.usageLimit ? promotion.usageLimit.toString() : 'Unlimited';
  const remainingUsage = promotion.usageLimit ? Math.max(0, promotion.usageLimit - promotion.usedCount) : 'Unlimited';
  const usagePercent = promotion.usageLimit ? Math.min(100, Math.round((promotion.usedCount / promotion.usageLimit) * 100)) : 0;
  
  const discountVal = promotion.discountValue || promotion.walletCashback || promotion.referralReward || 150;
  const totalDiscountGiven = promotion.usedCount * discountVal;

  const getServiceNames = (items?: any[]) => {
    if (!items || items.length === 0 || items.includes('ALL')) return 'All Services';
    return items.map(item => typeof item === 'object' && item !== null ? item.name || item.title || item._id : item).filter(Boolean).join(', ');
  };

  const getBrandNames = (items?: any[]) => {
    if (!items || items.length === 0 || items.includes('ALL')) return 'All Vehicle Brands';
    return items.map(item => typeof item === 'object' && item !== null ? item.name || item.title || item._id : item).filter(Boolean).join(', ');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900">{promotion.title}</h1>
              <PromoTypeBadge type={promotion.promoType} />
              <PromotionStatusBadge status={promotion.status} endDate={promotion.endDate} />
              <PriorityBadge priority={promotion.priority} />
            </div>
            <p className="text-xs text-slate-500 mt-1">{promotion.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Promotion
          </button>
        </div>
      </div>

      {/* Usage Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Usage</span>
          <p className="text-lg font-black text-slate-900 mt-1">{promotion.usedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Remaining</span>
          <p className="text-lg font-black text-slate-900 mt-1">{remainingUsage}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Limit</span>
          <p className="text-lg font-black text-slate-900 mt-1">{usageLimitText}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Discount Given</span>
          <p className="text-lg font-black text-emerald-600 mt-1">AED {totalDiscountGiven.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Per User Limit</span>
          <p className="text-lg font-black text-slate-900 mt-1">{promotion.perUserLimit || 1}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Stackable</span>
          <p className="text-lg font-black text-slate-900 mt-1">{promotion.stackable ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Usage Progress Bar */}
      {promotion.usageLimit && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Promotion Limit Utilization</span>
            <span>{usagePercent}% Used</span>
          </div>
          <div className="w-full bg-slate-100 h-full rounded-full overflow-hidden">
            <div className="bg-red-600 h-full rounded-full transition-all duration-500" style={{ width: `${usagePercent}%` }} />
          </div>
        </div>
      )}

      {/* Detailed Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: Overview & Discount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-red-600" /> Discount & Benefits
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Promo Code:</span>
              <span className="font-mono font-bold text-slate-900">{promotion.code || 'N/A (Auto Applied)'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Discount Type:</span>
              <span className="font-bold text-slate-800 capitalize">{promotion.discountType.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Discount Benefit:</span>
              <DiscountBadge discountType={promotion.discountType} discountValue={promotion.discountValue} walletCashback={promotion.walletCashback} referralReward={promotion.referralReward} />
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Min Order Amount:</span>
              <span className="font-bold text-slate-900">AED {promotion.minimumOrderAmount || 0}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Max Discount Cap:</span>
              <span className="font-bold text-slate-900">{promotion.maximumDiscountAmount ? `AED ${promotion.maximumDiscountAmount}` : 'No Cap'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Schedule & Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" /> Schedule & Time Rules
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Start Date:</span>
              <span className="font-bold text-slate-900">{promotion.startDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">End Date:</span>
              <span className="font-bold text-slate-900">{promotion.endDate || 'No Expiry Date'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Valid Days:</span>
              <span className="font-semibold text-slate-800">{promotion.validDays.length > 0 ? promotion.validDays.join(', ') : 'Every Day'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Time Range:</span>
              <span className="font-semibold text-slate-800">
                {promotion.validTimeFrom && promotion.validTimeTo ? `${promotion.validTimeFrom} to ${promotion.validTimeTo}` : 'All Day'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Applicability */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-600" /> Target Applicability
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Applicable Services:</span>
              <span className="font-semibold text-slate-800 text-right">{getServiceNames(promotion.applicableServices)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Vehicle Brands:</span>
              <span className="font-semibold text-slate-800 text-right">{getBrandNames(promotion.applicableVehicleBrands)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Vehicle Types:</span>
              <span className="font-semibold text-slate-800 text-right">{promotion.applicableVehicleTypes && promotion.applicableVehicleTypes.length ? promotion.applicableVehicleTypes.map((v: any) => typeof v === 'object' && v !== null ? v.name : v).filter(Boolean).join(', ') : 'All Vehicle Types'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">User Tier:</span>
              <span className="font-bold text-slate-900 capitalize">{promotion.applicableUserType} Users</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Payment Methods:</span>
              <span className="font-semibold text-slate-800">{promotion.paymentMethods.length ? promotion.paymentMethods.join(', ') : 'All Payment Methods'}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Rules & Flags */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-red-600" /> Rules & Parameters
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">First Booking Only:</span>
              <span className="font-bold text-slate-900">{promotion.firstBookingOnly ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Include Taxes:</span>
              <span className="font-bold text-slate-900">{promotion.includeTaxes ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Auto Apply:</span>
              <span className="font-bold text-slate-900">{promotion.autoApply ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Stackable:</span>
              <span className="font-bold text-slate-900">{promotion.stackable ? 'Allowed' : 'Not Allowed'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
