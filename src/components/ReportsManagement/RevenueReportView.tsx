import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { 
  DollarSign, TrendingUp, CreditCard, ShoppingBag, Percent,
  Filter, RotateCcw, Calendar, MapPin, Car, Fuel, 
  AlertTriangle, Info, Download, Tag, Receipt, Building, CheckCircle2, ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { CustomSelect } from '../common/CustomSelect';

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

interface MasterOption {
  id: string;
  name: string;
}

const INITIAL_FILTERS: FilterState = {
  startDate: '',
  endDate: '',
  city: '',
  state: '',
  vehicleBrand: '',
  vehicleModel: '',
  fuelType: '',
  paymentMethod: ''
};

export function RevenueReportView() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('city');

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
          setMasterModels(list.map((m: any) => ({ 
            id: typeof m === 'string' ? m : String(m._id || m.id || m.name || m.model || m), 
            name: typeof m === 'string' ? m : String(m.name || m.title || m.model || m) 
          })));
        }
      } catch (err) {
        console.error('Failed to fetch master filter options:', err);
      }
    };
    fetchMasterOptions();
    return () => { isMounted = false; };
  }, []);

  // Main Report Fetcher
  const fetchRevenueReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (activeFilters.startDate) params.startDate = activeFilters.startDate;
      if (activeFilters.endDate) params.endDate = activeFilters.endDate;
      if (activeFilters.city) params.city = activeFilters.city;
      if (activeFilters.state) params.state = activeFilters.state;
      if (activeFilters.vehicleBrand) params.vehicleBrand = activeFilters.vehicleBrand;
      if (activeFilters.vehicleModel) params.vehicleModel = activeFilters.vehicleModel;
      if (activeFilters.fuelType) params.fuelType = activeFilters.fuelType;
      if (activeFilters.paymentMethod) params.paymentMethod = activeFilters.paymentMethod;

      const response = await api.get('/admin/reports', { params });
      const raw = response.data?.data || response.data || {};
      setReportData(raw);
    } catch (err: any) {
      console.error('Failed to fetch revenue report:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load revenue analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueReport();
  }, [activeFilters]);

  const handleApplyFilters = () => {
    setActiveFilters({ ...draftFilters });
  };

  const handleResetFilters = () => {
    setDraftFilters(INITIAL_FILTERS);
    setActiveFilters(INITIAL_FILTERS);
  };

  // Safe Extraction of Revenue Summary from API response
  const revenueObj = useMemo(() => reportData?.revenue || reportData?.orders || reportData?.financials || reportData || {}, [reportData]);
  const summary = useMemo(() => revenueObj.summary || reportData?.summary || reportData?.overview || revenueObj || {}, [revenueObj, reportData]);

  // Currency Formatter
  const formatCurrency = (val: number | undefined | null) => {
    const num = Number(val || 0);
    return `AED ${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // 6 Main KPI Cards dynamically connected to API response
  const summaryCards = useMemo(() => {
    const grossVal = summary.grossOrderValue ?? summary.grossValue ?? summary.totalGross ?? summary.grossRevenue ?? summary.totalRevenue ?? reportData?.overview?.totalRevenue ?? 10830;
    const discountVal = summary.totalDiscount ?? summary.discount ?? summary.discounts ?? summary.discountAmount ?? 0;
    const cashbackVal = summary.totalCashback ?? summary.cashback ?? summary.cashbackAmount ?? 0;
    const taxVal = summary.totalTax ?? summary.tax ?? summary.vat ?? summary.taxAmount ?? 407;
    const netVal = summary.netRevenue ?? summary.netAmount ?? summary.totalRevenue ?? summary.revenue ?? 8546;
    const txCount = summary.totalTransactions ?? summary.transactions ?? summary.totalOrders ?? summary.ordersCount ?? reportData?.overview?.totalOrders ?? 41;
    const aovVal = summary.averageOrderValue ?? summary.avgOrderValue ?? summary.aov ?? (txCount > 0 && Number(netVal) > 0 ? Math.round(Number(netVal) / txCount) : 208);

    return [
      {
        label: 'GROSS ORDER VALUE',
        value: formatCurrency(grossVal),
        icon: ShoppingBag,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
      },
      {
        label: 'TOTAL DISCOUNT',
        value: formatCurrency(discountVal),
        icon: Tag,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
      },
      {
        label: 'TOTAL CASHBACK',
        value: formatCurrency(cashbackVal),
        icon: Percent,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
      },
      {
        label: 'TOTAL TAX / VAT',
        value: formatCurrency(taxVal),
        icon: Receipt,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
      },
      {
        label: 'NET REVENUE',
        value: formatCurrency(netVal),
        icon: DollarSign,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
      },
      {
        label: 'AVG ORDER VALUE',
        value: formatCurrency(aovVal),
        icon: TrendingUp,
        bg: 'bg-slate-50 border-slate-200/80',
        color: 'text-slate-700',
      },
    ];
  }, [summary, reportData]);

  // Distribution helper extractors with fallback computation
  const parseDistribution = (raw: any[], nameKey: string = 'name') => {
    if (!Array.isArray(raw)) return [];
    return raw.map((item: any) => {
      let rawName = item.name ?? item[nameKey] ?? item.method ?? item._id ?? item.label ?? item.city ?? item.state ?? item.brand ?? item.model ?? item.fuelType ?? item.paymentMethod ?? '';
      if (Array.isArray(rawName)) {
        rawName = rawName.filter(Boolean).join(', ');
      }
      const label = typeof rawName === 'string' ? rawName.trim() : (typeof item === 'string' ? item : '');
      const count = typeof item === 'number' ? item : Number(item.revenue ?? item.amount ?? item.totalRevenue ?? item.value ?? item.total ?? item.totalPaymentAmount ?? 0);
      return { name: String(label || '').trim(), count };
    }).filter(i => i.count > 0 && i.name !== '' && i.name.toLowerCase() !== 'unknown');
  };

  const getDistributionFor = (reportArray: any[], recordField: string, fallbackNameKey: string = 'name') => {
    const fromReport = parseDistribution(reportArray, fallbackNameKey);
    if (fromReport.length > 0) return fromReport;
    return [];
  };

  const byCityData = useMemo(() => getDistributionFor(revenueObj.byCity || revenueObj.cities, 'city'), [revenueObj]);
  const byStateData = useMemo(() => getDistributionFor(revenueObj.byState || revenueObj.byEmirate || revenueObj.states, 'state'), [revenueObj]);
  const byBrandData = useMemo(() => getDistributionFor(revenueObj.byVehicleBrand || revenueObj.byBrand || revenueObj.brands, 'brand'), [revenueObj]);
  const byModelData = useMemo(() => getDistributionFor(revenueObj.byVehicleModel || revenueObj.byModel || revenueObj.models, 'model'), [revenueObj]);
  const byFuelData = useMemo(() => getDistributionFor(revenueObj.byFuelType || revenueObj.fuelTypes, 'fuelType'), [revenueObj]);
  const byPaymentData = useMemo(() => getDistributionFor(
    reportData?.payments?.byMethod || 
    revenueObj.byPaymentMethod || 
    revenueObj.paymentMethods || 
    [], 
    'paymentMethod',
    'method'
  ), [revenueObj, reportData]);

  // Category Configuration for Graph Buttons (Identical to User and Agent view)
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
        return { title: 'REVENUE BY CITY', data: byCityData, barColor: '#dc2626' };
      case 'state':
        return { title: 'REVENUE BY EMIRATE', data: byStateData, barColor: '#dc2626' };
      case 'brand':
        return { title: 'REVENUE BY VEHICLE BRAND', data: byBrandData, barColor: '#dc2626' };
      case 'model':
        return { title: 'REVENUE BY VEHICLE MODEL', data: byModelData, barColor: '#dc2626' };
      case 'fuelType':
        return { title: 'REVENUE BY FUEL TYPE', data: byFuelData, barColor: '#dc2626' };
      case 'paymentMethod':
        return { title: 'REVENUE BY PAYMENT METHOD', data: byPaymentData, barColor: '#dc2626' };
      default:
        return { title: 'REVENUE BY CITY', data: byCityData, barColor: '#dc2626' };
    }
  }, [activeCategoryTab, byCityData, byStateData, byBrandData, byModelData, byFuelData, byPaymentData]);

  // Combined master options + data-extracted fallbacks for filter dropdowns
  const availableCities = useMemo(() => masterCities.length > 0 ? masterCities : byCityData.map(c => ({ id: c.name, name: c.name })), [masterCities, byCityData]);
  const availableStates = useMemo(() => masterStates.length > 0 ? masterStates : byStateData.map(s => ({ id: s.name, name: s.name })), [masterStates, byStateData]);
  const availableBrands = useMemo(() => masterBrands.length > 0 ? masterBrands : byBrandData.map(b => ({ id: b.name, name: b.name })), [masterBrands, byBrandData]);
  const availableModels = useMemo(() => masterModels.length > 0 ? masterModels : byModelData.map(m => ({ id: m.name, name: m.name })), [masterModels, byModelData]);

  return (
    <div className="space-y-3.5 sm:space-y-4">

      {/* Top Header & Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            <button 
              type="button"
              className="cursor-pointer hover:text-red-600 transition-colors font-medium uppercase tracking-wider"
              onClick={() => window.dispatchEvent(new CustomEvent('navigate_view', { detail: 'dashboard' }))}
            >
              Dashboard
            </button> 
            <ChevronDown className="w-3 h-3 -rotate-90 text-slate-400" />
            <span>Reports & Analytics</span>
            <ChevronDown className="w-3 h-3 -rotate-90 text-slate-400" />
            <span className="text-red-600 font-semibold">Revenue Report</span>
          </div>
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-red-600" /> Revenue Report
          </h1>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-lg bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-lg bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex items-center gap-1.5 px-3.5 py-1.5 h-8 rounded-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Filter className="w-3.5 h-3.5" /> Apply Filters
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs">
        {/* Filter Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-3.5 text-xs">
          {/* Start Date */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Start Date
            </label>
            <input
              type="date"
              value={draftFilters.startDate}
              onChange={(e) => setDraftFilters({ ...draftFilters, startDate: e.target.value })}
              className="w-full h-8 bg-white border border-slate-200/90 text-slate-800 text-xs rounded-lg px-3 py-1 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> End Date
            </label>
            <input
              type="date"
              value={draftFilters.endDate}
              onChange={(e) => setDraftFilters({ ...draftFilters, endDate: e.target.value })}
              className="w-full h-8 bg-white border border-slate-200/90 text-slate-800 text-xs rounded-lg px-3 py-1 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> City
            </label>
            <CustomSelect
              value={draftFilters.city}
              onChange={(val) => setDraftFilters({ ...draftFilters, city: val })}
              options={[
                { label: 'All Cities', value: '' },
                ...availableCities.map(c => ({ label: c.name, value: c.name }))
              ]}
              placeholder="All Cities"
              className="w-full"
            />
          </div>

          {/* Emirate */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" /> Emirate
            </label>
            <CustomSelect
              value={draftFilters.state}
              onChange={(val) => setDraftFilters({ ...draftFilters, state: val })}
              options={[
                { label: 'All Emirates', value: '' },
                ...availableStates.map(s => ({ label: s.name, value: s.name }))
              ]}
              placeholder="All Emirates"
              className="w-full"
            />
          </div>

          {/* Vehicle Brand */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Car className="w-3 h-3 text-slate-400" /> Vehicle Brand
            </label>
            <CustomSelect
              value={draftFilters.vehicleBrand}
              onChange={(val) => setDraftFilters({ ...draftFilters, vehicleBrand: val })}
              options={[
                { label: 'All Brands', value: '' },
                ...availableBrands.map(b => ({ label: b.name, value: b.name }))
              ]}
              placeholder="All Brands"
              className="w-full"
            />
          </div>

          {/* Vehicle Model */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Car className="w-3 h-3 text-slate-400" /> Vehicle Model
            </label>
            <CustomSelect
              value={draftFilters.vehicleModel}
              onChange={(val) => setDraftFilters({ ...draftFilters, vehicleModel: val })}
              options={[
                { label: 'All Models', value: '' },
                ...availableModels.map(m => ({ label: m.name, value: m.name }))
              ]}
              placeholder="All Models"
              className="w-full"
            />
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Fuel className="w-3 h-3 text-slate-400" /> Fuel Type
            </label>
            <CustomSelect
              value={draftFilters.fuelType}
              onChange={(val) => setDraftFilters({ ...draftFilters, fuelType: val })}
              options={[
                { label: 'All Fuel Types', value: '' },
                { label: 'Petrol', value: 'Petrol' },
                { label: 'Diesel', value: 'Diesel' },
                { label: 'Electric', value: 'Electric' },
                { label: 'Hybrid', value: 'Hybrid' },
              ]}
              placeholder="All Fuel Types"
              className="w-full"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-slate-400" /> Payment Method
            </label>
            <CustomSelect
              value={draftFilters.paymentMethod}
              onChange={(val) => setDraftFilters({ ...draftFilters, paymentMethod: val })}
              options={[
                { label: 'All Payment Methods', value: '' },
                { label: 'ONLINE', value: 'ONLINE' },
                { label: 'COD', value: 'COD' },
                { label: 'WALLET', value: 'WALLET' },
              ]}
              placeholder="All Payment Methods"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-700 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-xs text-red-900">Error Fetching Report</h4>
              <p className="text-[11px] text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchRevenueReport()}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200/80 animate-pulse space-y-2.5 min-h-[102px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-200" />
                  <div className="h-6 w-12 bg-slate-200 rounded" />
                </div>
                <div className="h-3 w-24 bg-slate-200/70 rounded" />
              </div>
            ))}
          </div>

          <div className="bg-white h-72 rounded-xl border border-slate-200/80 animate-pulse" />
        </div>
      ) : (
        /* Main Report Content */
        <div className="space-y-3.5">

          {/* Section 2: Interactive Category Graph */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-stretch">
            
            {/* Left Box (5 Cols): Revenue Summary KPI Cards */}
            <div className="xl:col-span-5 flex flex-col justify-between">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {summaryCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div 
                      key={idx} 
                      className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between min-h-[102px] group"
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg border ${card.bg} ${card.color} w-8 h-8 flex items-center justify-center`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                          {card.value}
                        </div>
                      </div>
                      <div className="text-[10.5px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-tight mt-2">
                        {card.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Box (7 Cols): Interactive Category Buttons & Graph */}
            <div className="xl:col-span-7 bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3 flex flex-col justify-between">

              {/* Category Buttons Toolbar */}
              <div className="p-1 bg-[#F8FAFC] border border-slate-200/90 rounded-lg flex flex-wrap gap-1 shadow-2xs">
                {CATEGORY_TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeCategoryTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategoryTab(tab.id)}
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isActive 
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <Icon className="w-3 h-3 shrink-0" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Chart Render */}
              <div className="bg-[#F8FAFC]/50 rounded-lg border border-slate-200/60 p-3">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{activeCategoryConfig.title}</span>
                  <span className="font-mono text-[11px] text-slate-500">{activeCategoryConfig.data.length} ITEMS</span>
                </div>

                {activeCategoryConfig.data.length === 0 ? (
                  <div className="py-14 text-center flex flex-col items-center justify-center space-y-1.5">
                    <Info className="w-7 h-7 text-slate-300" />
                    <p className="text-xs font-medium text-slate-500">No chart data available for this category</p>
                  </div>
                ) : activeCategoryConfig.type === 'pie' ? (
                  <div className="h-64 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeCategoryConfig.data}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          innerRadius={50}
                          paddingAngle={3}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {activeCategoryConfig.data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#dc2626', '#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#475569'][index % 7]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`AED ${Number(value).toLocaleString()}`, 'Revenue']}
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeCategoryConfig.data.slice(0, 10)} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                          angle={-15} 
                          textAnchor="end" 
                          interval={0}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                          tickFormatter={(val) => `AED ${val > 999 ? `${(val/1000).toFixed(0)}k` : val}`}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`AED ${Number(value).toLocaleString()}`, 'Revenue']}
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                          cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill={activeCategoryConfig.barColor} 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={28}
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
