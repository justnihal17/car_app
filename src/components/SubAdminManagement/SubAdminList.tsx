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
      return 'bg-gradient-to-r from-red-600 to-red-600 text-white border-transparent shadow-xs shadow-red-500/20 font-semibold';
    case 'admin':
      return 'bg-red-50 text-red-700 border-red-200/80 font-medium';
    case 'staff':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-medium';
    case 'manager':
      return 'bg-purple-50 text-purple-700 border-purple-200/80 font-medium';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
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
        const currentProfileStr = sessionStorage.getItem('adminProfile');
        const currentProfile = currentProfileStr ? JSON.parse(currentProfileStr) : null;

        const localHistoryStr = localStorage.getItem('adminLoginHistory');
        let localHistory = localHistoryStr ? JSON.parse(localHistoryStr) : {};

        const passMapStr = localStorage.getItem('adminPasswords');
        const passMap = passMapStr ? JSON.parse(passMapStr) : {};
        let passMapUpdated = false;

        const rawAdmins = Array.isArray(response.data.data)
          ? response.data.data
          : (response.data.data?.admins || response.data.data?.list || response.data.admins || []);

        const mappedData = rawAdmins.map((admin: any): SubAdmin => {
          const usernameKey = admin.adminId?.toLowerCase() || '';
          const emailKey = admin.email?.toLowerCase() || '';
          const firstNameKey = admin.firstName?.toLowerCase() || '';
          const nameKey = `${admin.firstName || ''} ${admin.lastName || ''}`.trim().toLowerCase();
          const phoneKey = (admin.phone || '').trim();
          const idKey = admin._id || admin.id || '';

          const isCurrentLoggedInUser = !!(currentProfile && (
            (currentProfile._id && currentProfile._id === admin._id) ||
            (currentProfile.adminId && currentProfile.adminId.toLowerCase() === usernameKey) ||
            (currentProfile.email && currentProfile.email.toLowerCase() === emailKey)
          ));

          const localTime = localHistory[idKey] || localHistory[usernameKey] || localHistory[emailKey] || (isCurrentLoggedInUser ? new Date().toISOString() : null);
          const localPass = passMap[idKey] || passMap[usernameKey] || passMap[emailKey] || passMap[firstNameKey] || passMap[nameKey] || passMap[phoneKey] || null;

          let resolvedPassword = admin.plainPassword || admin.password || admin.tempPassword || admin.originalPassword || localPass || '';
          if (!resolvedPassword || resolvedPassword === '••••••••') {
            resolvedPassword = 'Admin@123';
            if (idKey) passMap[idKey] = resolvedPassword;
            if (usernameKey) passMap[usernameKey] = resolvedPassword;
            if (emailKey) passMap[emailKey] = resolvedPassword;
            passMapUpdated = true;
          } else if (resolvedPassword && !localPass) {
            if (idKey) passMap[idKey] = resolvedPassword;
            if (usernameKey) passMap[usernameKey] = resolvedPassword;
            if (emailKey) passMap[emailKey] = resolvedPassword;
            passMapUpdated = true;
          }

          return {
            ...admin,
            id: admin._id || admin.id,
            name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim(),
            username: admin.adminId || '',
            email: admin.email || '',
            phone: admin.phone || '-',
            role: admin.role || 'admin',
            department: admin.role === 'super_admin' ? 'Management' : 'Operations',
            password: resolvedPassword,
            status: admin.blocked ? 'Blocked' : (admin.active ? 'Active' : 'Inactive'),
            created: admin.createdAt ? new Date(admin.createdAt).toISOString().split('T')[0] : '-',
            lastLogin: admin.lastLoginAt || admin.lastLogin || localTime || admin.createdAt || new Date().toISOString()
          };
        });

        if (passMapUpdated) {
          localStorage.setItem('adminPasswords', JSON.stringify(passMap));
        }
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
        const currentProfileStr = sessionStorage.getItem('adminProfile');
        const currentProfile = currentProfileStr ? JSON.parse(currentProfileStr) : null;

        const localHistoryStr = localStorage.getItem('adminLoginHistory');
        const localHistory = localHistoryStr ? JSON.parse(localHistoryStr) : {};
        const usernameKey = raw.adminId?.toLowerCase() || '';
        const emailKey = raw.email?.toLowerCase() || '';
        const firstNameKey = raw.firstName?.toLowerCase() || '';
        const nameKey = `${raw.firstName || ''} ${raw.lastName || ''}`.trim().toLowerCase();
        const phoneKey = (raw.phone || '').trim();
        const idKey = raw._id || raw.id || '';

        const isCurrentLoggedInUser = !!(currentProfile && (
          (currentProfile._id && currentProfile._id === raw._id) ||
          (currentProfile.adminId && currentProfile.adminId.toLowerCase() === usernameKey) ||
          (currentProfile.email && currentProfile.email.toLowerCase() === emailKey)
        ));

        const localTime = localHistory[idKey] || localHistory[usernameKey] || localHistory[emailKey] || (isCurrentLoggedInUser ? new Date().toISOString() : null);

        const passMapStr = localStorage.getItem('adminPasswords');
        const passMap = passMapStr ? JSON.parse(passMapStr) : {};
        const localPass = passMap[idKey] || passMap[usernameKey] || passMap[emailKey] || passMap[firstNameKey] || passMap[nameKey] || passMap[phoneKey] || admin.password || null;

        let resolvedPassword = raw.plainPassword || raw.password || raw.tempPassword || raw.originalPassword || localPass || admin.password || '';
        if (!resolvedPassword || resolvedPassword === '••••••••') {
          resolvedPassword = 'Admin@123';
          if (idKey) passMap[idKey] = resolvedPassword;
          if (usernameKey) passMap[usernameKey] = resolvedPassword;
          if (emailKey) passMap[emailKey] = resolvedPassword;
          localStorage.setItem('adminPasswords', JSON.stringify(passMap));
        }

        const mappedAdmin: SubAdmin = {
          ...raw,
          id: raw._id || raw.id,
          name: `${raw.firstName || ''} ${raw.lastName || ''}`.trim(),
          username: raw.adminId || '',
          email: raw.email || '',
          phone: raw.phone || '-',
          role: raw.role || 'admin',
          department: raw.role === 'super_admin' ? 'Management' : 'Operations',
          password: resolvedPassword,
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
    <div className="p-3.5 sm:p-4 lg:p-5 space-y-3.5 sm:space-y-4 w-full bg-slate-50/60 min-h-screen">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          <span>Dashboard</span> 
          <ChevronRight className="w-3 h-3 text-slate-400" /> 
          <span>Profile Management</span> 
          <ChevronRight className="w-3 h-3 text-slate-400" /> 
          <span className="text-red-600 font-semibold">
            Sub Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCreate} 
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-xs transition-all active:scale-95 text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" /> Create
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-3.5 w-full">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[90px] bg-slate-200/70 animate-pulse rounded-xl p-3.5 border border-slate-200/50 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-2.5 w-12 bg-slate-300 rounded" />
                <div className="w-6 h-6 bg-slate-300 rounded-lg" />
              </div>
              <div className="h-5 w-8 bg-slate-300 rounded mt-2" />
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
                className={`bg-white p-3.5 sm:p-4 rounded-xl transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 min-h-[88px] sm:min-h-[92px] ${
                  isFocused 
                    ? `border border-slate-300 bg-white shadow-xs` 
                    : 'border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10.5px] font-semibold tracking-wider transition-colors uppercase leading-none ${isFocused ? `text-slate-800` : 'text-slate-500 group-hover:text-slate-800'}`}>{card.label}</span>
                  <div className={`p-1.5 rounded-lg border ${card.color} transition-all duration-200 group-hover:scale-105 shadow-2xs`}>
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between w-full mt-3">
                  <span className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight leading-none">{card.value}</span>
                  <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{card.sub}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="flex justify-end">
          <div className="flex items-center gap-1.5 w-full md:w-[320px]">
            <div className="relative flex-1 group">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-normal placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs h-8" 
              />
            </div>
            <button className="px-4 py-1.5 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg shadow-2xs transition-all text-xs shrink-0 h-8 cursor-pointer">
              Search
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-visible">
            <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#FFF] text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr className="bg-slate-50/70 border-b border-slate-200/80">
                    <th className="px-4 py-3 pl-5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider rounded-tl-xl w-[45%]">Admin Name</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider w-[25%]">Role</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider w-[20%]">Status</th>
                    <th className="px-4 py-3 pr-5 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wider rounded-tr-xl w-[10%]">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-2.5 pl-5"><div className="flex items-center gap-2.5"><div className="w-7.5 h-7.5 rounded-full bg-slate-200" /><div className="h-3.5 w-28 bg-slate-200 rounded" /></div></td>
                      <td className="px-4 py-2.5"><div className="h-3.5 w-20 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-2.5"><div className="h-3.5 w-16 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-2.5 pr-5"><div className="h-3.5 w-8 bg-slate-200 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-medium text-xs">No admin accounts found</td>
                  </tr>
                ) : paginatedAdmins.map((admin, index) => (
                <tr key={admin.id} onClick={() => handleView(admin)} className="hover:bg-slate-50/70 transition-colors duration-150 group cursor-pointer border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 pl-5 whitespace-nowrap">
                       <div className="flex items-center gap-3">
                        <div className={`w-7.5 h-7.5 shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(admin.name)} flex items-center justify-center text-white text-[11px] font-semibold shadow-2xs ring-2 ring-slate-100 border border-white/50 overflow-hidden relative`}>
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
                          <span className="font-medium text-slate-900 text-[13px] tracking-tight whitespace-nowrap leading-tight">{admin.name}</span>
                          <span className="text-xs text-slate-400 font-normal mt-0.5">{admin.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeStyle(admin.role)}`}>
                        <Shield className="w-3 h-3" />
                        {formatRole(admin.role)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <StatusBadge status={admin.status || (admin.active ? 'Active' : 'Inactive')} />
                    </td>
                    <td className="px-4 py-2.5 pr-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end relative action-menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenuId(openActionMenuId === admin.id ? null : admin.id);
                          }}
                          className="w-7.5 h-7.5 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {openActionMenuId === admin.id && (
                          <div className={`absolute right-0 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-[99] animate-in fade-in zoom-in-95 duration-100 text-left ${index >= Math.max(0, paginatedAdmins.length - 3) ? 'bottom-full mb-1 origin-bottom-right' : 'top-8 origin-top-right'}`}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleView(admin); }} 
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" /> View Details
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleEdit(admin); }} 
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleToggleStatus(admin); }} 
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            {admin.status === 'Active' ? <UserX className="w-3.5 h-3.5 text-slate-500" /> : <UserCheck className="w-3.5 h-3.5 text-slate-500" />} 
                            {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <div className="border-t border-slate-100 my-1"></div>
                          {admin.status === 'Blocked' ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'unblock', admin }); }} 
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Unblock
                            </button>
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'block', admin }); }} 
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5" /> Block
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'delete', admin }); }} 
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
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
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-normal">
                  <span>Showing</span>
                  <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    {filteredAdmins.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} – {Math.min(currentPage * ITEMS_PER_PAGE, filteredAdmins.length)}
                  </span>
                  <span>of</span>
                  <span className="font-semibold text-slate-800">{filteredAdmins.length}</span>
                  <span>results</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${currentPage === page ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs'}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
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
