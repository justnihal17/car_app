import React from 'react';
import { Order, PaymentStatus, PaymentMethod } from '../types/order.types';

interface PaymentUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdate: (payment: { status: PaymentStatus; method?: PaymentMethod }) => void;
}

const PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Paid', 'Failed', 'Refunded'];
const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'UPI', 'Wallet', 'Bank Transfer'];

export const PaymentUpdateModal: React.FC<PaymentUpdateModalProps> = ({ isOpen, onClose, order, onUpdate }) => {
  const [status, setStatus] = React.useState<PaymentStatus>('Pending');
  const [method, setMethod] = React.useState<PaymentMethod | ''>('');

  React.useEffect(() => {
    if (order) {
      setStatus(order.payment.status);
      setMethod(order.payment.method || '');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Update Payment - {order.orderNumber}</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PaymentStatus)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            >
              {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Select Method</option>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdate({ status, method: method as PaymentMethod });
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Update Payment
          </button>
        </div>
      </div>
    </div>
  );
};
