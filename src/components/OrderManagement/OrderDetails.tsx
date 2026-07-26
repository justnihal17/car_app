import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, User, Car, CheckCircle, ExternalLink, FileText, AlertCircle, RefreshCw, CreditCard, Shield, Loader2, Calendar } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { OrderMap } from './OrderMap';
import { AssignAgentModal, UpdateOrderModal, CancelOrderModal, UpdatePaymentModal } from './OrderModals';

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Assigned': 'bg-blue-50 text-blue-700 border-blue-200',
  'On The Way': 'bg-purple-50 text-purple-700 border-purple-200',
  'Arrived': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'In Progress': 'bg-sky-50 text-sky-700 border-sky-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200',
};

export function OrderDetails({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [assignModal, setAssignModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/order/${orderId}`);
      const data = res.data?.data || res.data?.order || res.data;
      setOrder(data);
    } catch (err: any) {
      console.error('Fetch order details error:', err);
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading Order Details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center max-w-md mx-auto min-h-[400px] flex flex-col items-center justify-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">{error || 'Order not found'}</h3>
        <button 
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
        >
          Back to Order List
        </button>
      </div>
    );
  }

  const customerName = order.customer?.fullName || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || order.customerName || 'Customer';
  const customerEmail = order.customer?.email || order.email || 'N/A';
  const customerPhone = order.customer?.phone || order.phone || 'N/A';

  const agentName = order.assignedAgent?.fullName || `${order.assignedAgent?.firstName || ''} ${order.assignedAgent?.lastName || ''}`.trim() || order.agentName || 'Unassigned';
  const agentPhone = order.assignedAgent?.phone || order.assignedAgent?.mobile || 'N/A';

  const vehicleInfo = order.vehicleDetails || order.vehicle?.name || order.vehicle || 'N/A';

  const services = Array.isArray(order.services) ? order.services : (order.service ? [order.service] : []);
  const pickupLocation = order.pickupLocation || { address: order.address || 'N/A' };

  const grandTotal = order.grandTotal || order.totalAmount || order.price || 0;
  const totalDuration = order.totalDuration || order.duration || 30;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full bg-slate-50/60 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">#{String(order._id || order.id).slice(-8).toUpperCase()}</h1>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[order.orderStatus || order.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {order.orderStatus || order.status || 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Booked: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            onClick={() => setAssignModal(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs shadow-xs flex items-center gap-2"
          >
            <User className="w-4 h-4 text-blue-600" /> Assign Agent
          </button>
          <button 
            onClick={() => setUpdateModal(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs shadow-xs flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-slate-500" /> Edit Order
          </button>
          <button 
            onClick={() => setPaymentModal(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs shadow-xs flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-emerald-600" /> Edit Payment
          </button>
          <button 
            onClick={() => setCancelModal(true)}
            disabled={['cancelled', 'completed'].includes((order.orderStatus || order.status || '').toLowerCase())}
            className="px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-xl hover:bg-rose-100 text-xs shadow-xs flex items-center gap-2 disabled:opacity-40"
          >
            <AlertCircle className="w-4 h-4" /> Cancel Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map View */}
          <OrderMap order={order} />

          {/* Services & Sub Services Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-red-600" /> Services & Sub-Services Ordered
            </h3>
            
            <div className="divide-y divide-slate-100">
              {services.length > 0 ? (
                services.map((s: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{s.name || s.serviceId?.name || 'Car Service'}</div>
                      {s.subServiceName && <div className="text-xs text-slate-500 mt-0.5">{s.subServiceName}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm">AED {s.price || 0}</div>
                      <div className="text-xs text-slate-400">{s.duration || 30} mins</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-2">No service item breakdown available.</p>
              )}
            </div>

            {/* Total Summary */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-bold bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-slate-500 font-normal">Est. Total Duration:</span> {totalDuration} mins
              </div>
              <div className="text-red-600 text-base">
                <span className="text-slate-500 font-normal text-sm">Grand Total:</span> AED {grandTotal}
              </div>
            </div>
          </div>

          {/* Pickup Address & Coordinates */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" /> Location Details
            </h3>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Pickup Address</label>
              <p className="text-sm font-bold text-slate-900 mt-1">{pickupLocation.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Latitude</label>
                <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">{pickupLocation.latitude || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Longitude</label>
                <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">{pickupLocation.longitude || 'N/A'}</p>
              </div>
            </div>

            {pickupLocation.googleMapUrl && (
              <div className="pt-2">
                <a 
                  href={pickupLocation.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
                >
                  Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Customer Note */}
          {order.customerNote && (
            <div className="bg-amber-50/60 rounded-2xl border border-amber-100 p-5">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Customer Note</h4>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">{order.customerNote}</p>
            </div>
          )}

        </div>

        {/* Right Sidebar - Details Cards */}
        <div className="space-y-6">
          
          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-red-600" /> Customer Info
            </h3>
            <div>
              <div className="font-bold text-slate-900 text-base">{customerName}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">{customerPhone}</div>
              <div className="text-xs text-slate-500 mt-0.5">{customerEmail}</div>
            </div>
          </div>

          {/* Vehicle Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-red-600" /> Vehicle
            </h3>
            <div className="font-bold text-slate-900 text-sm">{vehicleInfo}</div>
          </div>

          {/* Agent Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" /> Assigned Agent
              </h3>
              <button onClick={() => setAssignModal(true)} className="text-xs font-bold text-red-600 hover:text-red-700">Change</button>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{agentName}</div>
              {agentPhone !== 'N/A' && <div className="text-xs text-slate-500 font-mono mt-0.5">{agentPhone}</div>}
            </div>
          </div>

          {/* Booking & Schedule Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3 text-xs">
            <h3 className="font-bold text-slate-500 uppercase tracking-wider mb-2">Schedule & Status</h3>
            <div className="flex justify-between">
              <span className="text-slate-500">Booking Type:</span>
              <span className="font-bold text-slate-900">{order.bookingType || 'Scheduled'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Date:</span>
              <span className="font-bold text-slate-900">{order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Time:</span>
              <span className="font-bold text-slate-900">{order.scheduledTime || order.timeSlot || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-bold text-slate-900">{order.paymentStatus || (order.isPaid ? 'Paid' : 'Pending')}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Action Modals */}
      <AssignAgentModal 
        isOpen={assignModal}
        orderId={orderId}
        onClose={() => setAssignModal(false)}
        onSuccess={fetchOrderDetails}
      />

      <UpdateOrderModal 
        isOpen={updateModal}
        orderId={orderId}
        initialDate={order.scheduledDate}
        initialTime={order.scheduledTime}
        initialNote={order.customerNote}
        onClose={() => setUpdateModal(false)}
        onSuccess={fetchOrderDetails}
      />

      <CancelOrderModal 
        isOpen={cancelModal}
        orderId={orderId}
        onClose={() => setCancelModal(false)}
        onSuccess={fetchOrderDetails}
      />

      <UpdatePaymentModal 
        isOpen={paymentModal}
        orderId={orderId}
        initialStatus={order.paymentStatus}
        onClose={() => setPaymentModal(false)}
        onSuccess={fetchOrderDetails}
      />

    </div>
  );
}
