import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { 
  fetchNotifications, 
  markAsRead, 
  markAsUnread, 
  markAllAsRead, 
  deleteNotification,
  clearReadNotifications,
  setFilter 
} from '../../store/notificationSlice';
import { 
  Search, Bell, MoreHorizontal, ChevronRight, RefreshCw, 
  Trash2, CheckCircle2, Circle, Eye, Filter, ArrowUpRight
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { NotificationCategory, NotificationPriority, AppNotification } from '../../types/notification.types';
import toast from 'react-hot-toast';

export function NotificationManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, filters, loading } = useSelector((state: RootState) => state.notifications);
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const params: { is_read?: boolean } = {};
    if (filters.status === 'Read') params.is_read = true;
    if (filters.status === 'Unread') params.is_read = false;
    dispatch(fetchNotifications(params));
  }, [dispatch, filters.status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !(event.target as HTMLElement).closest('.notif-action-menu')) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  const handleRefresh = () => {
    const params: { is_read?: boolean } = {};
    if (filters.status === 'Read') params.is_read = true;
    if (filters.status === 'Unread') params.is_read = false;
    dispatch(fetchNotifications(params));
    toast.success('Notifications refreshed');
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch(priority) {
      case 'Critical': return 'text-red-700 bg-red-50 border-red-200';
      case 'High': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Normal': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Low': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filters.category !== 'All') {
      if (filters.category === 'Agents') {
        const isAgentRelated = 
          n.category === 'Agents' || 
          n.title.toLowerCase().includes('agent') || 
          n.message.toLowerCase().includes('agent');
        if (!isAgentRelated) return false;
      } else {
        if (n.category !== filters.category) return false;
      }
    }
    if (filters.status === 'Unread' && n.isRead) return false;
    if (filters.status === 'Read' && !n.isRead) return false;
    if (filters.priority !== 'All' && n.priority !== filters.priority) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) || 
        n.message.toLowerCase().includes(q) || 
        (n.referenceId && n.referenceId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Dashboard</span> 
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
            <span className="text-red-600 font-bold">Notification Management</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-700 py-1 px-2.5 rounded-full text-xs font-bold border border-red-200">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">Monitor and manage system updates, alerts, and user activities.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to clear all notifications?')) {
                dispatch(clearReadNotifications());
                toast.success('All notifications cleared');
              }
            }}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
          
          <button 
            onClick={() => {
              dispatch(markAllAsRead());
              toast.success('All marked as read');
            }}
            disabled={unreadCount === 0}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all text-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4 bg-slate-50/50">
          <div className="relative w-full md:max-w-xs flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={filters.search}
              onChange={(e) => dispatch(setFilter({ search: e.target.value }))}
              className="bg-white border border-slate-200 text-sm text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 w-full transition-all shadow-xs"
            />
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs shrink-0">
              {['All', 'Unread', 'Read'].map((status) => (
                <button
                  key={status}
                  onClick={() => dispatch(setFilter({ status: status as any }))}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filters.status === status ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {status}
                </button>
              ))}
            </div>

            <select 
              value={filters.category}
              onChange={(e) => dispatch(setFilter({ category: e.target.value as any }))}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 shadow-xs shrink-0 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Orders">Orders</option>
              <option value="Payments">Payments</option>
              <option value="Users">Users</option>
              <option value="Agents">Agents</option>
              <option value="Promotions">Promotions</option>
              <option value="System">System</option>
            </select>
          </div>
        </div>

        {/* List View */}
        <div className="overflow-x-auto custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="px-4 py-20 text-center flex flex-col items-center justify-center bg-white">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                <Bell className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No notifications found</h3>
              <p className="text-sm text-slate-500 mt-1.5 max-w-[280px]">
                {notifications.length === 0 
                  ? 'New order, user, agent, payment, and system updates will appear here.'
                  : 'Try adjusting your filters or search query.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200/80">
                  <th className="px-5 py-4 w-[60px] text-center">Status</th>
                  <th className="px-5 py-4">Notification Details</th>
                  <th className="px-5 py-4">Category & Priority</th>
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {filteredNotifications.map((notif) => (
                  <tr 
                    key={notif.id} 
                    className={`group transition-colors ${notif.isRead ? 'bg-white hover:bg-slate-50/50' : 'bg-red-50/20 hover:bg-red-50/40'}`}
                  >
                    <td className="px-5 py-4 text-center align-top pt-5">
                      <div className="flex justify-center">
                        {notif.isRead ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white ring-1 ring-slate-200"></div>
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white ring-1 ring-red-200 animate-pulse"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top max-w-[400px]">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[15px] truncate ${notif.isRead ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                          {notif.title}
                        </span>
                        <span className={`text-sm whitespace-normal break-words line-clamp-2 ${notif.isRead ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                          {notif.message}
                        </span>
                        {notif.referenceId && (
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 w-fit px-2 py-0.5 rounded-md border border-slate-200">
                            Ref: <span className="text-slate-700">{notif.referenceId}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top pt-5">
                      <div className="flex flex-col gap-2">
                        <span className="inline-flex w-fit px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {notif.category}
                        </span>
                        <span className={`inline-flex w-fit px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(notif.priority)}`}>
                          {notif.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top pt-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(notif.createdAt), 'MMM dd, hh:mm a')}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right align-top pt-4">
                      <div className="relative inline-block text-left notif-action-menu">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === notif.id ? null : notif.id)}
                          className={`p-2 rounded-xl transition-all border ${activeMenu === notif.id ? 'bg-slate-100 border-slate-200 text-slate-900 shadow-sm' : 'bg-white border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm opacity-0 group-hover:opacity-100'}`}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        
                        {activeMenu === notif.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl shadow-slate-200/50 bg-white border border-slate-200 p-1.5 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                            {notif.isRead ? (
                              <button 
                                onClick={() => { dispatch(markAsUnread(notif.id)); setActiveMenu(null); }}
                                className="w-full text-left flex items-center px-3 py-2 text-sm text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Circle className="mr-2.5 w-4 h-4 text-slate-400" /> Mark as unread
                              </button>
                            ) : (
                              <button 
                                onClick={() => { dispatch(markAsRead(notif.id)); setActiveMenu(null); }}
                                className="w-full text-left flex items-center px-3 py-2 text-sm text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <CheckCircle2 className="mr-2.5 w-4 h-4 text-emerald-500" /> Mark as read
                              </button>
                            )}
                            
                            {notif.actionUrl && (
                              <button 
                                onClick={() => {
                                  dispatch(markAsRead(notif.id));
                                  if (notif.actionUrl === '/orders' || notif.actionUrl?.includes('orders')) {
                                    window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'orders' } }));
                                    const targetId = notif.entityId || notif.referenceId;
                                    if (targetId) {
                                      setTimeout(() => {
                                        window.dispatchEvent(new CustomEvent('select_order', { detail: targetId }));
                                      }, 100);
                                    }
                                  } else {
                                    window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: notif.actionUrl } }));
                                  }
                                  setActiveMenu(null);
                                }}
                                className="w-full text-left flex items-center px-3 py-2 text-sm text-slate-600 font-medium hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <ArrowUpRight className="mr-2.5 w-4 h-4 text-blue-500" /> View Record
                              </button>
                            )}
                            
                            <div className="h-px bg-slate-200 my-1.5 mx-2"></div>
                            
                            <button 
                              onClick={() => {
                                if(window.confirm('Are you sure you want to delete this notification?')) {
                                  dispatch(deleteNotification(notif.id));
                                }
                                setActiveMenu(null);
                              }}
                              className="w-full text-left flex items-center px-3 py-2 text-sm text-slate-600 font-medium hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors group"
                            >
                              <Trash2 className="mr-2.5 w-4 h-4 text-red-500 group-hover:text-red-600" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination mock */}
        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>Showing {filteredNotifications.length} notifications</span>
          </div>
        )}
      </div>
    </div>
  );
}
