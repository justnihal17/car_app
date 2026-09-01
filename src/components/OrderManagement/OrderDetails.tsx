import { useEffect, useState } from 'react';
import { 
  ArrowLeft, Clock, MapPin, User, Car, CheckCircle, FileText, 
  XCircle, CreditCard, Star, Phone, Mail, Award, Activity, 
  Edit2, Camera, X as CloseIcon, ChevronLeft, ChevronRight,
  ArrowRightLeft, UserCheck, ShieldAlert
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchOrderById, clearSelectedOrder } from '../../store/orderSlice';
import { EditOrderModal } from './Modals/EditOrderModal';
import { CancelOrderModal } from './Modals/CancelOrderModal';
import { UpdatePaymentModal } from './Modals/UpdatePaymentModal';
import { ReassignAgentModal } from './Modals/ReassignAgentModal';
import { SafeImage } from '../common/SafeImage';

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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
    return () => { dispatch(clearSelectedOrder()); };
  }, [dispatch, orderId]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Loading Order Details...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedOrder) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center text-center max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <XCircle className="w-12 h-12 text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Order Not Found</h2>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            {error || 'This order (ID: ' + orderId + ') does not exist or has been removed from database.'}
          </p>
          <button 
            onClick={onBack} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            Go Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const order = selectedOrder.order || selectedOrder;
  const history = selectedOrder.history || [];
  const srv = order.services?.[0];
  const orderStatus = order.status || 'pending';
  const paymentStatus = capitalize(order.payment?.status || 'pending');

  const estimatedAmount = Number(order.estimated_amount ?? order.subtotal ?? order.base_amount ?? srv?.price ?? 0);
  const additionalAmount = Number(order.additional_service_amount || 0);
  const subtotalAmount = estimatedAmount + additionalAmount;
  const couponDiscount = Number(order.coupon_discount || 0);
  const subscriptionDiscount = Number(order.subscriptionDiscount || order.subscription_discount || 0);
  const totalDiscounts = couponDiscount + subscriptionDiscount;
  const vatRate = Number(order.vat_rate ?? 5);
  const vatAmount = (order.vat_amount != null && Number(order.vat_amount) >= 0)
    ? Number(order.vat_amount)
    : ((order.vat != null && Number(order.vat) >= 0)
        ? Number(order.vat)
        : (Math.max(0, subtotalAmount - totalDiscounts) * (vatRate / 100)));

  return (
    <div className="p-3.5 sm:p-4 lg:p-5 space-y-3.5 sm:space-y-4 w-full bg-slate-50/60 min-h-screen animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">{order.order_number}</h1>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border shadow-2xs ${STATUS_COLORS[orderStatus] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {capitalize(orderStatus)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 font-normal">
              <Clock className="w-3 h-3 text-slate-400" /> Order Placed: {new Date(order.order_date || order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-xs shadow-2xs flex items-center gap-1.5 h-8 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit Order
          </button>

          {orderStatus !== 'cancelled' && orderStatus !== 'completed' && (
            order.agent_id ? (
              <button 
                onClick={() => setIsAssignModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-xs shadow-xs transition-all flex items-center gap-1.5 h-8 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Change Agent
              </button>
            ) : (
              <button 
                onClick={() => setIsAssignModalOpen(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-all flex items-center gap-1.5 h-8 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" /> Assign Agent
              </button>
            )
          )}

          {orderStatus !== 'cancelled' && orderStatus !== 'completed' && (
            <button 
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-100/80 transition-all text-xs shadow-2xs flex items-center gap-1.5 h-8 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-red-500" /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        
        {/* Main Content - Left/Center Column */}
        <div className="lg:col-span-2 space-y-3.5">
          
          {/* Service & Payment Details */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 transition-all">
              <h3 className="text-xs font-semibold text-slate-800 tracking-wider mb-3.5 flex items-center gap-2">
                <div className="p-1 bg-slate-100 rounded-md"><Car className="w-3.5 h-3.5 text-slate-600" /></div> Service Details
              </h3>
              <div className="flex items-start gap-3 mb-4">
                {(srv?.serviceId?.image || srv?.image || srv?.serviceId?.icon || srv?.serviceId?.imageUrl) ? (
                  <SafeImage 
                    src={srv?.serviceId?.image || srv?.image || srv?.serviceId?.icon || srv?.serviceId?.imageUrl} 
                    alt={srv?.serviceId?.name || 'Service'} 
                    className="w-12 h-12 rounded-xl border border-slate-100 shadow-2xs object-cover shrink-0" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-medium shadow-inner shrink-0">IMG</div>
                )}
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{capitalize(srv?.serviceId?.name || 'Unknown')}</div>
                  {(srv?.subServiceId?.name || (srv?.duration && Number(srv.duration) > 0)) ? (
                    <div className="text-xs text-slate-500 font-normal mt-0.5">
                      {capitalize(srv?.subServiceId?.name)}
                      {srv?.subServiceId?.name && srv?.duration && Number(srv.duration) > 0 ? ' • ' : ''}
                      {srv?.duration && Number(srv.duration) > 0 ? <span className="text-slate-700">{srv.duration} mins</span> : null}
                    </div>
                  ) : null}
                  {order.vehicle_id && (
                    <div className="text-[10px] font-medium text-slate-600 mt-1.5 bg-slate-100/80 inline-block px-2 py-0.5 rounded-md border border-slate-200/60">
                      Vehicle ID: {order.vehicle_id.substring(order.vehicle_id.length - 6).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-normal">Scheduled Date</span>
                  <span className="text-slate-800 font-medium">
                    {order.scheduled_at ? new Date(order.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : (order.order_date ? new Date(order.order_date).toLocaleDateString() : (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'))}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-normal">Appointment Time</span>
                  <span className="text-slate-800 font-medium">
                    {order.time_slot?.from && order.time_slot?.to 
                      ? `${order.time_slot.from} - ${order.time_slot.to}` 
                      : (order.scheduled_at ? new Date(order.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-normal">Order Date</span>
                  <span className="text-slate-700 font-normal">
                    {order.order_date ? new Date(order.order_date).toLocaleString() : (order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-normal shrink-0">Location</span>
                  <span className="text-slate-800 font-medium text-right truncate max-w-45" title={order.pickup_location?.address}>{order.pickup_location?.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs font-semibold text-slate-800 tracking-wider flex items-center gap-2">
                    <div className="p-1 bg-slate-100 rounded-md"><CreditCard className="w-3.5 h-3.5 text-slate-600" /></div> Payment Summary
                  </h3>
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-normal">Subtotal</span>
                    <span className="text-slate-700 font-medium">AED {subtotalAmount.toFixed(2)}</span>
                  </div>
                  {additionalAmount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-normal">Additional Services</span>
                      <span className="text-slate-700 font-medium">+ AED {additionalAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span className="font-normal">Coupon Discount</span>
                      <span className="font-medium">- AED {couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {subscriptionDiscount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span className="font-normal">Subscription Discount</span>
                      <span className="font-medium">- AED {subscriptionDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-normal">VAT ({vatRate}%)</span>
                    <span className="text-slate-700 font-medium">AED {vatAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-100 mt-2 flex items-end justify-between">
                <div>
                  <div className="text-slate-900 font-bold text-base">AED {order.final_amount}</div>
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5">Via {capitalize(order.payment?.method) || 'Cash'}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider shadow-2xs border ${
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
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 transition-all">
              <h3 className="text-xs font-semibold text-slate-800 tracking-wider mb-3 flex items-center gap-2">
                <div className="p-1 bg-slate-100 rounded-md"><FileText className="w-3.5 h-3.5 text-slate-600" /></div> Notes
              </h3>
              {order.customer_note && (
                <div className="mb-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Customer Note</span>
                  <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-700 border border-slate-100 leading-relaxed font-normal">
                    {order.customer_note}
                  </div>
                </div>
              )}
              {order.agent_notes?.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Agent Notes</span>
                  <div className="space-y-2">
                    {order.agent_notes.map((note: any, idx: number) => (
                      <div key={idx} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between gap-3 font-normal">
                        <span>{note.note}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">{new Date(note.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Service Completion Photos */}
          {order.completionPhotos?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 transition-all">
              <h3 className="text-xs font-semibold text-slate-800 tracking-wider mb-3 flex items-center gap-2">
                <div className="p-1 bg-emerald-50 rounded-md"><Camera className="w-3.5 h-3.5 text-emerald-600" /></div>
                Service Completion Photos
                <span className="ml-auto text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{order.completionPhotos.length} Photo{order.completionPhotos.length > 1 ? 's' : ''}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {order.completionPhotos.map((photo: any, idx: number) => (
                  <button
                    key={photo.public_id || idx}
                    onClick={() => setLightboxIndex(idx)}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-slate-100 shadow-2xs hover:shadow-sm hover:border-emerald-200 transition-all duration-200 cursor-pointer"
                  >
                    <SafeImage
                      src={photo.url}
                      alt={`Completion photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-1 shadow-2xs">
                        <Camera className="w-3 h-3 text-slate-700" />
                      </div>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-slate-900/60 text-white text-[9px] font-semibold px-1 py-0.5 rounded backdrop-blur-xs">
                      {idx + 1}/{order.completionPhotos.length}
                    </div>
                  </button>
                ))}
              </div>
              {order.completionPhotos[0]?.uploadedAt && (
                <p className="text-[11px] text-slate-400 font-normal mt-2.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Uploaded on {new Date(order.completionPhotos[order.completionPhotos.length - 1]?.uploadedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Timeline & Profiles */}
        <div className="space-y-3.5">
          
          {/* Order Timeline */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 max-h-96 overflow-y-auto custom-scrollbar transition-all">
              <h3 className="text-xs font-semibold text-slate-800 tracking-wider mb-4 flex items-center gap-2">
                <div className="p-1 bg-slate-100 rounded-md"><Activity className="w-3.5 h-3.5 text-slate-600" /></div> Timeline & Audit Log
              </h3>
              <div className="space-y-0">
                {history.map((step: any, idx: number) => {
                  const isLast = idx === history.length - 1;
                  const isReassigned = step.action === 'AGENT_REASSIGNED';
                  const isAssigned = step.action === 'AGENT_ASSIGNED';

                  return (
                    <div key={step._id || idx} className="flex gap-3 relative">
                      {!isLast && (
                        <div className="absolute left-2.5 top-6 w-px h-[calc(100%-8px)] bg-slate-100"></div>
                      )}
                      <div className="relative z-10 flex flex-col items-center mt-0.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${
                          isReassigned 
                            ? 'border-amber-500 text-amber-600 shadow-2xs' 
                            : isAssigned 
                            ? 'border-emerald-500 text-emerald-600 shadow-2xs'
                            : idx === 0 
                            ? 'border-red-500 text-red-500 shadow-2xs' 
                            : 'border-slate-200 text-slate-300'
                        }`}>
                          {isReassigned ? (
                            <ArrowRightLeft className="w-3 h-3 text-amber-500" />
                          ) : (
                            <CheckCircle className={`w-3 h-3 ${isAssigned ? 'text-emerald-500' : idx === 0 ? 'text-red-500' : 'text-slate-300'}`} />
                          )}
                        </div>
                      </div>
                      <div className="pb-4 flex-1">
                        <div className={`text-xs font-bold ${
                          isReassigned ? 'text-amber-700' : isAssigned ? 'text-emerald-700' : idx === 0 ? 'text-slate-900' : 'text-slate-600'
                        }`}>
                          {isReassigned ? 'Agent Reassigned' : isAssigned ? 'Agent Assigned' : capitalize(step.action?.replace(/_/g, ' '))}
                        </div>

                        {/* Reassignment visual details */}
                        {isReassigned && (
                          <div className="my-1 text-xs">
                            <span className="line-through text-slate-400">
                              {step.meta?.previous_agent_name || 'Previous Agent'}
                            </span>
                            <span className="text-slate-400 font-bold mx-1.5">➔</span>
                            <strong className="text-blue-600">
                              {step.meta?.new_agent_name || 'New Agent'}
                            </strong>
                          </div>
                        )}

                        {/* Initial Assignment details */}
                        {isAssigned && !isReassigned && step.meta?.new_agent_name && (
                          <div className="my-1 text-xs text-slate-700">
                            Assigned to: <strong className="text-emerald-700">{step.meta.new_agent_name}</strong>
                          </div>
                        )}

                        {/* Reassignment reason banner */}
                        {step.meta?.reassign_reason && (
                          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-2 rounded-lg my-1.5 leading-relaxed">
                            <strong>Reason:</strong> {step.meta.reassign_reason}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 mt-0.5 font-normal flex items-center gap-1.5">
                          {step.updated_by?.role && (
                            <span>By: <strong className="capitalize">{step.updated_by.role}</strong> •</span>
                          )}
                          <span>{new Date(step.createdAt).toLocaleString()}</span>
                        </div>

                        {step.meta?.status && (
                          <div className="text-[9px] mt-1.5 font-medium text-slate-500 uppercase tracking-wider bg-slate-50 inline-block px-1.5 py-0.5 rounded border border-slate-100">
                            Status: {step.meta.status}
                          </div>
                        )}
                        {step.meta?.note && !step.meta?.reassign_reason && (
                          <div className="text-[10px] mt-1 font-normal text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100/50 leading-relaxed">
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
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 transition-all">
            <h3 className="text-xs font-semibold text-slate-800 tracking-wider mb-3 flex items-center gap-2">
              <div className="p-1 bg-slate-100 rounded-md"><User className="w-3.5 h-3.5 text-slate-600" /></div> Customer Details
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm shrink-0 shadow-inner">
                {order.customer_id?.fullName?.[0] || 'C'}
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-xs">{order.customer_id?.fullName || 'Unknown Customer'}</div>
                <div className="text-[10px] text-red-600 font-semibold flex items-center gap-1 mt-0.5">
                  <Award className="w-3 h-3 text-red-500" /> Member
                </div>
              </div>
            </div>
            <div className="space-y-2 text-xs pt-2.5 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-700 font-medium">{order.customer_id?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-700 font-medium truncate" title={order.customer_id?.email}>{order.customer_id?.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Assigned Agent Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 transition-all">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-800 tracking-wider flex items-center gap-2">
                <div className="p-1 bg-slate-100 rounded-md"><Car className="w-3.5 h-3.5 text-slate-600" /></div> Assigned Agent
              </h3>
              {orderStatus !== 'cancelled' && orderStatus !== 'completed' && order.agent_id && (
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer border border-amber-200/60 shadow-2xs"
                >
                  <ArrowRightLeft className="w-3 h-3" /> Change
                </button>
              )}
            </div>

            {order.agent_id ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-sm shrink-0 border border-red-100 shadow-inner">
                    {order.agent_id.firstName?.[0] || 'A'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{order.agent_id.firstName} {order.agent_id.lastName}</div>
                    <div className="text-[10.5px] text-slate-500 font-medium mt-0.5 tracking-wider uppercase flex items-center gap-1.5">
                      <span>ID: {order.agent_id.agentId || 'N/A'}</span>
                      <span>•</span>
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {order.agent_id.rating || '5.0'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-2.5 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700 font-medium">{order.agent_id.phone || 'N/A'}</span>
                  </div>
                  {order.assigned_at && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-600 text-[11px]">
                        Assigned on {new Date(order.assigned_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100 p-3">
                <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
                <div className="text-xs font-semibold text-slate-800 mb-0.5">No Agent Assigned</div>
                <div className="text-[11px] text-slate-500 mb-3 font-normal">This order requires dispatch</div>
                <button onClick={() => setIsAssignModalOpen(true)} className="h-8 px-4 bg-slate-900 hover:bg-slate-800 text-white shadow-2xs font-semibold rounded-lg transition-all text-xs w-full cursor-pointer">
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

      <ReassignAgentModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        order={order} 
      />

      {/* Lightbox */}
      {lightboxIndex !== null && order.completionPhotos?.length > 0 && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 backdrop-blur-sm"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {lightboxIndex < order.completionPhotos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          <div className="flex flex-col items-center gap-4 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <SafeImage
              src={order.completionPhotos[lightboxIndex]?.url}
              alt={`Completion photo ${lightboxIndex + 1}`}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
            />
            <div className="flex items-center gap-3">
              {order.completionPhotos.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    idx === lightboxIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
            <p className="text-white/60 text-sm font-medium">
              {lightboxIndex + 1} / {order.completionPhotos.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
