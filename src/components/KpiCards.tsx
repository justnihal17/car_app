import { Users, Car, MapPin, DollarSign, Activity, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const KPIS = [
  { label: 'Total Customers', value: '124,592', change: '+12.5%', isUp: true, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', targetView: 'users' },
  { label: 'Active Drivers', value: '842', change: '+4.2%', isUp: true, icon: Car, color: 'text-emerald-400', bg: 'bg-emerald-400/10', targetView: 'drivers' },
  { label: "Today's Orders", value: '3,219', change: '-2.1%', isUp: false, icon: MapPin, color: 'text-orange-400', bg: 'bg-orange-400/10', targetView: 'orders' },
  { label: 'Revenue Today', value: '$84,291', change: '+18.4%', isUp: true, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', targetView: 'reports' },
  { label: 'Success Rate', value: '98.4%', change: '+0.2%', isUp: true, icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/10', targetView: 'reports' },
  { label: 'Pending Orders', value: '142', change: '+12', isUp: false, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', targetView: 'orders' },
  { label: 'Available Drivers', value: '315', change: '-5', isUp: false, icon: Activity, color: 'text-teal-400', bg: 'bg-teal-400/10', targetView: 'drivers' },
  { label: 'Monthly Growth', value: '24%', change: '+4%', isUp: true, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10', targetView: 'reports' },
];

function Sparkline({ isUp }: { isUp: boolean }) {
  const points = isUp 
    ? "0,20 10,15 20,18 30,10 40,12 50,2"
    : "0,5 10,12 20,8 30,18 40,15 50,22";
  const strokeColor = isUp ? "#34d399" : "#f87171";

  return (
    <svg width="60" height="24" viewBox="0 0 50 24" className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function KpiCards({ onViewChange }: { onViewChange: (view: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {KPIS.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
            <button 
            key={idx} 
            onClick={() => onViewChange(kpi.targetView || 'dashboard')}
            className="text-left bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl ${kpi.bg}`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${kpi.isUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {kpi.isUp ? '↑' : '↓'} {kpi.change}
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{kpi.label}</h3>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
              </div>
              <div className="pb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <Sparkline isUp={kpi.isUp} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
