import React, { useState } from 'react';
import { Save, Loader2, Calendar, Clock, Layers, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { SlotSettings } from '../types/slot.types';

interface GlobalSettingsViewProps {
  settings: SlotSettings;
  onUpdate: (updated: SlotSettings) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

export function GlobalSettingsView({ settings, onUpdate }: GlobalSettingsViewProps) {
  const [formData, setFormData] = useState<SlotSettings>({
    globalCapacity: settings.globalCapacity ?? 4,
    weeklyOffDays: settings.weeklyOffDays ?? [5],
    slotBufferMinutes: settings.slotBufferMinutes ?? 30,
    maxAdvanceDays: settings.maxAdvanceDays ?? 60,
  });

  const [loading, setLoading] = useState(false);

  const toggleDay = (dayVal: number) => {
    setFormData((prev) => {
      const current = prev.weeklyOffDays || [];
      const exists = current.includes(dayVal);
      const updated = exists ? current.filter((d) => d !== dayVal) : [...current, dayVal].sort((a, b) => a - b);
      return { ...prev, weeklyOffDays: updated };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.globalCapacity) < 1) {
      toast.error('Global capacity must be at least 1.');
      return;
    }

    const payload: SlotSettings = {
      globalCapacity: Number(formData.globalCapacity) || 4,
      weeklyOffDays: formData.weeklyOffDays || [],
      slotBufferMinutes: Number(formData.slotBufferMinutes) || 30,
      maxAdvanceDays: Number(formData.maxAdvanceDays) || 60,
    };

    try {
      setLoading(true);
      const res = await api.put('/admin/slots/settings', payload);
      const updated = res.data?.data || payload;
      toast.success('Slot settings updated successfully!');
      onUpdate(updated);
    } catch (err: any) {
      console.error('Failed to update slot settings:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update settings.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden max-w-4xl">
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            Global Capacity & Booking Automation Rules
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure system-wide capacity defaults, weekly closure days, advance windows, and buffer times.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6 text-xs">
        {/* Row 1: Global Capacity & Max Advance Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" /> Global Default Capacity (Per Slot)
            </label>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Default maximum number of cars/bookings allowed per time slot across all active services.
            </p>
            <div className="pt-1">
              <input
                type="number"
                min="1"
                max="100"
                value={formData.globalCapacity}
                onChange={(e) => setFormData({ ...formData, globalCapacity: Number(e.target.value) })}
                required
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" /> Max Advance Booking Window (Days)
            </label>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              How many days in advance customers can select dates and book appointments on the app.
            </p>
            <div className="pt-1">
              <input
                type="number"
                min="1"
                max="365"
                value={formData.maxAdvanceDays}
                onChange={(e) => setFormData({ ...formData, maxAdvanceDays: Number(e.target.value) })}
                required
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Same-day Slot Buffer */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
          <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-600" /> Same-Day Booking Cutoff Buffer (Minutes)
          </label>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Time slot is automatically locked & disabled on the customer app if the current time is within this buffer before slot start (e.g. 30 mins before 08:00 AM).
          </p>
          <div className="pt-1 max-w-xs">
            <input
              type="number"
              min="0"
              max="240"
              value={formData.slotBufferMinutes}
              onChange={(e) => setFormData({ ...formData, slotBufferMinutes: Number(e.target.value) })}
              required
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Row 3: Weekly Off Days Selector */}
        <div className="space-y-2.5">
          <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-red-600" /> Weekly Recurring Off-Days (Facility Closures)
          </label>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Select recurring days when the workshop/service is closed every week. All slots will be automatically disabled on these days.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
            {DAYS_OF_WEEK.map((d) => {
              const isChecked = (formData.weeklyOffDays || []).includes(d.value);
              return (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => toggleDay(d.value)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    isChecked
                      ? 'bg-red-50/80 border-red-300 text-red-700 font-bold shadow-2xs ring-1 ring-red-500/30'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-red-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                    <span className="text-xs">{d.short}</span>
                  </div>
                  <span className="text-[10px] opacity-75">{d.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-1">
            <span className="text-[11px] font-medium text-slate-600">
              Active Weekly Closures:{' '}
              {formData.weeklyOffDays.length === 0 ? (
                <span className="text-emerald-600 font-semibold">None (Open 7 Days a Week)</span>
              ) : (
                <span className="text-red-600 font-semibold">
                  Every {formData.weeklyOffDays.map((v) => DAYS_OF_WEEK.find((d) => d.value === v)?.label).join(', ')}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Settings...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Global Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
