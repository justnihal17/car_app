import { Bell, CheckCircle, Clock, XCircle, MousePointer, Eye, Send, Activity, BarChart2 } from 'lucide-react';
import { NOTIFICATIONS } from '../../data/notifications';

export function NotificationDashboard() {
  const kpis = [
    { label: 'Total Sent', value: '4.2M', change: '+12%', icon: Send, color: 'text-blue-600', iconBg: 'bg-blue-50 border-blue-100', bgGrad: 'from-blue-50/50 via-white to-white' },
    { label: 'Delivered', value: '98.5%', change: '+1.2%', icon: CheckCircle, color: 'text-emerald-600', iconBg: 'bg-emerald-50 border-emerald-100', bgGrad: 'from-emerald-50/50 via-white to-white' },
    { label: 'Open Rate', value: '42%', change: '+5%', icon: Eye, color: 'text-red-600', iconBg: 'bg-red-50 border-red-100', bgGrad: 'from-red-50/50 via-white to-white' },
    { label: 'Click Rate', value: '12%', change: '+2%', icon: MousePointer, color: 'text-purple-600', iconBg: 'bg-purple-50 border-purple-100', bgGrad: 'from-purple-50/50 via-white to-white' },
    { label: 'Failed', value: '1.5%', change: '-0.3%', icon: XCircle, color: 'text-rose-600', iconBg: 'bg-rose-50 border-rose-100', bgGrad: 'from-rose-50/50 via-white to-white' },
    { label: 'Scheduled', value: '14', change: '+3', icon: Clock, color: 'text-amber-600', iconBg: 'bg-amber-50 border-amber-100', bgGrad: 'from-amber-50/50 via-white to-white' }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`bg-gradient-to-br ${kpi.bgGrad} p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl border ${kpi.iconBg} ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${kpi.change.startsWith('+') ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100' : 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100'}`}>
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" /> Recent Activity Feed
            </h3>
            <button className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors">View All Logs</button>
          </div>
          
          <div className="space-y-4">
            {NOTIFICATIONS.slice(0, 4).map((notif, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/80 transition-colors">
                <div className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                  notif.status === 'Delivered' ? 'bg-emerald-500 ring-4 ring-emerald-100' :
                  notif.status === 'Failed' ? 'bg-red-500 ring-4 ring-red-100' : 'bg-amber-500 ring-4 ring-amber-100'
                }`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                    <span className="text-xs font-medium text-slate-400">{new Date(notif.date).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{notif.message}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200/80">
                      <Bell className="w-3 h-3 text-red-600" /> {notif.type}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200/80">
                      <BarChart2 className="w-3 h-3 text-emerald-600" /> {notif.openRate}% Open
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-red-600" /> Top Campaigns
            </h3>
          </div>
          <div className="space-y-5">
             <div className="group">
               <div className="flex justify-between text-sm mb-1.5">
                 <span className="text-slate-900 font-bold group-hover:text-red-600 transition-colors">Summer Wash Promo</span>
                 <span className="text-emerald-600 font-bold">48%</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-2">
                 <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '48%' }}></div>
               </div>
               <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Open Rate</div>
             </div>
             <div className="group">
               <div className="flex justify-between text-sm mb-1.5">
                 <span className="text-slate-900 font-bold group-hover:text-red-600 transition-colors">New Membership Tier</span>
                 <span className="text-red-600 font-bold">35%</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-2">
                 <div className="bg-red-500 h-2 rounded-full" style={{ width: '35%' }}></div>
               </div>
               <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Open Rate</div>
             </div>
             <div className="group">
               <div className="flex justify-between text-sm mb-1.5">
                 <span className="text-slate-900 font-bold group-hover:text-red-600 transition-colors">Refer a Friend</span>
                 <span className="text-purple-600 font-bold">29%</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-2">
                 <div className="bg-purple-500 h-2 rounded-full" style={{ width: '29%' }}></div>
               </div>
               <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Open Rate</div>
             </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Upcoming Scheduled</h3>
             <div className="space-y-3">
               <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                 <Clock className="w-4 h-4 text-amber-500" />
                 <div>
                   <div className="text-xs font-bold text-slate-900">System Maintenance Alert</div>
                   <div className="text-[10px] font-medium text-slate-500 mt-0.5">Jul 15 • In-App • All Users</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

