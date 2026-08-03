import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, UserMinus, LogIn, Plus, Download, Search, Filter, RefreshCw, Trash2, Eye, Edit2, ChevronRight, ChevronLeft, Sparkles, Settings, Clock, AlertCircle, MoreHorizontal } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { motion } from 'motion/react';
import { UserRegistrationDrawer } from './registration/UserRegistrationDrawer';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { ConfirmationModal, ActionType } from '../ConfirmationModal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const getFullImageUrl = (url: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `${import.meta.env.VITE_API_URL || 'https://stylein-backend.onrender.com'}${url}`;
};

export function UserWorkspace({ onUserSelect }: { onUserSelect: (id: string) => void }) {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"register" | "view" | "edit">("register");
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState<any>(null);
  const [actionModal, setActionModal] = useState<{isOpen: boolean, actionType: ActionType, user: any}>({isOpen: false, actionType: 'view', user: null});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionMenuId && !(event.target as HTMLElement).closest('.action-menu-container')) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenuId]);

  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customer/customer');
      const rawUsers = Array.isArray(response.data.data) ? response.data.data : (response.data.data?.customers || []);
      const statusMapStr = localStorage.getItem('customerStatusMap');
      const statusMap = statusMapStr ? JSON.parse(statusMapStr) : {};
      
      const mapped = rawUsers.map((user: any) => {
        const localActive = statusMap[user._id];
        const finalActive = localActive !== undefined ? localActive : user.active;
        return {
          id: user._id,
          name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          email: user.email || '-',
          phone: user.phone || '-',
          city: user.city || 'N/A',
          status: finalActive ? 'Active' : (user.blocked ? 'Blocked' : 'Inactive'),
          orders: user.ordersCount || 0,
          membership: user.membership || 'Standard',
          createdAt: user.createdAt,
          ...user,
          active: finalActive
        };
      });
      setUsersList(mapped);
    } catch (error: any) {
      console.log   
      toast.error(error.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserActionConfirm = async () => {
    const { actionType, user } = actionModal;
    if (!user) return;

    if (actionType === 'view') {
      setActionModal({ isOpen: false, actionType: 'view', user: null });
      setDrawerMode("edit");
      setSelectedUserForDrawer(user);
      setIsDrawerOpen(true);
    } else if (actionType === 'edit') {
      setActionModal({ isOpen: false, actionType: 'edit', user: null });
      setDrawerMode("edit");
      setSelectedUserForDrawer(user);
      setIsDrawerOpen(true);
    } else if (actionType === 'delete') {
      try {
        const response = await api.delete(`/customer/customer/${user.id}`);
        toast.success(response.data?.message || 'Customer deleted successfully');
        setUsersList(usersList.filter(u => u.id !== user.id));
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete customer');
      } finally {
        setActionModal({ isOpen: false, actionType: 'delete', user: null });
      }
    } else if (actionType === 'block' || actionType === 'unblock') {
      try {
        const newBlockedStatus = !(user.status === 'Blocked');
        const response = await api.put(`/customer/customer/admin/${user.id}`, { blocked: newBlockedStatus });
        toast.success(response.data?.message || `Customer ${newBlockedStatus ? 'blocked' : 'unblocked'} successfully`);
        setUsersList(usersList.map(u => u.id === user.id ? { ...u, status: newBlockedStatus ? 'Blocked' : 'Active' } : u));
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update customer status');
      } finally {
        setActionModal({ isOpen: false, actionType: 'block', user: null });
      }
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-red-600 to-red-600 shadow-blue-200/50',
      'from-red-600 to-purple-600 shadow-indigo-200/50',
      'from-emerald-600 to-teal-600 shadow-emerald-200/50',
      'from-amber-500 to-orange-600 shadow-amber-200/50',
      'from-rose-600 to-pink-600 shadow-rose-200/50'
    ];
    let sum = 0;
    for (let i = 0; i < (name || '').length; i++) {
      sum += (name || '').charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleToggleUserStatus = async (user: any) => {
    const isCurrentlyActive = user.status === 'Active';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    try {
      await api.put(`/customer/customer/admin/${user.id}`, { active: !isCurrentlyActive });
      
      const statusMapStr = localStorage.getItem('customerStatusMap');
      const statusMap = statusMapStr ? JSON.parse(statusMapStr) : {};
      statusMap[user.id] = !isCurrentlyActive;
      localStorage.setItem('customerStatusMap', JSON.stringify(statusMap));
      
      toast.success(`Status updated to ${newStatus}`);
      setUsersList(prev => prev.map(item => item.id === user.id ? { ...item, status: newStatus, active: !isCurrentlyActive } : item));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (!selectedCard || selectedCard === 'TOTAL' || selectedCard === 'Total Users' || selectedCard === 'USERS') return true;
    if (selectedCard === 'Active' || selectedCard === 'ACTIVE') return u.status === 'Active';
    if (selectedCard === 'Inactive' || selectedCard === 'INACTIVE' || selectedCard === 'DEACTIVATED') return u.status === 'Inactive';
    if (selectedCard === 'Blocked' || selectedCard === 'BLOCKED') return u.status === 'Blocked';
    if (selectedCard === 'Pending' || selectedCard === 'PENDING') return u.status === 'Pending';
    if (selectedCard === 'REGISTERED' || selectedCard === 'Today Registered') return u.createdAt && new Date(u.createdAt).toDateString() === new Date().toDateString();

    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full bg-slate-50/60 min-h-screen">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Dashboard</span> 
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
          <span>Profile Management</span> 
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
          <span className="text-red-600 font-bold">
            User Management
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setDrawerMode("register"); setSelectedUserForDrawer(null); setIsDrawerOpen(true); }} 
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Create
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[105px] bg-slate-200/70 animate-pulse rounded-2xl p-5 border border-slate-200/50 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-slate-300 rounded" />
                <div className="w-8 h-8 bg-slate-300 rounded-xl" />
              </div>
              <div className="h-6 w-12 bg-slate-300 rounded mt-2" />
            </div>
          ))
        ) : (
          [
            { label: 'USERS', value: usersList.length, icon: Users, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Accounts' },
            { label: 'ACTIVE', value: usersList.filter(u => u.status === 'Active').length, icon: UserCheck, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Operational' },
            { label: 'INACTIVE', value: usersList.filter(u => u.status === 'Inactive').length, icon: UserMinus, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Off-line' },
            { label: 'BLOCKED', value: usersList.filter(u => u.status === 'Blocked').length, icon: UserX, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Restricted' },
            { label: 'PENDING', value: usersList.filter(u => u.status === 'Pending').length, icon: LogIn, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Awaiting' },
            { label: 'REGISTERED', value: usersList.filter(u => u.createdAt && new Date(u.createdAt).toDateString() === new Date().toDateString()).length, icon: Plus, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'New Today' },
          ].map((card, i) => {
            const Icon = card.icon;
            const isFocused = selectedCard === card.label;
            return (
              <div 
                key={i} 
                onClick={() => setSelectedCard(prev => prev === card.label ? null : card.label)}
                className={`bg-white p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 ${
                  isFocused 
                    ? `border border-slate-300 bg-white shadow-md` 
                    : 'border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold tracking-tight transition-colors uppercase ${isFocused ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-800'}`}>{card.label}</span>
                  <div className={`p-2 rounded-xl border ${card.color} transition-all duration-300 group-hover:scale-110 shadow-xs`}>
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.sub}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative w-full md:w-80 group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-lg text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-sm" 
              />
            </div>
            <button className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg shadow-sm transition-all text-sm shrink-0">
              Search
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-visible">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#FFF] backdrop-blur-sm text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-4 py-4 pl-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-xl w-[300px]">User Name</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px]">City</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px]">Phone</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px]">Status</th>
                <th className="px-4 py-4 pr-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tr-xl w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4 pl-6"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-slate-200" /><div className="h-4 w-28 bg-slate-200 rounded" /></div></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4 pr-6"><div className="h-4 w-12 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">No registered users found</td>
                </tr>
              ) : paginatedUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-[#FEFEFE] transition-all duration-150 group cursor-pointer border-b border-slate-100 last:border-0" onClick={() => { setDrawerMode('edit'); setSelectedUserForDrawer(user); setIsDrawerOpen(true); }}>
                  <td className="px-4 py-4 pl-6 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center text-white text-[11px] font-bold shadow-sm ring-2 ring-slate-100 border border-white/50 overflow-hidden relative`}>
                        {(user.image || user.profileUrl || user.imageUrl) ? (
                          <img 
                            src={getFullImageUrl(user.image || user.profileUrl || user.imageUrl)} 
                            alt={user.name} 
                            className="w-full h-full object-cover absolute inset-0" 
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span>{getInitials(user.name)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 text-[15px] tracking-tight whitespace-nowrap leading-tight">{user.name}</span>
                        <span className="text-sm text-slate-400 mt-0.5">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-slate-600 text-sm">{user.city || 'Dubai'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-slate-600 text-sm font-mono">{user.phone}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status || (user.active ? 'Active' : 'Inactive')} />
                  </td>
                  <td className="px-4 py-4 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end relative action-menu-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenuId(openActionMenuId === user.id ? null : user.id);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                    {openActionMenuId === user.id && (
                      <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-[99] animate-in fade-in zoom-in-95 duration-100 text-left ${index >= Math.max(0, paginatedUsers.length - 3) ? 'bottom-full mb-1 origin-bottom-right' : 'top-10 origin-top-right'}`}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setDrawerMode('view'); setSelectedUserForDrawer(user); setIsDrawerOpen(true); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-slate-500" /> View Details
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setDrawerMode('edit'); setSelectedUserForDrawer(user); setIsDrawerOpen(true); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500" /> Edit
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleToggleUserStatus(user); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          {user.status === 'Active' ? <UserX className="w-4 h-4 text-slate-500" /> : <UserCheck className="w-4 h-4 text-slate-500" />} 
                          {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <div className="border-t border-slate-100 my-1"></div>
                        {user.status === 'Blocked' ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'unblock', user }); }} 
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <UserCheck className="w-4 h-4" /> Unblock
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'block', user }); }} 
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <UserX className="w-4 h-4" /> Block
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'delete', user }); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <div className="text-sm text-slate-500 font-medium">
                Showing <span className="text-slate-900 font-semibold">{filteredUsers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> of <span className="text-slate-900 font-semibold">{filteredUsers.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === page ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserRegistrationDrawer 
        isOpen={isDrawerOpen} 
        mode={drawerMode}
        initialData={selectedUserForDrawer}
        onClose={() => {
            setIsDrawerOpen(false);
            if (drawerMode === "register" || drawerMode === "edit") {
              fetchUsers();
            }
        }} 
      />
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        actionType={actionModal.actionType}
        name={actionModal.user?.name}
        onCancel={() => setActionModal({ isOpen: false, actionType: 'view', user: null })}
        onConfirm={handleUserActionConfirm}
      />
    </div>
  );
}
