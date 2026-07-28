import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MapPin, User, Car, CheckCircle, FileText, XCircle, CreditCard, Star, Phone, Mail, Award, Activity, Edit2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchOrderById, clearSelectedOrder } from '../../store/orderSlice';
import { EditOrderModal } from './Modals/EditOrderModal';
import { CancelOrderModal } from './Modals/CancelOrderModal';
import { UpdatePaymentModal } from './Modals/UpdatePaymentModal';
import { AssignAgentModal } from './Modals/AssignAgentModal';

const STATUS_COLORS: Record<string, string> = {
  'pending': 'bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]',
  'accepted': 'bg-blue-50 text-blue-700 border-blue-100',
  'started': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'on_the_way': 'bg-orange-50 text-orange-700 border-orange-100',
  'completed': 'bg-[#DCFCE7] text-[#16A34A] border-[#DCFCE7]',
  'cancelled': 'bg-[#FEE2E2] text-[#DC2626] border-[#FEE2E2]',
};

const capitalize = (str?: string) => {
  if (!str) return '';
  return str.split(/[\s_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export function OrderDetails({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedOrder, loading, error } = useSelector((state: RootState) => state.order);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
    return () => { dispatch(clearSelectedOrder()); };
  }, [dispatch, orderId]);

  if (loading || !selectedOrder) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Loading Order Details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center text-center">
          <XCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Failed to load order</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={onBack} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg">Go Back</button>
        </div>
      </div>
    );
  }

  const order = selectedOrder.order || selectedOrder;
  const history = selectedOrder.history || [];
  const srv = order.services?.[0];
  const orderStatus = order.status || 'pending';
  const paymentStatus = capitalize(order.payment?.status || 'pending');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-slate-200/60">
        <div className="flex items-center gap-5">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all shadow-sm hover:shadow"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{order.order_number}</h1>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-sm ${STATUS_COLORS[orderStatus] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {capitalize(orderStatus)}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-slate-400" /> Booked: {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-950 transition-all text-sm shadow-sm hover:shadow flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4 text-slate-500" /> Edit Order
          </button>
          {orderStatus === 'pending' && (
            <button 
              onClick={() => setIsAssignModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-red-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <User className="w-4 h-4" /> Assign Agent
            </button>
          )}
          <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-950 transition-all text-sm shadow-sm hover:shadow flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" /> Invoice
          </button>
          {orderStatus !== 'cancelled' && orderStatus !== 'completed' && (
            <button 
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-2.5 bg-red-50 border border-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-100/80 transition-all text-sm shadow-sm flex items-center gap-2"
            >
              <XCircle className="w-4 h-4 text-red-500" /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content - Left/Center Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Service & Payment Details */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-7 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-wider mb-6 flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-100 rounded-lg"><Car className="w-4 h-4 text-slate-600" /></div> Service Details
              </h3>
              <div className="flex items-start gap-4 mb-7">
                {srv?.serviceId?.image ? (
                  <img src={srv.serviceId.image} alt={srv.serviceId.name} className="w-16 h-16 rounded-2xl border border-slate-100 shadow-sm object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium shadow-inner">IMG</div>
                )}
                <div>
                  <div className="font-extrabold text-slate-900 text-lg tracking-tight">{capitalize(srv?.serviceId?.name || 'Unknown')}</div>
                  <div className="text-sm text-slate-500 font-medium">{capitalize(srv?.subServiceId?.name)} • <span className="text-slate-700">{srv?.duration} mins</span></div>
                  {order.vehicle_id && (
                    <div className="text-xs font-bold text-slate-600 mt-2.5 bg-slate-100/80 inline-block px-3 py-1.5 rounded-lg border border-slate-200/60">
                      Vehicle ID: {order.vehicle_id.substring(order.vehicle_id.length - 6).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3.5 pt-5 border-t border-slate-100/80">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Scheduled Time</span>
                  <span className="text-slate-900 font-bold">{order.scheduled_at ? new Date(order.scheduled_at).toLocaleString() : 'Not Scheduled'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Time Slot</span>
                  <span className="text-slate-900 font-bold">{order.time_slot?.from ? `${order.time_slot.from} - ${order.time_slot.to}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium shrink-0">Location</span>
                  <span className="text-slate-900 font-bold text-right truncate max-w-[200px]" title={order.pickup_location?.address}>{order.pickup_location?.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-7 flex flex-col justify-between hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-extrabold text-slate-800 tracking-wider flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-100 rounded-lg"><CreditCard className="w-4 h-4 text-slate-600" /></div> Payment Summary
                  </h3>
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="text-slate-700 font-bold">AED {order.estimated_amount || order.final_amount}</span>
                  </div>
                  {order.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Tax</span>
                      <span className="text-slate-700 font-bold">AED {order.tax_amount}</span>
                    </div>
                  )}
                  {order.additional_service_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Additional</span>
                      <span className="text-slate-700 font-bold">AED {order.additional_service_amount}</span>
                    </div>
                  )}
                  {order.coupon_discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span className="font-medium">Discount</span>
                      <span className="font-bold">- AED {order.coupon_discount}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-5 border-t border-slate-100/80 mt-4 flex items-end justify-between">
                <div>
                  <div className="text-slate-900 font-extrabold text-xl">AED {order.final_amount}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Via {capitalize(order.payment?.method) || 'Cash'}</div>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                  paymentStatus === 'Paid' ? 'bg-[#DCFCE7] text-[#16A34A] border-[#DCFCE7]' :
                  paymentStatus === 'Refunded' ? 'bg-[#F1F5F9] text-[#64748B] border-[#F1F5F9]' :
                  'bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]'
                }`}>
                  {paymentStatus}
                </span>
              </div>
            </div>
          </div>
          
          {/* Notes */}
          {(order.customer_note || order.agent_notes?.length > 0) && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-7 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-wider mb-5 flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-100 rounded-lg"><FileText className="w-4 h-4 text-slate-600" /></div> Notes
              </h3>
              {order.customer_note && (
                <div className="mb-5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Customer Note</span>
                  <div className="bg-slate-50/80 p-4 rounded-xl text-sm text-slate-700 border border-slate-100 leading-relaxed font-medium">
                    {order.customer_note}
                  </div>
                </div>
              )}
              {order.agent_notes?.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Agent Notes</span>
                  <div className="space-y-3">
                    {order.agent_notes.map((note: any, idx: number) => (
                      <div key={idx} className="text-sm text-slate-700 bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex justify-between gap-4 font-medium">
                        <span>{note.note}</span>
                        <span className="text-xs text-slate-400 shrink-0 font-semibold">{new Date(note.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Timeline & Profiles */}
        <div className="space-y-6">
          
          {/* Order Timeline */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-7 max-h-[420px] overflow-y-auto custom-scrollbar hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-wider mb-7 flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-100 rounded-lg"><Activity className="w-4 h-4 text-slate-600" /></div> Timeline
              </h3>
              <div className="space-y-0">
                {history.map((step: any, idx: number) => {
                  const isLast = idx === history.length - 1;
                  return (
                    <div key={step._id} className="flex gap-4 relative">
                      {!isLast && (
                        <div className="absolute left-3.5 top-9 w-px h-[calc(100%-10px)] bg-slate-100"></div>
                      )}
                      <div className="relative z-10 flex flex-col items-center mt-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-[3px] bg-white ${idx === 0 ? 'border-red-500 text-red-500 shadow-sm' : 'border-slate-200 text-slate-300'}`}>
                          <CheckCircle className={`w-4 h-4 ${idx === 0 ? 'text-red-500' : 'text-slate-300'}`} />
                        </div>
                      </div>
                      <div className="pb-7">
                        <div className={`text-sm font-bold ${idx === 0 ? 'text-slate-900' : 'text-slate-600'}`}>
                          {capitalize(step.action.replace(/_/g, ' '))}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 font-medium">
                          {new Date(step.createdAt).toLocaleString()}
                        </div>
                        {step.meta?.status && (
                          <div className="text-[10px] mt-2.5 font-bold text-slate-500 uppercase tracking-wider bg-slate-50 inline-block px-2.5 py-1 rounded-md border border-slate-100">
                            Status: {step.meta.status}
                          </div>
                        )}
                        {step.meta?.note && (
                          <div className="text-[11px] mt-2 font-medium text-slate-500 italic bg-slate-50/80 p-2.5 rounded-lg border border-slate-100/50 leading-relaxed">
                            "{step.meta.note}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-7 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
            <h3 className="text-sm font-extrabold text-slate-800 tracking-wider mb-5 flex items-center gap-2.5">
              <div className="p-1.5 bg-slate-100 rounded-lg"><User className="w-4 h-4 text-slate-600" /></div> Customer Details
            </h3>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-extrabold text-lg shrink-0 shadow-inner">
                {order.customer_id?.fullName?.[0] || 'C'}
              </div>
              <div>
                <div className="font-extrabold text-slate-900 tracking-tight">{order.customer_id?.fullName || 'Unknown Customer'}</div>
                <div className="text-xs text-red-600 font-bold flex items-center gap-1.5 mt-1">
                  <Award className="w-3.5 h-3.5 text-red-500" /> Member
                </div>
              </div>
            </div>
            <div className="space-y-3.5 text-sm pt-4 border-t border-slate-100/80">
              <div className="flex items-center gap-3 text-slate-500">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 font-bold">{order.customer_id?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-700 font-bold truncate" title={order.customer_id?.email}>{order.customer_id?.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Agent Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-7 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
            <h3 className="text-sm font-extrabold text-slate-800 tracking-wider mb-5 flex items-center gap-2.5">
              <div className="p-1.5 bg-slate-100 rounded-lg"><Car className="w-4 h-4 text-slate-600" /></div> Assigned Agent
            </h3>
            {order.agent_id ? (
              <>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 font-extrabold text-lg shrink-0 border border-red-100 shadow-inner">
                    {order.agent_id.firstName?.[0] || 'A'}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 tracking-tight">{order.agent_id.firstName} {order.agent_id.lastName}</div>
                    <div className="text-xs text-slate-500 font-bold mt-1 tracking-wider uppercase">ID: {order.agent_id.agentId || 'N/A'}</div>
                  </div>
                </div>
                <div className="space-y-3.5 text-sm pt-4 border-t border-slate-100/80">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-bold">{order.agent_id.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Car className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-bold">Assigned Vehicle</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 bg-slate-50/80 rounded-2xl border border-slate-100 p-5">
                <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <User className="w-6 h-6 text-slate-300" />
                </div>
                <div className="text-sm font-extrabold text-slate-800 mb-1.5">No Agent Assigned</div>
                <div className="text-xs text-slate-500 mb-5 font-medium">This order requires dispatch</div>
                <button onClick={() => setIsAssignModalOpen(true)} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white shadow-md font-bold rounded-xl transition-all text-sm w-full">
                  Assign Manually
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <EditOrderModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        order={order} 
      />
      
      <CancelOrderModal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)} 
        order={order} 
      />

      <UpdatePaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        order={order} 
      />

      <AssignAgentModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        order={order} 
      />
    </div>
  );
}
