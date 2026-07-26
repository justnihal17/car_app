import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader2, Bell } from 'lucide-react';

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/notification');
        if (response.data?.status || response.data?.success) {
          setNotifications(response.data.data || []);
        } else {
          setError('Failed to load notifications.');
        }
      } catch (err: any) {
        setError('Error fetching notifications.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="fixed top-16 right-6 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-0 z-50 overflow-hidden flex flex-col max-h-[500px]">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-slate-900 font-bold flex items-center gap-2">
          <Bell className="w-4 h-4 text-red-600" /> Notifications
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
      </div>
      <div className="overflow-y-auto flex-1 p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm text-center py-4">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No new notifications.</p>
        ) : (
          notifications.map((n, i) => (
            <div key={n._id || i} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <p className="text-sm text-slate-800 font-medium">{n.title || n.message || 'Notification'}</p>
              {n.description && <p className="text-xs text-slate-500 mt-1">{n.description}</p>}
              <p className="text-[10px] text-slate-400 mt-1">
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
