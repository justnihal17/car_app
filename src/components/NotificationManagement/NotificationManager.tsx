import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  clearReadNotifications,
  setFilter 
} from '../../store/notificationSlice';
import { 
  Search, Bell, ChevronRight, RefreshCw, 
  Trash2, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';

export function NotificationManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, filters, loading } = useSelector((state: RootState) => state.notifications);
  
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const params: { is_read?: boolean } = {};
    if (filters.status === 'Read') params.is_read = true;
    if (filters.status === 'Unread') params.is_read = false;
    dispatch(fetchNotifications(params));
  }, [dispatch, filters.status]);

  const handleRefresh = () => {
    const params: { is_read?: boolean } = {};
    if (filters.status === 'Read') params.is_read = true;
    if (filters.status === 'Unread') params.is_read = false;
    dispatch(fetchNotifications(params));
    toast.success('Notifications refreshed');
  };

  const handleNotificationClick = (notif: any) => {
    // Only mark as read if currently unread (cannot be unmarked back to unread)
    if (!notif.isRead) {
      dispatch(markAsRead(notif.id));
    }

    let payloadData: any = {};
    try {
      payloadData = typeof notif.payload === 'string' ? JSON.parse(notif.payload) : (notif.payload || {});
    } catch (e) {}

    const extractOrd = (txt: any) => (typeof txt === 'string' ? (txt.match(/ORD\d{4,10}/i)?.[0] || '') : '');

    const targetId =
      notif.order_number ||
      notif.orderNumber ||
      payloadData.order_number ||
      payloadData.orderNumber ||
      notif.entityId ||
      notif.referenceId ||
      payloadData.orderId ||
      payloadData.order_id ||
      payloadData._id ||
      (notif.actionUrl?.includes('orders/') ? notif.actionUrl.split('orders/')[1] : (notif.actionUrl?.includes('order/') ? notif.actionUrl.split('order/')[1] : null)) ||
      extractOrd(notif.title) ||
      extractOrd(notif.message);

    if (targetId) {
      window.dispatchEvent(new CustomEvent('navigate_view', { detail: `/order/${targetId}` }));
      window.dispatchEvent(new CustomEvent('select_order', { detail: targetId }));
    } else if (notif.actionUrl) {
      window.dispatchEvent(new CustomEvent('navigate_view', { detail: notif.actionUrl }));
    } else {
      window.dispatchEvent(new CustomEvent('navigate_view', { detail: '/order' }));
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filters.status === 'Unread' && n.isRead) return false;
    if (filters.status === 'Read' && !n.isRead) return false;
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
    <div className="p-3.5 sm:p-4 lg:p-5 space-y-3.5 sm:space-y-4 w-full bg-slate-50/60 min-h-screen animate-in fade-in duration-200">
      {/* Header with Title and Search/Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            <button 
              type="button"
              className="cursor-pointer hover:text-red-600 transition-colors font-medium uppercase tracking-wider"
              onClick={() => window.dispatchEvent(new CustomEvent('navigate_view', { detail: 'dashboard' }))}
            >
              Dashboard
            </button> 
            <ChevronRight className="w-3 h-3 text-slate-400" /> 
            <span className="text-red-600 font-semibold">Notification Management</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="bg-red-50 text-red-700 py-0.5 px-2 rounded-md text-[10px] font-semibold border border-red-200">
                {unreadCount} Unread
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/90 rounded-lg shadow-2xs transition-all active:scale-95 flex items-center justify-center h-8 w-8 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
          </button>
          
          <button 
            onClick={() => setIsClearAllModalOpen(true)}
            disabled={notifications.length === 0}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 border border-slate-200/90 font-semibold rounded-lg shadow-2xs transition-all text-xs flex items-center gap-1.5 h-8 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            Clear All
          </button>
          
          <button 
            onClick={() => {
              dispatch(markAllAsRead());
              toast.success('All marked as read');
            }}
            disabled={unreadCount === 0}
            className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-xs transition-all active:scale-95 text-xs flex items-center gap-1.5 h-8 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div className="relative w-full md:max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={filters.search}
              onChange={(e) => dispatch(setFilter({ search: e.target.value }))}
              className="bg-[#F8FAFC] border border-slate-200 text-xs text-slate-800 rounded-lg pl-8 pr-3 h-8 focus:outline-none focus:border-red-500 focus:bg-white w-full transition-all shadow-2xs"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-[#F8FAFC] border border-slate-200/90 rounded-lg p-0.5 shadow-2xs shrink-0">
            {['All', 'Unread', 'Read'].map((status) => (
              <button
                key={status}
                onClick={() => dispatch(setFilter({ status: status as any }))}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filters.status === status 
                    ? 'bg-slate-900 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* List View */}
        <div className="overflow-x-auto custom-scrollbar min-h-[300px]">
          {filteredNotifications.length === 0 ? (
            <div className="px-4 py-16 text-center flex flex-col items-center justify-center bg-white">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100 shadow-2xs">
                <Bell className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-xs font-semibold text-slate-800">No notifications found</h3>
              <p className="text-[11px] text-slate-500 mt-1 max-w-64">
                {notifications.length === 0 
                  ? 'New order, user, agent, payment, and system updates will appear here.'
                  : 'Try adjusting your search query or filter tab.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="px-3.5 py-2.5 w-12 text-center">Status</th>
                  <th className="px-3.5 py-2.5">Notification Details</th>
                  <th className="px-3.5 py-2.5">Time</th>
                  <th className="px-3.5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredNotifications.map((notif) => (
                  <tr 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)}
                    className={`group transition-colors cursor-pointer ${
                      notif.isRead 
                        ? 'bg-white hover:bg-slate-50/50' 
                        : 'bg-slate-50/40 hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-3.5 py-2.5 text-center align-top pt-3">
                      <div className="flex justify-center">
                        {notif.isRead ? (
                          <div className="w-2 h-2 rounded-full bg-slate-300 border border-white ring-1 ring-slate-200" title="Read"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-red-600 border border-white ring-1 ring-red-300 animate-pulse" title="Unread"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 align-top max-w-md">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs truncate ${notif.isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>
                            {notif.title}
                          </span>
                          {notif.actionUrl && (
                            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-red-600 transition-colors" />
                          )}
                        </div>
                        <span className={`text-[11px] whitespace-normal wrap-break-words line-clamp-2 ${notif.isRead ? 'text-slate-400 font-normal' : 'text-slate-600 font-normal'}`}>
                          {notif.message}
                        </span>
                        {notif.referenceId && (
                          <div className="mt-1 flex items-center gap-1 text-[9px] font-medium text-slate-500 uppercase tracking-wider bg-slate-100 w-fit px-1.5 py-0.2 rounded border border-slate-200">
                            Ref: <span className="text-slate-700 font-semibold">{notif.referenceId}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 align-top pt-3">
                      <div className="text-xs font-normal text-slate-500 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</div>
                        <div className="text-[10px] text-slate-400">{format(new Date(notif.createdAt), 'dd MMM yyyy, hh:mm a')}</div>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 align-top pt-3 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(notif.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 hover:border-red-100 transition-all shadow-2xs cursor-pointer inline-flex items-center justify-center"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination footer */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-normal">
              <span>Showing</span>
              <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                {filteredNotifications.length === 0 ? 0 : 1} – {filteredNotifications.length}
              </span>
              <span>of</span>
              <span className="font-semibold text-slate-800">{filteredNotifications.length}</span>
              <span>results</span>
            </div>
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isClearAllModalOpen}
        name="all notifications"
        title="Clear All Notifications?"
        description="Are you sure you want to clear all notifications? This action cannot be undone."
        onCancel={() => setIsClearAllModalOpen(false)}
        onConfirm={async () => {
          await dispatch(clearReadNotifications());
          toast.success('All notifications cleared');
          setIsClearAllModalOpen(false);
        }}
      />

      {/* Single Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingId}
        name="notification"
        title="Delete Notification?"
        description="Are you sure you want to delete this notification?"
        onCancel={() => setDeletingId(null)}
        onConfirm={async () => {
          if (deletingId) {
            await dispatch(deleteNotification(deletingId));
            toast.success('Notification deleted');
            setDeletingId(null);
          }
        }}
      />
    </div>
  );
}
