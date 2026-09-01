import React, { useState } from 'react';
import { X, Layers, Check, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { SlotSettings } from '../types/slot.types';

interface QuickCapacityModalProps {
  settings: SlotSettings;
  onClose: () => void;
  onSuccess: (updated: SlotSettings) => void;
}

export function QuickCapacityModal({ settings, onClose, onSuccess }: QuickCapacityModalProps) {
  const [globalCapacity, setGlobalCapacity] = useState<number | string>(settings.globalCapacity || 4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const capNum = Number(globalCapacity);
    if (isNaN(capNum) || capNum < 1) {
      setError('Global capacity must be at least 1 booking per slot.');
      return;
    }

    const payload: SlotSettings = {
      ...settings,
      globalCapacity: capNum,
    };

    try {
      setLoading(true);
      setError(null);
      const res = await api.put('/admin/slots/settings', payload);
      const updatedData = res.data?.data || payload;
      toast.success(`Global capacity updated to ${capNum} bookings/slot!`);
      onSuccess(updatedData);
      onClose();
    } catch (err: any) {
      console.error('Failed to update capacity:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update settings.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Edit Global Default Capacity</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-1.5 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Global Default Capacity (Max Bookings / Slot)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={globalCapacity}
              onChange={(e) => setGlobalCapacity(e.target.value)}
              required
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
            />
            <p className="text-[10.5px] text-slate-400 mt-1">
              Applies to all slots marked with <strong>Global Capacity</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-8 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  Update
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
