import { useState, useEffect } from 'react';
import { Search, Plus, Download, Eye, EyeOff, Copy, Trash2, Edit2, Shield, UserX, UserCheck, ChevronRight, ChevronLeft, Settings, AlertCircle, Clock, User, Filter, Sparkles, MoreHorizontal } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { CreateSubAdminDrawer } from './CreateAdminForm/CreateAdminForm';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { ConfirmationModal, ActionType } from '../ConfirmationModal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { SafeImage } from '../common/SafeImage';

const formatRole = (role: string) => {
  if (!role) return '-';
  if (role === 'super_admin') return 'Super Admin';
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getRoleBadgeStyle = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'super_admin':
      return 'bg-gradient-to-r from-red-600 to-red-600 text-white border-transparent shadow-xs shadow-red-500/20 font-extrabold';
    case 'admin':
      return 'bg-red-50 text-red-700 border-indigo-200/80 font-bold';
    case 'staff':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-bold';
    case 'manager':
      return 'bg-purple-50 text-purple-700 border-purple-200/80 font-bold';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 font-bold';
  }
};

const isToday = (dateStr: string) => {
  if (!dateStr || dateStr === 'Never' || dateStr === '-') return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

const formatLastLogin = (dateStr: string) => {
  if (!dateStr || dateStr === 'Never' || dateStr === '-') return 'Never';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Never';
  
  const today = new Date();
  const isSameDay = d.getDate() === today.getDate() &&
                    d.getMonth() === today.getMonth() &&
                    d.getFullYear() === today.getFullYear();
  
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (isSameDay) {
    return `Today at ${timeStr}`;
  }
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${timeStr}`;
};

interface SubAdmin {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  password?: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  created: string;
  lastLogin: string;
  [key: string]: any;
}

export function SubAdminManagement() {
  const [data, setData] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('Overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAdmin, setSelectedAdmin] = useState<SubAdmin | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionModal, setActionModal] = useState<{isOpen: boolean, actionType: ActionType, admin: SubAdmin | null}>({isOpen: false, actionType: 'view', admin: null});
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element).closest('.action-menu-container')) {
        setOpenActionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/admin');
      if (response.data.success) {
        const currentProfileStr = localStorage.getItem('adminProfile');
        const currentProfile = currentProfileStr ? JSON.parse(currentProfileStr) : null;

        const localHistoryStr = localStorage.getItem('adminLoginHistory');
        let localHistory = localHistoryStr ? JSON.parse(localHistoryStr) : {};

        const passMapStr = localStorage.getItem('adminPasswords');
        const passMap = passMapStr ? JSON.parse(passMapStr) : {};

        const rawAdmins = Array.isArray(response.data.data)
          ? response.data.data
          : (response.data.data?.admins || response.data.data?.list || response.data.admins || []);

        const mappedData = rawAdmins.map((admin: any): SubAdmin => {
          const usernameKey = admin.adminId?.toLowerCase() || '';
          const emailKey = admin.email?.toLowerCase() || '';
          const firstNameKey = admin.firstName?.toLowerCase() || '';
          const idKey = admin._id || '';

          const isCurrentLoggedInUser = !!(currentProfile && (
            (currentProfile._id && currentProfile._id === admin._id) ||
            (currentProfile.adminId && currentProfile.adminId.toLowerCase() === usernameKey) ||
            (currentProfile.email && currentProfile.email.toLowerCase() === emailKey)
          ));

          const localTime = localHistory[idKey] || localHistory[usernameKey] || localHistory[emailKey] || (isCurrentLoggedInUser ? new Date().toISOString() : null);
          const localPass = passMap[idKey] || passMap[usernameKey] || passMap[emailKey] || passMap[firstNameKey] || null;

          return {
            ...admin,
            id: admin._id,
            name: `${admin.firstName} ${admin.lastName}`.trim(),
            username: admin.adminId,
            email: admin.email,
            phone: admin.phone || '-',
            role: admin.role,
            department: admin.role === 'super_admin' ? 'Management' : 'Operations',
            password: admin.plainPassword || admin.password || localPass || '',
            status: admin.blocked ? 'Blocked' : (admin.active ? 'Active' : 'Inactive'),
            created: admin.createdAt ? new Date(admin.createdAt).toISOString().split('T')[0] : '-',
            lastLogin: admin.lastLoginAt || admin.lastLogin || localTime || admin.createdAt || new Date().toISOString()
          };
        });
        setData(mappedData);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      toast.error('Failed to load admins list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const togglePassword = (id: string) => setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCreate = () => { setDrawerMode('create'); setSelectedAdmin(null); setIsDrawerOpen(true); };
  const handleEdit = (admin: SubAdmin) => { setDrawerMode('edit'); setSelectedAdmin(admin); setIsDrawerOpen(true); };
  
  const handleView = async (admin: SubAdmin) => {
    try {
      const response = await api.get(`/admin/admin/${admin.id}`);
      if (response.data.success) {
        const raw = response.data.data;
        const currentProfileStr = localStorage.getItem('adminProfile');
        const currentProfile = currentProfileStr ? JSON.parse(currentProfileStr) : null;

        const localHistoryStr = localStorage.getItem('adminLoginHistory');
        const localHistory = localHistoryStr ? JSON.parse(localHistoryStr) : {};
        const usernameKey = raw.adminId?.toLowerCase() || '';
        const emailKey = raw.email?.toLowerCase() || '';
        const firstNameKey = raw.firstName?.toLowerCase() || '';
        const idKey = raw._id || '';

        const isCurrentLoggedInUser = !!(currentProfile && (
          (currentProfile._id && currentProfile._id === raw._id) ||
          (currentProfile.adminId && currentProfile.adminId.toLowerCase() === usernameKey) ||
          (currentProfile.email && currentProfile.email.toLowerCase() === emailKey)
        ));

        const localTime = localHistory[idKey] || localHistory[usernameKey] || localHistory[emailKey] || (isCurrentLoggedInUser ? new Date().toISOString() : null);

        const passMapStr = localStorage.getItem('adminPasswords');
        const passMap = passMapStr ? JSON.parse(passMapStr) : {};
        const localPass = passMap[idKey] || passMap[usernameKey] || passMap[emailKey] || passMap[firstNameKey] || null;

        const mappedAdmin: SubAdmin = {
          ...raw,
          id: raw._id,
          name: `${raw.firstName} ${raw.lastName}`.trim(),
          username: raw.adminId,
          email: raw.email,
          phone: raw.phone || '-',
          role: raw.role,
          department: raw.role === 'super_admin' ? 'Management' : 'Operations',
            password: raw.plainPassword || raw.password || localPass || '',
          status: raw.blocked ? 'Blocked' : (raw.active ? 'Active' : 'Inactive'),
          created: raw.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0] : '-',
          lastLogin: raw.lastLoginAt || raw.lastLogin || localTime || raw.createdAt || new Date().toISOString()
        };
        setDrawerMode('view');
        setSelectedAdmin(mappedAdmin);
        setIsDrawerOpen(true);
      }
    } catch (error) {
      console.error('Failed to view admin:', error);
      toast.error('Failed to load admin details');
    }
  };
  
  const handleActionConfirm = async () => {
    const { actionType, admin } = actionModal;
    if (!admin) return;

    if (actionType === 'view') {
      setActionModal({ isOpen: false, actionType: 'view', admin: null });
      handleView(admin);
    } else if (actionType === 'edit') {
      setActionModal({ isOpen: false, actionType: 'edit', admin: null });
      handleEdit(admin);
    } else if (actionType === 'delete') {
      try {
        await api.put(`/admin/admin/${admin.id}`, { deleted: true });
        setData(data.filter(a => a.id !== admin.id));
        toast.success(`${admin.name} deleted successfully`);
      } catch (error) {
        console.error('Failed to delete admin:', error);
        toast.error('Failed to delete admin');
      } finally {
        setActionModal({ isOpen: false, actionType: 'delete', admin: null });
      }
    } else if (actionType === 'block' || actionType === 'unblock') {
      const isCurrentlyBlocked = admin.status === 'Blocked';
      try {
        await api.put(`/admin/admin/${admin.id}`, { blocked: !isCurrentlyBlocked });
        toast.success(`Admin ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
        fetchAdmins();
      } catch (error) {
        console.error(`Failed to block/unblock admin:`, error);
        toast.error(`Failed to update admin status`);
      } finally {
        setActionModal({ isOpen: false, actionType: 'block', admin: null });
      }
    }
  };

  const handleSave = () => {
    setIsDrawerOpen(false);
    fetchAdmins();
  };

  const getInitials = (name: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-amber-500 to-orange-600',
      'from-emerald-500 to-teal-600',
      'from-red-600 to-rose-600',
      'from-blue-600 to-indigo-600',
      'from-purple-600 to-pink-600'
    ];
    let sum = 0;
    const str = name || 'Admin';
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleToggleStatus = async (admin: SubAdmin) => {
    const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
    const isActive = newStatus === 'Active';
    try {
      await api.put(`/admin/admin/${admin.id}`, { active: isActive });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to update status:', error);
    } finally {
      setData(prev => prev.map(item => item.id === admin.id ? { ...item, status: newStatus } : item));
    }
  };

  const filteredAdmins = data.filter(admin => {
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (!selectedCard || selectedCard === 'ADMIN') return true;
    if (selectedCard === 'ACTIVE') return admin.status === 'Active';
    if (selectedCard === 'INACTIVE') return admin.status === 'Inactive';
    if (selectedCard === 'BLOCKED') return admin.status === 'Blocked';
    if (selectedCard === 'LOGIN') return isToday(admin.lastLogin);
    if (selectedCard === 'PENDING') return admin.status === 'Inactive' && !admin.blocked;

    return true;
  });

  const totalPages = Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE);
  const paginatedAdmins = filteredAdmins.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
            Sub Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCreate} 
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
            { label: 'ADMIN', value: data.length, icon: Shield, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Accounts' },
            { label: 'ACTIVE', value: data.filter(a => a.status === 'Active').length, icon: UserCheck, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Operational' },
            { label: 'INACTIVE', value: data.filter(a => a.status === 'Inactive').length, icon: User, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Off-line' },
            { label: 'BLOCKED', value: data.filter(a => a.status === 'Blocked').length, icon: UserX, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Restricted' },
            { label: 'LOGIN', value: data.filter(a => isToday(a.lastLogin)).length, icon: Clock, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Active Today' },
            { label: 'PENDING', value: data.filter(a => a.status === 'Inactive' && !a.blocked).length, icon: AlertCircle, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Review' },
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
                  <span className={`text-xs font-semibold tracking-tight transition-colors uppercase ${isFocused ? `text-slate-800 font-bold` : 'text-slate-500 group-hover:text-slate-800'}`}>{card.label}</span>
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
        {/* Search Bar */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2 w-full md:w-[400px]">
            <div className="relative flex-1 group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" />
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
                    <th className="px-4 py-4 pl-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-xl w-[300px]">Admin Name</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px]">Role</th>
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
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">No admin accounts found</td>
                  </tr>
                ) : paginatedAdmins.map((admin, index) => (
                <tr key={admin.id} onClick={() => handleView(admin)} className="hover:bg-[#FEFEFE] transition-all duration-150 group cursor-pointer border-b border-slate-100 last:border-0">
                    <td className="px-4 py-4 pl-6 whitespace-nowrap">
                       <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(admin.name)} flex items-center justify-center text-white text-[11px] font-bold shadow-sm ring-2 ring-slate-100 border border-white/50 overflow-hidden relative`}>
                          {(admin.profileUrl || admin.imageUrl) ? (
                            <SafeImage 
                              src={admin.profileUrl || admin.imageUrl} 
                              alt={admin.name} 
                              className="w-full h-full object-cover absolute inset-0" 
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                          <span>{getInitials(admin.name)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 text-[15px] tracking-tight whitespace-nowrap leading-tight">{admin.name}</span>
                          <span className="text-sm text-slate-400 mt-0.5">{admin.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeStyle(admin.role)}`}>
                        <Shield className="w-3 h-3" />
                        {formatRole(admin.role)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-600 text-sm font-mono">{admin.phone || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={admin.status || (admin.active ? 'Active' : 'Inactive')} />
                    </td>
                    <td className="px-4 py-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end relative action-menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenuId(openActionMenuId === admin.id ? null : admin.id);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {openActionMenuId === admin.id && (
                          <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-[99] animate-in fade-in zoom-in-95 duration-100 text-left ${index >= Math.max(0, paginatedAdmins.length - 3) ? 'bottom-full mb-1 origin-bottom-right' : 'top-10 origin-top-right'}`}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleView(admin); }} 
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-slate-500" /> View Details
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleEdit(admin); }} 
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-slate-500" /> Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleToggleStatus(admin); }} 
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            {admin.status === 'Active' ? <UserX className="w-4 h-4 text-slate-500" /> : <UserCheck className="w-4 h-4 text-slate-500" />} 
                            {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <div className="border-t border-slate-100 my-1"></div>
                          {admin.status === 'Blocked' ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'unblock', admin }); }} 
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <UserCheck className="w-4 h-4" /> Unblock
                            </button>
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'block', admin }); }} 
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <UserX className="w-4 h-4" /> Block
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'delete', admin }); }} 
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
                  Showing <span className="text-slate-900 font-semibold">{filteredAdmins.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAdmins.length)}</span> of <span className="text-slate-900 font-semibold">{filteredAdmins.length}</span> results
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

      {isDrawerOpen && <CreateSubAdminDrawer mode={drawerMode} admin={selectedAdmin} onSave={handleSave} onClose={() => setIsDrawerOpen(false)} />}
      
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        actionType={actionModal.actionType}
        name={actionModal.admin?.name}
        onCancel={() => setActionModal({ isOpen: false, actionType: 'view', admin: null })}
        onConfirm={handleActionConfirm}
      />
    </div>
  );
}
