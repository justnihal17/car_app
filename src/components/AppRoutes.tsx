import React, { Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { fetchOrders } from '../store/orderSlice';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { NotificationDeniedBanner } from './NotificationDeniedBanner';
import { KpiCards } from './KpiCards';
import { LiveOrderOverview } from './LiveOrderOverview';
import { StatsShimmer } from './shimmer/ShimmerLoader';

// Lazy load route-level modules
const UserRegistrationPage = React.lazy(() => import('./UserManagement/registration/UserRegistrationPage').then(m => ({ default: m.UserRegistrationPage })));
const AgentRegistrationPage = React.lazy(() => import('./AgentManagement/registration/AgentRegistrationPage').then(m => ({ default: m.AgentRegistrationPage })));
const ProfileView = React.lazy(() => import('./ProfileView').then(m => ({ default: m.ProfileView })));

// Master Management pages 
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
const PaymentManager = React.lazy(() => import('./PaymentManagement/PaymentManager').then(m => ({ default: m.PaymentManager })));
const NotificationManager = React.lazy(() => import('./NotificationManagement/NotificationManager').then(m => ({ default: m.NotificationManager })));
const SubAdminManagement = React.lazy(() => import('./SubAdminManagement/SubAdminList').then(m => ({ default: m.SubAdminManagement })));
const AgentWorkspace = React.lazy(() => import('./AgentManagement/AgentWorkspace').then(m => ({ default: m.AgentWorkspace })));
const AgentProfileWorkspace = React.lazy(() => import('./AgentManagement/AgentProfileWorkspace').then(m => ({ default: m.AgentProfileWorkspace })));
const ReportsManager = React.lazy(() => import('./ReportsManagement/ReportsManager').then(m => ({ default: m.ReportsManager })));
const PromotionsModule = React.lazy(() => import('./PromotionsManagement/PromotionsModule'));
const SubscriptionManagement = React.lazy(() => import('./SubscriptionManagement').then(m => ({ default: m.SubscriptionManagement })));
const HelpCentre = React.lazy(() => import('./HelpCentre').then(m => ({ default: m.HelpCentre })));

// Wrapper for Dashboard Home to preserve its exact layout and initialization
const DashboardHome = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { permission } = usePushNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, limit: 10 }));
  }, [dispatch]);

  return (
    <div className="flex-1 p-4 lg:p-6 2xl:p-content space-y-4 lg:space-y-6 max-w-[1600px] mx-auto">
      {permission === 'denied' && <NotificationDeniedBanner />}
      <KpiCards onViewChange={(view) => navigate(`/${view}`)} />
      <div className="space-y-4 lg:space-y-6">
        <LiveOrderOverview />
      </div>
    </div>
  );
};

// Route Wrappers to preserve existing component APIs
const UserWorkspaceRoute = () => {
  const navigate = useNavigate();
  return <UserWorkspace onUserSelect={(id) => navigate(`/user-management/${id}`)} />;
};

const UserProfileWorkspaceRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return <UserProfileWorkspace userId={id!} onBack={() => navigate('/user-management')} />;
};

const AgentWorkspaceRoute = () => {
  const navigate = useNavigate();
  return <AgentWorkspace onAgentSelect={(id) => navigate(`/agent-management/${id}`)} />;
};

const AgentProfileWorkspaceRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return <AgentProfileWorkspace agentId={id!} onBack={() => navigate('/agent-management')} />;
};

const OrderListRoute = () => {
  const navigate = useNavigate();
  return <OrderList onSelectOrder={(id) => navigate(`/order/${id}`)} />;
};

const OrderDetailsRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return <OrderDetails orderId={id!} onBack={() => navigate('/order')} />;
};

const DriverListRoute = () => {
  const navigate = useNavigate();
  return <DriverList onDriverSelect={(id) => navigate(`/drivers/${id}`)} />;
};

const DriverDetailsRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return <DriverDetails driverId={id!} onBack={() => navigate('/drivers')} />;
};

const ReportsManagerRoute = () => {
  // Extract report type from URL if possible
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const currentView = pathParts.length > 2 ? `report-${pathParts[2]}` : 'reports';
  return <ReportsManager currentView={currentView} />;
};

const UserRegistrationRoute = () => {
  const navigate = useNavigate();
  return <UserRegistrationPage onViewChange={(view) => navigate(`/${view}`)} />;
};

export function AppRoutes() {
  const navigate = useNavigate();

  // Listen to select_order event from push notifications/header
  useEffect(() => {
    const handleSelectOrder = (e: any) => {
      const id = typeof e.detail === 'string' ? e.detail : e.detail?.orderId;
      if (id) {
        navigate(`/order/${id}`);
      }
    };
    window.addEventListener('select_order', handleSelectOrder as EventListener);
    return () => {
      window.removeEventListener('select_order', handleSelectOrder as EventListener);
    };
  }, [navigate]);

  return (
    <Suspense fallback={
      <div className="p-4 lg:p-6 2xl:p-content max-w-[1600px] mx-auto">
        <StatsShimmer />
      </div>
    }>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        
        {/* Profile Management */}
        <Route path="/sub-admin" element={<SubAdminManagement />} />
        <Route path="/user-management" element={<UserWorkspaceRoute />} />
        <Route path="/user-management/:id" element={<UserProfileWorkspaceRoute />} />
        <Route path="/agent-management" element={<AgentWorkspaceRoute />} />
        <Route path="/agent-management/:id" element={<AgentProfileWorkspaceRoute />} />
        
        {/* Registrations */}
        <Route path="/user-registration" element={<UserRegistrationRoute />} />
        <Route path="/agent-registration" element={<AgentRegistrationPage />} />
        
        {/* Master Management */}
        <Route path="/master/role" element={<RolePage />} />
        <Route path="/master/skill" element={<SkillPage />} />
        <Route path="/master/emirate" element={<StatePage />} />
        <Route path="/master/state" element={<StatePage />} />
        <Route path="/master/city" element={<CityPage />} />
        <Route path="/master/service" element={<ServicePage />} />
        <Route path="/master/subservice" element={<SubServicePage />} />
        <Route path="/master/brand" element={<BrandPage />} />
        <Route path="/master/color" element={<ColorPage />} />
        <Route path="/master/make" element={<MakePage />} />
        <Route path="/master/model" element={<ModelPage />} />
        <Route path="/master/vehicle-type" element={<VehicleTypePage />} />
        <Route path="/master/fuel-type" element={<FuelTypePage />} />
        <Route path="/master/banner" element={<BannerPage />} />
        
        {/* Other Core Modules */}
        <Route path="/promotions" element={<PromotionsModule />} />
        <Route path="/subscriptions" element={<SubscriptionManagement />} />
        <Route path="/subscription" element={<SubscriptionManagement />} />
        <Route path="/order" element={<OrderListRoute />} />
        <Route path="/order/:id" element={<OrderDetailsRoute />} />
        <Route path="/payments" element={<PaymentManager />} />
        <Route path="/notifications" element={<NotificationManager />} />
        <Route path="/help" element={<HelpCentre />} />
        
        {/* Reports */}
        <Route path="/reports" element={<ReportsManagerRoute />} />
        <Route path="/reports/users" element={<ReportsManagerRoute />} />
        <Route path="/reports/agents" element={<ReportsManagerRoute />} />
        <Route path="/reports/revenue" element={<ReportsManagerRoute />} />
        
        <Route path="/profile" element={<ProfileView />} />
        
        {/* 404 Fallback */}
        <Route path="*" element={
          <div className="p-4 lg:p-6 2xl:p-content max-w-[1600px] mx-auto text-center">
            <h2 className="text-xl 2xl:text-2xl font-bold text-slate-900 mt-10">404 - Page Not Found</h2>
            <p className="text-slate-600 mt-2 text-sm 2xl:text-base">The page you are looking for does not exist.</p>
          </div>
        } />
      </Routes>
    </Suspense>
  );
}
