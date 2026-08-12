import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { fetchOrders } from '../store/orderSlice';
import { WelcomeSection } from './WelcomeSection';
import { KpiCards } from './KpiCards';
import { LiveOrderOverview } from './LiveOrderOverview';
import { NotificationDeniedBanner } from './NotificationDeniedBanner';
import { usePushNotifications } from '../hooks/usePushNotifications';
import React, { Suspense } from 'react';
import { StatsShimmer } from './shimmer/ShimmerLoader';

// Lazy load all route-level modules (none of these are needed for initial Dashboard render)
const UserRegistrationPage = React.lazy(() => import('./UserManagement/registration/UserRegistrationPage').then(m => ({ default: m.UserRegistrationPage })));
const AgentRegistrationPage = React.lazy(() => import('./AgentManagement/registration/AgentRegistrationPage').then(m => ({ default: m.AgentRegistrationPage })));
const ProfileView = React.lazy(() => import('./ProfileView').then(m => ({ default: m.ProfileView })));

// Master Management pages (all share MasterPage ~1480 lines — Rollup groups them into one chunk)
const RolePage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.RolePage })));
const SkillPage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.SkillPage })));
const StatePage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.StatePage })));
const CityPage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.CityPage })));
const ServicePage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.ServicePage })));
const SubServicePage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.SubServicePage })));
const BrandPage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.BrandPage })));
const ColorPage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.ColorPage })));
const MakePage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.MakePage })));
const ModelPage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.ModelPage })));
const VehicleTypePage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.VehicleTypePage })));
const FuelTypePage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.FuelTypePage })));
const BannerPage = React.lazy(() => import('./MasterManagement/MasterViews').then(m => ({ default: m.BannerPage })));

const UserWorkspace = React.lazy(() => import('./UserManagement/UserWorkspace').then(m => ({ default: m.UserWorkspace })));
const UserProfileWorkspace = React.lazy(() => import('./UserManagement/UserProfileWorkspace').then(m => ({ default: m.UserProfileWorkspace })));
const DriverList = React.lazy(() => import('./DriverManagement/DriverList').then(m => ({ default: m.DriverList })));
const DriverDetails = React.lazy(() => import('./DriverManagement/DriverDetails').then(m => ({ default: m.DriverDetails })));
const OrderList = React.lazy(() => import('./OrderManagement/OrderList').then(m => ({ default: m.OrderList })));
const OrderDetails = React.lazy(() => import('./OrderManagement/OrderDetails').then(m => ({ default: m.OrderDetails })));
const SettingsManager = React.lazy(() => import('./SettingsManagement/SettingsManager').then(m => ({ default: m.SettingsManager })));
const HelpCentre = React.lazy(() => import('./HelpCentre').then(m => ({ default: m.HelpCentre })));
const PaymentManager = React.lazy(() => import('./PaymentManagement/PaymentManager').then(m => ({ default: m.PaymentManager })));
const NotificationManager = React.lazy(() => import('./NotificationManagement/NotificationManager').then(m => ({ default: m.NotificationManager })));
const SubAdminManagement = React.lazy(() => import('./SubAdminManagement/SubAdminList').then(m => ({ default: m.SubAdminManagement })));
const AgentWorkspace = React.lazy(() => import('./AgentManagement/AgentWorkspace').then(m => ({ default: m.AgentWorkspace })));
const AgentProfileWorkspace = React.lazy(() => import('./AgentManagement/AgentProfileWorkspace').then(m => ({ default: m.AgentProfileWorkspace })));
const ReportsManager = React.lazy(() => import('./ReportsManagement/ReportsManager').then(m => ({ default: m.ReportsManager })));
const PromotionsModule = React.lazy(() => import('./PromotionsManagement/PromotionsModule'));



export function DashboardContent({ currentView, onViewChange }: { currentView: string; onViewChange: (view: string) => void }) {
  const dispatch = useDispatch<AppDispatch>();
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
    if (currentView === 'dashboard') {
      dispatch(fetchOrders({ page: 1, limit: 10 }));
    }
  }, [currentView, dispatch]);

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
            <KpiCards onViewChange={onViewChange} />
            <div className="space-y-4 lg:space-y-6">
              <LiveOrderOverview />
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
      case 'help':
        return <HelpCentre />;
      case 'profile':
        return <ProfileView />;
      case 'reports':
      case 'report-users':
      case 'report-agents':
      case 'report-revenue':
        return <ReportsManager currentView={currentView} />;
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
      <Suspense fallback={<div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin"></div></div>}>
        {renderContent()}
      </Suspense>
    </div>
  );
}
