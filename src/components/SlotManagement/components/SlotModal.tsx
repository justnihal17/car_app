import React, { useState, useEffect } from 'react';
import { X, Clock, Check, Loader2, Layers, AlertCircle, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { MasterSlot } from '../types/slot.types';

interface SlotModalProps {
  slot?: MasterSlot | null;
  globalCapacity: number;
  onClose: () => void;
  onSuccess: () => void;
}

// Format 24h "08:00" to 12h "08:00 AM"
const format12Hour = (time24: string): string => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const paddedH = h12 < 10 ? `0${h12}` : `${h12}`;
  return `${paddedH}:${mStr || '00'} ${period}`;
};

export function SlotModal({ slot, globalCapacity, onClose, onSuccess }: SlotModalProps) {
  const isEdit = !!slot;

  const [startTime, setStartTime] = useState(slot?.startTime || '08:00');
  const [endTime, setEndTime] = useState(slot?.endTime || '09:00');
  const [label, setLabel] = useState(slot?.label || '08:00 AM - 09:00 AM');
  const [useGlobalCapacity, setUseGlobalCapacity] = useState<boolean>(slot ? slot.useGlobalCapacity : true);
  const [capacity, setCapacity] = useState<number | string>(slot?.capacity ?? 4);
  const [displayOrder, setDisplayOrder] = useState<number | string>(slot?.displayOrder ?? 1);
  const [active, setActive] = useState<boolean>(slot ? slot.active : true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate label when start or end time changes, unless manually edited
  const handleTimeChange = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
    if (start && end) {
      const generated = `${format12Hour(start)} - ${format12Hour(end)}`;
      setLabel(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startTime || !endTime) {
      setError('Start time and End time are required.');
      return;
    }

    if (startTime >= endTime) {
      setError('Start time must be strictly before End time.');
      return;
    }

    if (!label.trim()) {
      setError('Slot label is required.');
      return;
    }

    if (!useGlobalCapacity && (Number(capacity) < 1 || isNaN(Number(capacity)))) {
      setError('Custom capacity must be at least 1.');
      return;
    }

    const payload: any = {
      startTime,
      endTime,
      label: label.trim(),
      useGlobalCapacity,
      displayOrder: Number(displayOrder) || 1,
    };

    if (!useGlobalCapacity) {
      payload.capacity = Number(capacity);
    }

    if (isEdit) {
      payload.active = active;
    }

    try {
      setLoading(true);
      const slotId = slot?._id || slot?.id;
      if (isEdit && slotId) {
        await api.put(`/admin/slots/${slotId}`, payload);
        toast.success('Time slot updated successfully!');
      } else {
        await api.post('/admin/slots', payload);
        toast.success('Master time slot created successfully!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving slot:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save time slot.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isEdit ? 'Edit Master Time Slot' : 'Create Master Time Slot'}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Define the booking window, capacity rules, and display order.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Time Window Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Start Time (24h) <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleTimeChange(e.target.value, endTime)}
                required
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                End Time (24h) <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleTimeChange(startTime, e.target.value)}
                required
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Label Input */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Slot Display Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. 08:00 AM - 09:00 AM"
              required
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
            />
            <p className="text-[10.5px] text-slate-400 mt-1">This label is shown to customers on the booking screen.</p>
          </div>

          {/* Capacity Setting */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 space-y-3">
            <label className="block font-bold text-slate-800 uppercase tracking-wider text-[10.5px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-600" /> Capacity Setting
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setUseGlobalCapacity(true)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  useGlobalCapacity
                    ? 'border-red-500 bg-red-50/30 text-slate-900 shadow-2xs ring-1 ring-red-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-xs text-slate-900">Global Capacity</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${useGlobalCapacity ? 'border-red-600 bg-red-600' : 'border-slate-300 bg-white'}`}>
                    {useGlobalCapacity && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 font-medium">Uses system default ({globalCapacity} bookings)</span>
              </button>

              <button
                type="button"
                onClick={() => setUseGlobalCapacity(false)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  !useGlobalCapacity
                    ? 'border-purple-500 bg-purple-50/30 text-slate-900 shadow-2xs ring-1 ring-purple-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-xs text-slate-900">Custom Capacity</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${!useGlobalCapacity ? 'border-purple-600 bg-purple-600' : 'border-slate-300 bg-white'}`}>
                    {!useGlobalCapacity && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 font-medium">Custom override for this slot</span>
              </button>
            </div>

            {!useGlobalCapacity && (
              <div className="pt-2 animate-in fade-in duration-150">
                <label className="block font-semibold text-slate-700 mb-1">
                  Custom Max Bookings / Slot <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full h-8.5 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 shadow-2xs"
                />
              </div>
            )}
          </div>

          {/* Display Order & Active State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3 text-slate-400" /> Display Order
              </label>
              <input
                type="number"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="1"
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
              />
            </div>

            {isEdit && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slot Status</label>
                <select
                  value={active ? 'true' : 'false'}
                  onChange={(e) => setActive(e.target.value === 'true')}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
                >
                  <option value="true">Active (Bookable)</option>
                  <option value="false">Inactive (Disabled)</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-8.5 px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-8.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  {isEdit ? 'Save Changes' : 'Create Time Slot'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
