import React, { useState, useEffect, Suspense } from 'react';
import { PieChart } from 'lucide-react';
import { StatsShimmer } from '../shimmer/ShimmerLoader';

// Lazy load report views — each pulls in recharts (~170KB), so they should only load on demand
const ExecutiveDashboard = React.lazy(() => import('./ExecutiveDashboard').then(m => ({ default: m.ExecutiveDashboard })));
const CustomReportBuilder = React.lazy(() => import('./CustomReportBuilder').then(m => ({ default: m.CustomReportBuilder })));
const UserReportView = React.lazy(() => import('./UserReportView').then(m => ({ default: m.UserReportView })));
const AgentReportView = React.lazy(() => import('./AgentReportView').then(m => ({ default: m.AgentReportView })));
const RevenueReportView = React.lazy(() => import('./RevenueReportView').then(m => ({ default: m.RevenueReportView })));

export function ReportsManager({ currentView }: { currentView?: string }) {
  const getTabFromView = (view?: string) => {
    if (view === 'report-agents') return 'agent-reports';
    if (view === 'report-revenue') return 'revenue-reports';
    return 'user-reports';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromView(currentView));

  useEffect(() => {
    if (currentView) {
      setActiveTab(getTabFromView(currentView));
    }
  }, [currentView]);

  const renderContent = () => {
    if (activeTab === 'agent-reports') {
      return <AgentReportView />;
    }
    if (activeTab === 'revenue-reports' || activeTab === 'report-revenue') {
      return <RevenueReportView />;
    }
    return <UserReportView />;
  };

  return (
    <div className="p-3.5 sm:p-4 lg:p-5 space-y-3.5 sm:space-y-4 w-full bg-slate-50/60 min-h-screen animate-in fade-in duration-200">
      {/* Content Area */}
      <Suspense fallback={<StatsShimmer />}>
        {renderContent()}
      </Suspense>
    </div>
  );
}

