import { useState } from 'react';
import { Calendar, Filter, MapPin, SlidersHorizontal, Download, Play, PieChart, Users, DollarSign, Bell } from 'lucide-react';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { CustomReportBuilder } from './CustomReportBuilder';

export function ReportsManager() {
  const [activeTab, setActiveTab] = useState('executive-dashboard');
  const [dateRange, setDateRange] = useState('Today');

  const renderContent = () => {
    if (activeTab === 'executive-dashboard') {
      return <ExecutiveDashboard />;
    }
    if (activeTab === 'custom-reports') {
      return <CustomReportBuilder />;
    }
    
    // Placeholder for other report views (Revenue, Customer, etc.)
    return (
      <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-12 flex flex-col items-center justify-center text-center">
        <PieChart className="w-16 h-16 text-slate-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Detailed Report View</h2>
        <p className="text-slate-400 max-w-md">
          This section contains specialized analytics and BI visualizations for {activeTab.replace('-', ' ')}. 
          Connect to a charting library like Recharts to render the full data.
        </p>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Business Intelligence Center</p>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer appearance-none pr-4"
          >
            <option className="bg-slate-900">Today</option>
            <option className="bg-slate-900">Yesterday</option>
            <option className="bg-slate-900">Last 7 Days</option>
            <option className="bg-slate-900">Last 30 Days</option>
            <option className="bg-slate-900">Quarter</option>
            <option className="bg-slate-900">Year</option>
          </select>
        </div>
        
        <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
        
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-slate-400" />
          <select className="bg-transparent text-slate-300 focus:outline-none cursor-pointer appearance-none pr-4">
            <option className="bg-slate-900">All Cities</option>
            <option className="bg-slate-900">Dubai</option>
            <option className="bg-slate-900">Abu Dhabi</option>
          </select>
        </div>
        
        <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
        
        <button className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
          <Filter className="w-4 h-4" /> More Filters
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-800/60 pb-px">
        {[
          'Executive Dashboard', 'Revenue Reports', 'Customer Reports', 
          'Driver Reports', 'Service Reports', 'Order Reports', 
          'Payment Reports', 'Refund Reports', 'Notification Reports', 
          'Operational Reports', 'Custom Reports', 'Scheduled Reports'
        ].map(tab => {
          const tabId = tab.toLowerCase().replace(/ /g, '-');
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tabId 
                  ? 'border-emerald-500 text-emerald-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      {renderContent()}
    </div>
  );
}
