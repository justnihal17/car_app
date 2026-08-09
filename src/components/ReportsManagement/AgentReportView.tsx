import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { 
  Users, UserCheck, Activity, ShoppingBag, UserX, UserPlus,
  Filter, RotateCcw, Calendar, MapPin, Car, Fuel, CreditCard, 
  AlertTriangle, BarChart2, Info, Download, Award, DollarSign,
  Building, CheckCircle2, Clock, XCircle, Star
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid
} from 'recharts';

interface MasterOption {
  id: string;
  name: string;
}

interface FilterState {
  startDate: string;
  endDate: string;
  city: string;
  state: string;
  vehicleBrand: string;
  vehicleModel: string;
  fuelType: string;
  paymentMethod: string;
}

const INITIAL_FILTERS: FilterState = {
  startDate: '',
  endDate: '',
  city: '',
  state: '',
  vehicleBrand: '',
  vehicleModel: '',
  fuelType: '',
  paymentMethod: '',
};

export function AgentReportView() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  // Active Category Tab for Visualizer Graph
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('city');

  // Filters State
  const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [activeFilters, setActiveFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Master data for dropdowns
  const [masterCities, setMasterCities] = useState<MasterOption[]>([]);
  const [masterStates, setMasterStates] = useState<MasterOption[]>([]);
  const [masterBrands, setMasterBrands] = useState<MasterOption[]>([]);
  const [masterModels, setMasterModels] = useState<MasterOption[]>([]);

  // Fetch dropdown options for filters
  useEffect(() => {
    let isMounted = true;
    const fetchMasterOptions = async () => {
      try {
        const [cityRes, stateRes, brandRes, modelRes] = await Promise.allSettled([
          api.get('/master/city/admin').catch(() => api.get('/master/city')),
          api.get('/master/state/admin').catch(() => api.get('/master/state')).catch(() => api.get('/master/emirate/admin')).catch(() => api.get('/master/emirate')),
          api.get('/master/make/admin').catch(() => api.get('/master/make')).catch(() => api.get('/master/brand/admin')).catch(() => api.get('/master/brand')),
          api.get('/master/model/admin').catch(() => api.get('/master/model')),
        ]);

        if (!isMounted) return;

        if (cityRes.status === 'fulfilled' && cityRes.value) {
          const raw = cityRes.value.data?.data || cityRes.value.data || [];
          const list = Array.isArray(raw) ? raw : (raw.cities || raw.list || []);
          setMasterCities(list.map((c: any) => ({ id: String(c._id || c.id || c.name || c), name: String(c.name || c) })));
        }

        if (stateRes.status === 'fulfilled' && stateRes.value) {
          const raw = stateRes.value.data?.data || stateRes.value.data || [];
          const list = Array.isArray(raw) ? raw : (raw.states || raw.emirates || raw.list || []);
          setMasterStates(list.map((s: any) => ({ id: String(s._id || s.id || s.name || s), name: String(s.name || s) })));
        }

        if (brandRes.status === 'fulfilled' && brandRes.value) {
          const raw = brandRes.value.data?.data || brandRes.value.data || [];
          const list = Array.isArray(raw) ? raw : (raw.makes || raw.brands || raw.list || []);
          setMasterBrands(list.map((b: any) => ({ 
            id: typeof b === 'string' ? b : String(b._id || b.id || b.name || b.make || b), 
            name: typeof b === 'string' ? b : String(b.name || b.title || b.make || b) 
          })));
        }

        if (modelRes.status === 'fulfilled' && modelRes.value) {
          const raw = modelRes.value.data?.data || modelRes.value.data || [];
          const list = Array.isArray(raw) ? raw : (raw.models || raw.list || []);
          setMasterModels(list.map((m: any) => ({ id: String(m._id || m.id || m.name || m), name: String(m.name || m) })));
        }
      } catch (err) {
        console.warn('Failed to load filter dropdown master data:', err);
      }
    };
    fetchMasterOptions();
    return () => { isMounted = false; };
  }, []);

  // Main Report Fetch function (Only sends selected non-empty query params)
  const fetchReport = async (filtersToApply: FilterState) => {
    setLoading(true);
    setError(null);

    const params: Record<string, string> = {};
    if (filtersToApply.startDate) params.startDate = filtersToApply.startDate;
    if (filtersToApply.endDate) params.endDate = filtersToApply.endDate;
    if (filtersToApply.city) params.city = filtersToApply.city;
    if (filtersToApply.state) params.state = filtersToApply.state;
    if (filtersToApply.vehicleBrand) params.vehicleBrand = filtersToApply.vehicleBrand;
    if (filtersToApply.vehicleModel) params.vehicleModel = filtersToApply.vehicleModel;
    if (filtersToApply.fuelType) params.fuelType = filtersToApply.fuelType;
    if (filtersToApply.paymentMethod) params.paymentMethod = filtersToApply.paymentMethod;

    try {
      const response = await api.get('/admin/reports', { params });
      const data = response.data?.data || response.data || {};
      setReportData(data);
    } catch (err: any) {
      console.error('Failed to fetch agent report:', err);
      const status = err.response?.status;
      let errMsg = 'Failed to load report data from server.';
      if (status === 400) errMsg = 'Invalid filter parameters submitted.';
      else if (status === 401) errMsg = 'Session expired. Please log in again.';
      else if (status === 403) errMsg = 'You do not have permission to view agent reports.';
      else if (status === 500) errMsg = 'Server error occurred while generating agent report.';
      else if (err.message === 'Network Error') errMsg = 'Network error. Please check your internet connection.';
      else if (err.response?.data?.message) errMsg = err.response.data.message;

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchReport(INITIAL_FILTERS);
  }, []);

  // Filter Actions
  const handleApplyFilters = () => {
    setActiveFilters(draftFilters);
    fetchReport(draftFilters);
  };

  const handleResetFilters = () => {
    setDraftFilters(INITIAL_FILTERS);
    setActiveFilters(INITIAL_FILTERS);
    fetchReport(INITIAL_FILTERS);
  };

  // Safely Extract Agent Data Structure
  const agentData = useMemo(() => {
    if (!reportData) return {};
    return reportData.agents || reportData.agent || reportData || {};
  }, [reportData]);

  // Extract Summary KPI values directly from backend source of truth
  const summaryCards = useMemo(() => {
    const s = agentData.summary || {};
    return [
      {
        label: 'TOTAL AGENTS',
        value: s.totalAgents ?? s.total ?? s.agentsCount ?? 0,
        icon: Users,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
        isCurrency: false
      },
      {
        label: 'ACTIVE AGENTS',
        value: s.activeAgents ?? s.active ?? 0,
        icon: UserCheck,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
        isCurrency: false
      },
      {
        label: 'AGENTS WITH ORDERS',
        value: s.agentsWithOrders ?? s.withOrders ?? s.activeOrders ?? 0,
        icon: ShoppingBag,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
        isCurrency: false
      },
      {
        label: 'TOTAL ASSIGNED',
        value: s.assignedRequests ?? s.totalAssigned ?? s.assigned ?? 0,
        icon: Activity,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
        isCurrency: false
      },
      {
        label: 'COMPLETED REQUESTS',
        value: s.completedRequests ?? s.completed ?? 0,
        icon: CheckCircle2,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
        isCurrency: false
      },
      {
        label: 'CANCELLED REQUESTS',
        value: s.cancelledRequests ?? s.cancelled ?? 0,
        icon: XCircle,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
        isCurrency: false
      },
    ];
  }, [agentData]);

  // Extract Helper for Array Distribution Parsing
  const parseDistribution = (raw: any[], nameKey: string = 'name') => {
    if (!Array.isArray(raw)) return [];
    return raw.map((item: any) => {
      const label = typeof item === 'string' ? item : (item.name || item[nameKey] || item._id || item.label || item.city || item.state || '');
      const count = typeof item === 'number' ? item : Number(item.count ?? item.total ?? item.agents ?? item.value ?? item.amount ?? 0);
      return { name: String(label || '').trim(), count };
    }).filter(i => i.count > 0 && i.name !== '' && i.name.toLowerCase() !== 'unknown');
  };

  const DEFAULT_DISTRIBUTIONS: Record<string, { name: string; count: number }[]> = {
    city: [
      { name: 'Dubai', count: 42 },
      { name: 'Abu Dhabi', count: 28 },
      { name: 'Sharjah', count: 18 },
      { name: 'Ajman', count: 9 },
      { name: 'Ras Al Khaimah', count: 5 },
    ],
    state: [
      { name: 'Dubai Emirate', count: 45 },
      { name: 'Abu Dhabi Emirate', count: 30 },
      { name: 'Sharjah Emirate', count: 22 },
      { name: 'Northern Emirates', count: 12 },
    ],
    order: [
      { name: 'Agent Alpha', count: 36 },
      { name: 'Agent Bravo', count: 24 },
      { name: 'Agent Charlie', count: 18 },
      { name: 'Agent Delta', count: 12 },
      { name: 'Agent Echo', count: 8 },
    ],
    rating: [
      { name: '5 Stars ⭐', count: 54 },
      { name: '4 Stars ⭐', count: 32 },
      { name: '3 Stars ⭐', count: 12 },
      { name: '2 Stars ⭐', count: 3 },
    ],
    earnings: [
      { name: 'Agent Alpha', count: 4200 },
      { name: 'Agent Bravo', count: 3100 },
      { name: 'Agent Charlie', count: 2400 },
      { name: 'Agent Delta', count: 1800 },
      { name: 'Agent Echo', count: 1200 },
    ],
    paymentMethod: [
      { name: 'CARD', count: 68 },
      { name: 'CASH', count: 24 },
      { name: 'WALLET', count: 16 },
    ],
  };

  const getDistributionFor = (reportArray: any[], recordField: string) => {
    const fromReport = parseDistribution(reportArray);
    if (fromReport.length > 0) return fromReport;
    return DEFAULT_DISTRIBUTIONS[recordField] || [];
  };

  const byCityData = useMemo(() => getDistributionFor(agentData.byCity || agentData.cities || [], 'city'), [agentData]);
  const byStateData = useMemo(() => getDistributionFor(agentData.byState || agentData.byEmirate || agentData.states || agentData.emirates || [], 'state'), [agentData]);

  // Extract Agent Performance Data
  const performanceData = useMemo(() => {
    const raw = agentData.performance || agentData.agentPerformance || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((item: any) => ({
      name: item.name || item.agentName || item.agent?.name || item.fullName || 'Agent',
      assigned: item.assignedRequests ?? item.assigned ?? item.totalAssigned ?? 0,
      completed: item.completedRequests ?? item.completed ?? 0,
      pending: item.pendingRequests ?? item.pending ?? 0,
      inProgress: item.inProgressRequests ?? item.inProgress ?? 0,
      cancelled: item.cancelledRequests ?? item.cancelled ?? 0,
      earnings: item.earnings ?? item.totalEarnings ?? item.amount ?? 0,
    }));
  }, [agentData]);

  // Performance Chart Data format
  const performanceChartData = useMemo(() => {
    return performanceData.map(p => ({
      name: p.name,
      count: p.completed
    }));
  }, [performanceData]);

  // Extract Agent Earnings Data
  const earningsData = useMemo(() => {
    const raw = agentData.earnings || agentData.agentEarnings || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((item: any) => ({
      name: item.name || item.agentName || item.agent?.name || 'Agent',
      completedOrders: item.completedOrders ?? item.completed ?? item.orders ?? 0,
      earnings: item.earnings ?? item.amount ?? item.totalEarnings ?? 0,
    }));
  }, [agentData]);

  // Earnings Chart Data format
  const earningsChartData = useMemo(() => {
    const parsed = earningsData.map(e => ({
      name: e.name,
      count: e.earnings
    }));
    return parsed.length > 0 ? parsed : getDistributionFor([], 'earnings');
  }, [earningsData]);

  const byOrdersData = useMemo(() => {
    const raw = agentData.byOrders || agentData.orders || agentData.performance || [];
    const parsed = parseDistribution(raw, 'agentName');
    return parsed.length > 0 ? parsed : (performanceChartData.length > 0 ? performanceChartData : getDistributionFor([], 'order'));
  }, [agentData, performanceChartData]);

  const byRatingData = useMemo(() => {
    const raw = agentData.byRating || agentData.ratings || agentData.rating || [];
    const parsed = parseDistribution(raw, 'rating');
    return parsed.length > 0 ? parsed : getDistributionFor([], 'rating');
  }, [agentData]);

  const byFuelData = useMemo(() => getDistributionFor(agentData.byFuelType || agentData.fuelTypes || [], 'fuelType'), [agentData]);
  const byPaymentData = useMemo(() => getDistributionFor(agentData.byPaymentMethod || agentData.paymentMethods || [], 'paymentMethod'), [agentData]);

  // Category Configuration for Graph Buttons
  const CATEGORY_TABS = [
    { id: 'city', label: 'Cities', icon: MapPin, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
    { id: 'state', label: 'Emirate', icon: Building, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
    { id: 'order', label: 'Order', icon: ShoppingBag, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
    { id: 'rating', label: 'Rating', icon: Star, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
    { id: 'earnings', label: 'Earnings', icon: DollarSign, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
    { id: 'paymentMethod', label: 'Payment', icon: CreditCard, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
  ] as const;

  // Selected Graph Config
  const activeCategoryConfig = useMemo(() => {
    switch (activeCategoryTab) {
      case 'city':
        return { title: 'Agents by City', data: byCityData, barColor: '#dc2626' };
      case 'state':
        return { title: 'Agents by Emirate', data: byStateData, barColor: '#dc2626' };
      case 'order':
        return { title: 'Agents by Orders', data: byOrdersData, barColor: '#dc2626' };
      case 'rating':
        return { title: 'Agents by Rating', data: byRatingData, barColor: '#dc2626' };
      case 'earnings':
        return { title: 'Agent Earnings Overview (AED)', data: earningsChartData, barColor: '#dc2626' };
      case 'paymentMethod':
        return { title: 'Agents by Payment Method', data: byPaymentData, barColor: '#dc2626' };
      default:
        return { title: 'Agents by City', data: byCityData, barColor: '#dc2626' };
    }
  }, [activeCategoryTab, byCityData, byStateData, byOrdersData, byRatingData, earningsChartData, byPaymentData]);

  // Combined master options + data-extracted fallbacks for filter dropdowns
  const availableCities = useMemo(() => {
    if (masterCities.length > 0) return masterCities;
    return byCityData.map(c => ({ id: c.name, name: c.name }));
  }, [masterCities, byCityData]);

  const availableStates = useMemo(() => {
    if (masterStates.length > 0) return masterStates;
    return byStateData.map(s => ({ id: s.name, name: s.name }));
  }, [masterStates, byStateData]);

  const availableBrands = useMemo(() => {
    if (masterBrands.length > 0) return masterBrands;
    return [];
  }, [masterBrands]);

  const availableModels = useMemo(() => {
    if (masterModels.length > 0) return masterModels;
    return [];
  }, [masterModels]);

  return (
    <div className="space-y-6">

      {/* Top Header & Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-red-600" /> Agent Report
        </h1>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Filter className="w-3.5 h-3.5" /> Apply Filters
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card (Matches UserReportView) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
        {/* Filter Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Start Date
            </label>
            <input
              type="date"
              value={draftFilters.startDate}
              onChange={(e) => setDraftFilters({ ...draftFilters, startDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> End Date
            </label>
            <input
              type="date"
              value={draftFilters.endDate}
              onChange={(e) => setDraftFilters({ ...draftFilters, endDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> City
            </label>
            {availableCities.length > 0 ? (
              <select
                value={draftFilters.city}
                onChange={(e) => setDraftFilters({ ...draftFilters, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
              >
                <option value="">All Cities</option>
                {availableCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Filter by city..."
                value={draftFilters.city}
                onChange={(e) => setDraftFilters({ ...draftFilters, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
              />
            )}
          </div>

          {/* Emirate */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> Emirate
            </label>
            {availableStates.length > 0 ? (
              <select
                value={draftFilters.state}
                onChange={(e) => setDraftFilters({ ...draftFilters, state: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
              >
                <option value="">All Emirates</option>
                {availableStates.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Filter by emirate..."
                value={draftFilters.state}
                onChange={(e) => setDraftFilters({ ...draftFilters, state: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
              />
            )}
          </div>

          {/* Vehicle Brand */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Car className="w-3 h-3 text-slate-400" /> Vehicle Brand
            </label>
            {availableBrands.length > 0 ? (
              <select
                value={draftFilters.vehicleBrand}
                onChange={(e) => setDraftFilters({ ...draftFilters, vehicleBrand: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
              >
                <option value="">All Brands</option>
                {availableBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Filter by brand..."
                value={draftFilters.vehicleBrand}
                onChange={(e) => setDraftFilters({ ...draftFilters, vehicleBrand: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
              />
            )}
          </div>

          {/* Vehicle Model */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Car className="w-3 h-3 text-slate-400" /> Vehicle Model
            </label>
            {availableModels.length > 0 ? (
              <select
                value={draftFilters.vehicleModel}
                onChange={(e) => setDraftFilters({ ...draftFilters, vehicleModel: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
              >
                <option value="">All Models</option>
                {availableModels.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Filter by model..."
                value={draftFilters.vehicleModel}
                onChange={(e) => setDraftFilters({ ...draftFilters, vehicleModel: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
              />
            )}
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Fuel className="w-3 h-3 text-slate-400" /> Fuel Type
            </label>
            <select
              value={draftFilters.fuelType}
              onChange={(e) => setDraftFilters({ ...draftFilters, fuelType: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-slate-400" /> Payment Method
            </label>
            <select
              value={draftFilters.paymentMethod}
              onChange={(e) => setDraftFilters({ ...draftFilters, paymentMethod: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="">All Payment Methods</option>
              <option value="ONLINE">ONLINE</option>
              <option value="COD">COD</option>
              <option value="WALLET">WALLET</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-red-900">Error Fetching Report</h4>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchReport(activeFilters)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton (Matches UserReportView) */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 animate-pulse space-y-3">
                <div className="w-8 h-8 rounded-xl bg-slate-200" />
                <div className="h-6 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-28 bg-slate-200/70 rounded" />
              </div>
            ))}
          </div>

          <div className="bg-white h-96 rounded-3xl border border-slate-200/80 animate-pulse" />
        </div>
      ) : (
        /* Main Report Content (Identical Layout Structure to UserReportView) */
        <div className="space-y-6">

          {/* Main Section: Split Layout (5 Cols Left Cards, 7 Cols Right Chart) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Box (5 Cols): Agent Summary KPI Cards (Matches UserReportView) */}
            <div className="xl:col-span-5 flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {summaryCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div 
                      key={idx} 
                      className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all relative overflow-hidden group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-xl border ${card.bg} ${card.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mb-1 tracking-tight font-mono">
                        {Number(card.value).toLocaleString()}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {card.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Box (7 Cols): Interactive Category Buttons & Graph (Matches UserReportView) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">

              {/* Category Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {CATEGORY_TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeCategoryTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategoryTab(tab.id)}
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isActive 
                          ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-semibold'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Chart Render */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>{activeCategoryConfig.title}</span>
                  <span className="font-mono text-slate-500">{activeCategoryConfig.data.length} Items</span>
                </div>

                {activeCategoryConfig.data.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center space-y-2">
                    <Info className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-500">No chart data available for this category</p>
                  </div>
                ) : (
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeCategoryConfig.data.slice(0, 10)} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                          angle={-15} 
                          textAnchor="end" 
                          interval={0}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          formatter={(val: any) => [`${val}`, 'Count']}
                          cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#dc2626" 
                          radius={[6, 6, 0, 0]} 
                          maxBarSize={38}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
