import { Bell, CheckCircle, Clock, XCircle, MousePointer, Eye, Send, Activity, BarChart2 } from 'lucide-react';
import { NOTIFICATIONS } from '../../data/notifications';

export function NotificationDashboard() {
  const kpis = [
    { label: 'Total Sent', value: '4.2M', change: '+12%', icon: Send, color: 'text-blue-400' },
    { label: 'Delivered', value: '98.5%', change: '+1.2%', icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Open Rate', value: '42%', change: '+5%', icon: Eye, color: 'text-indigo-400' },
    { label: 'Click Rate', value: '12%', change: '+2%', icon: MousePointer, color: 'text-purple-400' },
    { label: 'Failed', value: '1.5%', change: '-0.3%', icon: XCircle, color: 'text-red-400' },
    { label: 'Scheduled', value: '14', change: '+3', icon: Clock, color: 'text-yellow-400' }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${kpi.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-slate-800/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Recent Activity Feed
            </h3>
            <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">View All Logs</button>
          </div>
          
          <div className="space-y-4">
            {NOTIFICATIONS.slice(0, 4).map((notif, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900 transition-colors">
                <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                  notif.status === 'Delivered' ? 'bg-emerald-400' :
                  notif.status === 'Failed' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-medium text-white">{notif.title}</h4>
                    <span className="text-xs text-slate-500">{new Date(notif.date).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                      <Bell className="w-3 h-3" /> {notif.type}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                      <BarChart2 className="w-3 h-3" /> {notif.openRate}% Open
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" /> Top Campaigns
            </h3>
          </div>
          <div className="space-y-5">
             <div className="group">
               <div className="flex justify-between text-sm mb-1.5">
                 <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">Summer Wash Promo</span>
                 <span className="text-emerald-400 font-bold">48%</span>
               </div>
               <div className="w-full bg-slate-800 rounded-full h-1.5">
                 <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '48%' }}></div>
               </div>
               <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Open Rate</div>
             </div>
             <div className="group">
               <div className="flex justify-between text-sm mb-1.5">
                 <span className="text-white font-medium group-hover:text-indigo-400 transition-colors">New Membership Tier</span>
                 <span className="text-indigo-400 font-bold">35%</span>
               </div>
               <div className="w-full bg-slate-800 rounded-full h-1.5">
                 <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '35%' }}></div>
               </div>
               <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Open Rate</div>
             </div>
             <div className="group">
               <div className="flex justify-between text-sm mb-1.5">
                 <span className="text-white font-medium group-hover:text-purple-400 transition-colors">Refer a Friend</span>
                 <span className="text-purple-400 font-bold">29%</span>
               </div>
               <div className="w-full bg-slate-800 rounded-full h-1.5">
                 <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '29%' }}></div>
               </div>
               <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Open Rate</div>
             </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800/60">
             <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Upcoming Scheduled</h3>
             <div className="space-y-3">
               <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
                 <Clock className="w-4 h-4 text-yellow-500" />
                 <div>
                   <div className="text-xs font-medium text-white">System Maintenance Alert</div>
                   <div className="text-[10px] text-slate-500 mt-0.5">Jul 15 • In-App • All Users</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
