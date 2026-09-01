import { 
  LayoutDashboard, Users, Wrench, FileText, 
  CreditCard, Bell, BarChart3, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight, ChevronDown, UserPlus, Shield, MapPin, Palette, Tags, ChevronsLeft, ChevronsRight, Car, MessageSquare, Crown, Globe, Home, ShieldAlert, ArrowLeft, Clock
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SafeImage } from './common/SafeImage';

const WEBSITE_MENU_ITEMS = [
  { id: 'web-home-services', path: '/website/home-services', label: 'Home Page Services', icon: Home },
  { id: 'web-service-content', path: '/website/service-content', label: 'Service Detail Content', icon: FileText },
  { id: 'web-rescue', path: '/website/rescue', label: 'Rescue Page CMS', icon: ShieldAlert },
  { id: 'web-brands', path: '/website/brands', label: 'Luxury Brands', icon: Car },
];

const MENU_ITEMS = [
  { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile-mgmt', label: 'Profile Management', icon: Users, isAccordion: true, children: [
    { id: 'sub-admin', path: '/sub-admin', label: 'Sub Admin', icon: Shield },
    { id: 'users', path: '/user-management', label: 'User Management', icon: Users },
    { id: 'agents', path: '/agent-management', label: 'Agent Management', icon: UserPlus },
  ]},
  { id: 'orders', path: '/order', label: 'Order Management', icon: FileText },
  { id: 'promotions', path: '/promotions', label: 'Offer Management', icon: Tags },
  { id: 'subscriptions', path: '/subscriptions', label: 'Subscriptions', icon: Crown },
  { id: 'payments', path: '/payments', label: 'Payment Management', icon: CreditCard },
  { id: 'notifications', path: '/notifications', label: 'Notification Management', icon: Bell },
  { id: 'master-mgmt', label: 'Master Management', icon: Shield, isAccordion: true, children: [
    { id: 'master-role', path: '/master/role', label: 'Role', icon: Shield },
    { id: 'master-skill', path: '/master/skill', label: 'Skill', icon: Wrench },
    { id: 'master-emirate', path: '/master/emirate', label: 'Emirate', icon: MapPin },
    { id: 'master-city', path: '/master/city', label: 'City', icon: MapPin },
    { id: 'master-service', path: '/master/service', label: 'Service', icon: Wrench },
    { id: 'master-subservice', path: '/master/subservice', label: 'Sub Service', icon: Wrench },
    { id: 'master-slots', path: '/master/slots', label: 'Time Slots', icon: Clock },
    { id: 'master-color', path: '/master/color', label: 'Color', icon: Palette },
    { id: 'master-make', path: '/master/make', label: 'Brand', icon: Car },
    { id: 'master-model', path: '/master/model', label: 'Model', icon: Car },
    { id: 'master-vehicle-type', path: '/master/vehicle-type', label: 'Vehicle Type', icon: Car },
    { id: 'master-fuel-type', path: '/master/fuel-type', label: 'Fuel Type', icon: Car },
    { id: 'master-banner', path: '/master/banner', label: 'Banner', icon: FileText },
  ]},
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, isAccordion: true, children: [
    { id: 'report-users', path: '/reports/users', label: 'User', icon: Users },
    { id: 'report-agents', path: '/reports/agents', label: 'Agent', icon: UserPlus },
    { id: 'report-revenue', path: '/reports/revenue', label: 'Revenue', icon: CreditCard },
  ]},
];

const BOTTOM_MENU = [
  { id: 'profile', path: '/profile', label: 'Settings', icon: Settings },
  { id: 'logout', label: 'Logout', icon: LogOut },
];

export function Sidebar({ 
  collapsed, 
  setCollapsed,
  onLogout
}: { 
  collapsed: boolean, 
  setCollapsed: (c: boolean) => void,
  onLogout: () => void
}) {
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    'profile-mgmt': true,
    'master-mgmt': false,
    'reports': false
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#FFFFFF] border-r border-slate-200/80 shadow-sm transition-all duration-300 z-50 flex flex-col text-slate-800
        ${collapsed ? 'w-16' : 'w-sidebar'}
      `}
    >
      {/* Brand Header */}
      <div 
        className="h-14 flex items-center justify-center px-3.5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
        title="Toggle Sidebar"
      >
        <div className={`flex items-center gap-2 overflow-hidden w-full ${collapsed ? 'justify-center' : 'justify-center px-1'}`}>
          <SafeImage 
            src="/logo.png" 
            alt="Stylein Logo" 
            className={`object-contain transition-all duration-300 mix-blend-multiply brightness-[1.05] contrast-[1.1] shrink-0 ${collapsed ? 'h-8' : 'h-11'}`}
          />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar:none]">
        {currentPath.startsWith('/website') ? (
          <>
            {/* Website CMS Navigation Items */}
            {WEBSITE_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isDirectActive = currentPath === item.path || (item.path !== '/website' && currentPath.startsWith(item.path));
              
              return (
                <button
                  key={item.id}
                  onClick={() => { if (item.path) navigate(item.path); }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group relative whitespace-nowrap outline-none focus:outline-none focus:ring-0 ${
                    isDirectActive 
                      ? 'bg-linear-to-r from-red-50 via-red-50/90 to-red-50/40 text-red-600 font-bold border border-red-100/80 border-l-[3.5px] border-l-red-600 shadow-2xs' 
                      : 'text-slate-700 font-medium hover:bg-slate-100/70 hover:text-slate-900'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isDirectActive ? 'text-red-600' : 'text-slate-600'}`} />
                    {!collapsed && <span className="text-[13px] tracking-tight">{item.label}</span>}
                  </div>
                </button>
              );
            })}
          </>
        ) : (
          MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isDirectActive = item.path === '/' ? currentPath === '/' : (item.path && currentPath.startsWith(item.path));
            
            if (item.isAccordion) {
              const isOpen = openAccordions[item.id];
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 text-slate-700 font-medium hover:bg-slate-100/70 outline-none focus:outline-none focus:ring-0 ${collapsed ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 whitespace-nowrap">
                      <Icon className="w-4 h-4 shrink-0 text-slate-600" />
                      {!collapsed && <span className="text-[13px] tracking-tight">{item.label}</span>}
                    </div>
                    {!collapsed && <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
                  </button>
                  {isOpen && !collapsed && (
                    <div className="pl-3.5 ml-3 border-l border-slate-200/90 space-y-1 my-1">
                      {item.children?.map(child => {
                        const isSubActive = currentPath === child.path || (child.path !== '/' && currentPath.startsWith(child.path + '/'));
                        const ChildIcon = child.icon;
                        return (
                          <button
                            key={child.id}
                            onClick={() => {
                              if (currentPath === child.path) {
                                window.dispatchEvent(new CustomEvent('refresh_master_data'));
                              }
                              if (child.path) navigate(child.path);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[12px] transition-all whitespace-nowrap relative outline-none focus:outline-none focus:ring-0 ${
                              isSubActive 
                                ? 'bg-linear-to-r from-red-50 via-red-50/80 to-red-50/30 text-red-600 font-bold rounded-r-lg rounded-l-none border-l-[3.5px] border-red-600 -ml-3.5 pl-3.5 w-[calc(100%+14px)] shadow-2xs' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 rounded-lg font-medium'
                            }`}
                          >
                            <ChildIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-red-600' : 'text-slate-500'}`} />
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
                onClick={() => { if (item.path) navigate(item.path); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group relative whitespace-nowrap outline-none focus:outline-none focus:ring-0 ${
                  isDirectActive 
                    ? 'bg-linear-to-r from-red-50 via-red-50/90 to-red-50/40 text-red-600 font-bold border border-red-100/80 border-l-[3.5px] border-l-red-600 shadow-2xs' 
                    : 'text-slate-700 font-medium hover:bg-slate-100/70 hover:text-slate-900'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isDirectActive ? 'text-red-600' : 'text-slate-600'}`} />
                {!collapsed && <span className="text-[13px] tracking-tight">{item.label}</span>}
              </button>
            );
          })
        )}

        <div className="mt-4 mb-1.5 border-t border-slate-200/60" />

        {BOTTOM_MENU.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' ? currentPath === '/' : (item.path && currentPath.startsWith(item.path));
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'logout') {
                  onLogout();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group relative whitespace-nowrap text-slate-700 font-medium outline-none focus:outline-none focus:ring-0 ${
                isActive 
                  ? 'bg-linear-to-r from-red-50 via-red-50/90 to-red-50/40 text-red-600 font-bold border border-red-100/80 border-l-[3.5px] border-l-red-600 shadow-2xs' 
                  : 'hover:bg-slate-100/70 hover:text-slate-900'
              } ${collapsed ? 'justify-center' : ''} ${item.id === 'logout' ? 'hover:bg-red-50 text-red-600' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-600' : (item.id === 'logout' ? 'text-red-500' : 'text-slate-600')}`} />
              {!collapsed && <span className="text-[13px] tracking-tight">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-100 flex justify-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 font-normal transition-all flex items-center justify-center shadow-2xs border border-slate-200/60 active:scale-95 outline-none focus:outline-none focus:ring-0 cursor-pointer"
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
