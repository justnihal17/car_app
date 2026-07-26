import { ChevronLeft } from 'lucide-react';
import { NOTIFICATIONS } from '../../data/notifications';

export function NotificationDetails({ notificationId, onBack }: { notificationId: string, onBack: () => void }) {
  const notification = NOTIFICATIONS.find(n => n.id === notificationId);

  if (!notification) return <div className="p-8 text-slate-500 font-medium">Notification not found</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full bg-slate-50/60 min-h-screen">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold text-sm transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Notifications
      </button>
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{notification.title}</h2>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">{notification.status}</span>
        </div>
        <p className="text-slate-600 mb-6 text-base leading-relaxed">{notification.message}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
           <div><span className="text-slate-400 block text-xs uppercase font-bold mb-0.5">Type</span> {notification.type}</div>
           <div><span className="text-slate-400 block text-xs uppercase font-bold mb-0.5">Audience</span> {notification.audience}</div>
           <div><span className="text-slate-400 block text-xs uppercase font-bold mb-0.5">Sent</span> {notification.sent.toLocaleString()}</div>
           <div><span className="text-slate-400 block text-xs uppercase font-bold mb-0.5">Opened</span> {notification.opened.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
