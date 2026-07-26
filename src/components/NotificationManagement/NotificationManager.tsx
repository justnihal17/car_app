import { useState } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal, ChevronRight, RefreshCw, Send, Clock, Trash2, Edit2, Pause } from 'lucide-react';
import { NOTIFICATIONS, TEMPLATES } from '../../data/notifications';
import { NotificationDashboard } from './NotificationDashboard';
import { CreateNotification } from './CreateNotification';
import { NotificationDetails } from './NotificationDetails';

const STATUS_COLORS: Record<string, string> = {
  'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Scheduled': 'bg-amber-50 text-amber-700 border-amber-200',
  'Failed': 'bg-red-50 text-red-700 border-red-200',
  'Draft': 'bg-slate-100 text-slate-600 border-slate-200',
};

const TYPE_COLORS: Record<string, string> = {
  'Push': 'text-red-700 bg-red-50 border-red-200',
  'SMS': 'text-blue-700 bg-blue-50 border-blue-200',
  'Email': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'In-App': 'text-purple-700 bg-purple-50 border-purple-200',
};

export function NotificationManager() {
  const [activeTab, setActiveTab] = useState('notification-dashboard');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  if (isCreating) {
    return <CreateNotification onBack={() => setIsCreating(false)} />;
  }

  if (selectedNotification) {
    return <NotificationDetails notificationId={selectedNotification} onBack={() => setSelectedNotification(null)} />;
  }

  const renderContent = () => {
    if (activeTab === 'notification-dashboard') {
      return <NotificationDashboard />;
    }

    if (activeTab === 'templates') {
      return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search templates..." 
                  className="bg-slate-50 border border-slate-200 text-sm text-slate-900 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 w-full transition-all"
                />
              </div>
              <button className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm shadow-xs flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Template
              </button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200/80">
                  <th className="px-5 py-4 font-bold">Template ID & Name</th>
                  <th className="px-5 py-4 font-bold">Channel</th>
                  <th className="px-5 py-4 font-bold">Category</th>
                  <th className="px-5 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {TEMPLATES.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{tpl.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">{tpl.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${TYPE_COLORS[tpl.channel] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {tpl.channel}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200 font-medium">{tpl.category}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Default table view for other tabs (Push, SMS, Logs etc.)
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Search and Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search notifications..." 
                className="bg-slate-50 border border-slate-200 text-sm text-slate-900 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 w-full transition-all"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2 text-sm px-3.5 font-semibold">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Advanced Filters</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <select className="bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl px-3.5 py-2 outline-none">
              <option>Status: All</option>
              <option>Delivered</option>
              <option>Scheduled</option>
              <option>Failed</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200/80">
                <th className="px-5 py-4 font-bold">Notification & Message</th>
                <th className="px-5 py-4 font-bold">Channel & Audience</th>
                <th className="px-5 py-4 font-bold">Delivery Stats</th>
                <th className="px-5 py-4 font-bold">Status & Date</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {NOTIFICATIONS.map((notif) => (
                <tr key={notif.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedNotification(notif.id)}>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900 max-w-[200px] truncate">{notif.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 max-w-[250px] truncate">{notif.message}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${TYPE_COLORS[notif.type] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {notif.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      {notif.audience}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-slate-700 flex justify-between w-32 mb-1 font-medium">
                       <span>Sent:</span> <span className="font-mono font-bold text-slate-900">{notif.sent.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-emerald-600 flex justify-between w-32 font-medium">
                       <span>Opened:</span> <span className="font-mono font-bold">{notif.opened.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[notif.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {notif.status}
                    </span>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(notif.date).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {notif.status === 'Scheduled' && (
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"><Pause className="w-4 h-4" /></button>
                      )}
                      {notif.status === 'Failed' && (
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span>Showing 1 to 5 of 450 notifications</span>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 transition-colors flex items-center justify-center" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold shadow-xs">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-transparent hover:bg-white text-slate-600 font-medium">2</button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full bg-slate-50/60 min-h-screen">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Dashboard</span> 
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
            <span className="text-red-600 font-bold">Notification Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Centralized communication hub</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm">
            <Download className="w-4 h-4 text-slate-500" />
            Export Logs
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 text-sm"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            Create Notification
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-200/80 pb-px gap-1">
        {['Notification Dashboard', 'Push Notifications', 'SMS Notifications', 'Email Notifications', 'In-App Notifications', 'Templates', 'Delivery Status', 'Failed Notifications', 'Notification Logs', 'Campaign Analytics'].map(tab => {
          const tabId = tab.toLowerCase().replace(/ /g, '-');
          const isActive = activeTab === tabId;
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive 
                  ? 'border-red-600 text-red-600 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {renderContent()}
    </div>
  );
}

