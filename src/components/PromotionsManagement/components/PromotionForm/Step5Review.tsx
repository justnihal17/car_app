import React from 'react';
import { Promotion } from '../../types/promotion.types';
import { Edit2, Tag, Calendar, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DUMMY_SERVICES, DUMMY_BRANDS } from '../../data/dummyPromotions';

interface Step5Props {
  formData: Partial<Promotion>;
  onGoToStep: (step: number) => void;
}

export function Step5Review({ formData, onGoToStep }: Step5Props) {
  const getServiceNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return 'Applicable to all services';
    return ids.map(id => DUMMY_SERVICES.find(s => s.id === id)?.name || id).join(', ');
  };

  const getBrandNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return 'Applicable to all vehicle brands';
    return ids.map(id => DUMMY_BRANDS.find(b => b.id === id)?.name || id).join(', ');
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Step 5: Review & Create</h2>
        <p className="text-xs text-slate-500">Review all configured rules before activating this promotion.</p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Section 1: Basic Info & Type */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-red-600" /> Basic Information & Type
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-red-600 hover:underline font-bold flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 1
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><span className="text-slate-500">Title:</span> <strong className="text-slate-900">{formData.title}</strong></div>
            <div><span className="text-slate-500">Promo Type:</span> <strong className="text-slate-900 uppercase">{formData.promoType}</strong></div>
            <div><span className="text-slate-500">Promo Code:</span> <strong className="font-mono text-slate-900">{formData.code || 'N/A (Auto Applied)'}</strong></div>
            <div><span className="text-slate-500">Initial Status:</span> <strong className="text-slate-900 uppercase">{formData.status}</strong></div>
            <div className="sm:col-span-2"><span className="text-slate-500">Description:</span> <span className="text-slate-800">{formData.description}</span></div>
          </div>
        </div>

        {/* Section 2: Discount & Limits */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-red-600" /> Discount & Limits
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-red-600 hover:underline font-bold flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 2
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><span className="text-slate-500">Discount Type:</span> <strong className="text-slate-900 capitalize">{formData.discountType?.replace('_', ' ')}</strong></div>
            <div>
              <span className="text-slate-500">Value:</span>{' '}
              <strong className="text-slate-900">
                {formData.discountType === 'flat' ? `₹${formData.discountValue}` : formData.discountType === 'percentage' ? `${formData.discountValue}%` : 'Free Service'}
              </strong>
            </div>
            <div><span className="text-slate-500">Min Order:</span> <strong className="text-slate-900">₹{formData.minimumOrderAmount || 0}</strong></div>
            <div><span className="text-slate-500">Max Discount Cap:</span> <strong className="text-slate-900">{formData.maximumDiscountAmount ? `₹${formData.maximumDiscountAmount}` : 'None'}</strong></div>
            <div><span className="text-slate-500">Total Usage Limit:</span> <strong className="text-slate-900">{formData.usageLimit || 'Unlimited'}</strong></div>
            <div><span className="text-slate-500">Per User Limit:</span> <strong className="text-slate-900">{formData.perUserLimit || 1}</strong></div>
            <div><span className="text-slate-500">Stackable:</span> <strong className="text-slate-900">{formData.stackable ? 'Yes' : 'No'}</strong></div>
            <div><span className="text-slate-500">Priority:</span> <strong className="text-slate-900">P{formData.priority || 1}</strong></div>
          </div>
        </div>

        {/* Section 3: Applicability */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-red-600" /> Target Applicability
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(3)}
              className="text-red-600 hover:underline font-bold flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 3
            </button>
          </div>
          <div className="space-y-1.5">
            <div><span className="text-slate-500">Services:</span> <span className="font-semibold text-slate-800">{getServiceNames(formData.applicableServices)}</span></div>
            <div><span className="text-slate-500">Excluded Services:</span> <span className="font-semibold text-slate-800">{getServiceNames(formData.excludedServices)}</span></div>
            <div><span className="text-slate-500">Vehicle Brands:</span> <span className="font-semibold text-slate-800">{getBrandNames(formData.applicableVehicleBrands)}</span></div>
            <div><span className="text-slate-500">Vehicle Types:</span> <span className="font-semibold text-slate-800">{formData.applicableVehicleTypes?.length ? formData.applicableVehicleTypes.join(', ') : 'All Vehicle Types'}</span></div>
            <div><span className="text-slate-500">Cities:</span> <span className="font-semibold text-slate-800">{formData.applicableCities?.length ? formData.applicableCities.join(', ') : 'All Cities'}</span></div>
            <div><span className="text-slate-500">User Tier:</span> <span className="font-bold text-slate-900 capitalize">{formData.applicableUserType} Users</span></div>
            <div><span className="text-slate-500">Payment Methods:</span> <span className="font-semibold text-slate-800">{formData.paymentMethods?.length ? formData.paymentMethods.join(', ') : 'All Payment Methods'}</span></div>
          </div>
        </div>

        {/* Section 4: Schedule & Additional */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-red-600" /> Schedule & Rules
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(4)}
              className="text-red-600 hover:underline font-bold flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 4
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><span className="text-slate-500">Start Date:</span> <strong className="text-slate-900">{formData.startDate}</strong></div>
            <div><span className="text-slate-500">End Date:</span> <strong className="text-slate-900">{formData.endDate || 'No Expiry Date'}</strong></div>
            <div><span className="text-slate-500">Valid Days:</span> <strong className="text-slate-900">{formData.validDays?.length ? formData.validDays.join(', ') : 'Every Day'}</strong></div>
            <div><span className="text-slate-500">Time Range:</span> <strong className="text-slate-900">{formData.validTimeFrom && formData.validTimeTo ? `${formData.validTimeFrom} - ${formData.validTimeTo}` : 'All Day'}</strong></div>
            <div><span className="text-slate-500">Auto Apply:</span> <strong className="text-slate-900">{formData.autoApply ? 'Yes' : 'No'}</strong></div>
            <div><span className="text-slate-500">Include Taxes:</span> <strong className="text-slate-900">{formData.includeTaxes ? 'Yes' : 'No'}</strong></div>
            {formData.walletCashback ? <div><span className="text-slate-500">Wallet Cashback:</span> <strong className="text-emerald-600">₹{formData.walletCashback}</strong></div> : null}
            {formData.referralReward ? <div><span className="text-slate-500">Referral Reward:</span> <strong className="text-amber-600">₹{formData.referralReward}</strong></div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
