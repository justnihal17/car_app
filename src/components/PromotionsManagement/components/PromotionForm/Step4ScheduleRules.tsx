import React from 'react';
import { Promotion } from '../../types/promotion.types';
import { DAYS_OF_WEEK } from '../../data/dummyPromotions';
import { Calendar, Clock, Percent, Zap, Wallet, Share2 } from 'lucide-react';

interface Step4Props {
  formData: Partial<Promotion>;
  onChange: (updated: Partial<Promotion>) => void;
  errors: Record<string, string>;
}

export function Step4ScheduleRules({ formData, onChange, errors }: Step4Props) {
  const hasNoExpiry = !formData.endDate;
  const isAvailableAllDay = !formData.validTimeFrom && !formData.validTimeTo;

  const toggleDay = (day: string) => {
    const current = formData.validDays || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    onChange({ validDays: updated });
  };

  const selectDayGroup = (type: 'ALL' | 'weekdays' | 'weekends') => {
    if (type === 'ALL') {
      onChange({ validDays: [...DAYS_OF_WEEK] });
    } else if (type === 'weekdays') {
      onChange({ validDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] });
    } else if (type === 'weekends') {
      onChange({ validDays: ['Saturday', 'Sunday'] });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Step 4: Schedule & Rules</h2>
        <p className="text-xs text-slate-500">Configure valid date ranges, day restrictions, time slots, and special rewards.</p>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
          {errors.startDate && <p className="text-[11px] font-semibold text-red-500">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700">End Date</label>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={hasNoExpiry}
                onChange={(e) => onChange({ endDate: e.target.checked ? undefined : '2026-12-31' })}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              No Expiry Date
            </label>
          </div>
          <input
            type="date"
            disabled={hasNoExpiry}
            value={formData.endDate || ''}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium disabled:opacity-50"
          />
          {errors.endDate && <p className="text-[11px] font-semibold text-red-500">{errors.endDate}</p>}
        </div>
      </div>

      {/* Valid Days */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700">Valid Days</label>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => selectDayGroup('ALL')}
              className="text-red-600 hover:underline"
            >
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => selectDayGroup('weekdays')}
              className="text-slate-600 hover:underline"
            >
              Weekdays
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => selectDayGroup('weekends')}
              className="text-slate-600 hover:underline"
            >
              Weekends
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = (formData.validDays || []).includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        {(formData.validDays || []).length === 0 && (
          <p className="text-[11px] font-semibold text-emerald-600">Valid every day of the week</p>
        )}
      </div>

      {/* Valid Time Slots */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700">Valid Time Window</label>
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailableAllDay}
              onChange={(e) =>
                onChange({
                  validTimeFrom: e.target.checked ? undefined : '09:00',
                  validTimeTo: e.target.checked ? undefined : '18:00',
                })
              }
              className="rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            Available All Day
          </label>
        </div>

        {!isAvailableAllDay && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">From</span>
              <input
                type="time"
                value={formData.validTimeFrom || ''}
                onChange={(e) => onChange({ validTimeFrom: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500">To</span>
              <input
                type="time"
                value={formData.validTimeTo || ''}
                onChange={(e) => onChange({ validTimeTo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>
            {errors.validTimeTo && <p className="text-[11px] font-semibold text-red-500 col-span-2">{errors.validTimeTo}</p>}
          </div>
        )}
      </div>

      {/* Type-Specific Reward Fields */}
      {formData.promoType === 'CASHBACK' && (
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-600" /> Wallet Cashback Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">AED</span>
            <input
              type="number"
              min={1}
              value={formData.walletCashback || ''}
              onChange={(e) => onChange({ walletCashback: Number(e.target.value) })}
              placeholder="100"
              className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
            />
          </div>
          {errors.walletCashback && <p className="text-[11px] font-semibold text-red-500">{errors.walletCashback}</p>}
          <p className="text-[11px] text-slate-500">This amount will be credited to customer's wallet after an eligible booking.</p>
        </div>
      )}

      {formData.promoType === 'REFERRAL' && (
        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-amber-600" /> Referral Reward Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">AED</span>
            <input
              type="number"
              min={1}
              value={formData.referralReward || ''}
              onChange={(e) => onChange({ referralReward: Number(e.target.value) })}
              placeholder="200"
              className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
            />
          </div>
          {errors.referralReward && <p className="text-[11px] font-semibold text-red-500">{errors.referralReward}</p>}
          <p className="text-[11px] text-slate-500">Reward provided for a successful eligible referral.</p>
        </div>
      )}

      {/* Rules Toggles */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        {/* Include Taxes */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-xs font-bold text-slate-800">Include Taxes</span>
            <p className="text-[11px] text-slate-500">Calculate the promotion using order amount including taxes.</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ includeTaxes: !formData.includeTaxes })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              formData.includeTaxes ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                formData.includeTaxes ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Auto Apply */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-xs font-bold text-slate-800">Auto Apply</span>
            <p className="text-[11px] text-slate-500">Automatically apply this promotion when all conditions are satisfied.</p>
          </div>
          <button
            type="button"
            disabled={formData.promoType === 'AUTOMATIC'}
            onClick={() => onChange({ autoApply: !formData.autoApply })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              formData.autoApply ? 'bg-purple-600' : 'bg-slate-300'
            } ${formData.promoType === 'AUTOMATIC' ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                formData.autoApply ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
