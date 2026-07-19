import { useState } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ORDERS } from '../../data/orders';

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]',
  'On The Way': 'bg-blue-50 text-blue-700 border-blue-100',
  'Arrived': 'bg-purple-50 text-purple-700 border-purple-100',
  'Completed': 'bg-[#DCFCE7] text-[#16A34A] border-[#DCFCE7]',
  'Cancelled': 'bg-[#FEE2E2] text-[#DC2626] border-[#FEE2E2]',
};

const PAYMENT_BADGE_COLORS: Record<string, string> = {
  'Paid': 'bg-[#DCFCE7] text-[#16A34A]',
  'Pending': 'bg-[#FEF3C7] text-[#B45309]',
  'Failed': 'bg-[#FEE2E2] text-[#DC2626]',
  'Refunded': 'bg-[#F1F5F9] text-[#64748B]',
};

export function OrderList({ onSelectOrder }: { onSelectOrder: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState('orders');

  const filteredOrders = ORDERS.filter(order => {
    if (activeTab === 'orders') return true;
    if (activeTab === 'live-orders') return order.status === 'On The Way';
    if (activeTab === 'pending-orders') return order.status === 'Pending';
    if (activeTab === 'assigned-orders') return order.status === 'Assigned';
    if (activeTab === 'in-progress') return order.status === 'On The Way';
    if (activeTab === 'completed-orders') return order.status === 'Completed';
    if (activeTab === 'cancelled-orders') return order.status === 'Cancelled';
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all service orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 hover:text-slate-950 transition-colors text-sm shadow-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 hover:text-slate-950 transition-colors text-sm shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-600/10 transition-all text-sm">
            <Plus className="w-4 h-4" />
            Create Order
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-200 pb-px">
        {['Orders', 'Live Orders', 'Pending Orders', 'Assigned Orders', 'In Progress', 'Completed Orders', 'Cancelled Orders', 'Refund Requests'].map(tab => {
          const tabId = tab.toLowerCase().replace(' ', '-');
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tabId 
                  ? 'border-blue-600 text-blue-600 font-semibold' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search and Filter Bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by Order ID, Customer, Agent or Phone..." 
                className="bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full transition-all shadow-sm"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors flex items-center gap-2 text-sm px-3 shadow-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Advanced Filters</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <select className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 shadow-sm text-xs">
              <option>Status: All</option>
              <option>Pending</option>
              <option>Assigned</option>
              <option>On The Way</option>
            </select>
            <select className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 shadow-sm text-xs">
              <option>City: All</option>
              <option>Dubai</option>
              <option>Abu Dhabi</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar bg-white">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-5 py-4 font-medium">Order Details</th>
                <th className="px-5 py-4 font-medium">Customer & Location</th>
                <th className="px-5 py-4 font-medium">Agent & Vehicle</th>
                <th className="px-5 py-4 font-medium">Amount & Payment</th>
                <th className="px-5 py-4 font-medium">Status & ETA</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors group cursor-pointer" onClick={() => onSelectOrder(order.id)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={order.service.image} alt={order.service.name} className="w-10 h-10 rounded-lg border border-slate-200 object-cover" />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          {order.id}
                          {order.priority === 'Urgent' && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FEE2E2] uppercase">Urgent</span>}
                          {order.priority === 'High' && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFEDD5] text-[#C2410C] border border-[#FFEDD5] uppercase">High</span>}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{order.service.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800">{order.customer.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 max-w-[180px] truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      {order.location.address}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {order.driver ? (
                      <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 hover:border-blue-500/20 px-3 py-1.5 rounded-lg transition-all w-fit">
                        <img src={order.driver.image} alt={order.driver.name} className="w-7 h-7 rounded-full border border-slate-200 object-cover shadow-sm shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800 text-xs tracking-wide">{order.driver.name}</div>
                          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">{order.driver.vehicle}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] border border-[#FEF3C7] text-[#B45309] rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-pulse"></span>
                        Unassigned
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{order.amount}</div>
                    <div className="text-xs font-medium mt-1 flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${PAYMENT_BADGE_COLORS[order.paymentStatus] || 'bg-slate-100 text-slate-500'}`}>
                        {order.paymentStatus}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{order.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {order.status}
                    </span>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {order.eta}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>Showing 1 to 5 of 1,245 orders</span>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-500 transition-colors flex items-center justify-center" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-blue-600 bg-blue-600 text-white font-semibold shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold shadow-sm">2</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold shadow-sm">3</button>
            <span className="px-2 py-1.5 text-slate-400">...</span>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold shadow-sm">125</button>
            <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
