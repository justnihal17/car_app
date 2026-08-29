import React from 'react';
import toast from 'react-hot-toast';
import { store } from '../store/store';
import { createNotification } from '../store/notificationSlice';
import { AppNotification } from '../types/notification.types';

/**
 * Dispatches a centralized notification to Redux, triggers the UI toast,
 * and increments the unread badge automatically.
 */
export const triggerSystemNotification = (data: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
  // 1. Dispatch to Redux store (persists to mock API and updates UI)
  store.dispatch(createNotification(data));

  // 2. Trigger native OS notification if allowed
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(data.title, {
      body: data.message,
      icon: '/vite.svg', // replace with actual icon if needed
    });
  }

  // 3. Trigger Toast notification
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl pointer-events-auto flex flex-col border border-slate-100 p-4 space-y-3 ring-1 ring-slate-900/5 relative overflow-hidden`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600" />
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg border border-red-100 shadow-sm shrink-0">
              🔔
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{data.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{data.message}</p>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg text-xs p-1.5 font-bold transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {data.referenceId && (
          <div className="bg-slate-50/80 rounded-xl p-3 text-xs space-y-2 border border-slate-100 mt-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-500 font-medium whitespace-nowrap">Reference:</span>
              <span className="font-bold text-slate-900 break-words text-right">{data.referenceId}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-500 font-medium whitespace-nowrap">Category:</span>
              <span className="font-semibold text-slate-700 break-words text-right">{data.category}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          {data.actionUrl && (
            <button
              onClick={() => {
                toast.dismiss(t.id);
                if (data.actionUrl === '/orders' || data.actionUrl === '/order' || data.actionUrl?.includes('orders') || data.actionUrl?.includes('order')) {
                  window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'order' } }));
                  const targetId = data.entityId || data.referenceId || (data.actionUrl?.includes('orders/') ? data.actionUrl.split('orders/')[1] : (data.actionUrl?.includes('order/') ? data.actionUrl.split('order/')[1] : null));
                  if (targetId) {
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('select_order', { detail: targetId }));
                    }, 100);
                  }
                } else {
                  window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: data.actionUrl } }));
                }
              }}
              className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-500/20 text-center cursor-pointer active:scale-[0.98]"
            >
              View Record
            </button>
          )}
          <button
            onClick={() => toast.dismiss(t.id)}
            className={`${data.actionUrl ? 'px-4' : 'flex-1'} py-2 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer border border-slate-200 hover:border-slate-300`}
          >
            Dismiss
          </button>
        </div>
      </div>
    ),
    { duration: 5000 }
  );
};
