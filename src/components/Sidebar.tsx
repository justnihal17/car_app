import { 
  LayoutDashboard, Users, Car, Wrench, FileText, 
  CreditCard, Bell, BarChart3, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight, Fuel, ChevronDown, UserPlus, Shield, MapPin
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
    { id: 'master-state', label: 'State', icon: MapPin },
    { id: 'master-city', label: 'City', icon: MapPin },
    { id: 'master-service', label: 'Service', icon: Wrench },
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
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  
  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
            <Fuel className="w-6 h-6 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-lg text-slate-900 tracking-tight whitespace-nowrap">CAFU Admin</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1 custom-scrollbar">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.children?.some(child => child.id === currentView));
          
          if (item.isAccordion) {
            const isOpen = openAccordions[item.id];
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-slate-500 hover:text-blue-700 hover:bg-blue-50 ${collapsed ? 'justify-center' : ''}`}
                >
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                </button>
                {isOpen && !collapsed && (
                  <div className="pl-8 space-y-1">
                    {item.children?.map(child => (
                      <button
                        key={child.id}
                        onClick={() => onViewChange(child.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all whitespace-nowrap ${currentView === child.id ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50'}`}
                      >
                        <child.icon className="w-4 h-4" />
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative whitespace-nowrap
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 rounded-r-md rounded-l-none' 
                  : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
              {collapsed && isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
              )}
            </button>
          );
        })}

        <div className="mt-8 mb-4 border-t border-slate-200" />

        {BOTTOM_MENU.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative whitespace-nowrap
                ${isActive && item.id === 'settings'
                  ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 rounded-r-md rounded-l-none'
                  : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700'}
                ${collapsed ? 'justify-center' : ''}
                ${item.id === 'logout' ? 'text-red-500 hover:text-red-700' : ''}
              `}
            >
              <Icon className={`w-5 h-5 shrink-0`} />
              {!collapsed && <span className={`font-medium text-sm`}>{item.label}</span>}
              {collapsed && isActive && item.id === 'settings' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200 flex justify-end">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors w-full flex justify-center"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
