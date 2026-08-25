import React from 'react';
import { Order, OrderStatus } from '../types/order.types';

interface UpdateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdate: (updates: Partial<Order>) => void;
}

const STATUSES: OrderStatus[] = ['Pending', 'Accepted', 'Assigned', 'On Route', 'In Progress', 'Completed', 'Cancelled'];

export const UpdateOrderModal: React.FC<UpdateOrderModalProps> = ({ isOpen, onClose, order, onUpdate }) => {
  const [status, setStatus] = React.useState<OrderStatus>('Pending');
  const [scheduledAt, setScheduledAt] = React.useState('');

  React.useEffect(() => {
    if (order) {
      setStatus((order.status as OrderStatus) || 'Pending');
      const dateVal = order.scheduled_at || order.order_date || order.scheduledDate || '';
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          const pad = (n: number) => n.toString().padStart(2, '0');
          setScheduledAt(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
        }
      } else {
        setScheduledAt('');
      }
    }
  }, [order]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl transition-all">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Update Order {order.order_number || order.orderNumber}</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={() => {
              const updates: Partial<Order> = { status };
              if (scheduledAt) {
                updates.scheduled_at = new Date(scheduledAt).toISOString();
              }
              onUpdate(updates);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
