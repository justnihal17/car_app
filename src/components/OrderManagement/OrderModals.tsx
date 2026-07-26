import { useState, useEffect } from 'react';
import { X, Search, Loader2, User, Calendar, Clock, CreditCard, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// -------------------------------------------------------------
// 1. ASSIGN AGENT MODAL
// -------------------------------------------------------------
export function AssignAgentModal({
  isOpen,
  orderId,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAgents();
    }
  }, [isOpen]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/agent/agent');
      const raw = res.data?.data || res.data?.agents || res.data || [];
      const list = Array.isArray(raw) ? raw : [];
      setAgents(list);
    } catch (err) {
      console.error('Failed to fetch agents', err);
      toast.error('Failed to load agents list');
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(a => {
    const name = `${a.firstName || ''} ${a.lastName || ''} ${a.fullName || ''} ${a.name || ''}`.toLowerCase();
    const phone = (a.phone || a.mobile || '').toLowerCase();
    return name.includes(search.toLowerCase()) || phone.includes(search.toLowerCase());
  });

  const handleSubmit = async () => {
    if (!selectedAgentId) {
      toast.error('Please select an agent');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.patch(`/admin/order/${orderId}/assign`, { agentId: selectedAgentId, agent: selectedAgentId });
      if (res.data?.success || res.data?.status) {
        toast.success(res.data?.message || 'Agent assigned successfully');
        onSuccess();
        onClose();
      } else {
        toast.success('Agent assigned successfully');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign agent');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-red-600" /> Assign Agent to Order
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search agent by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 outline-none focus:border-red-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
            {loading ? (
              <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 text-red-600 animate-spin" /></div>
            ) : filteredAgents.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-sm">No active agents found.</p>
            ) : (
              filteredAgents.map(a => {
                const id = a._id || a.id;
                const name = a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Agent';
                const isSelected = selectedAgentId === id;
                return (
                  <div
                    key={id}
                    onClick={() => setSelectedAgentId(id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected ? 'border-red-600 bg-red-50/50 text-red-600' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{name}</div>
                      <div className="text-xs text-slate-500">{a.phone || a.mobile || a.email}</div>
                    </div>
                    {isSelected && <ShieldCheck className="w-5 h-5 text-red-600" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting || !selectedAgentId}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. UPDATE ORDER MODAL (Schedule & Notes)
// -------------------------------------------------------------
export function UpdateOrderModal({
  isOpen,
  orderId,
  initialDate,
  initialTime,
  initialNote,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  orderId: string;
  initialDate?: string;
  initialTime?: string;
  initialNote?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [scheduledDate, setScheduledDate] = useState(initialDate || '');
  const [scheduledTime, setScheduledTime] = useState(initialTime || '');
  const [customerNote, setCustomerNote] = useState(initialNote || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setScheduledDate(initialDate || '');
    setScheduledTime(initialTime || '');
    setCustomerNote(initialNote || '');
  }, [initialDate, initialTime, initialNote, isOpen]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: any = {};
      if (scheduledDate) payload.scheduledDate = scheduledDate;
      if (scheduledTime) payload.scheduledTime = scheduledTime;
      if (customerNote !== undefined) payload.customerNote = customerNote;

      const res = await api.patch(`/admin/order/${orderId}`, payload);
      if (res.data?.success || res.data?.status) {
        toast.success(res.data?.message || 'Order updated successfully');
        onSuccess();
        onClose();
      } else {
        toast.success('Order updated successfully');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" /> Update Order Schedule
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Scheduled Date</label>
              <input 
                type="date" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Scheduled Time</label>
              <input 
                type="time" 
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Note</label>
            <textarea 
              rows={3}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:border-red-500 resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. CANCEL ORDER MODAL
// -------------------------------------------------------------
export function CancelOrderModal({
  isOpen,
  orderId,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please enter a cancellation reason');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.patch(`/admin/order/${orderId}/cancel`, { cancelReason: reason, reason });
      if (res.data?.success || res.data?.status) {
        toast.success(res.data?.message || 'Order cancelled');
        onSuccess();
        onClose();
      } else {
        toast.success('Order cancelled');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-red-50/50">
          <h3 className="font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Cancel Order
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500">Are you sure you want to cancel this order? Please specify the reason below.</p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation Reason *</label>
            <textarea 
              rows={3}
              placeholder="e.g., Customer requested cancellation due to scheduling conflict..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:border-red-500 resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm">Dismiss</button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting || !reason.trim()}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. UPDATE PAYMENT MODAL
// -------------------------------------------------------------
export function UpdatePaymentModal({
  isOpen,
  orderId,
  initialStatus,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  orderId: string;
  initialStatus?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [paymentStatus, setPaymentStatus] = useState(initialStatus || 'Paid');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialStatus) setPaymentStatus(initialStatus);
  }, [initialStatus, isOpen]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        paymentStatus,
        transactionId: transactionId || undefined,
        paymentMethod
      };
      const res = await api.patch(`/admin/order/${orderId}/payment`, payload);
      if (res.data?.success || res.data?.status) {
        toast.success(res.data?.message || 'Payment status updated');
        onSuccess();
        onClose();
      } else {
        toast.success('Payment status updated');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-600" /> Update Payment Details
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
            <select 
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-red-500 font-semibold"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-red-500 font-semibold"
            >
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Online">Online / Apple Pay</option>
              <option value="Wallet">Wallet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction ID (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g., TXN-98712398"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-red-500 font-mono"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
