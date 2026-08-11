import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Plus, ChevronLeft, ChevronRight, Clock, MapPin, RefreshCw, AlertCircle, ShoppingBag, Truck, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchOrders, setFilters, fetchLiveOverview } from '../../store/orderSlice';
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

    // Always sort by newest first
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.created_at || b.date || 0).getTime();
      return dateB - dateA;
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Orders</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-950 transition-all shadow-sm hover:shadow">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-950 transition-all shadow-sm hover:shadow text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm">
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const isFocused = activeTab === card.tab;
          return (
            <div
              key={i}
              onClick={() => handleTabChange(card.tab)}
              className={`bg-white p-4 rounded-2xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 ${
                isFocused
                  ? 'border border-slate-300 bg-white shadow-md'
                  : 'border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold tracking-tight transition-colors uppercase ${isFocused ? 'text-slate-800 font-bold' : 'text-slate-500 group-hover:text-slate-800'}`}>
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl border ${card.color} transition-all duration-300 group-hover:scale-110 shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">{loading ? '-' : card.value}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar bg-slate-100/50 p-1.5 rounded-xl gap-1">
        {['Orders', 'Live Orders', 'Pending Orders', 'Assigned Orders', 'In Progress', 'Completed Orders', 'Cancelled Orders'].map(tab => {
          const tabId = tab.toLowerCase().replace(' ', '-');
          const isActive = activeTab === tabId;
          return (
            <button
              key={tabId}
              onClick={() => handleTabChange(tabId)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        {/* Search and Filter Bar */}
        <div className="p-5 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by Order ID..." 
                className="bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-slate-300 focus:shadow-md focus:bg-white w-full transition-all"
              />
            </div>
            <button type="submit" className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all flex items-center gap-2 text-sm px-6 shadow-sm hover:shadow-md">
              <span className="hidden sm:inline font-bold">Search</span>
            </button>
          </form>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar bg-white min-h-[400px]">
          {error ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <p>{error}</p>
            </div>
          ) : loading && filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin mb-3"></div>
              <p>Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <p>No orders found matching your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[10px] 2xl:text-[11px] uppercase tracking-widest font-bold border-b border-slate-100">
                  <th className="px-4 2xl:px-6 py-3 2xl:py-4">Order Details</th>
                  <th className="px-4 2xl:px-6 py-3 2xl:py-4">Customer & Location</th>
                  <th className="px-4 2xl:px-6 py-3 2xl:py-4">Agent</th>
                  <th className="px-4 2xl:px-6 py-3 2xl:py-4">Amount & Payment</th>
                  <th className="px-4 2xl:px-6 py-3 2xl:py-4">Status & Time</th>
                </tr>
              </thead>
              <tbody className="text-xs 2xl:text-sm divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const srv = order.services?.[0]?.serviceId;
                  const paymentStatus = capitalize(order.payment?.status || 'Pending');
                  const orderStatus = capitalize(order.status || 'Pending');
                  
                  return (
                    <tr key={order._id} className="hover:bg-slate-50/70 transition-colors group cursor-pointer" onClick={() => onSelectOrder(order._id)}>
                      <td className="px-4 2xl:px-5 py-3 2xl:py-4">
                        <div className="flex items-center gap-2.5 2xl:gap-3">
                          {srv?.image ? (
                            <SafeImage src={srv.image} alt={srv.name} className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg border border-slate-200 object-cover" />
                          ) : (
                            <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] 2xl:text-xs">IMG</div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              {order.order_number}
                            </div>
                            <div className="text-[10px] 2xl:text-xs text-slate-500 mt-0.5">{capitalize(srv?.name || 'Service')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 2xl:px-5 py-3 2xl:py-4">
                        <div className="font-semibold text-slate-800">{order.customer_id?.fullName || 'Unknown Customer'}</div>
                        <div className="text-[10px] 2xl:text-xs text-slate-500 mt-0.5 flex items-center gap-1 max-w-[150px] 2xl:max-w-[180px] truncate">
                          <MapPin className="w-3 2xl:w-3.5 h-3 2xl:h-3.5 shrink-0 text-slate-400" />
                          {order.pickup_location?.address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 2xl:px-5 py-3 2xl:py-4">
                        {order.agent_id ? (
                          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg w-fit">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                              {order.agent_id.firstName?.[0]}{order.agent_id.lastName?.[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 text-xs tracking-wide">{order.agent_id.firstName} {order.agent_id.lastName}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] border border-[#FEF3C7] text-[#B45309] rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-pulse"></span>
                            Unassigned
                          </div>
                        )}
                      </td>
                      <td className="px-4 2xl:px-5 py-3 2xl:py-4">
                        <div className="font-semibold text-slate-900">AED {order.final_amount}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Incl. VAT: AED {order.tax_amount != null ? Number(order.tax_amount).toFixed(2) : '0.00'}</div>
                        <div className="text-[10px] 2xl:text-xs font-medium mt-1 flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] 2xl:text-[10px] font-bold uppercase ${PAYMENT_BADGE_COLORS[paymentStatus] || 'bg-slate-100 text-slate-500'}`}>
                            {paymentStatus}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{capitalize(order.payment?.method) || 'Cash'}</span>
                        </div>
                      </td>
                      <td className="px-4 2xl:px-5 py-3 2xl:py-4">
                        <span className={`inline-flex items-center px-2 2xl:px-2.5 py-0.5 2xl:py-1 rounded-md text-[10px] 2xl:text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[orderStatus] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {orderStatus}
                        </span>
                        <div className="text-[10px] 2xl:text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 2xl:w-3.5 h-3 2xl:h-3.5 text-slate-400" />
                          {order.time_slot?.from ? `${order.time_slot.from} - ${order.time_slot.to}` : 'N/A'}
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
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders</span>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-500 transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button className="px-3 py-1.5 rounded-lg border border-red-600 bg-red-600 text-white font-semibold shadow-sm">
                {pagination.page}
              </button>
              
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-500 transition-colors flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
