import { Server, Activity, ShieldAlert, ArrowRight, Zap, RefreshCcw, AlertTriangle, Clock, MessageSquare } from 'lucide-react';

const SYSTEM_HEALTH = [
  { label: 'API Gateway', status: 'Operational', ping: '12ms', color: 'text-emerald-400', bg: 'bg-emerald-400' },
  { label: 'Database', status: 'Operational', ping: '24ms', color: 'text-emerald-400', bg: 'bg-emerald-400' },
  { label: 'Payment Node', status: 'Degraded', ping: '215ms', color: 'text-yellow-400', bg: 'bg-yellow-400' },
  { label: 'Notifications', status: 'Operational', ping: '18ms', color: 'text-emerald-400', bg: 'bg-emerald-400' },
];

const ACTIVITIES = [
  { type: 'payment', title: 'Payment Success', desc: 'Order #9921 • $45.00', time: '2m ago', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { type: 'driver', title: 'Driver Verified', desc: 'Alex Johnson submitted docs', time: '15m ago', icon: ShieldAlert, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { type: 'refund', title: 'Refund Approved', desc: 'Order #9910 • $120.00', time: '1h ago', icon: RefreshCcw, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { type: 'order', title: 'New Order Created', desc: 'Order #9925 by Robert M.', time: '2h ago', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { type: 'system', title: 'System Backup', desc: 'Automated DB snapshot', time: '4h ago', icon: Server, color: 'text-gray-400', bg: 'bg-gray-400/10' },
];

const TASKS = [
  { id: 1, title: 'Urgent Refund Request', desc: 'Order #9802 requires manual approval', type: 'urgent', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 2, title: 'Upcoming VIP Service', desc: 'Schedule driver for VIP customer at 2 PM', type: 'pending', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { id: 3, title: 'Unread Messages (4)', desc: 'From drivers regarding active orders', type: 'message', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10' },
];

export function RightPanel() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-[#0f1218] to-emerald-900/10 p-5 rounded-xl border border-emerald-500/10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Activity className="w-24 h-24" />
        </div>
        <h2 className="text-sm font-bold text-white tracking-tight uppercase mb-4 relative z-10">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <button className="bg-[#0f1218]/80 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/30 text-xs text-emerald-400 font-medium py-2 rounded-lg transition-colors shadow-sm">Add Driver</button>
          <button className="bg-[#0f1218]/80 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/30 text-xs text-emerald-400 font-medium py-2 rounded-lg transition-colors shadow-sm">Assign Job</button>
          <button className="bg-[#0f1218]/80 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/30 text-xs text-emerald-400 font-medium py-2 rounded-lg transition-colors shadow-sm">Generate Report</button>
          <button className="bg-[#0f1218]/80 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/30 text-xs text-emerald-400 font-medium py-2 rounded-lg transition-colors shadow-sm">Notify All</button>
        </div>
      </div>

      {/* Actionable Tasks */}
      <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-white tracking-tight uppercase flex items-center gap-2">
            Action Needed
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">3</span>
          </h2>
        </div>
        <div className="space-y-3">
          {TASKS.map((task) => {
            const Icon = task.icon;
            return (
              <div key={task.id} className="flex gap-3 p-3 rounded-xl bg-slate-800/20 border border-slate-800 hover:bg-slate-800/40 transition-colors cursor-pointer group">
                <div className={`p-2 rounded-lg shrink-0 h-min ${task.bg}`}>
                  <Icon className={`w-4 h-4 ${task.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{task.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{task.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-white tracking-tight uppercase">System Health</h2>
          <Server className="w-4 h-4 text-slate-500" />
        </div>
        <div className="space-y-4">
          {SYSTEM_HEALTH.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.bg} ${item.status !== 'Operational' ? 'animate-pulse' : ''}`}></div>
                <span className="text-sm text-slate-300 font-medium">{item.label}</span>
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${item.color}`}>{item.status}</div>
                <div className="text-[10px] text-slate-500 font-mono">{item.ping}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities Timeline */}
      <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-white tracking-tight uppercase">Recent Logs</h2>
          <button className="text-slate-500 hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative border-l border-slate-800/60 ml-3 space-y-6">
          {ACTIVITIES.map((activity, idx) => {
            const Icon = activity.icon;
            return (
              <div key={idx} className="relative pl-6">
                <div className={`absolute -left-3 top-0 p-1.5 rounded-full ${activity.bg} ring-4 ring-[#111814]`}>
                  <Icon className={`w-3 h-3 ${activity.color}`} />
                </div>
                <div>
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-sm font-medium text-slate-200">{activity.title}</h4>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                  <p className="text-xs text-slate-400">{activity.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
