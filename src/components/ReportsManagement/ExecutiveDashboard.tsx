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

  // Safe extraction of metrics
  const customersSummary = reportData?.customers?.summary || {};
  const ordersSummary = reportData?.orders?.summary || reportData?.summary || {};

  const kpis = [
    { 
      label: "Total Revenue", 
      value: ordersSummary.totalRevenue ? `₹${Number(ordersSummary.totalRevenue).toLocaleString()}` : (reportData?.totalRevenue ? `₹${Number(reportData.totalRevenue).toLocaleString()}` : '₹0'), 
      icon: DollarSign, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 border-emerald-200/60' 
    },
    { 
      label: 'Total Customers', 
      value: (customersSummary.totalCustomers ?? customersSummary.total ?? 0).toLocaleString(), 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 border-blue-200/60' 
    },
    { 
      label: 'Active Customers', 
      value: (customersSummary.activeCustomers ?? customersSummary.active ?? 0).toLocaleString(), 
      icon: Activity, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50 border-purple-200/60' 
    },
    { 
      label: 'Total Orders', 
      value: (ordersSummary.totalOrders ?? ordersSummary.total ?? 0).toLocaleString(), 
      icon: ShoppingCart, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 border-amber-200/60' 
    },
    { 
      label: 'Completed Orders', 
      value: (ordersSummary.completedOrders ?? ordersSummary.completed ?? 0).toLocaleString(), 
      icon: CheckCircle, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 border-emerald-200/60' 
    },
    { 
      label: 'Pending Orders', 
      value: (ordersSummary.pendingOrders ?? ordersSummary.pending ?? 0).toLocaleString(), 
      icon: RefreshCw, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 border-blue-200/60' 
    },
    { 
      label: 'Cancelled Orders', 
      value: (ordersSummary.cancelledOrders ?? ordersSummary.cancelled ?? 0).toLocaleString(), 
      icon: AlertTriangle, 
      color: 'text-red-600', 
      bg: 'bg-red-50 border-red-200/60' 
    },
    { 
      label: 'New Customers', 
      value: (customersSummary.newCustomers ?? customersSummary.new ?? 0).toLocaleString(), 
      icon: Star, 
      color: 'text-red-600', 
      bg: 'bg-red-50 border-red-200/60' 
    },
  ];

  // Parse Revenue or City breakdown
  const cityData = useMemo(() => {
    const raw = reportData?.customers?.byCity || reportData?.byCity || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((item: any, i: number) => ({
      name: String(item.name || item.city || item._id || `City ${i + 1}`),
      count: Number(item.count ?? item.total ?? 0)
    }));
  }, [reportData]);

  // Parse Services breakdown if available
  const serviceData = useMemo(() => {
    const raw = reportData?.services?.byService || reportData?.byService || reportData?.services || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((item: any, i: number) => ({
      name: String(item.name || item.service || item._id || `Service ${i + 1}`),
      count: Number(item.count ?? item.orders ?? 0)
    }));
  }, [reportData]);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-red-900">Error Fetching Dashboard Data</h4>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchExecutiveReport}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 animate-pulse space-y-3">
                <div className="w-8 h-8 rounded-xl bg-slate-200" />
                <div className="h-6 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-28 bg-slate-200/70 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl border ${kpi.bg} ${kpi.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1 tracking-tight font-mono">
                    {kpi.value}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {kpi.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* City Distribution Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-4 h-4 text-emerald-600" /> Distribution By City
              </h3>

              {cityData.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                  <Info className="w-8 h-8 text-slate-300 mb-2" />
                  No city data returned from API
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" fill="#dc2626" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
            {/* Top Services Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Star className="w-4 h-4 text-amber-500" /> Services Breakdown
              </h3>
              
              {serviceData.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                  <Info className="w-8 h-8 text-slate-300 mb-2" />
                  No service breakdown available from API
                </div>
              ) : (
                <div className="space-y-3">
                  {serviceData.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div className="text-xs font-bold text-slate-800">{service.name}</div>
                      <div className="text-xs font-black text-red-600 font-mono">{service.count}</div>
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
