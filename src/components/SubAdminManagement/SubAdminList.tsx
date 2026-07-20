import { useState, useEffect } from 'react';
import { Search, Plus, Download, Eye, EyeOff, Copy, Trash2, Edit2, Shield, UserX, UserCheck, ChevronRight, Settings, AlertCircle, Clock, User, Filter, Sparkles } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { CreateSubAdminDrawer } from './CreateSubAdminDrawer';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
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
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string, name: string}>({isOpen: false, id: '', name: ''});

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

        const mappedData = response.data.data.map((admin: any): SubAdmin => {
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
        setDrawerMode('view');
        setSelectedAdmin(mappedAdmin);
        setIsDrawerOpen(true);
      }
    } catch (error) {
      console.error('Failed to view admin:', error);
      toast.error('Failed to load admin details');
    }
  };
  
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      await api.put(`/admin/admin/${deleteModal.id}`, { deleted: true });
      setData(data.filter(a => a.id !== deleteModal.id));
      toast.success(`${deleteModal.name} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete admin:', error);
      toast.error('Failed to delete admin');
    } finally {
      setDeleteModal({ isOpen: false, id: '', name: '' });
    }
  };

  const handleBlockToggle = async (admin: SubAdmin) => {
    const isCurrentlyBlocked = admin.status === 'Blocked';
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    
    if (confirm(`Are you sure you want to ${action} ${admin.name}?`)) {
      try {
        await api.put(`/admin/admin/${admin.id}`, { blocked: !isCurrentlyBlocked });
        toast.success(`Admin ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
        fetchAdmins();
      } catch (error) {
        console.error(`Failed to ${action} admin:`, error);
        toast.error(`Failed to ${action} admin`);
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

  const filteredAdmins = data.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto bg-slate-50/60 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Dashboard</span> 
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
        <span>Profile Management</span> 
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
        <span className="text-red-600 font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Sub Admin
        </span>
      </div>

      {/* Hero Header */}
      <div className="bg-white/80 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sub Admin Management</h2>
          <p className="text-slate-500 mt-1 text-sm">Control administrative accounts, assign operational roles, and manage system permissions.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleCreate} 
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Create Sub Admin
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm">
            <Settings className="w-4 h-4 text-slate-500" /> Settings
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Admins', value: data.length, icon: Shield, color: 'text-red-600 bg-red-50 border-red-100', bgGrad: 'from-red-50/50 via-white to-white', sub: 'Accounts' },
          { label: 'Active', value: data.filter(a => a.status === 'Active').length, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', bgGrad: 'from-emerald-50/50 via-white to-white', sub: 'Operational' },
          { label: 'Inactive', value: data.filter(a => a.status === 'Inactive').length, icon: User, color: 'text-amber-600 bg-amber-50 border-amber-100', bgGrad: 'from-amber-50/50 via-white to-white', sub: 'Off-line' },
          { label: 'Blocked', value: data.filter(a => a.status === 'Blocked').length, icon: UserX, color: 'text-rose-600 bg-rose-50 border-rose-100', bgGrad: 'from-rose-50/50 via-white to-white', sub: 'Restricted' },
          { label: "Today's Login", value: data.filter(a => isToday(a.lastLogin)).length, icon: Clock, color: 'text-red-600 bg-red-50 border-indigo-100', bgGrad: 'from-red-50/50 via-white to-white', sub: 'Active Today' },
          { label: 'Pending Approval', value: data.filter(a => a.status === 'Inactive' && !a.blocked).length, icon: AlertCircle, color: 'text-purple-600 bg-purple-50 border-purple-100', bgGrad: 'from-purple-50/50 via-white to-white', sub: 'Review' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className={`bg-gradient-to-br ${card.bgGrad} p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 tracking-tight group-hover:text-slate-800 transition-colors uppercase">{card.label}</span>
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
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1.5 bg-slate-200/60 rounded-2xl w-fit border border-slate-300/40 shadow-inner backdrop-blur-md">
        {['Overview', 'Staff', 'Roles', 'Permissions', 'Activity Logs'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === tab 
                ? 'bg-white text-red-600 shadow-sm border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' ? (
        <div className="space-y-4">
            {/* Title & Search Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Admins</h3>
                  <p className="text-xs text-slate-500 mt-0.5">List of recently registered system administrators</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 shadow-2xs">
                  {filteredAdmins.length} Users
                </span>
              </div>
              <div className="relative w-full md:w-80 group">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search admin name, ID..." 
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
                      <th className="px-3 py-3.5 pl-5 whitespace-nowrap">Admin Name</th>
                      <th className="px-3 py-3.5 whitespace-nowrap">Admin ID</th>
                      <th className="px-3 py-3.5 whitespace-nowrap">Email</th>
                      <th className="px-3 py-3.5 whitespace-nowrap">Role</th>
                      <th className="px-3 py-3.5 whitespace-nowrap">Password</th>
                      <th className="px-3 py-3.5 whitespace-nowrap">Last Login</th>
                      <th className="px-3 py-3.5 whitespace-nowrap">Status</th>
                      <th className="px-3 py-3.5 pr-5 text-right whitespace-nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">Loading administrators...</td>
                      </tr>
                    ) : filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">No admin accounts found</td>
                      </tr>
                    ) : filteredAdmins.map(admin => (
                    <tr key={admin.id} className="hover:bg-red-50/20 transition-all duration-150 group">
                        <td className="px-3 py-3.5 pl-5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(admin.name)} flex items-center justify-center text-white text-[11px] font-bold shadow-sm ring-2 ring-slate-100 border border-white/50`}>
                              {getInitials(admin.name)}
                            </div>
                            <span className="font-medium text-slate-900 text-sm tracking-tight whitespace-nowrap">{admin.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-[11px] bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80 font-bold tracking-tight shadow-2xs">
                            {admin.username}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-slate-600 font-semibold text-xs truncate max-w-[170px]" title={admin.email}>{admin.email}</td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeStyle(admin.role)}`}>
                            <Shield className="w-3 h-3" />
                            {formatRole(admin.role)}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-slate-500 tracking-wider font-bold text-xs bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md">
                              {showPasswords[admin.id] ? admin.password : '••••••••'}
                            </span>
                            <button 
                              onClick={() => togglePassword(admin.id)} 
                              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-all"
                              title="Show Password"
                            >
                              {showPasswords[admin.id] ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                            </button>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(admin.username);
                                toast.success('Admin ID copied to clipboard!');
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-all"
                              title="Copy ID"
                            >
                              <Copy className="w-3.5 h-3.5"/>
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatLastLogin(admin.lastLogin)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <StatusBadge status={admin.status} />
                        </td>
                        <td className="px-3 py-3.5 pr-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleView(admin)} className="text-blue-600 hover:text-blue-800 p-1 transition-transform hover:scale-110" title="View Details"><Eye className="w-4 h-4"/></button>
                            <button onClick={() => handleEdit(admin)} className="text-emerald-600 hover:text-emerald-800 p-1 transition-transform hover:scale-110" title="Edit Details"><Edit2 className="w-4 h-4"/></button>
                            <button onClick={() => handleDeleteClick(admin.id, admin.name)} className="text-red-600 hover:text-red-800 p-1 transition-transform hover:scale-110" title="Delete Account"><Trash2 className="w-4 h-4"/></button>
                            {admin.status === 'Blocked' ? (
                              <button onClick={() => handleBlockToggle(admin)} className="text-emerald-600 hover:text-emerald-900 p-1 transition-transform hover:scale-110" title="Unblock Admin"><UserCheck className="w-4 h-4"/></button>
                            ) : (
                              <button onClick={() => handleBlockToggle(admin)} className="text-slate-600 hover:text-slate-900 p-1 transition-transform hover:scale-110" title="Block Admin"><UserX className="w-4 h-4"/></button>
                            )}
                          </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 font-semibold shadow-sm">
            <Settings className="w-8 h-8 text-slate-300 mx-auto mb-3 animate-spin duration-3000" />
            {activeTab} module is under active development.
        </div>
      )}

      {isDrawerOpen && <CreateSubAdminDrawer mode={drawerMode} admin={selectedAdmin} onSave={handleSave} onClose={() => setIsDrawerOpen(false)} />}
      
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        name={deleteModal.name}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
