import React, { useState, useMemo } from 'react';
import { 
  Calendar, Plus, Search, Trash2, ShieldAlert, RefreshCw, 
  Loader2, Tag, AlertCircle, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { BlockedDate } from '../types/slot.types';
import { ConfirmationModal } from '../../ConfirmationModal';

interface BlockedDatesTabProps {
  blockedDates: BlockedDate[];
  loading: boolean;
  onRefresh: () => void;
  onOpenCreate: () => void;
}

const TYPE_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  HOLIDAY: { label: 'Official Holiday', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200/80' },
  OFF_DAY: { label: 'Off Day', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/80' },
  MAINTENANCE: { label: 'Maintenance', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/80' },
  CUSTOM: { label: 'Custom Closure', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300/80' },
};

export function BlockedDatesTab({
  blockedDates,
  loading,
  onRefresh,
  onOpenCreate,
}: BlockedDatesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Unblock deletion state
  const [itemToUnblock, setItemToUnblock] = useState<BlockedDate | null>(null);
  const [isUnblocking, setIsUnblocking] = useState(false);

  const handleConfirmUnblock = async () => {
    if (!itemToUnblock) return;
    const blockId = itemToUnblock._id || itemToUnblock.id;
    if (!blockId) return;

    try {
      setIsUnblocking(true);
      await api.delete(`/admin/blocked-dates/${blockId}`);
      toast.success(`Date ${itemToUnblock.date} unblocked successfully! Bookings are reopened.`);
      setItemToUnblock(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to unblock date:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to unblock date.';
      toast.error(msg);
    } finally {
      setIsUnblocking(false);
    }
  };

  const filteredDates = useMemo(() => {
    return blockedDates.filter((item) => {
      const matchSearch =
        item.date.includes(searchTerm) ||
        item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === 'ALL' || item.type === typeFilter;

      return matchSearch && matchType;
    });
  }, [blockedDates, searchTerm, typeFilter]);

  // Format date helper: "2026-12-02" -> "Wed, 02 Dec 2026"
  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Control Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by date (YYYY-MM-DD) or holiday reason..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200/80 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
          />
        </div>

        {/* Type Filter & Add Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
          >
            <option value="ALL">All Closure Types</option>
            <option value="HOLIDAY">Official Holidays</option>
            <option value="OFF_DAY">Off Days</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="CUSTOM">Custom Closures</option>
          </select>

          <button
            onClick={onRefresh}
            title="Refresh List"
            className="h-9 w-9 flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Block Calendar Date</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Day & Format</th>
                <th className="py-3 px-4">Closure Reason / Occasion</th>
                <th className="py-3 px-4 text-center">Closure Type</th>
                <th className="py-3 px-4 text-center">Booking Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading && blockedDates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-500 mb-2" />
                    <span>Loading blocked dates & holidays...</span>
                  </td>
                </tr>
              ) : filteredDates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">No Blocked Dates Found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchTerm || typeFilter !== 'ALL'
                        ? 'No blocked dates match your filter.'
                        : 'All dates are currently open for booking. Click "Block Calendar Date" to add holidays.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDates.map((item) => {
                  const blockId = item._id || item.id || '';
                  const badgeInfo = TYPE_BADGES[item.type] || TYPE_BADGES.CUSTOM;

                  return (
                    <tr key={blockId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-[12px]">
                          <Calendar className="w-3.5 h-3.5 text-red-500" />
                          <span>{item.date}</span>
                        </div>
                      </td>

                      {/* Day & Full date */}
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        {formatDateDisplay(item.date)}
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.reason}
                      </td>

                      {/* Closure Type */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border}`}>
                          <Tag className="w-3 h-3" />
                          {badgeInfo.label}
                        </span>
                      </td>

                      {/* Booking Status */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <ShieldAlert className="w-3 h-3 text-rose-600" /> Bookings Closed
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setItemToUnblock(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200/80 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs active:scale-95"
                          title="Unblock Date"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Unblock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total Blocked Dates: <strong className="text-slate-800">{filteredDates.length}</strong></span>
          <span className="text-[11px] text-slate-400">Dates blocked here will be inaccessible across all customer interfaces.</span>
        </div>
      </div>

      {/* Confirmation Modal for Unblocking */}
      <ConfirmationModal
        isOpen={!!itemToUnblock}
        title="Unblock Calendar Date"
        message={`Are you sure you want to unblock date ${itemToUnblock?.date} (${itemToUnblock?.reason})? This will immediately reopen bookings for this date on the customer mobile app and website.`}
        confirmText="Unblock Date"
        cancelText="Cancel"
        isLoading={isUnblocking}
        onConfirm={handleConfirmUnblock}
        onCancel={() => setItemToUnblock(null)}
      />
    </div>
  );
}
