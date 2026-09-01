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
      document.body.style.overflow = 'hidden';
      setCancelReason('');
      setError(null);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200/90 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Cancel Order
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-3.5 space-y-3">
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel order <span className="font-semibold text-slate-900">{order.order_number}</span>? This action cannot be undone.
          </p>

          {error && <div className="p-2 bg-red-50 text-red-700 text-xs rounded-md border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cancellation Reason <span className="text-red-500">*</span></label>
            <textarea 
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={2}
              placeholder="E.g., Customer requested cancellation..."
              className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-red-500 focus:bg-white resize-none transition-all shadow-2xs"
              required
            />
          </div>

          <div className="pt-2 flex items-center gap-2 justify-end">
            <button type="button" onClick={onClose} className="h-8 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">Keep Order</button>
            <button type="submit" disabled={loading} className="h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-all shadow-2xs disabled:opacity-50 cursor-pointer">
              {loading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
