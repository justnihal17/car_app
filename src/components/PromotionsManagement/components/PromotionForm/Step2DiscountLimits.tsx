import React from 'react';
import { Promotion, DiscountType } from '../../types/promotion.types';
import { DUMMY_SERVICES } from '../../data/dummyPromotions';
import { Percent, Banknote, Sparkles } from 'lucide-react';

interface Step2Props {
  formData: Partial<Promotion>;
  onChange: (updated: Partial<Promotion>) => void;
  errors: Record<string, string>;
  isEditMode?: boolean;
}

export function Step2DiscountLimits({ formData, onChange, errors, isEditMode }: Step2Props) {
  const isUnlimited = formData.usageLimit === undefined || formData.usageLimit === null;

  const DISCOUNT_TYPES: { type: DiscountType; label: string; desc: string; icon: any }[] = [
    {
      type: 'flat',
      label: 'Flat Discount',
      desc: 'Deduct a fixed currency amount from total bill.',
      icon: Banknote,
    },
    {
      type: 'percentage',
      label: 'Percentage Discount',
      desc: 'Deduct a percentage value from eligible bill.',
      icon: Percent,
    },
    {
      type: 'free_service',
      label: 'Free Service',
      desc: 'Offer a complimentary service item.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Step 2: Discount & Limits</h2>
        <p className="text-xs text-slate-500">Configure discount value, limits, priority, and stackability.</p>
      </div>

      {/* Discount Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700">
          Discount Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DISCOUNT_TYPES.map((item) => {
            const Icon = item.icon;
            const isSelected = formData.discountType === item.type;

            return (
              <div
                key={item.type}
                onClick={() => onChange({ discountType: item.type })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-50/30 ring-2 ring-red-500/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      isSelected ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discount Value (for Flat & Percentage) */}
      {formData.discountType !== 'free_service' && (
        <div className="space-y-1.5 max-w-sm">
          <label className="text-xs font-bold text-slate-700">
            Discount Value <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              {formData.discountType === 'flat' ? '₹' : '%'}
            </span>
            <input
              type="number"
              min={1}
              max={formData.discountType === 'percentage' ? 100 : undefined}
              value={formData.discountValue !== undefined ? formData.discountValue : ''}
              onChange={(e) => onChange({ discountValue: e.target.value ? Number(e.target.value) : undefined })}
              placeholder={formData.discountType === 'flat' ? '200' : '20'}
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          {errors.discountValue && <p className="text-[11px] font-semibold text-red-500">{errors.discountValue}</p>}
        </div>
      )}

      {/* Free Service Select (for Free Service) */}
      {formData.discountType === 'free_service' && (
        <div className="space-y-1.5 max-w-sm">
          <label className="text-xs font-bold text-slate-700">
            Select Free Service <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.freeServiceId || ''}
            onChange={(e) => onChange({ freeServiceId: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value="">-- Choose Free Service --</option>
            {DUMMY_SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
          {errors.freeServiceId && <p className="text-[11px] font-semibold text-red-500">{errors.freeServiceId}</p>}
        </div>
      )}

      {/* Min Order & Max Discount in 2 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Minimum Order Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
            <input
              type="number"
              min={0}
              value={formData.minimumOrderAmount !== undefined ? formData.minimumOrderAmount : ''}
              onChange={(e) => onChange({ minimumOrderAmount: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0"
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          <p className="text-[11px] text-slate-400">Applies only when total order meets this amount.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Maximum Discount Amount (Cap)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
            <input
              type="number"
              min={0}
              value={formData.maximumDiscountAmount !== undefined ? formData.maximumDiscountAmount : ''}
              onChange={(e) => onChange({ maximumDiscountAmount: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Leave empty for no cap"
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          <p className="text-[11px] text-slate-400">Caps maximum discount allowed for percentage offers.</p>
        </div>
      </div>

      {/* Usage Limits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
        {/* Total Usage Limit */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700">Total Usage Limit</label>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isUnlimited}
                onChange={(e) => onChange({ usageLimit: e.target.checked ? undefined : 100 })}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              Unlimited
            </label>
          </div>
          <input
            type="number"
            min={1}
            disabled={isUnlimited}
            value={!isUnlimited && formData.usageLimit !== undefined ? formData.usageLimit : ''}
            onChange={(e) => onChange({ usageLimit: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={isUnlimited ? 'Unlimited' : '100'}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium disabled:opacity-50"
          />
        </div>

        {/* Per User Limit */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Per User Limit</label>
          <input
            type="number"
            min={1}
            value={formData.perUserLimit !== undefined ? formData.perUserLimit : 1}
            onChange={(e) => onChange({ perUserLimit: e.target.value ? Number(e.target.value) : 1 })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Application Priority</label>
          <input
            type="number"
            min={1}
            value={formData.priority !== undefined ? formData.priority : 1}
            onChange={(e) => onChange({ priority: e.target.value ? Number(e.target.value) : 1 })}
            placeholder="1"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
          <p className="text-[10px] text-slate-400">Lower numbers apply first.</p>
        </div>
      </div>

      {/* Used Count (Read-only for Edit) */}
      {isEditMode && (
        <div className="space-y-1.5 max-w-xs">
          <label className="text-xs font-bold text-slate-700">Current Used Count</label>
          <input
            type="number"
            readOnly
            disabled
            value={formData.usedCount || 0}
            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-not-allowed"
          />
        </div>
      )}

      {/* Stackable Toggle */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <div>
          <span className="text-xs font-bold text-slate-800">Allow Combination (Stackable)</span>
          <p className="text-[11px] text-slate-500">Allow this promotion to be combined with other promotions.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ stackable: !formData.stackable })}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            formData.stackable ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
              formData.stackable ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
