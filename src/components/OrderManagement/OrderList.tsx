import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight, Clock, MapPin, RefreshCw, Loader2, Calendar, User, Car, Wrench, Shield, CreditCard, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CreateOrderDrawer } from './CreateOrderDrawer';
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

const PAYMENT_BADGE_COLORS: Record<string, string> = {
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Failed': 'bg-rose-50 text-rose-700 border-rose-200',
  'Refunded': 'bg-slate-100 text-slate-600 border-slate-200',
};

export function OrderList({ onSelectOrder }: { onSelectOrder: (id: string) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active Modals
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; orderId: string }>({ isOpen: false, orderId: '' });
  const [updateModal, setUpdateModal] = useState<{ isOpen: boolean; order: any }>({ isOpen: false, order: null });
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; orderId: string }>({ isOpen: false, orderId: '' });
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; orderId: string; status: string }>({ isOpen: false, orderId: '', status: '' });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    fetchOrders();
    fetchRecentOrders();
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/order');
      const raw = res.data?.data || res.data?.orders || res.data || [];
      const list = Array.isArray(raw) ? raw : (raw.list || []);
      
      const mapped = list.map((item: any) => {
        const customerName = item.customer?.fullName || `${item.customer?.firstName || ''} ${item.customer?.lastName || ''}`.trim() || item.customerName || item.customer || 'Customer';
        const agentName = item.assignedAgent?.fullName || `${item.assignedAgent?.firstName || ''} ${item.assignedAgent?.lastName || ''}`.trim() || item.agentName || item.agent?.name || 'Unassigned';
        const vehicleName = item.vehicleDetails || item.vehicle?.name || item.vehicle || 'N/A';
        const servicesList = Array.isArray(item.services) 
          ? item.services.map((s: any) => s.name || s.serviceId?.name || 'Service').join(', ') 
          : (item.serviceName || item.service?.name || 'Car Wash');

        return {
          id: item._id || item.id,
          orderIdStr: item.orderId || item._id || item.id,
          customerName,
          customerPhone: item.customer?.phone || item.phone || '',
          vehicleName,
          servicesList,
          agentName,
          agentId: item.assignedAgent?._id || item.assignedAgent?.id || item.agentId,
          bookingType: item.bookingType || 'Scheduled',
          scheduledDate: item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : 'N/A',
          scheduledTime: item.scheduledTime || item.timeSlot || 'N/A',
          paymentStatus: item.paymentStatus || (item.isPaid ? 'Paid' : 'Pending'),
          orderStatus: item.orderStatus || item.status || 'Pending',
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A',
          rawItem: item
        };
      });

      setOrders(mapped);
    } catch (err: any) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    setLoadingRecent(true);
    try {
      const res = await api.get('/admin/order/recent');
      const raw = res.data?.data || res.data?.orders || res.data || [];
      const list = Array.isArray(raw) ? raw : [];
      setRecentOrders(list.slice(0, 4));
    } catch (err) {
      console.error('Fetch recent orders error:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab filter
      if (activeTab === 'pending' && order.orderStatus.toLowerCase() !== 'pending') return false;
      if (activeTab === 'assigned' && order.orderStatus.toLowerCase() !== 'assigned') return false;
      if (activeTab === 'ontheway' && order.orderStatus.toLowerCase() !== 'on the way') return false;
      if (activeTab === 'completed' && order.orderStatus.toLowerCase() !== 'completed') return false;
      if (activeTab === 'cancelled' && order.orderStatus.toLowerCase() !== 'cancelled') return false;

      // Dropdown Status Filter
      if (statusFilter !== 'All' && order.orderStatus.toLowerCase() !== statusFilter.toLowerCase()) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (order.orderIdStr || '').toLowerCase().includes(q);
        const matchesCustomer = (order.customerName || '').toLowerCase().includes(q);
        const matchesPhone = (order.customerPhone || '').toLowerCase().includes(q);
        const matchesAgent = (order.agentName || '').toLowerCase().includes(q);
        const matchesVehicle = (order.vehicleName || '').toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesPhone && !matchesAgent && !matchesVehicle) return false;
      }

      return true;
    });
  }, [orders, activeTab, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full bg-slate-50/60 min-h-screen">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Dashboard</span> 
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
            <span className="text-red-600 font-bold">Order Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and track all service orders in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export
          </button>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Create Order
          </button>
        </div>
      </div>

      {/* Recent Orders Section */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" /> Recent Orders Quickview
            </h3>
            <span className="text-xs text-slate-400 font-medium">Live Feed</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentOrders.map((ro, i) => {
              const customerName = ro.customer?.fullName || `${ro.customer?.firstName || ''} ${ro.customer?.lastName || ''}`.trim() || 'Customer';
              return (
                <div 
                  key={ro._id || i}
                  onClick={() => onSelectOrder(ro._id || ro.id)}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/80 hover:border-slate-200 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">#{String(ro._id || ro.id).slice(-6).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${STATUS_COLORS[ro.orderStatus || ro.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {ro.orderStatus || ro.status || 'Pending'}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 text-sm truncate">{customerName}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                    <span>AED {ro.grandTotal || ro.totalAmount || 0}</span>
                    <span className="text-[10px] text-slate-400">{ro.createdAt ? new Date(ro.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-200/80 pb-px gap-1">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'pending', label: 'Pending' },
          { id: 'assigned', label: 'Assigned' },
          { id: 'ontheway', label: 'On The Way' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive 
                  ? 'border-red-600 text-red-600 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table & Controls Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by Order ID, Customer, Phone, Vehicle, Agent..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200 text-sm text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 w-full transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <label className="text-xs font-bold text-slate-400 uppercase">Status:</label>
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl px-3.5 py-2 text-sm outline-none focus:border-red-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="On The Way">On The Way</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200/80">
                <th className="px-5 py-4 font-bold">Order ID</th>
                <th className="px-5 py-4 font-bold">Customer</th>
                <th className="px-5 py-4 font-bold">Vehicle</th>
                <th className="px-5 py-4 font-bold">Services</th>
                <th className="px-5 py-4 font-bold">Assigned Agent</th>
                <th className="px-5 py-4 font-bold">Booking Type</th>
                <th className="px-5 py-4 font-bold">Scheduled Date</th>
                <th className="px-5 py-4 font-bold">Scheduled Time</th>
                <th className="px-5 py-4 font-bold">Payment Status</th>
                <th className="px-5 py-4 font-bold">Order Status</th>
                <th className="px-5 py-4 font-bold">Created Date</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-10 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={12} className="px-5 py-12 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-slate-800 font-bold mb-1">{error}</p>
                    <button 
                      onClick={fetchData} 
                      className="mt-3 px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-colors"
                    >
                      Retry Connection
                    </button>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-5 py-12 text-center text-slate-400 font-medium">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* Order ID */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 hover:text-red-600 cursor-pointer" onClick={() => onSelectOrder(order.id)}>
                      #{String(order.orderIdStr).slice(-8).toUpperCase()}
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      {order.customerPhone && <div className="text-xs text-slate-400 font-mono mt-0.5">{order.customerPhone}</div>}
                    </td>

                    {/* Vehicle */}
                    <td className="px-5 py-4 text-slate-700 font-medium">{order.vehicleName}</td>

                    {/* Services */}
                    <td className="px-5 py-4 text-slate-800 font-semibold max-w-[200px] truncate" title={order.servicesList}>
                      {order.servicesList}
                    </td>

                    {/* Assigned Agent */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        order.agentName === 'Unassigned' ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        <User className="w-3.5 h-3.5" /> {order.agentName}
                      </span>
                    </td>

                    {/* Booking Type */}
                    <td className="px-5 py-4 font-medium text-slate-700">{order.bookingType}</td>

                    {/* Scheduled Date */}
                    <td className="px-5 py-4 font-medium text-slate-700">{order.scheduledDate}</td>

                    {/* Scheduled Time */}
                    <td className="px-5 py-4 font-medium text-slate-700">{order.scheduledTime}</td>

                    {/* Payment Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${PAYMENT_BADGE_COLORS[order.paymentStatus] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[order.orderStatus] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-4 text-xs text-slate-400 font-medium">{order.createdAt}</td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => onSelectOrder(order.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                        >
                          View
                        </button>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === order.id ? null : order.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {/* Dropdown Menu */}
                          {openDropdownId === order.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-left text-xs font-semibold">
                              <button 
                                onClick={() => { setOpenDropdownId(null); setAssignModal({ isOpen: true, orderId: order.id }); }}
                                className="w-full px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <User className="w-3.5 h-3.5 text-blue-600" /> Assign Agent
                              </button>
                              <button 
                                onClick={() => { setOpenDropdownId(null); setUpdateModal({ isOpen: true, order: order.rawItem }); }}
                                className="w-full px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Calendar className="w-3.5 h-3.5 text-slate-600" /> Update Order
                              </button>
                              <button 
                                onClick={() => { setOpenDropdownId(null); setPaymentModal({ isOpen: true, orderId: order.id, status: order.paymentStatus }); }}
                                className="w-full px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Update Payment
                              </button>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button 
                                onClick={() => { setOpenDropdownId(null); setCancelModal({ isOpen: true, orderId: order.id }); }}
                                disabled={['cancelled', 'completed'].includes(order.orderStatus.toLowerCase())}
                                className="w-full px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-40"
                              >
                                <AlertCircle className="w-3.5 h-3.5" /> Cancel Order
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            Showing <span className="font-bold text-slate-900">{filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-slate-900">{filteredOrders.length}</span> orders
          </div>
          <div className="flex gap-1.5 items-center">
            <button 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold shadow-xs">
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Create Order Drawer */}
      <CreateOrderDrawer 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchData}
      />

      {/* Action Modals */}
      <AssignAgentModal 
        isOpen={assignModal.isOpen}
        orderId={assignModal.orderId}
        onClose={() => setAssignModal({ isOpen: false, orderId: '' })}
        onSuccess={fetchData}
      />

      <UpdateOrderModal 
        isOpen={updateModal.isOpen}
        orderId={updateModal.order?._id || updateModal.order?.id}
        initialDate={updateModal.order?.scheduledDate}
        initialTime={updateModal.order?.scheduledTime}
        initialNote={updateModal.order?.customerNote}
        onClose={() => setUpdateModal({ isOpen: false, order: null })}
        onSuccess={fetchData}
      />

      <CancelOrderModal 
        isOpen={cancelModal.isOpen}
        orderId={cancelModal.orderId}
        onClose={() => setCancelModal({ isOpen: false, orderId: '' })}
        onSuccess={fetchData}
      />

      <UpdatePaymentModal 
        isOpen={paymentModal.isOpen}
        orderId={paymentModal.orderId}
        initialStatus={paymentModal.status}
        onClose={() => setPaymentModal({ isOpen: false, orderId: '', status: '' })}
        onSuccess={fetchData}
      />

    </div>
  );
}
