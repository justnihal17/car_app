import { Activity, Server, Database, Cloud, Network, ShieldAlert, CheckCircle } from 'lucide-react';

export function SystemHealth() {
  const metrics = [
    { label: 'API Status', value: 'Operational', icon: Cloud, status: 'ok', detail: '99.99% Uptime' },
    { label: 'Database', value: 'Healthy', icon: Database, status: 'ok', detail: '14ms latency' },
    { label: 'Server Usage (CPU)', value: '42%', icon: Server, status: 'warning', detail: 'Normal load' },
    { label: 'Network Traffic', value: 'Stable', icon: Network, status: 'ok', detail: '2.4 GB/s' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">System Health</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time infrastructure monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          All Systems Operational
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          const isWarning = metric.status === 'warning';
          return (
            <div key={idx} className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${isWarning ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isWarning ? <ShieldAlert className="w-4 h-4 text-yellow-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="text-2xl font-bold text-white mb-1 tracking-tight">{metric.value}</div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{metric.label}</div>
              <div className="text-xs text-slate-500">{metric.detail}</div>
              
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-slate-800/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-6">
         <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
           <Activity className="w-4 h-4 text-indigo-500" /> Infrastructure Logs
         </h3>
         <div className="space-y-4">
            <div className="flex gap-4 p-3 rounded-lg bg-slate-900/50 border border-slate-800/50">
               <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400" />
               <div>
                  <div className="text-sm font-medium text-white mb-0.5">Automated Backup Completed</div>
                  <div className="text-xs text-slate-400">Database snapshot saved to secure cloud storage.</div>
                  <div className="text-[10px] text-slate-500 mt-2 font-mono">10 minutes ago</div>
               </div>
            </div>
            <div className="flex gap-4 p-3 rounded-lg bg-slate-900/50 border border-slate-800/50">
               <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-yellow-400" />
               <div>
                  <div className="text-sm font-medium text-white mb-0.5">High CPU Usage Detected</div>
                  <div className="text-xs text-slate-400">Node cluster 3 reached 85% utilization, auto-scaling triggered.</div>
                  <div className="text-[10px] text-slate-500 mt-2 font-mono">1 hour ago</div>
               </div>
            </div>
            <div className="flex gap-4 p-3 rounded-lg bg-slate-900/50 border border-slate-800/50">
               <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400" />
               <div>
                  <div className="text-sm font-medium text-white mb-0.5">Deploy Successful</div>
                  <div className="text-xs text-slate-400">Version 2.4.1 deployed to production without downtime.</div>
                  <div className="text-[10px] text-slate-500 mt-2 font-mono">3 hours ago</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
