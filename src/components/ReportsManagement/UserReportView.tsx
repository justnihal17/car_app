import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { 
  Users, UserPlus, UserCheck, Activity, ShoppingBag, UserX, 
  Filter, RotateCcw, Calendar, MapPin, Car, Fuel, CreditCard, 
  AlertTriangle, RefreshCw, BarChart2, ChevronDown, ChevronUp, Info,
  Building, PieChart as PieChartIcon, Table
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

  // Active Category Tab state
  const [activeCategoryTab, setActiveCategoryTab] = useState<'city' | 'state' | 'brand' | 'model' | 'fuelType' | 'paymentMethod'>('city');

  // Master data for dropdowns
  const [masterCities, setMasterCities] = useState<MasterOption[]>([]);
  const [masterStates, setMasterStates] = useState<MasterOption[]>([]);
  const [masterBrands, setMasterBrands] = useState<MasterOption[]>([]);
  const [masterModels, setMasterModels] = useState<MasterOption[]>([]);

  // Show all toggle state for side table
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

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
  const byPaymentData = useMemo(() => parseDistribution(customerData.byPaymentMethod || reportData?.orders?.byPaymentMethod || reportData?.byPaymentMethod || [], 'paymentMethod'), [customerData, reportData]);

  // Total counts for percentages calculation
  const totalCityCount = useMemo(() => byCityData.reduce((acc, curr) => acc + curr.count, 0) || 1, [byCityData]);
  const totalStateCount = useMemo(() => byStateData.reduce((acc, curr) => acc + curr.count, 0) || 1, [byStateData]);
  const totalBrandCount = useMemo(() => byBrandData.reduce((acc, curr) => acc + curr.count, 0) || 1, [byBrandData]);
  const totalModelCount = useMemo(() => byModelData.reduce((acc, curr) => acc + curr.count, 0) || 1, [byModelData]);
  const totalFuelCount = useMemo(() => byFuelData.reduce((acc, curr) => acc + curr.count, 0) || 1, [byFuelData]);
  const totalPaymentCount = useMemo(() => byPaymentData.reduce((acc, curr) => acc + curr.count, 0) || 1, [byPaymentData]);

  // Category Configuration for Buttons
  const CATEGORY_TABS = [
    { id: 'city', label: 'Cities', icon: MapPin, color: 'text-emerald-600', activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' },
    { id: 'state', label: 'Emirate', icon: Building, color: 'text-blue-600', activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-500/20' },
    { id: 'brand', label: 'Brand', icon: Car, color: 'text-red-600', activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
    { id: 'model', label: 'Model', icon: Car, color: 'text-purple-600', activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-500/20' },
    { id: 'fuelType', label: 'Fuel Type', icon: Fuel, color: 'text-amber-600', activeBg: 'bg-amber-600 text-white shadow-md shadow-amber-500/20' },
    { id: 'paymentMethod', label: 'Payment', icon: CreditCard, color: 'text-indigo-600', activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' },
  ] as const;

  // Selected Active Data Config
  const activeCategoryConfig = useMemo(() => {
    switch (activeCategoryTab) {
      case 'city':
        return { labelName: 'City', title: 'Customers by City', data: byCityData, total: totalCityCount, barColor: '#10b981', barClass: 'bg-emerald-500' };
      case 'state':
        return { labelName: 'State / Emirate', title: 'Customers by State / Emirate', data: byStateData, total: totalStateCount, barColor: '#2563eb', barClass: 'bg-blue-600' };
      case 'brand':
        return { labelName: 'Vehicle Brand', title: 'Customers by Vehicle Brand', data: byBrandData, total: totalBrandCount, barColor: '#dc2626', barClass: 'bg-red-600' };
      case 'model':
        return { labelName: 'Vehicle Model', title: 'Customers by Vehicle Model', data: byModelData, total: totalModelCount, barColor: '#9333ea', barClass: 'bg-purple-600' };
      case 'fuelType':
        return { labelName: 'Fuel Type', title: 'Customers by Fuel Type', data: byFuelData, total: totalFuelCount, barColor: '#f59e0b', barClass: 'bg-amber-500' };
      case 'paymentMethod':
        return { labelName: 'Payment Method', title: 'Customers by Payment Method', data: byPaymentData, total: totalPaymentCount, barColor: '#4f46e5', barClass: 'bg-indigo-600' };
      default:
        return { labelName: 'City', title: 'Customers by City', data: byCityData, total: totalCityCount, barColor: '#10b981', barClass: 'bg-emerald-500' };
    }
  }, [activeCategoryTab, byCityData, totalCityCount, byStateData, totalStateCount, byBrandData, totalBrandCount, byModelData, totalModelCount, byFuelData, totalFuelCount, byPaymentData, totalPaymentCount]);

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
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" /> Apply Filters
            </button>
          </div>
        </div>

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
                <option value="">All States</option>
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

          <div className="bg-white h-96 rounded-3xl border border-slate-200/80 animate-pulse" />
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

          {/* Section 2: Interactive Category Filter Buttons + Graph & Side Table Layout */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            {/* Toggle Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-red-600" /> Customer Analytics Visualizer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Click a category button below to view its graph and details table
                </p>
              </div>

              {/* Category Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {CATEGORY_TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeCategoryTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveCategoryTab(tab.id);
                        setShowAllRows(false);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? tab.activeBg
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-semibold'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Interactive Grid: Left (Graph) & Right (Details Table) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Side: Graph Box (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-red-600" /> {activeCategoryConfig.title}
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                    {activeCategoryConfig.data.length} Total Items
                  </span>
                </div>

                {activeCategoryConfig.data.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center space-y-2">
                    <Info className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-500">No {activeCategoryConfig.labelName} data available for current filters</p>
                  </div>
                ) : (
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeCategoryConfig.data.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-20} textAnchor="end" />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          formatter={(val: any) => [`${val} Customers`, 'Count']}
                        />
                        <Bar dataKey="count" fill={activeCategoryConfig.barColor} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Right Side: Side Details Table Box (5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Table className="w-4 h-4 text-slate-600" /> {activeCategoryConfig.labelName} Breakdown Details
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">Total: {activeCategoryConfig.total.toLocaleString()}</span>
                </div>

                {activeCategoryConfig.data.length === 0 ? (
                  <div className="py-20 text-center text-xs text-slate-400 font-medium">No details to display</div>
                ) : (
                  <div className="space-y-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-500 bg-slate-50 border-b border-slate-200">
                            <th className="py-2.5 px-3 font-bold uppercase">{activeCategoryConfig.labelName}</th>
                            <th className="py-2.5 px-3 text-right font-bold uppercase">Customers</th>
                            <th className="py-2.5 px-3 text-right font-bold uppercase">Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(showAllRows ? activeCategoryConfig.data : activeCategoryConfig.data.slice(0, 6)).map((item, i) => {
                            const pct = Math.round((item.count / activeCategoryConfig.total) * 100);
                            return (
                              <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-2.5 px-3 text-slate-900 font-bold">
                                  <div className="flex flex-col gap-1">
                                    <span>{item.name}</span>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div className={`h-full ${activeCategoryConfig.barClass}`} style={{ width: `${Math.max(pct, 4)}%` }} />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-900 font-bold font-mono align-top">{item.count.toLocaleString()}</td>
                                <td className="py-2.5 px-3 text-right text-slate-600 font-bold align-top">{pct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {activeCategoryConfig.data.length > 6 && (
                      <button
                        onClick={() => setShowAllRows(!showAllRows)}
                        className="w-full py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {showAllRows ? <>Show Less <ChevronUp className="w-3.5 h-3.5" /></> : <>View All ({activeCategoryConfig.data.length}) <ChevronDown className="w-3.5 h-3.5" /></>}
                      </button>
                    )}
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
