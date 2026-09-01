import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { OrderService } from '../../../services/order.service';
import { fetchOrderById, fetchOrders } from '../../../store/orderSlice';

interface UpdatePaymentModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export function UpdatePaymentModal({ order, isOpen, onClose }: UpdatePaymentModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [status, setStatus] = useState('paid');
  const [method, setMethod] = useState('cash');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && order) {
      document.body.style.overflow = 'hidden';
      setStatus(order.payment?.status || 'pending');
      setMethod(order.payment?.method?.toLowerCase() || 'cash');
      setTransactionId(order.payment?.transaction_id || '');
      setError(null);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        status,
        method,
        transaction_id: transactionId
      };
      
      const response = await OrderService.updatePayment(order._id, data);
      if (response.success) {
        dispatch(fetchOrderById(order._id));
        dispatch(fetchOrders({ page: 1 }));
        onClose();
      } else {
        setError(response.message || 'Failed to update payment');
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
            <CreditCard className="w-3.5 h-3.5 text-slate-700" /> Update Payment
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-3.5 space-y-3">
          {error && <div className="p-2 bg-red-50 text-red-700 text-xs rounded-md border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-lg px-2.5 h-8 text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Method</label>
            <select 
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-lg px-2.5 h-8 text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs cursor-pointer"
            >
              <option value="cash">Cash</option>
              <option value="card">Card / Online</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Transaction ID (Optional)</label>
            <input 
              type="text" 
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="E.g. TXN123456789"
              className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-lg px-2.5 h-8 text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <div className="pt-2 flex items-center gap-2 justify-end">
            <button type="button" onClick={onClose} className="h-8 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading} className="h-8 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all shadow-2xs disabled:opacity-50 cursor-pointer">
              {loading ? 'Saving...' : 'Update Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
