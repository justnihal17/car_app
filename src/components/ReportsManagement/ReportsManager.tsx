import { useState, useEffect } from 'react';
import { Calendar, Filter, MapPin, SlidersHorizontal, Download, Play, PieChart, Users, DollarSign, Bell } from 'lucide-react';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { CustomReportBuilder } from './CustomReportBuilder';
import { UserReportView } from './UserReportView';
import { AgentReportView } from './AgentReportView';
import { RevenueReportView } from './RevenueReportView';

export function ReportsManager({ currentView }: { currentView?: string }) {
  const getTabFromView = (view?: string) => {
    if (view === 'report-users') return 'user-reports';
    if (view === 'report-agents') return 'agent-reports';
    if (view === 'report-revenue') return 'revenue-reports';
    return 'executive-dashboard';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromView(currentView));
  const [dateRange, setDateRange] = useState('Today');

  useEffect(() => {
    if (currentView) {
      setActiveTab(getTabFromView(currentView));
    }
  }, [currentView]);

  const renderContent = () => {
    if (activeTab === 'executive-dashboard') {
      return <ExecutiveDashboard />;
    }
    if (activeTab === 'custom-reports') {
      return <CustomReportBuilder />;
    }
    if (activeTab === 'user-reports' || activeTab === 'customer-reports') {
      return <UserReportView />;
    }
    if (activeTab === 'agent-reports') {
      return <AgentReportView />;
    }
    if (activeTab === 'revenue-reports' || activeTab === 'report-revenue') {
      return <RevenueReportView />;
    }
    
    // Placeholder for other report views (Revenue, Service, etc.)
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 flex flex-col items-center justify-center text-center">
        <PieChart className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Detailed Report View</h2>
        <p className="text-slate-500 max-w-md text-sm">
          This section contains specialized analytics and BI visualizations for {activeTab.replace('-', ' ')}.
        </p>
      </div>
    );
  };

  return (
    <div className="p-4 md:px-8 md:pb-8 md:pt-2 max-w-7xl mx-auto space-y-4">
      {/* Content Area */}
      {renderContent()}
    </div>
  );
}
