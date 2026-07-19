import { useState } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight, RefreshCw, FileText, Send, Clock, CheckCircle, XCircle, Trash2, Edit2, Play, Pause } from 'lucide-react';
import { NOTIFICATIONS, TEMPLATES } from '../../data/notifications';
import { NotificationDashboard } from './NotificationDashboard';
import { CreateNotification } from './CreateNotification';
import { NotificationDetails } from './NotificationDetails';

const STATUS_COLORS: Record<string, string> = {
  'Delivered': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Scheduled': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Failed': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Draft': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const TYPE_COLORS: Record<string, string> = {
  'Push': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  'SMS': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Email': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'In-App': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
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
        <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
          <div className="p-5 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search templates..." 
                  className="bg-slate-900 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/50 w-full transition-all"
                />
              </div>
              <button className="px-4 py-2 bg-slate-900 border border-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors text-sm shadow-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Template
              </button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="px-5 py-4 font-medium">Template ID & Name</th>
                  <th className="px-5 py-4 font-medium">Channel</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-800">
                {TEMPLATES.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{tpl.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono">{tpl.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${TYPE_COLORS[tpl.channel] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {tpl.channel}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-300 bg-slate-900 px-2 py-1 rounded text-xs border border-slate-800">{tpl.category}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
      <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
        {/* Search and Filter Bar */}
        <div className="p-5 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search notifications..." 
                className="bg-slate-900 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/50 w-full transition-all"
              />
            </div>
            <button className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-sm px-3">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced Filters</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <select className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 outline-none">
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
              <tr className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-5 py-4 font-medium">Notification & Message</th>
                <th className="px-5 py-4 font-medium">Channel & Audience</th>
                <th className="px-5 py-4 font-medium">Delivery Stats</th>
                <th className="px-5 py-4 font-medium">Status & Date</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800">
              {NOTIFICATIONS.map((notif) => (
                <tr key={notif.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer" onClick={() => setSelectedNotification(notif.id)}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-white max-w-[200px] truncate">{notif.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 max-w-[250px] truncate">{notif.message}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${TYPE_COLORS[notif.type] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {notif.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      {notif.audience}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-slate-300 flex justify-between w-32 mb-1">
                       <span>Sent:</span> <span className="font-mono">{notif.sent.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-emerald-400 flex justify-between w-32">
                       <span>Opened:</span> <span className="font-mono">{notif.opened.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider border ${STATUS_COLORS[notif.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {notif.status}
                    </span>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(notif.date).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {notif.status === 'Scheduled' && (
                        <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"><Pause className="w-4 h-4" /></button>
                      )}
                      {notif.status === 'Failed' && (
                        <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
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
        <div className="p-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Showing 1 to 5 of 450 notifications</span>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white font-medium">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-transparent hover:bg-slate-800 text-slate-400 font-medium">2</button>
            <button className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notification Management</h1>
          <p className="text-sm text-slate-400 mt-1">Centralized communication hub</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm shadow-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm shadow-sm">
            <Download className="w-4 h-4" />
            Export Logs
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm"
          >
            <Send className="w-4 h-4" />
            Create Notification
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-800/60 pb-px">
        {['Notification Dashboard', 'Push Notifications', 'SMS Notifications', 'Email Notifications', 'In-App Notifications', 'Templates', 'Delivery Status', 'Failed Notifications', 'Notification Logs', 'Campaign Analytics'].map(tab => {
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

      {renderContent()}
    </div>
  );
}
