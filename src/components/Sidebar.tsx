import { 
  LayoutDashboard, Users, Wrench, FileText, 
  CreditCard, Bell, BarChart3, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight, ChevronDown, UserPlus, Shield, MapPin, Palette, Tags, ChevronsLeft, ChevronsRight, Car
} from 'lucide-react';
import { useState } from 'react';
import { SafeImage } from './common/SafeImage';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile-mgmt', label: 'Profile Management', icon: Users, isAccordion: true, children: [
    { id: 'sub-admin', label: 'Sub Admin', icon: Shield },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'agents', label: 'Agent Management', icon: UserPlus },
  ]},
  { id: 'master-mgmt', label: 'Master Management', icon: Shield, isAccordion: true, children: [
    { id: 'master-role', label: 'Role', icon: Shield },
    { id: 'master-skill', label: 'Skill', icon: Wrench },
    { id: 'master-emirate', label: 'Emirate', icon: MapPin },
    { id: 'master-city', label: 'City', icon: MapPin },
    { id: 'master-service', label: 'Service', icon: Wrench },
    { id: 'master-subservice', label: 'Sub Service', icon: Wrench },
    { id: 'master-color', label: 'Color', icon: Palette },
    { id: 'master-make', label: 'Brand', icon: Car },
    { id: 'master-model', label: 'Model', icon: Car },
    { id: 'master-vehicle-type', label: 'Vehicle Type', icon: Car },
    { id: 'master-fuel-type', label: 'Fuel Type', icon: Car },
    { id: 'master-banner', label: 'Banner', icon: FileText },
  ]},
  { id: 'promotions', label: 'Offer Management', icon: Tags },
  { id: 'orders', label: 'Order Management', icon: FileText },
  { id: 'payments', label: 'Payment Management', icon: CreditCard },
  { id: 'notifications', label: 'Notification Management', icon: Bell },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, isAccordion: true, children: [
    { id: 'report-users', label: 'User', icon: Users },
    { id: 'report-agents', label: 'Agent', icon: UserPlus },
    { id: 'report-revenue', label: 'Revenue', icon: CreditCard },
  ]},
];

const BOTTOM_MENU = [
  { id: 'profile', label: 'Settings', icon: Settings },
  { id: 'logout', label: 'Logout', icon: LogOut },
];

export function Sidebar({ 
  collapsed, 
  setCollapsed,
  currentView = 'dashboard',
  onViewChange = () => {}
}: { 
  collapsed: boolean, 
  setCollapsed: (c: boolean) => void,
  currentView?: string,
  onViewChange?: (view: string) => void
}) {
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    'profile-mgmt': true,
    'master-mgmt': false,
    'reports': false
  });
  
  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#FFFFFF] border-r border-slate-200/80 shadow-sm transition-all duration-300 z-50 flex flex-col text-slate-800
        ${collapsed ? 'w-20' : 'xl:w-sidebar lg:w-64 w-sidebar'}
      `}
    >
      {/* Brand Header */}
      <div 
        className="h-16 2xl:h-20 flex items-center justify-center px-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
        title="Toggle Sidebar"
      >
        <div className={`flex items-center gap-3 overflow-hidden w-full ${collapsed ? 'justify-center' : 'justify-center px-2'}`}>
          <SafeImage 
            src="/logo.png" 
            alt="Stylein Logo" 
            className={`object-contain transition-all duration-300 mix-blend-multiply brightness-[1.05] contrast-[1.1] shrink-0 ${collapsed ? 'h-12' : 'h-[80px]'}`}
          />

        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 2xl:py-6 px-2 2xl:px-3 flex flex-col gap-1 2xl:gap-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isDirectActive = currentView === item.id;
          const hasActiveChild = item.children?.some(child => child.id === currentView);
          
          if (item.isAccordion) {
            const isOpen = openAccordions[item.id];
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className={`w-full flex items-center justify-between gap-2 2xl:gap-3 px-3 2xl:px-3.5 py-2.5 2xl:py-3 rounded-xl 2xl:rounded-2xl transition-all duration-200 text-slate-800 font-normal hover:bg-slate-100/70 outline-none focus:outline-none focus:ring-0 ${collapsed ? 'justify-center' : ''}`}
                >
                  <div className="flex items-center gap-2 2xl:gap-3 whitespace-nowrap">
                    <Icon className="w-[18px] h-[18px] 2xl:w-5 2xl:h-5 shrink-0 text-slate-700" />
                    {!collapsed && <span className="text-[13px] 2xl:text-sm tracking-tight">{item.label}</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
                </button>
                {isOpen && !collapsed && (
                  <div className="pl-6 ml-4 border-l-2 border-slate-200/80 space-y-1 my-1">
                    {item.children?.map(child => {
                      const isSubActive = currentView === child.id;
                      const ChildIcon = child.icon;
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            if (currentView === child.id) {
                              window.dispatchEvent(new CustomEvent('refresh_master_data'));
                            }
                            onViewChange(child.id);
                          }}
                          className={`w-full flex items-center gap-2 2xl:gap-3 px-3 2xl:px-4 py-2 2xl:py-2.5 text-[12px] 2xl:text-sm transition-all whitespace-nowrap relative outline-none focus:outline-none focus:ring-0 ${
                            isSubActive 
                              ? 'bg-gradient-to-r from-red-50 via-red-50/80 to-red-50/30 text-red-600 font-bold rounded-r-xl 2xl:rounded-r-2xl rounded-l-none border-l-[4px] 2xl:border-l-[6px] border-red-600 -ml-[18px] 2xl:-ml-[26px] pl-4 2xl:pl-6 w-[calc(100%+18px)] 2xl:w-[calc(100%+26px)] shadow-2xs' 
                              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 rounded-lg 2xl:rounded-xl font-normal'
                          }`}
                        >
                          <ChildIcon className={`w-3.5 h-3.5 2xl:w-4 2xl:h-4 ${isSubActive ? 'text-red-600' : 'text-slate-600'}`} />
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-2 2xl:gap-3 px-3 2xl:px-4 py-2.5 2xl:py-3 rounded-xl 2xl:rounded-2xl transition-all duration-200 group relative whitespace-nowrap outline-none focus:outline-none focus:ring-0 ${
                isDirectActive 
                  ? 'bg-gradient-to-r from-red-50 via-red-50/90 to-red-50/40 text-red-600 font-bold border border-red-100/80 border-l-[4px] 2xl:border-l-[6px] border-l-red-600 shadow-2xs' 
                  : 'text-slate-800 font-normal hover:bg-slate-100/70 hover:text-slate-900'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-[18px] h-[18px] 2xl:w-5 2xl:h-5 shrink-0 ${isDirectActive ? 'text-red-600' : 'text-slate-700'}`} />
              {!collapsed && <span className="text-[13px] 2xl:text-sm tracking-tight">{item.label}</span>}
            </button>
          );
        })}

        <div className="mt-6 mb-2 border-t border-slate-200/60" />

        {BOTTOM_MENU.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-2 2xl:gap-3 px-3 2xl:px-4 py-2.5 2xl:py-3 rounded-xl 2xl:rounded-2xl transition-all duration-200 group relative whitespace-nowrap text-slate-800 font-normal outline-none focus:outline-none focus:ring-0 ${
                isActive 
                  ? 'bg-gradient-to-r from-red-50 via-red-50/90 to-red-50/40 text-red-600 font-bold border border-red-100/80 border-l-[4px] 2xl:border-l-[6px] border-l-red-600 shadow-2xs' 
                  : 'hover:bg-slate-100/70 hover:text-slate-900'
              } ${collapsed ? 'justify-center' : ''} ${item.id === 'logout' ? 'hover:bg-red-50 text-red-600' : ''}`}
            >
              <Icon className={`w-[18px] h-[18px] 2xl:w-5 2xl:h-5 shrink-0 ${isActive ? 'text-red-600' : (item.id === 'logout' ? 'text-red-500' : 'text-slate-700')}`} />
              {!collapsed && <span className="text-[13px] 2xl:text-sm tracking-tight">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-4 border-t border-slate-100 flex justify-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-2.5 2xl:py-3 rounded-xl 2xl:rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 font-normal transition-all flex items-center justify-center shadow-2xs border border-slate-200/60 active:scale-95 outline-none focus:outline-none focus:ring-0"
        >
          {collapsed ? <ChevronsRight className="w-4 h-4 2xl:w-5 2xl:h-5" /> : <ChevronsLeft className="w-4 h-4 2xl:w-5 2xl:h-5" />}
        </button>
      </div>
    </aside>
  );
}
