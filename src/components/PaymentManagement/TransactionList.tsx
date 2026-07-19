import { useState } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle, RefreshCw, FileText, CreditCard, DollarSign } from 'lucide-react';
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

export function TransactionList({ onSelectTransaction }: { onSelectTransaction: (id: string) => void }) {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor every platform transaction</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm shadow-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm">
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
        {/* Search and Filter Bar */}
        <div className="p-5 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by Transaction ID, Order ID, Customer..." 
                className="bg-slate-900 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/50 w-full transition-all"
              />
            </div>
            <button className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-sm px-3">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced Filters</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <select className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 outline-none">
              <option>Status: All</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Failed</option>
              <option>Refunded</option>
            </select>
            <select className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 outline-none">
              <option>Gateway: All</option>
              <option>Stripe</option>
              <option>Razorpay</option>
              <option>Wallet</option>
              <option>Cash</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-5 py-4 font-medium">Transaction & Order</th>
                <th className="px-5 py-4 font-medium">Customer & Driver</th>
                <th className="px-5 py-4 font-medium">Gateway & Method</th>
                <th className="px-5 py-4 font-medium">Amount & Fee</th>
                <th className="px-5 py-4 font-medium">Status & Date</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800">
              {PAYMENTS.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer" onClick={() => onSelectTransaction(payment.id)}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-white flex items-center gap-2">
                      {payment.id}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono">{payment.orderId}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <img src={payment.customer.image} alt={payment.customer.name} className="w-6 h-6 rounded-full border border-slate-700 object-cover" />
                      <div className="font-medium text-slate-200 text-xs">{payment.customer.name}</div>
                    </div>
                    {payment.driver ? (
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 pl-8">
                        {payment.driver.name}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 italic mt-1 pl-8">Unassigned</div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${GATEWAY_COLORS[payment.gateway] || 'bg-slate-800 text-slate-400'}`}>
                      {payment.gateway}
                    </span>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {payment.method}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{payment.amount}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Fee: {payment.platformFee}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider border ${STATUS_COLORS[payment.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {payment.status}
                    </span>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(payment.date).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Showing 1 to 5 of 12,450 transactions</span>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white font-medium">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-transparent hover:bg-slate-800 text-slate-400 font-medium">2</button>
            <button className="px-3 py-1.5 rounded-lg border border-transparent hover:bg-slate-800 text-slate-400 font-medium">3</button>
            <span className="px-2 py-1.5 text-slate-600">...</span>
            <button className="px-3 py-1.5 rounded-lg border border-transparent hover:bg-slate-800 text-slate-400 font-medium">1,245</button>
            <button className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
