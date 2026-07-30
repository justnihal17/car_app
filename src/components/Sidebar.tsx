import { 
  LayoutDashboard, Users, Wrench, FileText, 
  CreditCard, Bell, BarChart3, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight, ChevronDown, UserPlus, Shield, MapPin, Palette, Tags, ChevronsLeft, ChevronsRight, Car
} from 'lucide-react';
import { useState } from 'react';

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
  { id: 'orders', label: 'Order Management', icon: FileText },
  { id: 'payments', label: 'Payment Management', icon: CreditCard },
  { id: 'notifications', label: 'Notification Management', icon: Bell },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
];

const BOTTOM_MENU = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help Center', icon: HelpCircle },
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
    'master-mgmt': false
  });
  
  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#faf8f5] border-r border-slate-200/80 shadow-sm transition-all duration-300 z-50 flex flex-col text-slate-800
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="bg-red-600 p-2.5 rounded-2xl shrink-0 text-white shadow-md shadow-red-500/20 flex items-center justify-center">
            {/* Flower 4-dot Grid Icon */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M7 3a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H7zm10 0a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4h-2zM7 13a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4H7zm10 0a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4h-2z"/>
            </svg>
          </div>
          {!collapsed && <span className="font-extrabold text-xl text-slate-900 tracking-tight whitespace-nowrap">Stylein Admin</span>}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 text-slate-800 font-bold hover:bg-slate-100/70 ${collapsed ? 'justify-center' : ''}`}
                >
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <Icon className="w-5 h-5 shrink-0 text-slate-700" />
                    {!collapsed && <span className="text-sm tracking-tight">{item.label}</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
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
                          className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm transition-all whitespace-nowrap relative ${
                            isSubActive 
                              ? 'bg-gradient-to-r from-red-50 to-red-50/20 text-red-600 font-bold rounded-r-2xl rounded-l-none border-l-4 border-red-600 -ml-[26px] pl-6' 
                              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 rounded-xl font-semibold'
                          }`}
                        >
                          <ChildIcon className={`w-4 h-4 ${isSubActive ? 'text-red-600' : 'text-slate-600'}`} />
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
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 group relative whitespace-nowrap ${
                isDirectActive 
                  ? 'bg-red-50/80 text-red-600 font-bold border border-red-100/80 shadow-2xs' 
                  : 'text-slate-800 font-bold hover:bg-slate-100/70 hover:text-slate-900'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isDirectActive ? 'text-red-600' : 'text-slate-700'}`} />
              {!collapsed && <span className="text-sm tracking-tight">{item.label}</span>}
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
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 group relative whitespace-nowrap text-slate-800 font-bold ${
                isActive 
                  ? 'bg-red-50/80 text-red-600 font-bold border border-red-100/80' 
                  : 'hover:bg-slate-100/70 hover:text-slate-900'
              } ${collapsed ? 'justify-center' : ''} ${item.id === 'logout' ? 'hover:bg-red-50 text-red-600' : ''}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-red-600' : (item.id === 'logout' ? 'text-red-500' : 'text-slate-700')}`} />
              {!collapsed && <span className="text-sm tracking-tight">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-4 border-t border-slate-100 flex justify-center">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-3 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 font-bold transition-all flex items-center justify-center shadow-2xs border border-slate-200/60 active:scale-95"
        >
          {collapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}

