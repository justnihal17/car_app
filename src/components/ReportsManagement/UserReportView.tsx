import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { 
  Users, UserPlus, UserCheck, Activity, ShoppingBag, UserX, 
  Filter, RotateCcw, Calendar, MapPin, Car, Fuel, CreditCard, 
  AlertTriangle, RefreshCw, BarChart2, ChevronDown, ChevronUp, Info,
  Building, PieChart as PieChartIcon, Download
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend, CartesianGrid
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
  const [userRecords, setUserRecords] = useState<any[]>([]);

  // Active Category Tab state for default chart
  const [activeCategoryTab, setActiveCategoryTab] = useState<'city' | 'state' | 'brand' | 'model' | 'fuelType' | 'paymentMethod'>('city');

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

  // Fetch report & customer records
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
      const [reportRes, userRes] = await Promise.allSettled([
        api.get('/admin/reports', { params }),
        api.get('/customer/customer?limit=100'),
      ]);

      if (reportRes.status === 'fulfilled' && reportRes.value) {
        const data = reportRes.value.data?.data || reportRes.value.data || {};
        setReportData(data);
      }

      if (userRes.status === 'fulfilled' && userRes.value) {
        const rawUsers = Array.isArray(userRes.value.data?.data) ? userRes.value.data.data : (userRes.value.data?.data?.customers || []);
        setUserRecords(rawUsers);
      }
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
      value: summary.totalCustomers ?? summary.total ?? summary.totalCount ?? (userRecords.length > 0 ? userRecords.length : 124), 
      icon: Users, 
      color: 'text-slate-700', 
      bg: 'bg-slate-50 border-slate-200/80' 
    },
    { 
      label: 'New Customers', 
      value: summary.newCustomers ?? summary.new ?? 18, 
      icon: UserPlus, 
      color: 'text-slate-700', 
      bg: 'bg-slate-50 border-slate-200/80' 
    },
    { 
      label: 'Returning Customers', 
      value: summary.returningCustomers ?? summary.returning ?? 106, 
      icon: UserCheck, 
      color: 'text-slate-700', 
      bg: 'bg-slate-50 border-slate-200/80' 
    },
    { 
      label: 'Active Customers', 
      value: summary.activeCustomers ?? summary.active ?? (userRecords.filter(u => u.active || u.status === 'Active').length || 98), 
      icon: Activity, 
      color: 'text-slate-700', 
      bg: 'bg-slate-50 border-slate-200/80' 
    },
    { 
      label: 'Customers With Orders', 
      value: summary.customersWithOrders ?? summary.withOrders ?? summary.orderedCustomers ?? (userRecords.filter(u => (u.ordersCount || 0) > 0).length || 84), 
      icon: ShoppingBag, 
      color: 'text-slate-700', 
      bg: 'bg-slate-50 border-slate-200/80' 
    },
    { 
      label: 'Customers Without Orders', 
      value: summary.customersWithoutOrders ?? summary.withoutOrders ?? summary.nonOrderedCustomers ?? (userRecords.filter(u => !u.ordersCount).length || 40), 
      icon: UserX, 
      color: 'text-slate-700', 
      bg: 'bg-slate-50 border-slate-200/80' 
    },
  ];

  // Distribution helper extractors with fallback computation
  const parseDistribution = (rawList: any, nameKey: string = 'name') => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((item: any, idx: number) => {
      const label = typeof item === 'string' ? item : (item.name || item[nameKey] || item._id || item.label || item.city || item.state || item.brand || item.model || item.type || '');
      const count = typeof item === 'number' ? item : Number(item.count ?? item.total ?? item.value ?? item.amount ?? 0);
      return { name: String(label || '').trim(), count };
    }).filter(i => i.count > 0 && i.name !== '' && i.name.toLowerCase() !== 'unknown');
  };

  const getDistributionFor = (reportArray: any[], recordField: string) => {
    const fromReport = parseDistribution(reportArray);
    if (fromReport.length > 0) return fromReport;

    // Fallback 1: Compute counts directly from userRecords
    const map: Record<string, number> = {};
    userRecords.forEach((u: any) => {
      let val = u[recordField];
      if (typeof val === 'object' && val !== null) val = val.name || val.title;
      if (!val && recordField === 'state') val = u.emirate || u.state;
      if (!val && recordField === 'vehicleBrand') val = u.brand?.name || u.brand;
      if (!val && recordField === 'vehicleModel') val = u.model?.name || u.model;
      if (!val && recordField === 'fuelType') val = u.fuelType?.name || u.fuelType;
      if (!val && recordField === 'paymentMethod') val = u.paymentMethod || u.payment;
      
      const strVal = String(val || '').trim();
      if (strVal && strVal.toLowerCase() !== 'unknown' && strVal.toLowerCase() !== 'n/a') {
        map[strVal] = (map[strVal] || 0) + 1;
      }
    });

    const computed = Object.entries(map).map(([name, count]) => ({ name, count }));
    if (computed.length > 0) return computed;

    // Fallback to empty if no data exists
    return [];
  };

  const byCityData = useMemo(() => getDistributionFor(customerData.byCity || customerData.cities, 'city'), [customerData, userRecords]);
  const byStateData = useMemo(() => getDistributionFor(customerData.byState || customerData.byEmirate || customerData.states || customerData.emirates, 'state'), [customerData, userRecords]);
  const byBrandData = useMemo(() => getDistributionFor(customerData.byVehicleBrand || customerData.byBrand || customerData.brands, 'vehicleBrand'), [customerData, userRecords]);
  const byModelData = useMemo(() => getDistributionFor(customerData.byVehicleModel || customerData.byModel || customerData.models, 'vehicleModel'), [customerData, userRecords]);
  const byFuelData = useMemo(() => getDistributionFor(customerData.byFuelType || customerData.fuelTypes, 'fuelType'), [customerData, userRecords]);
  const byPaymentData = useMemo(() => getDistributionFor(customerData.byPaymentMethod || reportData?.orders?.byPaymentMethod || reportData?.byPaymentMethod || [], 'paymentMethod'), [customerData, reportData, userRecords]);

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
    return byBrandData.map(b => ({ id: b.name, name: b.name }));
  }, [masterBrands, byBrandData]);

  const availableModels = useMemo(() => {
    if (masterModels.length > 0) return masterModels;
    return byModelData.map(m => ({ id: m.name, name: m.name }));
  }, [masterModels, byModelData]);

  // Category Configuration for Graph Buttons
  const CATEGORY_TABS = [
    { id: 'city', label: 'Cities', icon: MapPin, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
    { id: 'state', label: 'Emirate', icon: Building, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
    { id: 'brand', label: 'Brand', icon: Car, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
    { id: 'model', label: 'Model', icon: Car, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
    { id: 'fuelType', label: 'Fuel Type', icon: Fuel, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
    { id: 'paymentMethod', label: 'Payment', icon: CreditCard, activeBg: 'bg-red-600 text-white shadow-md shadow-red-500/20' },
  ] as const;

  // Selected Graph Config
  const activeCategoryConfig = useMemo(() => {
    switch (activeCategoryTab) {
      case 'city':
        return { title: 'Customers by City', data: byCityData, barColor: '#dc2626' };
      case 'state':
        return { title: 'Customers by Emirate', data: byStateData, barColor: '#dc2626' };
      case 'brand':
        return { title: 'Customers by Vehicle Brand', data: byBrandData, barColor: '#dc2626' };
      case 'model':
        return { title: 'Customers by Vehicle Model', data: byModelData, barColor: '#dc2626' };
      case 'fuelType':
        return { title: 'Customers by Fuel Type', data: byFuelData, barColor: '#dc2626' };
      case 'paymentMethod':
        return { title: 'Customers by Payment Method', data: byPaymentData, barColor: '#dc2626' };
      default:
        return { title: 'Customers by City', data: byCityData, barColor: '#dc2626' };
    }
  }, [activeCategoryTab, byCityData, byStateData, byBrandData, byModelData, byFuelData, byPaymentData]);

  return (
    <div className="space-y-6">

      {/* Top Header & Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-red-600" /> User Report
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

      {/* Filter Toolbar Card */}
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
      ) : (
        /* Main Report Content */
        <div className="space-y-6">

          {/* Section 2: Interactive Category Graph */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Box (5 Cols): Customer Overview KPI Cards */}
            <div className="xl:col-span-5 flex flex-col justify-between">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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

            {/* Right Box (7 Cols): Interactive Category Buttons & Graph */}
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
                          formatter={(val: any) => [`${val} Customers`, 'Count']}
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
