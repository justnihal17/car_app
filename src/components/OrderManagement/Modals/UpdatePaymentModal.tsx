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
      setStatus(order.payment?.status || 'pending');
      setMethod(order.payment?.method?.toLowerCase() || 'cash');
      setTransactionId(order.payment?.transaction_id || '');
      setError(null);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-500" /> Update Payment
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Method</label>
            <select 
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="cash">Cash</option>
              <option value="card">Card / Online</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Transaction ID (Optional)</label>
            <input 
              type="text" 
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="E.g. TXN123456789"
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="pt-4 flex items-center gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-50">
              {loading ? 'Saving...' : 'Update Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
