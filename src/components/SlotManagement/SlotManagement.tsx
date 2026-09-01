import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, Layers, Calendar, ShieldAlert, Settings, Plus, 
  RefreshCw, CheckCircle2, AlertCircle, Edit3, ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { MasterSlot, SlotSettings, BlockedDate } from './types/slot.types';
import { SlotsListTab } from './components/SlotsListTab';
import { BlockedDatesTab } from './components/BlockedDatesTab';
import { GlobalSettingsView } from './components/GlobalSettingsView';
import { SlotModal } from './components/SlotModal';
import { BlockedDateModal } from './components/BlockedDateModal';
import { QuickCapacityModal } from './components/QuickCapacityModal';
import { StatsShimmer } from '../shimmer/ShimmerLoader';

const DAYS_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function SlotManagement() {
  const [activeTab, setActiveTab] = useState<'SLOTS' | 'HOLIDAYS' | 'SETTINGS'>('SLOTS');

  // Core Data States
  const [settings, setSettings] = useState<SlotSettings>({
    globalCapacity: 4,
    weeklyOffDays: [5],
    slotBufferMinutes: 30,
    maxAdvanceDays: 60,
  });
  const [slots, setSlots] = useState<MasterSlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedSlotForEdit, setSelectedSlotForEdit] = useState<MasterSlot | null>(null);
  const [isBlockedDateModalOpen, setIsBlockedDateModalOpen] = useState(false);
  const [isQuickCapacityModalOpen, setIsQuickCapacityModalOpen] = useState(false);

  // Data Fetchers
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, slotsRes, blockedRes] = await Promise.allSettled([
        api.get('/admin/slots/settings'),
        api.get('/admin/slots', { params: { includeInactive: true } }),
        api.get('/admin/blocked-dates'),
      ]);

      // Settings
      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        const raw = settingsRes.value.data?.data || settingsRes.value.data || {};
        setSettings({
          globalCapacity: raw.globalCapacity ?? 4,
          weeklyOffDays: raw.weeklyOffDays ?? [5],
          slotBufferMinutes: raw.slotBufferMinutes ?? 30,
          maxAdvanceDays: raw.maxAdvanceDays ?? 60,
          active: raw.active ?? true,
        });
      }

      // Slots
      if (slotsRes.status === 'fulfilled' && slotsRes.value) {
        const raw = slotsRes.value.data?.data || slotsRes.value.data || [];
        const slotList = Array.isArray(raw) ? raw : (raw.slots || []);
        setSlots(slotList.filter((s: MasterSlot) => !s.deleted));
        if (raw.globalCapacity) {
          setSettings((prev) => ({ ...prev, globalCapacity: raw.globalCapacity }));
        }
      }

      // Blocked Dates
      if (blockedRes.status === 'fulfilled' && blockedRes.value) {
        const raw = blockedRes.value.data?.data || blockedRes.value.data || [];
        const list = Array.isArray(raw) ? raw : (raw.blockedDates || raw.dates || []);
        setBlockedDates(list);
      }
    } catch (err: any) {
      console.error('Failed to fetch slot management data:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load slot data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Derived Top Stat Values
  const activeSlotsCount = slots.filter((s) => s.active).length;
  const offDaysFormatted =
    settings.weeklyOffDays.length === 0
      ? '7 Days Open'
      : settings.weeklyOffDays.map((d) => DAYS_NAME[d] || `Day ${d}`).join(', ');

  const handleOpenCreateSlot = () => {
    setSelectedSlotForEdit(null);
    setIsSlotModalOpen(true);
  };

  const handleOpenEditSlot = (slot: MasterSlot) => {
    setSelectedSlotForEdit(slot);
    setIsSlotModalOpen(true);
  };

  return (
    <div className="p-3.5 sm:p-4 lg:p-5 space-y-4 w-full bg-slate-50/60 min-h-screen animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            <span>Operations & Scheduling</span>
            <span>/</span>
            <span className="text-red-600 font-semibold">Time Slots & Capacity</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            Time Slot & Capacity Management
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            className="flex items-center gap-1.5 px-3 py-1.5 h-8.5 rounded-lg bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {activeTab === 'SLOTS' && (
            <button
              onClick={handleOpenCreateSlot}
              className="flex items-center gap-1.5 px-3.5 py-1.5 h-8.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Time Slot</span>
            </button>
          )}

          {activeTab === 'HOLIDAYS' && (
            <button
              onClick={() => setIsBlockedDateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 h-8.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Block Date</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Global Capacity */}
        <div 
          onClick={() => setIsQuickCapacityModalOpen(true)}
          className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between min-h-[76px] cursor-pointer group"
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase truncate leading-none">
              Global Default Capacity
            </span>
            <div className="p-1.5 border border-slate-100/90 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors shrink-0">
              <Layers className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>
          <div className="flex justify-between items-baseline w-full mt-2 gap-1.5">
            <span className="text-xl sm:text-[22px] font-semibold text-slate-800 tracking-tight leading-none">
              {settings.globalCapacity} <span className="text-xs font-normal text-slate-400">Cars / Slot</span>
            </span>
            <span className="text-[8.5px] font-medium text-slate-400 tracking-wider uppercase flex items-center gap-1 group-hover:text-slate-700 transition-colors">
              <Edit3 className="w-2.5 h-2.5" /> Edit
            </span>
          </div>
        </div>

        {/* Card 2: Active Master Slots */}
        <div 
          onClick={() => setActiveTab('SLOTS')}
          className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between min-h-[76px] cursor-pointer group"
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase truncate leading-none">
              Active Master Slots
            </span>
            <div className="p-1.5 border border-slate-100/90 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>
          <div className="flex justify-between items-baseline w-full mt-2 gap-1.5">
            <span className="text-xl sm:text-[22px] font-semibold text-slate-800 tracking-tight leading-none">
              {activeSlotsCount}{' '}
              <span className="text-xs font-normal text-slate-400">/ {slots.length} Total</span>
            </span>
            <span className="text-[8.5px] font-medium text-slate-400 tracking-wider uppercase">
              Bookable
            </span>
          </div>
        </div>

        {/* Card 3: Weekly Closures */}
        <div 
          onClick={() => setActiveTab('SETTINGS')}
          className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between min-h-[76px] cursor-pointer group"
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase truncate leading-none">
              Weekly Closures
            </span>
            <div className="p-1.5 border border-slate-100/90 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>
          <div className="flex justify-between items-baseline w-full mt-2 gap-1.5">
            <span className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight leading-none truncate" title={offDaysFormatted}>
              {settings.weeklyOffDays.length === 0 ? '7 Days Open' : `Every ${offDaysFormatted}`}
            </span>
            <span className="text-[8.5px] font-medium text-slate-400 tracking-wider uppercase">
              Schedule
            </span>
          </div>
        </div>

        {/* Card 4: Blocked Holiday Dates */}
        <div 
          onClick={() => setActiveTab('HOLIDAYS')}
          className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between min-h-[76px] cursor-pointer group"
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase truncate leading-none">
              Blocked Dates
            </span>
            <div className="p-1.5 border border-slate-100/90 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>
          <div className="flex justify-between items-baseline w-full mt-2 gap-1.5">
            <span className="text-xl sm:text-[22px] font-semibold text-slate-800 tracking-tight leading-none">
              {blockedDates.length} <span className="text-xs font-normal text-slate-400">Dates</span>
            </span>
            <span className="text-[8.5px] font-medium text-slate-400 tracking-wider uppercase">
              Blackout
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/90 pb-2">
        <button
          onClick={() => setActiveTab('SLOTS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'SLOTS'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/90'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Master Time Slots ({slots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HOLIDAYS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'HOLIDAYS'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/90'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Holiday & Blocked Dates ({blockedDates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'SETTINGS'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/90'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Global Capacity & Rules</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchAllData}
            className="px-3 py-1 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tab Content Area */}
      {loading && slots.length === 0 ? (
        <StatsShimmer />
      ) : (
        <>
          {activeTab === 'SLOTS' && (
            <SlotsListTab
              slots={slots}
              globalCapacity={settings.globalCapacity}
              loading={loading}
              onRefresh={fetchAllData}
              onOpenCreate={handleOpenCreateSlot}
              onOpenEdit={handleOpenEditSlot}
            />
          )}

          {activeTab === 'HOLIDAYS' && (
            <BlockedDatesTab
              blockedDates={blockedDates}
              loading={loading}
              onRefresh={fetchAllData}
              onOpenCreate={() => setIsBlockedDateModalOpen(true)}
            />
          )}

          {activeTab === 'SETTINGS' && (
            <GlobalSettingsView
              settings={settings}
              onUpdate={(updated) => {
                setSettings(updated);
                fetchAllData();
              }}
            />
          )}
        </>
      )}

      {/* Slot Modal (Create & Edit) */}
      {isSlotModalOpen && (
        <SlotModal
          slot={selectedSlotForEdit}
          globalCapacity={settings.globalCapacity}
          onClose={() => {
            setIsSlotModalOpen(false);
            setSelectedSlotForEdit(null);
          }}
          onSuccess={fetchAllData}
        />
      )}

      {/* Blocked Date Modal */}
      {isBlockedDateModalOpen && (
        <BlockedDateModal
          onClose={() => setIsBlockedDateModalOpen(false)}
          onSuccess={fetchAllData}
        />
      )}

      {/* Quick Capacity Modal */}
      {isQuickCapacityModalOpen && (
        <QuickCapacityModal
          settings={settings}
          onClose={() => setIsQuickCapacityModalOpen(false)}
          onSuccess={(updated) => {
            setSettings(updated);
            fetchAllData();
          }}
        />
      )}
    </div>
  );
}

export default SlotManagement;
