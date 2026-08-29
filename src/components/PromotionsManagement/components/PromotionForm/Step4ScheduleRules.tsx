import React from 'react';
import { Promotion } from '../../types/promotion.types';
import { DAYS_OF_WEEK } from '../../data/dummyPromotions';
import { Calendar, Clock, Percent, Zap, Wallet, Share2, Check } from 'lucide-react';

interface Step4Props {
  formData: Partial<Promotion>;
  onChange: (updated: Partial<Promotion>) => void;
  errors: Record<string, string>;
}

export function Step4ScheduleRules({ formData, onChange, errors }: Step4Props) {
  const hasNoExpiry = !formData.endDate;
  const isAvailableAllDay = !formData.validTimeFrom && !formData.validTimeTo;

  const isAllDaysSelected =
    Boolean(
      formData.validDays?.includes('ALL') ||
      (formData.validDays && formData.validDays.length === DAYS_OF_WEEK.length)
    );

  const toggleDay = (day: string) => {
    const isAll = (formData.validDays || []).includes('ALL') || (formData.validDays || []).length === 0;
    if (isAll) {
      onChange({ validDays: [day] });
    } else {
      const current = (formData.validDays || []).filter((d) => d !== 'ALL');
      const updated = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day];
      onChange({
        validDays: updated.length === 0 || updated.length === DAYS_OF_WEEK.length ? ['ALL'] : updated,
      });
    }
  };

  const selectDayGroup = (type: 'weekdays' | 'weekends') => {
    if (type === 'weekdays') {
      onChange({ validDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] });
    } else if (type === 'weekends') {
      onChange({ validDays: ['Saturday', 'Sunday'] });
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-2.5">
        <h2 className="text-sm font-semibold text-slate-900">Step 4: Schedule & Rules</h2>
        <p className="text-xs text-slate-400 font-normal mt-0.5">Configure valid date ranges, day restrictions, time slots, and special rewards.</p>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Start Date */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="w-full h-8 px-3 bg-white border border-slate-200/90 rounded-lg text-xs font-normal text-slate-900 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 shadow-2xs"
          />
          {errors.startDate && <p className="text-[10.5px] font-medium text-red-500">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700">End Date</label>
            <label className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={hasNoExpiry}
                onChange={(e) => onChange({ endDate: e.target.checked ? '' : formData.endDate || '2026-12-31' })}
                className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 accent-red-600 cursor-pointer"
              />
              No Expiry Date
            </label>
          </div>
          <input
            type="date"
            disabled={hasNoExpiry}
            value={formData.endDate || ''}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="w-full h-8 px-3 bg-white border border-slate-200/90 rounded-lg text-xs font-normal text-slate-900 disabled:bg-slate-50 disabled:opacity-60 shadow-2xs"
          />
          {errors.endDate && <p className="text-[10.5px] font-medium text-red-500">{errors.endDate}</p>}
        </div>
      </div>

      {/* Valid Days */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Valid Days</label>
          <div className="flex items-center gap-2 text-xs font-medium">
            <button
              type="button"
              onClick={() => selectDayGroup('weekdays')}
              className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer"
            >
              Weekdays
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => selectDayGroup('weekends')}
              className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer"
            >
              Weekends
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => onChange({ validDays: ['ALL'] })}
              className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer"
            >
              Set All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected =
              (formData.validDays || []).includes('ALL') ||
              (formData.validDays || []).length === 0 ||
              (formData.validDays || []).includes(day);
            return (
              <div
                key={day}
                onClick={() => toggleDay(day)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all select-none ${
                  isSelected
                    ? 'border-slate-300 bg-slate-50 text-slate-900 font-medium'
                    : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="truncate pr-1">{day}</span>
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
        {((formData.validDays || []).includes('ALL') || (formData.validDays || []).length === 0) && (
          <p className="text-[10.5px] font-medium text-emerald-600">Valid every day of the week (default)</p>
        )}
      </div>

      {/* Valid Time Slots */}
      <div className="space-y-1.5 border-t border-slate-100 pt-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-slate-700">Valid Time Window</label>
          <label className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailableAllDay}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange({ validTimeFrom: '', validTimeTo: '' });
                } else {
                  onChange({ validTimeFrom: '09:00', validTimeTo: '21:00' });
                }
              }}
              className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 accent-red-600 cursor-pointer"
            />
            Available All Day
          </label>
        </div>

        {!isAvailableAllDay && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            <div>
              <span className="text-[10.5px] font-medium text-slate-400">From</span>
              <input
                type="time"
                value={formData.validTimeFrom || ''}
                onChange={(e) => onChange({ validTimeFrom: e.target.value })}
                className="w-full h-8 px-3 bg-white border border-slate-200/90 rounded-lg text-xs font-normal text-slate-900 shadow-2xs"
              />
            </div>
            <div>
              <span className="text-[10.5px] font-medium text-slate-400">To</span>
              <input
                type="time"
                value={formData.validTimeTo || ''}
                onChange={(e) => onChange({ validTimeTo: e.target.value })}
                className="w-full h-8 px-3 bg-white border border-slate-200/90 rounded-lg text-xs font-normal text-slate-900 shadow-2xs"
              />
            </div>
            {errors.validTimeTo && <p className="text-[10.5px] font-medium text-red-500 col-span-2">{errors.validTimeTo}</p>}
          </div>
        )}
      </div>

      {/* Type-Specific Reward Fields */}
      {formData.promoType === 'CASHBACK' && (
        <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-100 space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Wallet Cashback Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">AED</span>
            <input
              type="number"
              min={1}
              value={formData.walletCashback || ''}
              onChange={(e) => onChange({ walletCashback: Number(e.target.value) })}
              placeholder="100"
              className="w-full h-8 pl-11 pr-3 bg-white border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-900 shadow-2xs"
            />
          </div>
          {errors.walletCashback && <p className="text-[10.5px] font-medium text-red-500">{errors.walletCashback}</p>}
          <p className="text-[10.5px] text-slate-400">This amount will be credited to customer's wallet after an eligible booking.</p>
        </div>
      )}

      {formData.promoType === 'REFERRAL' && (
        <div className="p-3 bg-amber-50/40 rounded-lg border border-amber-100 space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-amber-600" /> Referral Reward Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">AED</span>
            <input
              type="number"
              min={1}
              value={formData.referralReward || ''}
              onChange={(e) => onChange({ referralReward: Number(e.target.value) })}
              placeholder="200"
              className="w-full h-8 pl-11 pr-3 bg-white border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-900 shadow-2xs"
            />
          </div>
          {errors.referralReward && <p className="text-[10.5px] font-medium text-red-500">{errors.referralReward}</p>}
          <p className="text-[10.5px] text-slate-400">Reward provided for a successful eligible referral.</p>
        </div>
      )}

      {/* Rules Toggles */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        {/* Include Taxes */}
        <div className="flex items-center justify-between p-3 bg-slate-50/60 border border-slate-200/90 rounded-lg">
          <div>
            <span className="text-xs font-semibold text-slate-800">Include Taxes</span>
            <p className="text-[11px] text-slate-400">Calculate the promotion using order amount including taxes.</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ includeTaxes: !formData.includeTaxes })}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
              formData.includeTaxes ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${
                formData.includeTaxes ? 'translate-x-4.5' : 'translate-x-0.75'
              }`}
            />
          </button>
        </div>

        {/* Auto Apply */}
        <div className="flex items-center justify-between p-3 bg-slate-50/60 border border-slate-200/90 rounded-lg">
          <div>
            <span className="text-xs font-semibold text-slate-800">Auto Apply</span>
            <p className="text-[11px] text-slate-400">Automatically apply this promotion when all conditions are satisfied.</p>
          </div>
          <button
            type="button"
            disabled={formData.promoType === 'AUTOMATIC'}
            onClick={() => onChange({ autoApply: !formData.autoApply })}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
              formData.autoApply ? 'bg-purple-600' : 'bg-slate-300'
            } ${formData.promoType === 'AUTOMATIC' ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${
                formData.autoApply ? 'translate-x-4.5' : 'translate-x-0.75'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
