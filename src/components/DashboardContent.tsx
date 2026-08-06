import { useState, useEffect } from 'react';
import { WelcomeSection } from './WelcomeSection';
import { KpiCards } from './KpiCards';
import { LiveOrderOverview } from './LiveOrderOverview';
import { LiveMap } from './LiveMap';
import { AnalyticsCharts } from './AnalyticsCharts';
import { RecentOrdersTable } from './RecentOrdersTable';
import { RightPanel } from './RightPanel';
import { UserWorkspace } from './UserManagement/UserWorkspace';
import { UserProfileWorkspace } from './UserManagement/UserProfileWorkspace';
import { UserRegistrationPage } from './UserManagement/registration/UserRegistrationPage';
import { DriverList } from './DriverManagement/DriverList';
import { DriverDetails } from './DriverManagement/DriverDetails';
import { OrderList } from './OrderManagement/OrderList';
import { OrderDetails } from './OrderManagement/OrderDetails';
import { SettingsManager } from './SettingsManagement/SettingsManager';
import { HelpCentre } from './HelpCentre';
import { PaymentManager } from './PaymentManagement/PaymentManager';
import { NotificationManager } from './NotificationManagement/NotificationManager';
import { SubAdminManagement } from './SubAdminManagement/SubAdminList';
import { AgentWorkspace } from './AgentManagement/AgentWorkspace';
import { AgentProfileWorkspace } from './AgentManagement/AgentProfileWorkspace';
import { AgentRegistrationPage } from './AgentManagement/registration/AgentRegistrationPage';
import { RolePage, SkillPage, StatePage, CityPage, ServicePage, SubServicePage, BrandPage, ColorPage, MakePage, ModelPage, VehicleTypePage, FuelTypePage, BannerPage } from './MasterManagement/MasterViews';
import { ProfileView } from './ProfileView';
import { ReportsManager } from './ReportsManagement/ReportsManager';
import { NotificationDeniedBanner } from './NotificationDeniedBanner';
import { usePushNotifications } from '../hooks/usePushNotifications';

import React from 'react';
import { StatsShimmer } from './shimmer/ShimmerLoader';
const PromotionsModule = React.lazy(() => import('./PromotionsManagement/PromotionsModule'));

export function DashboardContent({ currentView, onViewChange }: { currentView: string; onViewChange: (view: string) => void }) {
  const { permission } = usePushNotifications();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedUserId(null);
    setSelectedDriverId(null);
    setSelectedAgentId(null);
    if (currentView !== 'orders') {
      setSelectedOrderId(null);
    }
  }, [currentView]);

  useEffect(() => {
    const handleSelectOrder = (e: any) => {
      const id = typeof e.detail === 'string' ? e.detail : e.detail?.orderId;
      if (id) {
        setSelectedOrderId(id);
      }
    };
    window.addEventListener('select_order', handleSelectOrder as EventListener);
    return () => {
      window.removeEventListener('select_order', handleSelectOrder as EventListener);
    };
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="flex-1 p-4 lg:p-6 2xl:p-content space-y-4 lg:space-y-6 max-w-[1600px] mx-auto">
            {permission === 'denied' && <NotificationDeniedBanner />}
            <WelcomeSection onViewChange={onViewChange} />
            <KpiCards onViewChange={onViewChange} />
            <div className="grid grid-cols-1 xl:grid-cols-4 2xl:grid-cols-3 gap-4 lg:gap-6">
              <div className="xl:col-span-3 2xl:col-span-2 space-y-4 lg:space-y-6">
                <LiveOrderOverview />
                <LiveMap />
                <AnalyticsCharts />
                <RecentOrdersTable />
              </div>
              <div className="xl:col-span-1">
                <RightPanel />
              </div>
            </div>
          </div>
        );
      case 'users':
        if (selectedUserId) {
          return <UserProfileWorkspace userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
        }
        return <UserWorkspace onUserSelect={setSelectedUserId} />;
      case 'sub-admin':
        return <SubAdminManagement />;
      case 'agents':
        if (selectedAgentId) {
          return <AgentProfileWorkspace agentId={selectedAgentId} onBack={() => setSelectedAgentId(null)} />;
        }
        return <AgentWorkspace onAgentSelect={setSelectedAgentId} />;
      case 'user-registration':
        return <UserRegistrationPage onViewChange={onViewChange} />;
      case 'agent-registration':
        return <AgentRegistrationPage />;
      case 'master-role':
        return <RolePage />;
      case 'master-skill':
        return <SkillPage />;
      case 'master-emirate':
      case 'master-state':
        return <StatePage />;
      case 'master-city':
        return <CityPage />;
      case 'master-service':
        return <ServicePage />;
      case 'master-subservice':
        return <SubServicePage />;
      case 'master-brand':
        return <BrandPage />;
      case 'master-color':
        return <ColorPage />;
      case 'master-make':
        return <MakePage />;
      case 'master-model':
        return <ModelPage />;
      case 'master-vehicle-type':
        return <VehicleTypePage />;
      case 'master-fuel-type':
        return <FuelTypePage />;
      case 'master-banner':
        return <BannerPage />;
      case 'promotions':
      case 'master-promotions':
        return (
          <React.Suspense fallback={<StatsShimmer />}>
            <PromotionsModule />
          </React.Suspense>
        );
      case 'drivers':
        if (selectedDriverId) {
          return <DriverDetails driverId={selectedDriverId} onBack={() => setSelectedDriverId(null)} />;
        }
        return <DriverList onDriverSelect={setSelectedDriverId} />;
      case 'orders':
        if (selectedOrderId) {
          return <OrderDetails orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />;
        }
        return <OrderList onSelectOrder={setSelectedOrderId} />;
      case 'payments':
        return <PaymentManager />;
      case 'notifications':
        return <NotificationManager />;
      case 'settings':
        return <SettingsManager />;
      case 'help':
        return <HelpCentre />;
      case 'profile':
        return <ProfileView />;
      case 'reports':
        return <ReportsManager />;
      default:
        return (
          <div className="p-4 lg:p-6 2xl:p-content">
            <h2 className="text-xl 2xl:text-2xl font-bold text-slate-900 capitalize">{currentView.replace('-', ' ')}</h2>
            <p className="text-slate-600 mt-4 text-sm 2xl:text-base">Working on the {currentView} module...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-3.5rem)] 2xl:min-h-[calc(100vh-4rem)]">
      {renderContent()}
    </div>
  );
}
