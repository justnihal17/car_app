import { useState, useEffect } from 'react';
import { Search, Plus, Download, Eye, EyeOff, Copy, Trash2, Edit2, Shield, UserX, UserCheck, ChevronRight, Settings, AlertCircle, Clock, User, Filter, Sparkles } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { CreateSubAdminDrawer } from './CreateSubAdminDrawer';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { ConfirmationModal, ActionType } from '../ConfirmationModal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

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
            password: admin.plainPassword || admin.password || localPass || 'Admin@123',
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
          password: raw.plainPassword || raw.password || localPass || 'Admin@123',
          status: raw.blocked ? 'Blocked' : (raw.active ? 'Active' : 'Inactive'),
          created: raw.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0] : '-',
          lastLogin: raw.lastLoginAt || raw.lastLogin || localTime || raw.createdAt || new Date().toISOString()
        };
        setDrawerMode('edit');
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
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
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
            { label: 'ADMIN', value: data.length, icon: Shield, color: 'text-red-600 bg-red-50 border-red-100', activeBorder: 'border-red-600', activeBg: 'bg-red-50/50', activeText: 'text-red-600', bgGrad: 'from-red-50/50 via-white to-white', sub: 'Accounts' },
            { label: 'ACTIVE', value: data.filter(a => a.status === 'Active').length, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', activeBorder: 'border-emerald-600', activeBg: 'bg-emerald-50/50', activeText: 'text-emerald-700', bgGrad: 'from-emerald-50/50 via-white to-white', sub: 'Operational' },
            { label: 'INACTIVE', value: data.filter(a => a.status === 'Inactive').length, icon: User, color: 'text-amber-600 bg-amber-50 border-amber-100', activeBorder: 'border-amber-500', activeBg: 'bg-amber-50/50', activeText: 'text-amber-700', bgGrad: 'from-amber-50/50 via-white to-white', sub: 'Off-line' },
            { label: 'BLOCKED', value: data.filter(a => a.status === 'Blocked').length, icon: UserX, color: 'text-rose-600 bg-rose-50 border-rose-100', activeBorder: 'border-rose-600', activeBg: 'bg-rose-50/50', activeText: 'text-rose-700', bgGrad: 'from-rose-50/50 via-white to-white', sub: 'Restricted' },
            { label: 'LOGIN', value: data.filter(a => isToday(a.lastLogin)).length, icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-100', activeBorder: 'border-blue-600', activeBg: 'bg-blue-50/50', activeText: 'text-blue-700', bgGrad: 'from-blue-50/50 via-white to-white', sub: 'Active Today' },
            { label: 'PENDING', value: data.filter(a => a.status === 'Inactive' && !a.blocked).length, icon: AlertCircle, color: 'text-purple-600 bg-purple-50 border-purple-100', activeBorder: 'border-purple-600', activeBg: 'bg-purple-50/50', activeText: 'text-purple-700', bgGrad: 'from-purple-50/50 via-white to-white', sub: 'Review' },
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
        {/* Search Bar */}
        <div className="flex justify-end">
          <div className="relative w-full md:w-80 group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search admin name, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-xs" 
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50/80 backdrop-blur-sm text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-4 pl-6 whitespace-nowrap">Admin Name</th>
                  <th className="px-4 py-4 whitespace-nowrap">Role</th>
                  <th className="px-4 py-4 whitespace-nowrap">Email</th>
                  <th className="px-4 py-4 whitespace-nowrap">Phone</th>
                  <th className="px-4 py-4 pr-6 text-right whitespace-nowrap">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-4 pl-6"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-slate-200" /><div className="h-4 w-28 bg-slate-200 rounded" /></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-4 pr-6"><div className="h-4 w-12 bg-slate-200 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">No admin accounts found</td>
                  </tr>
                ) : filteredAdmins.map(admin => (
                <tr key={admin.id} onClick={() => handleView(admin)} className="hover:bg-red-50/20 transition-all duration-150 group cursor-pointer">
                    <td className="px-4 py-4 pl-6 whitespace-nowrap">
                       <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(admin.name)} flex items-center justify-center text-white text-[11px] font-bold shadow-sm ring-2 ring-slate-100 border border-white/50 overflow-hidden relative`}>
                          {(admin.profileUrl || admin.imageUrl) ? (
                            <img 
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
                        <span className="font-medium text-slate-900 text-sm tracking-tight whitespace-nowrap">{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeStyle(admin.role)}`}>
                        <Shield className="w-3 h-3" />
                        {formatRole(admin.role)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-600 text-sm">{admin.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-600 text-sm font-mono">{admin.phone || '-'}</td>
                    <td className="px-4 py-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(admin);
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none mr-1.5 ${
                            admin.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              admin.status === 'Active' ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleView(admin); }} className="text-blue-600 hover:text-blue-800 p-1 transition-transform hover:scale-110"><Eye className="w-4 h-4"/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(admin); }} className="text-emerald-600 hover:text-emerald-800 p-1 transition-transform hover:scale-110"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={(e) => { e.stopPropagation(); setActionModal({ isOpen: true, actionType: 'delete', admin }); }} className="text-red-600 hover:text-red-800 p-1 transition-transform hover:scale-110"><Trash2 className="w-4 h-4"/></button>
                        {admin.status === 'Blocked' ? (
                          <button onClick={(e) => { e.stopPropagation(); setActionModal({ isOpen: true, actionType: 'unblock', admin }); }} className="text-emerald-600 hover:text-emerald-900 p-1 transition-transform hover:scale-110"><UserCheck className="w-4 h-4"/></button>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); setActionModal({ isOpen: true, actionType: 'block', admin }); }} className="text-slate-600 hover:text-slate-900 p-1 transition-transform hover:scale-110"><UserX className="w-4 h-4"/></button>
                        )}
                      </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
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
