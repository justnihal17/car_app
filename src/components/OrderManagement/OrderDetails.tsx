import { ArrowLeft, Clock, MapPin, User, Car, CheckCircle, Navigation, FileText, XCircle, RefreshCw, CreditCard, Star, Phone, Mail, Award, Activity } from 'lucide-react';
import { ORDERS } from '../../data/orders';
import { OrderMap } from './OrderMap';

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]',
  'On The Way': 'bg-blue-50 text-blue-700 border-blue-100',
  'Arrived': 'bg-purple-50 text-purple-700 border-purple-100',
  'Completed': 'bg-[#DCFCE7] text-[#16A34A] border-[#DCFCE7]',
  'Cancelled': 'bg-[#FEE2E2] text-[#DC2626] border-[#FEE2E2]',
};

const TIMELINE = [
  { status: 'Order Placed', time: '09:30 AM', date: 'Jul 12, 2026', done: true, current: false },
  { status: 'Payment Confirmed', time: '09:31 AM', date: 'Jul 12, 2026', done: true, current: false },
  { status: 'Driver Assigned', time: '09:35 AM', date: 'Jul 12, 2026', done: true, current: false },
  { status: 'On The Way', time: '09:40 AM', date: 'Jul 12, 2026', done: true, current: false },
  { status: 'Arrived', time: '09:55 AM', date: 'Jul 12, 2026', done: true, current: true },
  { status: 'Service Started', time: '', date: '', done: false, current: false },
  { status: 'Completed', time: '', date: '', done: false, current: false },
];

export function OrderDetails({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const order = ORDERS.find(o => o.id === orderId) || ORDERS[0];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{order.id}</h1>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Booked: {new Date(order.bookingTime).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {order.status === 'Pending' && (
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm shadow-lg shadow-blue-600/10 transition-all flex items-center gap-2">
              <User className="w-4 h-4" /> Assign Agent
            </button>
          )}
          {['On The Way', 'Arrived'].includes(order.status) && (
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm shadow-lg shadow-blue-600/10 transition-all flex items-center gap-2">
              <Navigation className="w-4 h-4" /> Track Live
            </button>
          )}
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm shadow-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" /> Invoice
          </button>
          <button className="px-4 py-2 bg-red-50 border border-red-100 text-red-600 font-medium rounded-lg hover:bg-red-100/70 transition-colors text-sm shadow-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" /> Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content - Left/Center Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Real High-Fidelity Interactive Map */}
          <OrderMap order={order} />

          {/* Service & Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Car className="w-4 h-4 text-slate-400" /> Service Details
              </h3>
              <div className="flex items-start gap-4 mb-6">
                <img src={order.service.image} alt={order.service.name} className="w-16 h-16 rounded-xl border border-slate-200 shadow-sm object-cover" />
                <div>
                  <div className="font-bold text-slate-950 text-lg">{order.service.name}</div>
                  <div className="text-sm text-slate-500">{order.service.category} • {order.service.duration}</div>
                  <div className="text-xs font-semibold text-slate-700 mt-2 bg-slate-50 inline-block px-2.5 py-1 rounded border border-slate-200">
                    Vehicle: {order.vehicle}
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Scheduled</span>
                  <span className="text-slate-800 font-semibold">{order.scheduledTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Location</span>
                  <span className="text-slate-800 font-semibold truncate max-w-[200px] text-right" title={order.location.address}>{order.location.address}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" /> Payment Summary
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-700 font-medium">{order.service.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax (5%)</span>
                    <span className="text-slate-700 font-medium">$2.25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Platform Fee</span>
                    <span className="text-slate-700 font-medium">$1.00</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-semibold text-slate-900">Grand Total</span>
                  <span className="text-xl font-bold text-blue-600">{order.amount}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    Via {order.paymentMethod}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    order.paymentStatus === 'Paid' ? 'bg-[#DCFCE7] text-[#16A34A] border-[#DCFCE7]' :
                    order.paymentStatus === 'Refunded' ? 'bg-[#F1F5F9] text-[#64748B] border-[#F1F5F9]' :
                    'bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Timeline & Profiles */}
        <div className="space-y-6">
          
          {/* Order Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" /> Order Timeline
            </h3>
            <div className="space-y-0">
              {TIMELINE.map((step, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== TIMELINE.length - 1 && (
                    <div className={`absolute left-3 top-8 w-px h-[calc(100%-8px)] ${step.done && TIMELINE[idx+1]?.done ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                  )}
                  <div className="relative z-10 flex flex-col items-center mt-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 
                      ${step.current ? 'bg-white border-blue-600 text-blue-600' : 
                        step.done ? 'bg-blue-600 border-blue-600 text-white' : 
                        'bg-white border-slate-200 text-slate-400'}
                    `}>
                      {step.done && !step.current ? <CheckCircle className="w-3.5 h-3.5" /> : 
                       step.current ? <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> : null}
                    </div>
                  </div>
                  <div className="pb-6">
                    <div className={`text-sm ${step.current ? 'text-blue-600 font-bold' : step.done ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                      {step.status}
                    </div>
                    {step.time && (
                      <div className="text-xs text-slate-500 mt-0.5">{step.date} • {step.time}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Customer Details</h3>
            <div className="flex items-center gap-4 mb-4">
              <img src={order.customer.image} alt={order.customer.name} className="w-12 h-12 rounded-full border border-slate-200 shadow-sm object-cover" />
              <div>
                <div className="font-bold text-slate-900">{order.customer.name}</div>
                <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                  <Award className="w-3 h-3 text-blue-500" /> {order.customer.membership}
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 font-medium">{order.customer.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 font-medium">{order.customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-slate-700 font-medium">{order.customer.rating} avg. rating</span>
              </div>
            </div>
          </div>

          {/* Agent Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Assigned Agent</h3>
            {order.driver ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <img src={order.driver.image} alt={order.driver.name} className="w-12 h-12 rounded-full border border-slate-200 shadow-sm object-cover" />
                  <div>
                    <div className="font-bold text-slate-900">{order.driver.name}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{order.driver.id}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-medium">{order.driver.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Car className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-medium">{order.driver.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-slate-700 font-medium">{order.driver.rating} rating</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-100 p-4">
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div className="text-sm font-bold text-slate-800 mb-1">No Agent Assigned</div>
                <div className="text-xs text-slate-500 mb-4">This order requires dispatch</div>
                <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-bold rounded-lg transition-colors text-sm w-full">
                  Assign Manually
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
