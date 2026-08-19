import { useEffect } from 'react';
import { usePushNotifications } from '../context/NotificationContext';
import { Loader2, Bell, CheckCheck, Check, X, CheckCircle2 } from 'lucide-react';

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markRead, markAllRead, fetchBackendNotifications, navigateToOrder } = usePushNotifications();

  useEffect(() => {
    fetchBackendNotifications().catch(() => {});
  }, [fetchBackendNotifications]);

  return (
    <div className="fixed top-16 right-6 w-96 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[520px] animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-slate-900 font-extrabold text-sm flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-800 text-white rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              title="Mark all as read"
              className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Seen</span>
            </button>
          )}
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications Body List */}
      <div className="overflow-y-auto flex-1 p-3 space-y-2.5 divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-slate-600 font-bold text-sm">No notifications</p>
            <p className="text-xs text-slate-400 max-w-[200px]">You are all caught up! New order and system alerts will appear here.</p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const notifId = n.id || n._id || `notif-${i}`;
            const isUnread = !n.isRead && !n.read;
            return (
              <div 
                key={notifId} 
                onClick={() => {
                  if (isUnread) markRead(notifId);
                  
                  let notifPayload: any = {};
                  try {
                    notifPayload = typeof n.payload === 'string' ? JSON.parse(n.payload) : (n.payload || {});
                  } catch (e) {}
                  
                  const targetOrderId = n.entityId || n.referenceId || n.entity_id || n.reference_id || notifPayload._id || notifPayload.orderId || notifPayload.order_id || notifPayload.referenceId || notifPayload.reference_id || notifPayload.entityId || notifPayload.entity_id || (n.actionUrl && n.actionUrl.includes('orders/') ? n.actionUrl.split('orders/')[1] : (n.actionUrl && n.actionUrl.includes('order/') ? n.actionUrl.split('order/')[1] : null));
                  
                  if (targetOrderId || (n.actionUrl && (n.actionUrl.includes('orders') || n.actionUrl.includes('order')))) {
                    navigateToOrder(targetOrderId, n.actionUrl);
                    onClose();
                  }
                }}
                className={`pt-2.5 first:pt-0 pb-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                  isUnread ? 'bg-slate-50/60 hover:bg-slate-100/70 border-l-4 border-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-bold ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title || n.message || 'Notification Alert'}
                      </p>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-slate-800 shrink-0 animate-pulse" />
                      )}
                    </div>
                    {n.description && (
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {n.description}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                    </p>
                  </div>

                  {isUnread ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead(notifId);
                      }}
                      title="Mark as seen"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all shrink-0 mt-0.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 opacity-60" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
