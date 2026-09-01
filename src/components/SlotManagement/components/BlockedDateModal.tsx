import React, { useState } from 'react';
import { X, Calendar, Check, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { BlockedDateType } from '../types/slot.types';

interface BlockedDateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TYPE_OPTIONS: { value: BlockedDateType; label: string; description: string }[] = [
  { value: 'HOLIDAY', label: 'Official Holiday', description: 'Public / National holiday closures' },
  { value: 'OFF_DAY', label: 'Off Day', description: 'Weekly or special non-working day' },
  { value: 'MAINTENANCE', label: 'Maintenance / Renovation', description: 'Facility or technical service downtime' },
  { value: 'CUSTOM', label: 'Custom Closure', description: 'Ad-hoc weather or operational closure' },
];

export function BlockedDateModal({ onClose, onSuccess }: BlockedDateModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [type, setType] = useState<BlockedDateType>('HOLIDAY');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Date is required in YYYY-MM-DD format.');
      return;
    }

    if (!reason.trim()) {
      setError('Reason for blocking this date is required.');
      return;
    }

    const payload = {
      date,
      reason: reason.trim(),
      type,
    };

    try {
      setLoading(true);
      await api.post('/admin/blocked-dates', payload);
      toast.success(`Date ${date} blocked successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error blocking date:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to block date.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Block Calendar Date</h3>
              <p className="text-xs text-slate-500 font-normal">Close all bookings on a specific holiday or off-day.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
            />
          </div>

          {/* Block Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Closure Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as BlockedDateType)}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reason / Holiday Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. UAE National Day / Rain Storm"
              required
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
            />
            <p className="text-[10.5px] text-slate-400 mt-1">This reason is displayed to customers attempting to book on this date.</p>
          </div>

          {/* Warning notice */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2 text-amber-800 text-[11px] leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Blocking this date will instantly disable slot bookings on the customer mobile app and website for this entire day.
            </span>
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
                  Blocking...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Block Date
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
