import { useState } from 'react';
import { 
  DollarSign, Users, Car, ShoppingCart, TrendingUp, TrendingDown, 
  Activity, Star, RefreshCw, Calendar, MapPin, Filter, AlertTriangle, CheckCircle 
} from 'lucide-react';

export function ExecutiveDashboard() {
  const kpis = [
    { label: "Today's Revenue", value: '$12,450', change: '+15%', trend: 'up', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Total Customers', value: '124.5K', change: '+2.4%', trend: 'up', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Total Drivers', value: '1,250', change: '+12', trend: 'up', icon: Car, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Orders Today', value: '845', change: '-5%', trend: 'down', icon: ShoppingCart, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Completed Orders', value: '720', change: '+8%', trend: 'up', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Pending Orders', value: '115', change: '0%', trend: 'neutral', icon: RefreshCw, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Cancelled Orders', value: '10', change: '-2%', trend: 'down', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Average Rating', value: '4.8', change: '+0.1', trend: 'up', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg border ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  kpi.trend === 'up' ? 'text-emerald-400' : 
                  kpi.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {kpi.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {kpi.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  {kpi.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1 font-mono tracking-tight">{kpi.value}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</div>
              
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-slate-800/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
           <div className="text-slate-500 flex flex-col items-center gap-3">
             <Activity className="w-12 h-12 opacity-20" />
             <p className="text-sm uppercase tracking-wider font-medium">Revenue Trend Chart Area</p>
             <p className="text-xs text-slate-600">Integrate Recharts or similar library for interactive data visualization</p>
           </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" /> Revenue By City
            </h3>
            <div className="space-y-5">
               <div className="group">
                 <div className="flex justify-between text-sm mb-1.5">
                   <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">Dubai</span>
                   <span className="text-emerald-400 font-bold">$45,200</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5">
                   <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                 </div>
               </div>
               <div className="group">
                 <div className="flex justify-between text-sm mb-1.5">
                   <span className="text-white font-medium group-hover:text-indigo-400 transition-colors">Abu Dhabi</span>
                   <span className="text-indigo-400 font-bold">$22,400</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5">
                   <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                 </div>
               </div>
               <div className="group">
                 <div className="flex justify-between text-sm mb-1.5">
                   <span className="text-white font-medium group-hover:text-purple-400 transition-colors">Sharjah</span>
                   <span className="text-purple-400 font-bold">$12,100</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5">
                   <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> Top Services
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Super Shine Wash', revenue: '$18,500', orders: 450 },
                { name: 'Engine Oil Change', revenue: '$12,200', orders: 120 },
                { name: 'Premium Wash', revenue: '$8,400', orders: 320 }
              ].map((service, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-white">{service.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{service.orders} orders</div>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{service.revenue}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
