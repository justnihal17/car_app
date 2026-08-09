import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { 
  Users, UserPlus, UserCheck, Activity, ShoppingBag, UserX, 
  Filter, RotateCcw, Calendar, MapPin, Car, Fuel, CreditCard, 
  AlertTriangle, RefreshCw, BarChart2, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend 
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

const CHART_COLORS = [
  '#dc2626', '#10b981', '#2563eb', '#9333ea', '#f59e0b', 
  '#0891b2', '#db2777', '#4f46e5', '#0d9488', '#ea580c'
];

export function UserReportView() {
  const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [activeFilters, setActiveFilters] = useState<FilterState>(INITIAL_FILTERS);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  // Master data for dropdowns
  const [masterCities, setMasterCities] = useState<MasterOption[]>([]);
  const [masterStates, setMasterStates] = useState<MasterOption[]>([]);
  const [masterBrands, setMasterBrands] = useState<MasterOption[]>([]);
  const [masterModels, setMasterModels] = useState<MasterOption[]>([]);

  // Show all toggle states for tables
  const [showAllCity, setShowAllCity] = useState<boolean>(false);
  const [showAllState, setShowAllState] = useState<boolean>(false);
  const [showAllBrand, setShowAllBrand] = useState<boolean>(false);
  const [showAllModel, setShowAllModel] = useState<boolean>(false);

  // Fetch dropdown options for filters
  useEffect(() => {
    let isMounted = true;
    const fetchMasterOptions = async () => {
      try {
        const [cityRes, stateRes, brandRes, modelRes] = await Promise.allSettled([
          api.get('/master/city/admin').catch(() => api.get('/master/city')),
          api.get('/master/state/admin').catch(() => api.get('/master/state')),
          api.get('/master/brand/admin').catch(() => api.get('/master/brand')),
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
          const list = Array.isArray(raw) ? raw : (raw.brands || raw.list || []);
          setMasterBrands(list.map((b: any) => ({ id: String(b._id || b.id || b.name || b), name: String(b.name || b) })));
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

  // Fetch report data function
  const fetchReport = async (filtersToApply: FilterState) => {
    setLoading(true);
    setError(null);

    // Build clean params (exclude empty strings/undefined)
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
      console.error('Failed to fetch user report:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to load report data from server.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchReport(INITIAL_FILTERS);
  }, []);

  // Filter actions
  const handleApplyFilters = () => {
    setActiveFilters(draftFilters);
    fetchReport(draftFilters);
  };

  const handleResetFilters = () => {
    setDraftFilters(INITIAL_FILTERS);
    setActiveFilters(INITIAL_FILTERS);
    fetchReport(INITIAL_FILTERS);
  };

  // Safely extract customer summary data
  const customerData = reportData?.customers || reportData?.customerData || {};
  const summary = customerData?.summary || customerData?.overview || {};

  const summaryCards = [
    { 
      label: 'Total Customers', 
      value: summary.totalCustomers ?? summary.total ?? summary.totalCount ?? 0, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 border-blue-200/60' 
    },
    { 
      label: 'New Customers', 
      value: summary.newCustomers ?? summary.new ?? 0, 
      icon: UserPlus, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 border-emerald-200/60' 
    },
    { 
      label: 'Returning Customers', 
      value: summary.returningCustomers ?? summary.returning ?? 0, 
      icon: UserCheck, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50 border-purple-200/60' 
    },
    { 
      label: 'Active Customers', 
      value: summary.activeCustomers ?? summary.active ?? 0, 
      icon: Activity, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 border-amber-200/60' 
    },
    { 
      label: 'Customers With Orders', 
      value: summary.customersWithOrders ?? summary.withOrders ?? summary.orderedCustomers ?? 0, 
      icon: ShoppingBag, 
      color: 'text-red-600', 
      bg: 'bg-red-50 border-red-200/60' 
    },
    { 
      label: 'Customers Without Orders', 
      value: summary.customersWithoutOrders ?? summary.withoutOrders ?? summary.nonOrderedCustomers ?? 0, 
      icon: UserX, 
      color: 'text-slate-600', 
      bg: 'bg-slate-100 border-slate-200/60' 
    },
  ];

  // Distribution helper extractors
  const parseDistribution = (rawList: any, nameKey: string = 'name') => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((item: any, idx: number) => {
      const label = typeof item === 'string' ? item : (item.name || item[nameKey] || item._id || item.label || item.city || item.state || item.brand || item.model || item.type || '');
      const count = typeof item === 'number' ? item : Number(item.count ?? item.total ?? item.value ?? item.amount ?? 0);
      return { name: String(label || '').trim(), count };
    }).filter(i => i.count > 0 && i.name !== '' && i.name.toLowerCase() !== 'unknown');
  };

  const byCityData = useMemo(() => parseDistribution(customerData.byCity || customerData.cities, 'city'), [customerData]);
  const byStateData = useMemo(() => parseDistribution(customerData.byState || customerData.byEmirate || customerData.states || customerData.emirates, 'state'), [customerData]);
  const byBrandData = useMemo(() => parseDistribution(customerData.byVehicleBrand || customerData.byBrand || customerData.brands, 'brand'), [customerData]);
  const byModelData = useMemo(() => parseDistribution(customerData.byVehicleModel || customerData.byModel || customerData.models, 'model'), [customerData]);
  const byFuelData = useMemo(() => parseDistribution(customerData.byFuelType || customerData.fuelTypes, 'fuelType'), [customerData]);

  // Total counts for percentages calculation
  const totalCityCount = useMemo(() => byCityData.reduce((acc, curr) => acc + curr.count, 0) || 1, [byCityData]);
  const totalStateCount = useMemo(() => byStateData.reduce((acc, curr) => acc + curr.count, 0) || 1, [byStateData]);
  const totalBrandCount = useMemo(() => byBrandData.reduce((acc, curr) => acc + curr.count, 0) || 1, [byBrandData]);
  const totalModelCount = useMemo(() => byModelData.reduce((acc, curr) => acc + curr.count, 0) || 1, [byModelData]);
  const totalFuelCount = useMemo(() => byFuelData.reduce((acc, curr) => acc + curr.count, 0) || 1, [byFuelData]);

  const hasData = useMemo(() => {
    if (!reportData) return false;
    return (
      summaryCards.some(c => c.value > 0) ||
      byCityData.length > 0 ||
      byStateData.length > 0 ||
      byBrandData.length > 0 ||
      byModelData.length > 0 ||
      byFuelData.length > 0
    );
  }, [reportData, summaryCards, byCityData, byStateData, byBrandData, byModelData, byFuelData]);

  return (
    <div className="space-y-6">

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Filter className="w-4 h-4 text-red-600" /> Filter Criteria
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />} Apply Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {/* Date From */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Date From
            </label>
            <input
              type="date"
              value={draftFilters.startDate}
              onChange={(e) => setDraftFilters({ ...draftFilters, startDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Date To
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
            {masterCities.length > 0 ? (
              <select
                value={draftFilters.city}
                onChange={(e) => setDraftFilters({ ...draftFilters, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="">All Cities</option>
                {masterCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
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

          {/* State / Emirate */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> State / Emirate
            </label>
            {masterStates.length > 0 ? (
              <select
                value={draftFilters.state}
                onChange={(e) => setDraftFilters({ ...draftFilters, state: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="">All States / Emirates</option>
                {masterStates.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Filter by state..."
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
            {masterBrands.length > 0 ? (
              <select
                value={draftFilters.vehicleBrand}
                onChange={(e) => setDraftFilters({ ...draftFilters, vehicleBrand: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="">All Brands</option>
                {masterBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
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
            {masterModels.length > 0 ? (
              <select
                value={draftFilters.vehicleModel}
                onChange={(e) => setDraftFilters({ ...draftFilters, vehicleModel: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="">All Models</option>
                {masterModels.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
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

      {/* Loading Skeleton */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white h-80 rounded-3xl border border-slate-200/80 animate-pulse" />
            <div className="bg-white h-80 rounded-3xl border border-slate-200/80 animate-pulse" />
          </div>
        </div>
      ) : !hasData ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <Info className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Customer Data Available</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              No customer data available for the selected filters. Try adjusting your dates or resetting filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Main Report Content */
        <div className="space-y-6">
          {/* Section 1: Customer Overview KPI Cards */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" /> Customer Overview Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {summaryCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div 
                    key={idx} 
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl border ${card.bg} ${card.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
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

          {/* Section 2: Customer Distribution Charts & Tables */}
          {(byCityData.length > 0 || byStateData.length > 0 || byBrandData.length > 0 || byModelData.length > 0 || byFuelData.length > 0) && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-red-600" /> Customer Distribution & Demographics
              </h3>

              {/* Row 1: City & State */}
              {(byCityData.length > 0 || byStateData.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* City Distribution */}
                  {byCityData.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" /> Customers by City
                        </h4>
                        <span className="text-xs font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{byCityData.length} Cities</span>
                      </div>

                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={byCityData.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-25} textAnchor="end" />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                              formatter={(val: any) => [`${val} Customers`, 'Count']}
                            />
                            <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Table View */}
                      <div className="border-t border-slate-100 pt-3">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-500 bg-slate-50 border-b border-slate-200">
                                <th className="py-2 px-3 font-bold uppercase">City</th>
                                <th className="py-2 px-3 text-right font-bold uppercase">Count</th>
                                <th className="py-2 px-3 text-right font-bold uppercase">Share</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(showAllCity ? byCityData : byCityData.slice(0, 5)).map((item, i) => {
                                const pct = Math.round((item.count / totalCityCount) * 100);
                                return (
                                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-2.5 px-3 text-slate-800 font-medium">{item.name}</td>
                                    <td className="py-2.5 px-3 text-right text-emerald-600 font-bold font-mono">{item.count.toLocaleString()}</td>
                                    <td className="py-2.5 px-3 text-right text-slate-500 font-semibold">{pct}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {byCityData.length > 5 && (
                          <button
                            onClick={() => setShowAllCity(!showAllCity)}
                            className="mt-2 text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {showAllCity ? <>Show Top 5 <ChevronUp className="w-3.5 h-3.5" /></> : <>View All ({byCityData.length}) <ChevronDown className="w-3.5 h-3.5" /></>}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* State / Emirate Distribution */}
                  {byStateData.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" /> Customers by State / Emirate
                        </h4>
                        <span className="text-xs font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{byStateData.length} Regions</span>
                      </div>

                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={byStateData.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-25} textAnchor="end" />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                              formatter={(val: any) => [`${val} Customers`, 'Count']}
                            />
                            <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Table View */}
                      <div className="border-t border-slate-100 pt-3">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-500 bg-slate-50 border-b border-slate-200">
                                <th className="py-2 px-3 font-bold uppercase">State / Emirate</th>
                                <th className="py-2 px-3 text-right font-bold uppercase">Count</th>
                                <th className="py-2 px-3 text-right font-bold uppercase">Share</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(showAllState ? byStateData : byStateData.slice(0, 5)).map((item, i) => {
                                const pct = Math.round((item.count / totalStateCount) * 100);
                                return (
                                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-2.5 px-3 text-slate-800 font-medium">{item.name}</td>
                                    <td className="py-2.5 px-3 text-right text-blue-600 font-bold font-mono">{item.count.toLocaleString()}</td>
                                    <td className="py-2.5 px-3 text-right text-slate-500 font-semibold">{pct}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {byStateData.length > 5 && (
                          <button
                            onClick={() => setShowAllState(!showAllState)}
                            className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {showAllState ? <>Show Top 5 <ChevronUp className="w-3.5 h-3.5" /></> : <>View All ({byStateData.length}) <ChevronDown className="w-3.5 h-3.5" /></>}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Row 2: Vehicle Brand & Model */}
              {(byBrandData.length > 0 || byModelData.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Vehicle Brand Distribution */}
                  {byBrandData.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Car className="w-4 h-4 text-red-600" /> Customers by Vehicle Brand
                        </h4>
                        <span className="text-xs font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{byBrandData.length} Brands</span>
                      </div>

                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={byBrandData.slice(0, 8)} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} width={80} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                              formatter={(val: any) => [`${val} Customers`, 'Count']}
                            />
                            <Bar dataKey="count" fill="#dc2626" radius={[0, 6, 6, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Table View */}
                      <div className="border-t border-slate-100 pt-3">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-500 bg-slate-50 border-b border-slate-200">
                                <th className="py-2 px-3 font-bold uppercase">Brand</th>
                                <th className="py-2 px-3 text-right font-bold uppercase">Count</th>
                                <th className="py-2 px-3 text-right font-bold uppercase">Share</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(showAllBrand ? byBrandData : byBrandData.slice(0, 5)).map((item, i) => {
                                const pct = Math.round((item.count / totalBrandCount) * 100);
                                return (
                                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-2.5 px-3 text-slate-800 font-medium">{item.name}</td>
                                    <td className="py-2.5 px-3 text-right text-red-600 font-bold font-mono">{item.count.toLocaleString()}</td>
                                    <td className="py-2.5 px-3 text-right text-slate-500 font-semibold">{pct}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {byBrandData.length > 5 && (
                          <button
                            onClick={() => setShowAllBrand(!showAllBrand)}
                            className="mt-2 text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {showAllBrand ? <>Show Top 5 <ChevronUp className="w-3.5 h-3.5" /></> : <>View All ({byBrandData.length}) <ChevronDown className="w-3.5 h-3.5" /></>}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vehicle Model Distribution */}
                  {byModelData.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Car className="w-4 h-4 text-purple-600" /> Customers by Vehicle Model
                        </h4>
                        <span className="text-xs font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{byModelData.length} Models</span>
                      </div>

                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={byModelData.slice(0, 8)} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} width={80} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                              formatter={(val: any) => [`${val} Customers`, 'Count']}
                            />
                            <Bar dataKey="count" fill="#9333ea" radius={[0, 6, 6, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Table View */}
                      <div className="border-t border-slate-100 pt-3">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-500 bg-slate-50 border-b border-slate-200">
                                <th className="py-2 px-3 font-bold uppercase">Model</th>
                                <th className="py-2 px-3 text-right font-bold uppercase">Count</th>
                                <th className="py-2 px-3 text-right font-bold uppercase">Share</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(showAllModel ? byModelData : byModelData.slice(0, 5)).map((item, i) => {
                                const pct = Math.round((item.count / totalModelCount) * 100);
                                return (
                                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-2.5 px-3 text-slate-800 font-medium">{item.name}</td>
                                    <td className="py-2.5 px-3 text-right text-purple-600 font-bold font-mono">{item.count.toLocaleString()}</td>
                                    <td className="py-2.5 px-3 text-right text-slate-500 font-semibold">{pct}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {byModelData.length > 5 && (
                          <button
                            onClick={() => setShowAllModel(!showAllModel)}
                            className="mt-2 text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {showAllModel ? <>Show Top 5 <ChevronUp className="w-3.5 h-3.5" /></> : <>View All ({byModelData.length}) <ChevronDown className="w-3.5 h-3.5" /></>}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Row 3: Fuel Type Distribution */}
              {byFuelData.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-amber-600" /> Customers by Fuel Type
                    </h4>
                    <span className="text-xs font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{byFuelData.length} Fuel Types</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    <div className="h-64 w-full flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={byFuelData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="count"
                          >
                            {byFuelData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            formatter={(val: any) => [`${val} Customers`, 'Count']}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Detailed Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-500 bg-slate-50 border-b border-slate-200">
                            <th className="py-2 px-3 font-bold uppercase">Fuel Type</th>
                            <th className="py-2 px-3 text-right font-bold uppercase">Count</th>
                            <th className="py-2 px-3 text-right font-bold uppercase">Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {byFuelData.map((item, i) => {
                            const pct = Math.round((item.count / totalFuelCount) * 100);
                            const color = CHART_COLORS[i % CHART_COLORS.length];
                            return (
                              <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-2.5 px-3 text-slate-800 font-medium flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                  {item.name}
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-900 font-bold font-mono">{item.count.toLocaleString()}</td>
                                <td className="py-2.5 px-3 text-right text-slate-500 font-semibold">{pct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
