import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Plus, ChevronLeft, ChevronRight, Clock, MapPin, RefreshCw, AlertCircle, ShoppingBag, Truck, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchOrders, setFilters, fetchLiveOverview, getOrderTimestamp } from '../../store/orderSlice';
import { SafeImage } from '../common/SafeImage';

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]',
  'On The Way': 'bg-red-50 text-red-700 border-red-100',
  'Started': 'bg-blue-50 text-blue-700 border-blue-100',
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

const capitalize = (str?: string) => {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export function OrderList({ onSelectOrder }: { onSelectOrder: (id: string) => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, filters, pagination, error, liveOverview } = useSelector((state: RootState) => state.order);

  const [activeTab, setActiveTab] = useState('orders');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    dispatch(fetchOrders(filters));
    dispatch(fetchLiveOverview());
  }, [dispatch, filters]);

  // Real-time refresh when new order arrives or periodic background sync
  useEffect(() => {
    const handleRefreshEvent = () => {
      dispatch(fetchOrders(filters));
      dispatch(fetchLiveOverview());
    };
    window.addEventListener('refresh_orders', handleRefreshEvent);

    const interval = setInterval(() => {
      if (!document.hidden) {
        dispatch(fetchOrders(filters));
        dispatch(fetchLiveOverview());
      }
    }, 40000);

    return () => {
      window.removeEventListener('refresh_orders', handleRefreshEvent);
      clearInterval(interval);
    };
  }, [dispatch, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== searchInput) {
        dispatch(setFilters({ search: searchInput, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, dispatch, filters.search]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    let status = '';
    if (tabId === 'live-orders') status = 'on the way';
    if (tabId === 'pending-orders') status = 'pending';
    if (tabId === 'assigned-orders') status = 'pending';
    if (tabId === 'in-progress') status = 'started';
    if (tabId === 'completed-orders') status = 'completed';
    if (tabId === 'cancelled-orders') status = 'cancelled';
    
    dispatch(setFilters({ status, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput, page: 1 }));
  };

  const handleRefresh = () => {
    dispatch(fetchOrders(filters));
    dispatch(fetchLiveOverview());
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(setFilters({ page: newPage }));
    }
  };

  const getOrderStatus = (o: any) => (o.status || o.order_status || '').toString().toLowerCase().trim();

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (activeTab === 'live-orders') {
      result = result.filter(o => ['on the way', 'on_the_way', 'on route', 'onroute'].includes(getOrderStatus(o)));
    } else if (activeTab === 'pending-orders') {
      result = result.filter(o => ['pending', 'accepted', 'assigned', 'created', 'new', 'unassigned'].includes(getOrderStatus(o)) && !o.agent_id);
    } else if (activeTab === 'assigned-orders') {
      result = result.filter(o => o.agent_id);
    } else if (activeTab === 'in-progress') {
      result = result.filter(o => ['started', 'in progress', 'in_progress', 'arrived'].includes(getOrderStatus(o)));
    } else if (activeTab === 'completed-orders') {
      result = result.filter(o => ['completed', 'delivered', 'done'].includes(getOrderStatus(o)));
    } else if (activeTab === 'cancelled-orders') {
      result = result.filter(o => ['cancelled', 'canceled', 'refunded', 'rejected'].includes(getOrderStatus(o)));
    }

    if (searchInput.trim()) {
      const q = searchInput.trim().toLowerCase().replace(/^#/, '');
      result = result.filter(o => 
        (o.order_number || '').toLowerCase().includes(q) ||
        (o.id || o._id || o.referenceId || o.orderId || '').toLowerCase().includes(q) ||
        (o.customer_id?.fullName || o.customer_id?.firstName || '').toLowerCase().includes(q) ||
        (o.customer_id?.phone || '').toLowerCase().includes(q)
      );
    }

    // Always sort by newest first (newly booked orders appear at the very top)
    result.sort((a, b) => {
      const timeA = getOrderTimestamp(a);
      const timeB = getOrderTimestamp(b);
      if (timeB !== timeA) return timeB - timeA;

      const numA = parseInt(String(a.order_number || a.orderNumber || '').replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(String(b.order_number || b.orderNumber || '').replace(/\D/g, ''), 10) || 0;
      if (numB !== numA) return numB - numA;

      const idA = String(a.order_number || a._id || a.id || '');
      const idB = String(b.order_number || b._id || b.id || '');
      return idB.localeCompare(idA, undefined, { numeric: true });
    });

    return result;
  }, [orders, activeTab, searchInput]);

  const statCards = [
    {
      label: 'TOTAL',
      value: liveOverview?.totalOrders ?? (pagination.total || orders.length),
      icon: ShoppingBag,
      color: 'text-slate-600 bg-[#F8FAFC] border-slate-200',
      sub: 'All Orders',
      tab: 'orders',
    },
    {
      label: 'PENDING',
      value: liveOverview?.pending?.count ?? orders.filter(o => ['pending', 'accepted', 'assigned', 'created', 'new', 'unassigned'].includes(getOrderStatus(o))).length,
      icon: Clock,
      color: 'text-slate-600 bg-[#F8FAFC] border-slate-200',
      sub: 'Awaiting',
      tab: 'pending-orders',
    },
    {
      label: 'IN PROGRESS',
      value: liveOverview?.inProgress?.count ?? orders.filter(o => ['started', 'in progress', 'in_progress', 'arrived'].includes(getOrderStatus(o))).length,
      icon: Activity,
      color: 'text-slate-600 bg-[#F8FAFC] border-slate-200',
      sub: 'Active',
      tab: 'in-progress',
    },
    {
      label: 'COMPLETED',
      value: liveOverview?.completed?.count ?? orders.filter(o => ['completed', 'delivered', 'done'].includes(getOrderStatus(o))).length,
      icon: CheckCircle2,
      color: 'text-slate-600 bg-[#F8FAFC] border-slate-200',
      sub: 'Delivered',
      tab: 'completed-orders',
    },
    {
      label: 'CANCELLED',
      value: liveOverview?.cancelled?.count ?? orders.filter(o => ['cancelled', 'canceled', 'refunded', 'rejected'].includes(getOrderStatus(o))).length,
      icon: XCircle,
      color: 'text-slate-600 bg-[#F8FAFC] border-slate-200',
      sub: 'Refunded/Void',
      tab: 'cancelled-orders',
    },
  ];

  return (
    <div className="p-3.5 sm:p-4 lg:p-5 space-y-3.5 sm:space-y-4 w-full bg-slate-50/60 min-h-screen animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          <button 
            type="button"
            className="cursor-pointer hover:text-red-600 transition-colors font-medium uppercase tracking-wider"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate_view', { detail: 'dashboard' }))}
          >
            Dashboard
          </button> 
          <ChevronRight className="w-3 h-3 text-slate-400" /> 
          <span className="text-red-600 font-semibold">
            Order Management
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh} 
            disabled={loading}
            className="p-1.5 bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer h-8 w-8 flex items-center justify-center"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
          </button>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all shadow-2xs text-xs h-8 cursor-pointer">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export
          </button>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate_view', { detail: 'orders/create' }))}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-xs transition-all active:scale-95 text-xs h-8 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
            Create
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-3.5 w-full">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const isFocused = activeTab === card.tab;
          return (
            <div
              key={i}
              onClick={() => handleTabChange(card.tab)}
              className={`bg-white p-3 sm:p-3.5 rounded-xl transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 min-h-[78px] sm:min-h-[82px] ${
                isFocused
                  ? 'border border-slate-300 bg-white shadow-xs'
                  : 'border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-semibold tracking-wider transition-colors uppercase leading-none ${isFocused ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-800'}`}>
                  {card.label}
                </span>
                <div className={`p-1 rounded-md border ${card.color} transition-all duration-200 group-hover:scale-105 shadow-2xs`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between w-full mt-2">
                <span className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight leading-none">{loading ? '-' : card.value}</span>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar bg-white border border-slate-200/90 p-1 rounded-xl gap-1 shadow-2xs">
        {['Orders', 'Live Orders', 'Pending Orders', 'Assigned Orders', 'In Progress', 'Completed Orders', 'Cancelled Orders'].map(tab => {
          const tabId = tab.toLowerCase().replace(' ', '-');
          const isActive = activeTab === tabId;
          return (
            <button
              key={tabId}
              onClick={() => handleTabChange(tabId)}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Search and Filter Bar */}
        <div className="p-3 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
            <div className="relative w-full max-w-sm group">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by Order ID, customer..." 
                className="bg-[#F8FAFC] border border-slate-200 text-xs text-slate-800 placeholder-slate-400 rounded-lg pl-8 pr-3 h-8 focus:outline-none focus:border-red-500 focus:bg-white w-full transition-all shadow-2xs"
              />
            </div>
            <button type="submit" className="h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold shadow-2xs cursor-pointer">
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar bg-white min-h-[300px]">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-xs">{error}</p>
            </div>
          ) : loading && filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-red-500 rounded-full animate-spin mb-2"></div>
              <p className="text-xs">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <p className="text-xs">No orders found matching your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="px-3.5 py-2.5">Order Details</th>
                  <th className="px-3.5 py-2.5">Customer & Location</th>
                  <th className="px-3.5 py-2.5">Agent</th>
                  <th className="px-3.5 py-2.5">Amount & Payment</th>
                  <th className="px-3.5 py-2.5">Status & Scheduled Date</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const srv = order.services?.[0]?.serviceId;
                  const paymentStatus = capitalize(order.payment?.status || 'Pending');
                  const orderStatus = capitalize(order.status || 'Pending');
                  
                  return (
                    <tr key={order._id} className="hover:bg-slate-50/70 transition-colors group cursor-pointer" onClick={() => onSelectOrder(order._id)}>
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {srv?.image ? (
                            <SafeImage src={srv.image} alt={srv.name} className="w-8 h-8 rounded-lg border border-slate-200 object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[9px] shrink-0 font-bold">IMG</div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 text-xs">
                              {order.order_number}
                            </div>
                            <div className="text-[11px] text-slate-500">{capitalize(srv?.name || 'Service')}</div>
                            <div className="text-[10px] text-slate-400">
                              Placed: {order.order_date ? new Date(order.order_date).toLocaleDateString() : (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-medium text-slate-800 text-xs">{order.customer_id?.fullName || 'Unknown Customer'}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 max-w-[160px] truncate">
                          <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="truncate">{order.pickup_location?.address || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        {order.agent_id ? (
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-md w-fit">
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {order.agent_id.firstName?.[0]}{order.agent_id.lastName?.[0]}
                            </div>
                            <span className="font-medium text-slate-800 text-xs">{order.agent_id.firstName} {order.agent_id.lastName}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FEF3C7] border border-[#FEF3C7] text-[#B45309] rounded-md text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-pulse"></span>
                            Unassigned
                          </div>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        {(() => {
                          const itemSubtotal = Number(order.estimated_amount ?? order.subtotal ?? order.base_amount ?? order.final_amount ?? 0);
                          const itemVat = (order.vat_amount != null && Number(order.vat_amount) >= 0)
                            ? Number(order.vat_amount)
                            : ((order.vat != null && Number(order.vat) >= 0)
                                ? Number(order.vat)
                                : (itemSubtotal * ((order.vat_rate ?? 5) / 100)));

                          return (
                            <>
                              <div className="font-semibold text-slate-900 text-xs">AED {order.final_amount}</div>
                              <div className="text-[10px] text-slate-400">Incl. VAT: AED {itemVat.toFixed(2)}</div>
                            </>
                          );
                        })()}
                        <div className="text-[10px] font-medium mt-0.5 flex items-center gap-1">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${PAYMENT_BADGE_COLORS[paymentStatus] || 'bg-slate-100 text-slate-500'}`}>
                            {paymentStatus}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{capitalize(order.payment?.method) || 'Cash'}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${STATUS_COLORS[orderStatus] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {orderStatus}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {order.scheduled_at 
                              ? new Date(order.scheduled_at).toLocaleDateString()
                              : (order.order_date ? new Date(order.order_date).toLocaleDateString() : (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'))}
                            {order.time_slot?.from ? ` (${order.time_slot.from} - ${order.time_slot.to})` : ''}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-normal">
              <span>Showing</span>
              <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                {(pagination.page - 1) * pagination.limit + 1} – {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>
              <span>of</span>
              <span className="font-semibold text-slate-800">{pagination.total}</span>
              <span>results</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <React.Fragment key={page}>
                        {prev && page - prev > 1 && (
                          <span className="px-1 text-slate-400 text-xs">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            pagination.page === page 
                              ? 'bg-red-600 text-white shadow-xs' 
                              : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
