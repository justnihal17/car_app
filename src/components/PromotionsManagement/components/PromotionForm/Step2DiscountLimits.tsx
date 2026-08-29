import React, { useState, useEffect } from 'react';
import api from '../../../../api/axios';
import { Promotion, DiscountType } from '../../types/promotion.types';
import { Percent, Banknote, Gift, Loader2 } from 'lucide-react';
import { CustomSelect } from '../../../common/CustomSelect';

interface Step2Props {
  formData: Partial<Promotion>;
  onChange: (updated: Partial<Promotion>) => void;
  errors: Record<string, string>;
  isEditMode?: boolean;
}

export function Step2DiscountLimits({ formData, onChange, errors, isEditMode }: Step2Props) {
  const isUnlimited = formData.usageLimit === undefined || formData.usageLimit === null;
  const [servicesList, setServicesList] = useState<{ id: string; name: string }[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await api.get('/master/service/admin');
        const raw = res.data?.data || res.data || [];
        const list = Array.isArray(raw) ? raw : (raw.services || raw.list || []);
        if (isMounted && list.length > 0) {
          setServicesList(list.map((s: any) => ({ id: s._id || s.id, name: s.name || s.title })));
        }
      } catch {
        try {
          const res = await api.get('/master/service');
          const raw = res.data?.data || res.data || [];
          const list = Array.isArray(raw) ? raw : (raw.services || raw.list || []);
          if (isMounted && list.length > 0) {
            setServicesList(list.map((s: any) => ({ id: s._id || s.id, name: s.name || s.title })));
          }
        } catch (e) {
          console.warn('Failed to fetch services for free service dropdown:', e);
        }
      } finally {
        if (isMounted) setLoadingServices(false);
      }
    };
    fetchServices();
    return () => { isMounted = false; };
  }, []);

  const DISCOUNT_TYPES: { type: DiscountType; label: string; desc: string; icon: any }[] = [
    {
      type: 'FLAT',
      label: 'Flat Discount',
      desc: 'Deduct a fixed currency amount from total bill.',
      icon: Banknote,
    },
    {
      type: 'PERCENTAGE',
      label: 'Percentage Discount',
      desc: 'Deduct a percentage value from eligible bill.',
      icon: Percent,
    },
    {
      type: 'FREE_SERVICE',
      label: 'Free Service',
      desc: 'Offer a complimentary service item.',
      icon: Gift,
    },
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-2.5">
        <h2 className="text-sm font-semibold text-slate-900">Step 2: Discount & Limits</h2>
        <p className="text-xs text-slate-400 font-normal mt-0.5">Configure discount value, limits, priority, and stackability.</p>
      </div>

      {/* Discount Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Discount Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {DISCOUNT_TYPES.map((item) => {
            const Icon = item.icon;
            const isSelected = formData.discountType === item.type;

            return (
              <div
                key={item.type}
                onClick={() => onChange({ discountType: item.type })}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-50/40 ring-1 ring-red-500/30 shadow-2xs'
                    : 'border-slate-200/90 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7.5 h-7.5 rounded-md flex items-center justify-center font-semibold shrink-0 ${
                      isSelected ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{item.label}</h4>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discount Value (for Flat & Percentage) */}
      {formData.discountType !== 'FREE_SERVICE' && (
        <div className="space-y-1 max-w-sm">
          <label className="text-xs font-semibold text-slate-700">
            Discount Value <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              {formData.discountType === 'FLAT' ? 'AED' : '%'}
            </span>
            <input
              type="number"
              min={1}
              max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
              value={formData.discountValue !== undefined ? formData.discountValue : ''}
              onChange={(e) => onChange({ discountValue: e.target.value ? Number(e.target.value) : undefined })}
              placeholder={formData.discountType === 'FLAT' ? '200' : '20'}
              className="w-full h-8 pl-11 pr-3 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 shadow-2xs"
            />
          </div>
          {errors.discountValue && <p className="text-[10.5px] font-medium text-red-500">{errors.discountValue}</p>}
        </div>
      )}

      {/* Free Service Select (for Free Service) */}
      {formData.discountType === 'FREE_SERVICE' && (
        <div className="space-y-1 max-w-sm">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            Select Free Service Item
            {loadingServices && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
          </label>
          <CustomSelect
            value={formData.freeServiceId || ''}
            onChange={(val) => onChange({ freeServiceId: val })}
            options={servicesList.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="-- Choose Free Service --"
            searchable={servicesList.length > 5}
            size="sm"
          />
          {errors.freeServiceId && <p className="text-[10.5px] font-medium text-red-500">{errors.freeServiceId}</p>}
        </div>
      )}

      {/* Min Order & Max Discount in 2 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Minimum Order Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">AED</span>
            <input
              type="number"
              min={0}
              value={formData.minimumOrderAmount !== undefined ? formData.minimumOrderAmount : ''}
              onChange={(e) => onChange({ minimumOrderAmount: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0"
              className="w-full h-8 pl-11 pr-3 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-900 font-normal placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 shadow-2xs"
            />
          </div>
          <p className="text-[10px] text-slate-400">Applies only when total order meets this amount.</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Maximum Discount Amount (Cap)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">AED</span>
            <input
              type="number"
              min={0}
              value={formData.maximumDiscountAmount !== undefined ? formData.maximumDiscountAmount : ''}
              onChange={(e) => onChange({ maximumDiscountAmount: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Leave empty for no cap"
              className="w-full h-8 pl-11 pr-3 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-900 font-normal placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 shadow-2xs"
            />
          </div>
          <p className="text-[10px] text-slate-400">Caps maximum discount allowed for percentage offers.</p>
        </div>
      </div>

      {/* Usage Limits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3">
        {/* Total Usage Limit */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700">Total Usage Limit</label>
            <label className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500 cursor-pointer">
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
            className="w-full h-8 px-3 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-900 font-normal disabled:bg-slate-50 disabled:opacity-60 shadow-2xs"
          />
        </div>

        {/* Per User Limit */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Per User Limit</label>
          <input
            type="number"
            min={1}
            value={formData.perUserLimit !== undefined ? formData.perUserLimit : 1}
            onChange={(e) => onChange({ perUserLimit: e.target.value ? Number(e.target.value) : 1 })}
            className="w-full h-8 px-3 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-900 font-normal focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 shadow-2xs"
          />
        </div>

        {/* Priority */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Application Priority</label>
          <input
            type="number"
            min={1}
            value={formData.priority !== undefined ? formData.priority : 1}
            onChange={(e) => onChange({ priority: e.target.value ? Number(e.target.value) : 1 })}
            placeholder="1"
            className="w-full h-8 px-3 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-900 font-normal focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 shadow-2xs"
          />
          <p className="text-[9.5px] text-slate-400">Lower numbers apply first.</p>
        </div>
      </div>

      {/* Used Count (Read-only for Edit) */}
      {isEditMode && (
        <div className="space-y-1 max-w-xs">
          <label className="text-xs font-semibold text-slate-700">Current Used Count</label>
          <input
            type="number"
            readOnly
            disabled
            value={formData.usedCount || 0}
            className="w-full h-8 px-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-600 cursor-not-allowed"
          />
        </div>
      )}

      {/* Stackable Toggle */}
      <div className="flex items-center justify-between p-3 bg-slate-50/60 border border-slate-200/90 rounded-lg">
        <div>
          <span className="text-xs font-semibold text-slate-800">Allow Combination (Stackable)</span>
          <p className="text-[11px] text-slate-400">Allow this promotion to be combined with other promotions.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ stackable: !formData.stackable })}
          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
            formData.stackable ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${
              formData.stackable ? 'translate-x-4.5' : 'translate-x-0.75'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
