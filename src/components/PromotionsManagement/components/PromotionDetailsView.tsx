import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Tag, Calendar, Layers, CheckCircle2, CreditCard, ShieldAlert, MapPin, Car, Wrench, Users } from 'lucide-react';
import { Promotion } from '../types/promotion.types';
import { PromoTypeBadge, PromotionStatusBadge, DiscountBadge, PriorityBadge } from './PromotionBadges';
import { getPromotionMasterData, getCachedMasterDataSync, PromotionMasterData } from '../services/promotionMasterCache';

interface PromotionDetailsViewProps {
  promotion: Promotion;
  onBack: () => void;
  onEdit: () => void;
}

export function PromotionDetailsView({ promotion, onBack, onEdit }: PromotionDetailsViewProps) {
  const [masterData, setMasterData] = useState<PromotionMasterData>(() => {
    return getCachedMasterDataSync() || {
      services: [],
      brands: [],
      models: [],
      vehicleTypes: [],
      fuelTypes: [],
      cities: [],
      emirates: [],
      customers: [],
    };
  });

  useEffect(() => {
    let isMounted = true;
    getPromotionMasterData().then((data) => {
      if (isMounted && data) {
        setMasterData(data);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const usageLimitText = promotion.usageLimit ? promotion.usageLimit.toString() : 'Unlimited';
  const remainingUsage = promotion.usageLimit ? Math.max(0, promotion.usageLimit - promotion.usedCount) : 'Unlimited';
  const usagePercent = promotion.usageLimit ? Math.min(100, Math.round((promotion.usedCount / promotion.usageLimit) * 100)) : 0;
  
  const discountVal = promotion.discountValue || promotion.walletCashback || promotion.referralReward || 150;
  const totalDiscountGiven = promotion.usedCount * discountVal;

  const renderPillList = (
    items?: any[],
    allLabel = 'All',
    masterList: { id: string; name: string }[] = [],
    tone: 'default' | 'danger' | 'success' = 'default'
  ) => {
    if (!items || items.length === 0 || items.includes('ALL')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          {allLabel}
        </span>
      );
    }

    const resolved = items
      .map((item) => {
        if (typeof item === 'object' && item !== null) return item.name || item.title || item._id;
        if (masterList.length > 0) {
          const match = masterList.find((m) => m.id === item || (m as any)._id === item || m.name === item);
          if (match) return match.name;
        }
        return String(item);
      })
      .filter(Boolean);

    if (resolved.length === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          {allLabel}
        </span>
      );
    }

    if (masterList.length > 0 && resolved.length === masterList.length) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          {allLabel} (All {resolved.length})
        </span>
      );
    }

    const badgeClass =
      tone === 'danger'
        ? 'bg-red-50 text-red-700 border-red-200/90'
        : tone === 'success'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
        : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100';

    return (
      <div className="flex flex-wrap gap-1.5 justify-end max-w-md">
        {resolved.map((name, i) => (
          <span
            key={i}
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border shadow-2xs ${badgeClass}`}
          >
            {name}
          </span>
        ))}
      </div>
    );
  };

  const renderDaysList = (days?: any[]) => {
    if (!days || days.length === 0 || days.includes('ALL') || days.length === 7) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          Every Day (Mon - Sun)
        </span>
      );
    }

    const dayNameMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const resolvedDays = days.map((d) => (typeof d === 'number' ? dayNameMap[d] || d : String(d)));

    return (
      <div className="flex flex-wrap gap-1 justify-end max-w-sm">
        {resolvedDays.map((day, i) => (
          <span
            key={i}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/80"
          >
            {day}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{promotion.title}</h1>
              <PromoTypeBadge type={promotion.promoType} />
              <PromotionStatusBadge status={promotion.status} endDate={promotion.endDate} />
              <PriorityBadge priority={promotion.priority} />
            </div>
            <p className="text-xs text-slate-500 mt-1">{promotion.description || 'No description provided.'}</p>
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
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Limit</span>
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
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Promo Code:</span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {promotion.code || 'N/A (Auto Applied)'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Discount Type:</span>
              <span className="font-bold text-slate-800 capitalize">{promotion.discountType.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Discount Benefit:</span>
              <DiscountBadge discountType={promotion.discountType} discountValue={promotion.discountValue} walletCashback={promotion.walletCashback} referralReward={promotion.referralReward} />
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Min Order Amount:</span>
              <span className="font-bold text-slate-900">AED {promotion.minimumOrderAmount || 0}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
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
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Start Date:</span>
              <span className="font-bold text-slate-900">{promotion.startDate}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">End Date:</span>
              <span className="font-bold text-slate-900">{promotion.endDate || 'No Expiry Date'}</span>
            </div>
            <div className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium shrink-0 pt-0.5">Valid Days:</span>
              {renderDaysList(promotion.validDays)}
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Time Range:</span>
              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {promotion.validTimeFrom && promotion.validTimeTo ? `${promotion.validTimeFrom} - ${promotion.validTimeTo}` : 'All Day (24 Hours)'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Target Applicability (Redesigned with Pills & Badges) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-600" /> Target Applicability
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium shrink-0 pt-0.5 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-400" /> Applicable Services:
              </span>
              {renderPillList(promotion.applicableServices, 'All Services', masterData.services)}
            </div>

            {promotion.excludedServices && promotion.excludedServices.length > 0 && !promotion.excludedServices.includes('ALL') && (
              <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100">
                <span className="text-red-500 font-medium shrink-0 pt-0.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Excluded Services:
                </span>
                {renderPillList(promotion.excludedServices, 'None Excluded', masterData.services, 'danger')}
              </div>
            )}

            <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium shrink-0 pt-0.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" /> Vehicle Brands:
              </span>
              {renderPillList(promotion.applicableVehicleBrands, 'All Vehicle Brands', masterData.brands)}
            </div>

            <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium shrink-0 pt-0.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" /> Vehicle Types:
              </span>
              {renderPillList(promotion.applicableVehicleTypes, 'All Vehicle Types', masterData.vehicleTypes)}
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" /> User Tier:
              </span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {promotion.applicableUserType || 'ALL'} Users
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Payment Methods:
              </span>
              {renderPillList(promotion.paymentMethods, 'All Payment Methods', [], 'default')}
            </div>
          </div>
        </div>

        {/* Section 4: Rules & Flags */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-red-600" /> Rules & Parameters
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">First Booking Only:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${promotion.firstBookingOnly ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700'}`}>
                {promotion.firstBookingOnly ? 'Yes (First Only)' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Include Taxes:</span>
              <span className="font-bold text-slate-900">{promotion.includeTaxes !== false ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Auto Apply:</span>
              <span className="font-bold text-slate-900">{promotion.autoApply ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Stackable:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${promotion.stackable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'}`}>
                {promotion.stackable ? 'Allowed' : 'Not Allowed'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
