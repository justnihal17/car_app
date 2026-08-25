import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { OrderService } from '../../../services/order.service';
import { fetchOrderById, fetchOrders } from '../../../store/orderSlice';

interface EditOrderModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const toLocalDatetimeString = (isoString?: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function EditOrderModal({ order, isOpen, onClose }: EditOrderModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [scheduledAt, setScheduledAt] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order && isOpen) {
      const initialDate = order.scheduled_at || order.order_date || order.createdAt;
      setScheduledAt(toLocalDatetimeString(initialDate));
      setCustomerNote(order.customer_note || '');
      setError(null);
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data: { scheduled_at?: string; customer_note?: string } = {};
      if (scheduledAt) {
        data.scheduled_at = new Date(scheduledAt).toISOString();
      }
      if (customerNote !== undefined) {
        data.customer_note = customerNote;
      }

      const response = await OrderService.updateOrder(order._id, data);
      if (response.success) {
        dispatch(fetchOrderById(order._id));
        dispatch(fetchOrders({ page: 1 }));
        onClose();
      } else {
        setError(response.message || 'Failed to update order');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" />
            Reschedule / Edit Order
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Scheduled Appointment (Date & Time)
            </label>
            <input 
              type="datetime-local" 
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Customer's scheduled service appointment (saved in <code className="text-slate-600">scheduled_at</code>)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Customer Note</label>
            <textarea 
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              rows={4}
              placeholder="Add note for customer..."
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="pt-4 flex items-center gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-red-600/20 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
