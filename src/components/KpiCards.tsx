import { useState, useEffect } from 'react';
import { Users, Car, MapPin, Shield, Building, Tag, Star, UserCheck } from 'lucide-react';
import api from '../api/axios';

export function KpiCards({ onViewChange }: { onViewChange: (view: string) => void }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        if (response.data && response.data.data) {
          setStats(response.data.data);
        } else {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  const kpis = [
    { label: 'Customers', value: stats?.customerCount ?? '0', icon: Users, subtext: 'ACCOUNTS', targetView: '/user-management' },
    { label: 'Agents', value: stats?.agentCount ?? '0', icon: UserCheck, subtext: 'OPERATIONAL', targetView: '/agent-management' },
    { label: 'Admins', value: stats?.adminCount ?? '0', icon: Shield, subtext: 'MANAGERS', targetView: '/sub-admin' },
    { label: 'Emirates', value: stats?.emirateCount ?? '0', icon: MapPin, subtext: 'STATES', targetView: '/master/emirate' },
    { label: 'Cities', value: stats?.cityCount ?? '0', icon: Building, subtext: 'LOCATIONS', targetView: '/master/city' },
    { label: 'Offers', value: stats?.activeOfferCount ?? '0', icon: Tag, subtext: 'PROMOTIONS', targetView: '/promotions' },
    { label: 'Brands', value: stats?.brandCount ?? '0', icon: Star, subtext: 'MAKES', targetView: '/master/make' },
    { label: 'Models', value: stats?.modelCount ?? '0', icon: Car, subtext: 'VEHICLES', targetView: '/master/model' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <button 
            key={idx} 
            onClick={() => onViewChange(kpi.targetView || '/')}
            className="text-left bg-white p-4 lg:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between min-h-[120px] cursor-pointer"
          >
            <div className="flex justify-between items-start w-full">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mt-1 w-3/4 line-clamp-2 leading-tight">{kpi.label}</span>
              <div className="p-2 border border-slate-100 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors shrink-0">
                <Icon className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            
            <div className="flex justify-between items-baseline w-full mt-4 gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{kpi.value}</span>
              {kpi.subtext && <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase truncate">{kpi.subtext}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
