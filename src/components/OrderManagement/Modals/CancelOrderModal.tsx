import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { OrderService } from '../../../services/order.service';
import { fetchOrderById, fetchOrders } from '../../../store/orderSlice';

interface CancelOrderModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CancelOrderModal({ order, isOpen, onClose }: CancelOrderModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCancelReason('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      setError('Please provide a reason for cancellation.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await OrderService.cancelOrder(order._id, cancelReason);
      if (response.success) {
        dispatch(fetchOrderById(order._id));
        dispatch(fetchOrders({ page: 1 }));
        onClose();
      } else {
        setError(response.message || 'Failed to cancel order');
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
            <AlertCircle className="w-5 h-5 text-red-500" /> Cancel Order
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel order <span className="font-bold text-slate-900">{order.order_number}</span>? This action cannot be undone.
          </p>

          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Cancellation Reason <span className="text-red-500">*</span></label>
            <textarea 
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="E.g., Customer requested cancellation, Agent unavailable..."
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
              required
            />
          </div>

          <div className="pt-4 flex items-center gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Keep Order</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-red-600/20 disabled:opacity-50">
              {loading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
