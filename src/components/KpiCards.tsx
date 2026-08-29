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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <button 
            key={idx} 
            onClick={() => onViewChange(kpi.targetView || '/')}
            className="text-left bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 group flex flex-col justify-between min-h-[76px] cursor-pointer active:scale-[0.99]"
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase truncate leading-none">{kpi.label}</span>
              <div className="p-1.5 border border-slate-100/90 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors shrink-0">
                <Icon className="w-3.5 h-3.5 text-slate-600" />
              </div>
            </div>
            
            <div className="flex justify-between items-baseline w-full mt-2 gap-1.5">
              <span className="text-xl sm:text-[22px] font-semibold text-slate-800 tracking-tight leading-none">{kpi.value}</span>
              {kpi.subtext && <span className="text-[8.5px] font-medium text-slate-400 tracking-wider uppercase truncate">{kpi.subtext}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
