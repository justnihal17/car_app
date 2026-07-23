import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, UserMinus, LogIn, Plus, Download, Search, Filter, RefreshCw, Trash2, Eye, Edit2, ChevronRight, Sparkles, Settings, Clock, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { motion } from 'motion/react';
import { UserRegistrationDrawer } from './registration/UserRegistrationDrawer';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { ConfirmationModal, ActionType } from '../ConfirmationModal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export function UserWorkspace({ onUserSelect }: { onUserSelect: (id: string) => void }) {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"register" | "view" | "edit">("register");
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState<any>(null);
  const [actionModal, setActionModal] = useState<{isOpen: boolean, actionType: ActionType, user: any}>({isOpen: false, actionType: 'view', user: null});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customer/customer');
      const rawUsers = Array.isArray(response.data.data) ? response.data.data : (response.data.data?.customers || []);
      const mapped = rawUsers.map((user: any) => ({
        id: user._id,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        email: user.email || '-',
        phone: user.phone || '-',
        city: user.city || 'N/A',
        status: user.active ? 'Active' : (user.blocked ? 'Blocked' : 'Pending'),
        orders: user.ordersCount || 0,
        membership: user.membership || 'Standard',
        createdAt: user.createdAt,
        ...user
      }));
      setUsersList(mapped);
    } catch (error: any) {
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
      setDrawerMode("view");
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

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (!selectedCard || selectedCard === 'Total Users') return true;
    if (selectedCard === 'Active') return u.status === 'Active';
    if (selectedCard === 'Inactive') return u.status === 'Inactive';
    if (selectedCard === 'Blocked') return u.status === 'Blocked';
    if (selectedCard === 'Pending') return u.status === 'Pending';
    if (selectedCard === 'Today Registered') return u.createdAt && new Date(u.createdAt).toDateString() === new Date().toDateString();

    return true;
  });

  return (
    <div className="p-8 space-y-8 bg-slate-50/60 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Dashboard</span> 
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
        <span>Profile Management</span> 
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
        <span className="text-red-600 font-bold">
          User Management
        </span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white/80 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">User Management Workspace</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage all registered users, permissions, account status and customer activity.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => { setDrawerMode("register"); setSelectedUserForDrawer(null); setIsDrawerOpen(true); }} 
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Register User
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export
          </button>
          <button onClick={fetchUsers} className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid (Matching SubAdmin Card Size & Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
            { label: 'Total Users', value: usersList.length, icon: Users, color: 'text-red-600 bg-red-50 border-red-100', activeBorder: 'border-red-600', activeBg: 'bg-red-50/50', activeText: 'text-red-600', bgGrad: 'from-red-50/50 via-white to-white', sub: 'Accounts' },
            { label: 'Active', value: usersList.filter(u => u.status === 'Active').length, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', activeBorder: 'border-emerald-600', activeBg: 'bg-emerald-50/50', activeText: 'text-emerald-700', bgGrad: 'from-emerald-50/50 via-white to-white', sub: 'Operational' },
            { label: 'Inactive', value: usersList.filter(u => u.status === 'Inactive').length, icon: UserMinus, color: 'text-amber-600 bg-amber-50 border-amber-100', activeBorder: 'border-amber-500', activeBg: 'bg-amber-50/50', activeText: 'text-amber-700', bgGrad: 'from-amber-50/50 via-white to-white', sub: 'Off-line' },
            { label: 'Blocked', value: usersList.filter(u => u.status === 'Blocked').length, icon: UserX, color: 'text-rose-600 bg-rose-50 border-rose-100', activeBorder: 'border-rose-600', activeBg: 'bg-rose-50/50', activeText: 'text-rose-700', bgGrad: 'from-rose-50/50 via-white to-white', sub: 'Restricted' },
            { label: 'Pending', value: usersList.filter(u => u.status === 'Pending').length, icon: LogIn, color: 'text-purple-600 bg-purple-50 border-purple-100', activeBorder: 'border-purple-600', activeBg: 'bg-purple-50/50', activeText: 'text-purple-700', bgGrad: 'from-purple-50/50 via-white to-white', sub: 'Awaiting' },
            { label: 'Today Registered', value: usersList.filter(u => u.createdAt && new Date(u.createdAt).toDateString() === new Date().toDateString()).length, icon: Plus, color: 'text-blue-600 bg-blue-50 border-blue-100', activeBorder: 'border-blue-600', activeBg: 'bg-blue-50/50', activeText: 'text-blue-700', bgGrad: 'from-blue-50/50 via-white to-white', sub: 'New Today' },
          ].map((card, i) => {
            const Icon = card.icon;
            const isFocused = selectedCard === card.label;
            return (
              <div 
                key={i} 
                onClick={() => setSelectedCard(prev => prev === card.label ? null : card.label)}
                className={`bg-gradient-to-br ${card.bgGrad} p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 ${
                  isFocused 
                    ? `border-2 ${card.activeBorder} ${card.activeBg}` 
                    : 'border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold tracking-tight transition-colors uppercase ${isFocused ? `${card.activeText} font-bold` : 'text-slate-500 group-hover:text-slate-800'}`}>{card.label}</span>
                  <div className={`p-2 rounded-xl border ${card.color} transition-all duration-300 group-hover:scale-110 shadow-xs`}>
                    <Icon className="w-4 h-4" />
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

      {/* Title & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Registered Users</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status of end-user profiles & active app accounts</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 shadow-2xs">
              {filteredUsers.length} Users
            </span>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search user name, email, phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-xs" 
            />
          </div>
        </div>

        {/* Table Container - Exact Match with SubAdmin */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50/80 backdrop-blur-sm text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-4 py-4 pl-6 whitespace-nowrap w-[20%]">User</th>
                <th className="px-4 py-4 whitespace-nowrap w-[25%]">Contact / Email</th>
                <th className="px-4 py-4 whitespace-nowrap w-[15%]">City</th>
                <th className="px-4 py-4 whitespace-nowrap w-[10%]">Orders</th>
                <th className="px-4 py-4 whitespace-nowrap w-[10%]">Membership</th>
                <th className="px-4 py-4 whitespace-nowrap w-[10%]">Status</th>
                <th className="px-4 py-4 pr-6 text-right whitespace-nowrap w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4.5 pl-6"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-200" /><div className="h-4 w-28 bg-slate-200 rounded" /></div></td>
                    <td className="px-4 py-4.5"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4.5"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4.5"><div className="h-4 w-12 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4.5"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4.5"><div className="h-6 w-16 bg-slate-200 rounded-full" /></td>
                    <td className="px-4 py-4.5 pr-6"><div className="h-4 w-12 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">No registered users found</td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-red-50/20 transition-all duration-150 group cursor-pointer" onClick={() => { setDrawerMode('view'); setSelectedUserForDrawer(user); setIsDrawerOpen(true); }}>
                  <td className="px-4 py-4.5 pl-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center text-white text-[11px] font-bold shadow-sm ring-2 ring-slate-100 border border-white/50 overflow-hidden relative`}>
                        {(user.profileUrl || user.imageUrl) ? (
                          <img 
                            src={user.profileUrl || user.imageUrl} 
                            alt={user.name} 
                            className="w-full h-full object-cover absolute inset-0" 
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span>{getInitials(user.name)}</span>
                      </div>
                      <span className="font-medium text-slate-900 text-sm tracking-tight whitespace-nowrap">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4.5 whitespace-nowrap">
                    <div className="text-xs">
                      <span className="font-medium text-slate-600 block">{user.email}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4.5 text-slate-600 font-semibold text-xs whitespace-nowrap">{user.city}</td>
                  <td className="px-4 py-4.5 whitespace-nowrap">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
                      {user.orders}
                    </span>
                  </td>
                  <td className="px-4 py-4.5 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-indigo-200/80">
                      {user.membership}
                    </span>
                  </td>
                  <td className="px-4 py-4.5 whitespace-nowrap">
                    <StatusBadge status={user.status as any} />
                  </td>
                  <td className="px-4 py-4.5 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); setDrawerMode('view'); setSelectedUserForDrawer(user); setIsDrawerOpen(true); }} className="text-blue-600 hover:text-blue-800 p-1 transition-transform hover:scale-110"><Eye className="w-4 h-4"/></button>
                      <button onClick={(e) => { e.stopPropagation(); setDrawerMode('edit'); setSelectedUserForDrawer(user); setIsDrawerOpen(true); }} className="text-emerald-600 hover:text-emerald-800 p-1 transition-transform hover:scale-110"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={(e) => { e.stopPropagation(); setActionModal({ isOpen: true, actionType: 'delete', user }); }} className="text-red-600 hover:text-red-800 p-1 transition-transform hover:scale-110"><Trash2 className="w-4 h-4"/></button>
                      {user.status === 'Blocked' ? (
                        <button onClick={(e) => { e.stopPropagation(); setActionModal({ isOpen: true, actionType: 'unblock', user }); }} className="text-emerald-600 hover:text-emerald-900 p-1 transition-transform hover:scale-110"><UserCheck className="w-4 h-4"/></button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setActionModal({ isOpen: true, actionType: 'block', user }); }} className="text-slate-600 hover:text-slate-900 p-1 transition-transform hover:scale-110"><UserX className="w-4 h-4"/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
