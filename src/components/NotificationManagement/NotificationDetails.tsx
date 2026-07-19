import { ChevronLeft, Bell, BarChart2 } from 'lucide-react';
import { NOTIFICATIONS } from '../../data/notifications';

export function NotificationDetails({ notificationId, onBack }: { notificationId: string, onBack: () => void }) {
  const notification = NOTIFICATIONS.find(n => n.id === notificationId);

  if (!notification) return <div className="text-white">Notification not found</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Notifications
      </button>
      <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white">{notification.title}</h2>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">{notification.status}</span>
        </div>
        <p className="text-slate-300 mb-6">{notification.message}</p>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
           <div>Type: {notification.type}</div>
           <div>Audience: {notification.audience}</div>
           <div>Sent: {notification.sent.toLocaleString()}</div>
           <div>Opened: {notification.opened.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
