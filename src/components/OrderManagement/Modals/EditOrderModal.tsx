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
      document.body.style.overflow = 'hidden';
      const initialDate = order.scheduled_at || order.order_date || order.createdAt;
      setScheduledAt(toLocalDatetimeString(initialDate));
      setCustomerNote(order.customer_note || '');
      setError(null);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200/90 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-red-600" />
            Reschedule / Edit Order
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-3.5 space-y-3">
          {error && <div className="p-2 bg-red-50 text-red-700 text-xs rounded-md border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Scheduled Appointment (Date & Time)
            </label>
            <input 
              type="datetime-local" 
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-lg px-2.5 h-8 text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Customer's scheduled service appointment
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer Note</label>
            <textarea 
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              rows={3}
              placeholder="Add note for customer..."
              className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-red-500 focus:bg-white resize-none transition-all shadow-2xs"
            />
          </div>

          <div className="pt-2 flex items-center gap-2 justify-end">
            <button type="button" onClick={onClose} className="h-8 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading} className="h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-all shadow-2xs disabled:opacity-50 cursor-pointer">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
