import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { 
  DollarSign, Users, Car, ShoppingCart, TrendingUp, TrendingDown, 
  Activity, Star, RefreshCw, MapPin, AlertTriangle, CheckCircle, Info 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip 
} from 'recharts';

export function ExecutiveDashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const fetchExecutiveReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/reports');
      const data = response.data?.data || response.data || {};
      setReportData(data);
    } catch (err: any) {
      console.error('Failed to fetch executive report:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load executive data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutiveReport();
  }, []);

  // Safe extraction of metrics directly from API response
  const overview = reportData?.overview || {};
  const customersSummary = reportData?.customers?.summary || {};
  const revenueSummary = reportData?.revenue?.summary || {};
  const ordersSummary = reportData?.orders?.summary || {};

  const kpis = [
    { 
      label: "Total Revenue", 
      value: overview.totalRevenue !== undefined 
        ? `AED ${Number(overview.totalRevenue).toLocaleString()}` 
        : (revenueSummary.netRevenue !== undefined 
            ? `AED ${Number(revenueSummary.netRevenue).toLocaleString()}` 
            : (ordersSummary.totalRevenue ? `AED ${Number(ordersSummary.totalRevenue).toLocaleString()}` : 'AED 0')), 
      icon: DollarSign, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 border-emerald-200/60' 
    },
    { 
      label: 'Total Customers', 
      value: (customersSummary.totalCustomers ?? overview.totalCustomers ?? 0).toLocaleString(), 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 border-blue-200/60' 
    },
    { 
      label: 'Active Customers', 
      value: (customersSummary.activeCustomers ?? 0).toLocaleString(), 
      icon: Activity, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50 border-purple-200/60' 
    },
    { 
      label: 'Total Orders', 
      value: (overview.totalOrders ?? ordersSummary.totalOrders ?? revenueSummary.totalTransactions ?? 0).toLocaleString(), 
      icon: ShoppingCart, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 border-amber-200/60' 
    },
    { 
      label: 'Completed Orders', 
      value: (ordersSummary.completedOrders ?? reportData?.agents?.summary?.completedRequests ?? overview.totalTransactions ?? 0).toLocaleString(), 
      icon: CheckCircle, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 border-emerald-200/60' 
    },
    { 
      label: 'Total Transactions', 
      value: (overview.totalTransactions ?? revenueSummary.totalTransactions ?? 0).toLocaleString(), 
      icon: RefreshCw, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 border-blue-200/60' 
    },
    { 
      label: 'Average Order Value', 
      value: overview.averageOrderValue !== undefined 
        ? `AED ${Number(overview.averageOrderValue).toLocaleString()}` 
        : (revenueSummary.averageOrderValue ? `AED ${Number(revenueSummary.averageOrderValue).toLocaleString()}` : 'AED 0'), 
      icon: TrendingUp, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50 border-indigo-200/60' 
    },
    { 
      label: 'New Customers', 
      value: (customersSummary.newCustomers ?? 0).toLocaleString(), 
      icon: Star, 
      color: 'text-red-600', 
      bg: 'bg-red-50 border-red-200/60' 
    },
  ];

  // Parse Revenue or City breakdown
  const cityData = useMemo(() => {
    const raw = reportData?.customers?.byState || reportData?.customers?.byCity || reportData?.revenue?.byState || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((item: any) => ({
      name: String(item.name || item.state || item.city || item._id || ''),
      count: Number(item.customerCount ?? item.revenue ?? item.count ?? item.orders ?? item.total ?? 0)
    })).filter(i => i.name && i.name.toLowerCase() !== 'unknown' && i.count > 0);
  }, [reportData]);

  // Parse Services breakdown if available
  const serviceData = useMemo(() => {
    const raw = reportData?.services?.byService || reportData?.revenue?.byVehicleBrand || reportData?.byVehicleBrand || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((item: any) => ({
      name: String(item.name || item.brand || item.service || item._id || ''),
      count: Number(item.revenue ?? item.customerCount ?? item.count ?? item.orders ?? 0)
    })).filter(i => i.name && i.name.toLowerCase() !== 'unknown' && i.count > 0);
  }, [reportData]);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-700 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-xs text-red-900">Error Fetching Dashboard Data</h4>
              <p className="text-[11px] text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchExecutiveReport}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200/80 animate-pulse space-y-2">
                <div className="w-7 h-7 rounded-lg bg-slate-200" />
                <div className="h-5 w-16 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-200/70 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between min-h-[82px] group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg border ${kpi.bg} ${kpi.color} w-7 h-7 flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">
                      {kpi.value}
                    </div>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider leading-tight">
                    {kpi.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            {/* City Distribution Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Distribution By City
              </h3>

              {cityData.length === 0 ? (
                <div className="py-14 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                  <Info className="w-7 h-7 text-slate-300 mb-1.5" />
                  No city data returned from API
                </div>
              ) : (
                <div className="h-64 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
            {/* Top Services Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Services Breakdown
              </h3>
              
              {serviceData.length === 0 ? (
                <div className="py-14 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                  <Info className="w-7 h-7 text-slate-300 mb-1.5" />
                  No service breakdown available from API
                </div>
              ) : (
                <div className="space-y-2">
                  {serviceData.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/60">
                      <div className="text-xs font-semibold text-slate-800">{service.name}</div>
                      <div className="text-xs font-bold text-red-600 font-mono">{service.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
