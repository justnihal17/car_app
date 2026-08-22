import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe, Home, FileText, ShieldAlert, Sparkles, Layers, Car } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePageServicesManager } from './components/HomePageServicesManager';
import { ServiceDetailContentManager } from './components/ServiceDetailContentManager';
import { BrandManager } from './components/BrandManager';
import { RescuePageManager } from './components/Rescue/RescuePageManager';

export type WebsiteTab = 'home-services' | 'service-content' | 'rescue' | 'brands';

interface WebsiteWorkspaceProps {
  initialTab?: WebsiteTab;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function WebsiteWorkspace({ initialTab }: WebsiteWorkspaceProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path or prop
  const getTabFromPath = (): WebsiteTab => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/website/brands') || path.includes('brand')) return 'brands';
    if (path.includes('/website/rescue') || path.includes('rescue')) return 'rescue';
    if (path.includes('/website/service-content') || path.includes('service-content') || path.includes('content')) return 'service-content';
    return 'home-services';
  };

  const [activeTab, setActiveTab] = useState<WebsiteTab>(initialTab || getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: WebsiteTab) => {
    setActiveTab(tab);
    navigate(`/website/${tab}`);
  };

  const TABS = [
    {
      id: 'home-services' as WebsiteTab,
      label: 'Home Page Services',
      subtitle: 'Featured Hero Services (Max 6)',
      icon: Home,
    },
    {
      id: 'service-content' as WebsiteTab,
      label: 'Service Detail Content',
      subtitle: 'Rich Pages, Steps & FAQs',
      icon: FileText,
    },
    {
      id: 'rescue' as WebsiteTab,
      label: 'Rescue Page CMS',
      subtitle: '24/7 Roadside Emergency',
      icon: ShieldAlert,
    },
    {
      id: 'brands' as WebsiteTab,
      label: 'Luxury Brands',
      subtitle: 'Brand Showcase & Copy',
      icon: Car,
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex-1 p-4 lg:p-6 2xl:p-content space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
        
        {/* Top Workspace Header */}
        <div className="pb-2 border-b border-slate-200/60">
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
            Website Management
          </h1>
        </div>

        {/* Modern Tab Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5 shadow-xs ${
                  isActive
                    ? 'bg-white border-red-500 ring-2 ring-red-500/20 text-slate-900 shadow-md'
                    : 'bg-white/80 border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black block tracking-tight truncate">{tab.label}</span>
                  <span className="text-[11px] font-semibold text-slate-400 block truncate mt-0.5">{tab.subtitle}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tab Component */}
        <div className="pt-2">
          {activeTab === 'home-services' && <HomePageServicesManager />}
          {activeTab === 'service-content' && <ServiceDetailContentManager />}
          {activeTab === 'rescue' && <RescuePageManager />}
          {activeTab === 'brands' && <BrandManager />}
        </div>

      </div>
    </QueryClientProvider>
  );
}
