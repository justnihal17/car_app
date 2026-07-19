import { ArrowLeft, Clock, MapPin, User, Car, CheckCircle, Navigation, FileText, XCircle, RefreshCw, CreditCard, DollarSign, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PAYMENTS } from '../../data/payments';

const STATUS_COLORS: Record<string, string> = {
  'Paid': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Failed': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Refunded': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const GATEWAY_COLORS: Record<string, string> = {
  'Stripe': 'text-indigo-400 bg-indigo-500/10',
  'Razorpay': 'text-blue-400 bg-blue-500/10',
  'Wallet': 'text-emerald-400 bg-emerald-500/10',
  'Cash': 'text-yellow-400 bg-yellow-500/10',
};

export function TransactionDetails({ transactionId, onBack }: { transactionId: string; onBack: () => void }) {
  const payment = PAYMENTS.find(p => p.id === transactionId) || PAYMENTS[0];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{payment.id}</h1>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[payment.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                {payment.status}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Processed: {new Date(payment.date).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {payment.status === 'Pending' && (
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Verify
            </button>
          )}
          {payment.status === 'Failed' && (
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-lg text-sm shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Retry Payment
            </button>
          )}
          {payment.status === 'Paid' && (
            <button className="px-4 py-2 bg-slate-900 border border-red-900/50 text-red-400 font-medium rounded-lg hover:bg-red-900/20 transition-colors text-sm shadow-sm flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Refund
            </button>
          )}
          <button className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm shadow-sm flex items-center gap-2">
            <FileText className="w-4 h-4" /> Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content - Left/Center Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-6">
             <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
               <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Transaction Summary
                  </h3>
               </div>
               <div className="text-right">
                 <div className="text-3xl font-bold text-white">{payment.amount} <span className="text-lg text-slate-500 font-medium">{payment.currency}</span></div>
               </div>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
               <div>
                 <div className="text-xs text-slate-500 mb-1">Order ID</div>
                 <div className="text-sm font-medium text-slate-200 font-mono">{payment.orderId}</div>
               </div>
               <div>
                 <div className="text-xs text-slate-500 mb-1">Invoice ID</div>
                 <div className="text-sm font-medium text-slate-200 font-mono">{payment.invoiceId}</div>
               </div>
               <div>
                 <div className="text-xs text-slate-500 mb-1">Gateway</div>
                 <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${GATEWAY_COLORS[payment.gateway] || 'bg-slate-800 text-slate-400'}`}>
                   {payment.gateway}
                 </span>
               </div>
               <div>
                 <div className="text-xs text-slate-500 mb-1">Method</div>
                 <div className="text-sm font-medium text-slate-200 flex items-center gap-1">
                   <CreditCard className="w-3.5 h-3.5 text-slate-400" /> {payment.method}
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Financial Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/50">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white font-mono">{payment.subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/50">
                <span className="text-slate-400">Tax</span>
                <span className="text-white font-mono">{payment.tax}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/50">
                <span className="text-slate-400">Discount</span>
                <span className="text-emerald-400 font-mono">-{payment.discount}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/50">
                <span className="text-slate-400">Platform Fee</span>
                <span className="text-slate-300 font-mono">{payment.platformFee}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-medium text-white">Net Amount</span>
                <span className="text-xl font-bold text-white font-mono">{payment.amount}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Gateway Verification Logs
            </h3>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-400 overflow-x-auto">
              <div className="text-emerald-400 mb-2">// Gateway Response: 200 OK</div>
              <div>{`{`}</div>
              <div className="pl-4">"id": "ch_3MqwQ9LkdIwHu7ix0Q2",</div>
              <div className="pl-4">"object": "charge",</div>
              <div className="pl-4">"amount": 4500,</div>
              <div className="pl-4">"amount_captured": 4500,</div>
              <div className="pl-4">"amount_refunded": 0,</div>
              <div className="pl-4">"balance_transaction": "txn_3MqwQ9LkdIwHu7ix0Q3",</div>
              <div className="pl-4">"billing_details": {`{`}</div>
              <div className="pl-8">"email": "{payment.customer.email}",</div>
              <div className="pl-8">"name": "{payment.customer.name}"</div>
              <div className="pl-4">{`}`}</div>
              <div>{`}`}</div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Profiles */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Customer Info</h3>
            <div className="flex items-center gap-4 mb-4">
              <img src={payment.customer.image} alt={payment.customer.name} className="w-12 h-12 rounded-full border border-slate-700 object-cover" />
              <div>
                <div className="font-medium text-white">{payment.customer.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{payment.customer.email}</div>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center justify-center gap-2">
              <User className="w-3.5 h-3.5" /> View Profile
            </button>
          </div>

          {/* Driver Card */}
          <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Driver Info</h3>
            {payment.driver ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <img src={payment.driver.image} alt={payment.driver.name} className="w-12 h-12 rounded-full border border-slate-700 object-cover" />
                  <div>
                    <div className="font-medium text-white">{payment.driver.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{payment.driver.id}</div>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center justify-center gap-2">
                  <User className="w-3.5 h-3.5" /> View Profile
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-sm font-medium text-slate-300">No Driver Assigned</div>
                <div className="text-xs text-slate-500">Order unassigned at payment</div>
              </div>
            )}
          </div>
          
          <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg p-5">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Risk Evaluation</h3>
             <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div>
                   <div className="text-sm font-medium text-emerald-400">Low Risk</div>
                   <div className="text-xs text-slate-400 mt-0.5">Score: 12 / 100</div>
                </div>
             </div>
             <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400">IP Match</span>
                   <span className="text-emerald-400">Passed</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400">CVV Check</span>
                   <span className="text-emerald-400">Passed</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
