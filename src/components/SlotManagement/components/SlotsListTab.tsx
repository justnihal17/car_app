import React, { useState, useMemo } from 'react';
import { 
  Clock, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, 
  Layers, ArrowUpDown, Filter, AlertCircle, RefreshCw, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { MasterSlot } from '../types/slot.types';
import { ConfirmationModal } from '../../ConfirmationModal';

interface SlotsListTabProps {
  slots: MasterSlot[];
  globalCapacity: number;
  loading: boolean;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (slot: MasterSlot) => void;
}

export function SlotsListTab({
  slots,
  globalCapacity,
  loading,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
}: SlotsListTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [capacityFilter, setCapacityFilter] = useState<'ALL' | 'GLOBAL' | 'CUSTOM'>('ALL');

  // Delete modal state
  const [slotToDelete, setSlotToDelete] = useState<MasterSlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle active state with optimism
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleActive = async (slot: MasterSlot) => {
    const slotId = slot._id || slot.id;
    if (!slotId) return;

    const newActiveState = !slot.active;
    setTogglingId(slotId);

    try {
      await api.patch(`/admin/slots/${slotId}/toggle`, { active: newActiveState });
      toast.success(`Slot marked as ${newActiveState ? 'Active' : 'Inactive'}`);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to toggle slot status:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update slot status.';
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!slotToDelete) return;
    const slotId = slotToDelete._id || slotToDelete.id;
    if (!slotId) return;

    try {
      setIsDeleting(true);
      await api.delete(`/admin/slots/${slotId}`);
      toast.success('Time slot deleted (soft-deleted). Historical bookings remain safe.');
      setSlotToDelete(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete slot:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete slot.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search computation
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      // Search
      const matchSearch =
        slot.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.startTime.includes(searchTerm) ||
        slot.endTime.includes(searchTerm) ||
        (slot.slotCode && slot.slotCode.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && slot.active) ||
        (statusFilter === 'INACTIVE' && !slot.active);

      // Capacity filter
      const matchCapacity =
        capacityFilter === 'ALL' ||
        (capacityFilter === 'GLOBAL' && slot.useGlobalCapacity) ||
        (capacityFilter === 'CUSTOM' && !slot.useGlobalCapacity);

      return matchSearch && matchStatus && matchCapacity;
    });
  }, [slots, searchTerm, statusFilter, capacityFilter]);

  return (
    <div className="space-y-3.5">
      {/* Control Bar: Search, Filters & Create Button */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by label or time (e.g. 08:00 AM)..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200/80 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
          />
        </div>

        {/* Filter Dropdowns & Create Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 px-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          {/* Capacity Filter */}
          <select
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value as any)}
            className="h-9 px-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs"
          >
            <option value="ALL">All Capacities</option>
            <option value="GLOBAL">Global Capacity</option>
            <option value="CUSTOM">Custom Override</option>
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
            <span>Create Time Slot</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3.5 w-16 text-center">Order</th>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4">Slot Display Label</th>
                <th className="py-3 px-4">Capacity Rule</th>
                <th className="py-3 px-4 text-center">Effective Capacity</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading && slots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-500 mb-2" />
                    <span>Loading master time slots...</span>
                  </td>
                </tr>
              ) : filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">No Time Slots Found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchTerm || statusFilter !== 'ALL' || capacityFilter !== 'ALL'
                        ? 'Try clearing your search or filter filters.'
                        : 'Click "Create Time Slot" above to add your first master booking window.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSlots.map((slot) => {
                  const slotId = slot._id || slot.id || '';
                  const effectiveCap = slot.useGlobalCapacity ? globalCapacity : (slot.capacity ?? globalCapacity);
                  const isToggling = togglingId === slotId;

                  return (
                    <tr key={slotId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order */}
                      <td className="py-3 px-3.5 text-center font-bold text-slate-800">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 inline-flex items-center justify-center text-xs">
                          {slot.displayOrder || 1}
                        </span>
                      </td>

                      {/* Time Window */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 font-mono text-[11.5px]">
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </div>
                      </td>

                      {/* Label */}
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {slot.label}
                      </td>

                      {/* Capacity Setting Rule */}
                      <td className="py-3 px-4">
                        {slot.useGlobalCapacity ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                            <Layers className="w-3 h-3 text-blue-500" /> Global ({globalCapacity})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
                            <Layers className="w-3 h-3 text-purple-500" /> Custom ({slot.capacity})
                          </span>
                        )}
                      </td>

                      {/* Effective Capacity */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full">
                          {effectiveCap} Cars
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(slot)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            slot.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {slot.active ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{slot.active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenEdit(slot)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Slot"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSlotToDelete(slot)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Soft Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total Master Slots: <strong className="text-slate-800">{filteredSlots.length}</strong></span>
          <span className="text-[11px]">Active Bookable Slots: <strong className="text-emerald-700">{filteredSlots.filter(s => s.active).length}</strong></span>
        </div>
      </div>

      {/* Confirmation Modal for Soft Delete */}
      <ConfirmationModal
        isOpen={!!slotToDelete}
        title="Delete Master Time Slot"
        message={`Are you sure you want to delete slot "${slotToDelete?.label}" (${slotToDelete?.startTime} - ${slotToDelete?.endTime})? This is a safe soft-delete that deactivates future bookings without corrupting historical orders.`}
        confirmText="Delete Slot"
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSlotToDelete(null)}
      />
    </div>
  );
}
