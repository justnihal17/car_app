
import { useState, useEffect } from 'react';
import { Search, Plus, Download, Eye, EyeOff, Copy, Trash2, Edit2, Shield, UserX, UserCheck, ChevronRight, Settings } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { CreateSubAdminDrawer } from './CreateSubAdminDrawer';
import api from '../../api/axios';

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
  [key: string]: any; // Allow raw api fields for editing
}

export function SubAdminManagement() {
  const [data, setData] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('Overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAdmin, setSelectedAdmin] = useState<SubAdmin | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/admin');
      if (response.data.success) {
        const mappedData = response.data.data.map((admin: any): SubAdmin => ({
          ...admin,
          id: admin._id,
          name: `${admin.firstName} ${admin.lastName}`.trim(),
          username: admin.adminId,
          email: admin.email,
          phone: admin.phone || '-',
          role: admin.role,
          department: 'Operations', // Placeholder
          password: '••••••••', // Masked, backend won't send real password
          status: admin.blocked ? 'Blocked' : (admin.active ? 'Active' : 'Inactive'),
          created: admin.createdAt ? new Date(admin.createdAt).toISOString().split('T')[0] : '-',
          lastLogin: admin.lastLoginAt ? new Date(admin.lastLoginAt).toISOString().split('T')[0] : 'Never'
        }));
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
        const mappedAdmin: SubAdmin = {
          ...raw,
          id: raw._id,
          name: `${raw.firstName} ${raw.lastName}`.trim(),
          username: raw.adminId,
          email: raw.email,
          phone: raw.phone || '-',
          role: raw.role,
          department: 'Operations',
          password: '••••••••',
          status: raw.blocked ? 'Blocked' : (raw.active ? 'Active' : 'Inactive'),
          created: raw.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0] : '-',
          lastLogin: raw.lastLoginAt ? new Date(raw.lastLoginAt).toISOString().split('T')[0] : 'Never'
        };
        setDrawerMode('view');
        setSelectedAdmin(mappedAdmin);
        setIsDrawerOpen(true);
      }
    } catch (error) {
      console.error('Failed to view admin:', error);
      alert('Failed to load admin details');
    }
  };
  
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.put(`/admin/admin/${id}`, { deleted: true });
        setData(data.filter(a => a.id !== id));
      } catch (error) {
        console.error('Failed to delete admin:', error);
        alert('Failed to delete admin');
      }
    }
  };

  const handleBlockToggle = async (admin: SubAdmin) => {
    const isCurrentlyBlocked = admin.status === 'Blocked';
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    
    if (confirm(`Are you sure you want to ${action} ${admin.name}?`)) {
      try {
        await api.put(`/admin/admin/${admin.id}`, { blocked: !isCurrentlyBlocked });
        fetchAdmins(); // Refresh list to get updated status
      } catch (error) {
        console.error(`Failed to ${action} admin:`, error);
        alert(`Failed to ${action} admin`);
      }
    }
  };

  const handleSave = () => {
    setIsDrawerOpen(false);
    fetchAdmins(); // Refresh list after save
  };

  return (
    <div className="p-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Dashboard</span> <ChevronRight className="w-4 h-4" /> <span>Profile Management</span> <ChevronRight className="w-4 h-4" /> <span className="font-semibold text-blue-600">Sub Admin</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">SUB ADMIN MANAGEMENT</h2>
          <p className="text-slate-600 mt-1">Manage all administrators and access permissions.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
            <Plus className="w-4 h-4" /> Create Sub Admin
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Total Admins', value: data.length },
          { label: 'Active', value: data.filter(a => a.status === 'Active').length },
          { label: 'Inactive', value: data.filter(a => a.status === 'Inactive').length },
          { label: 'Blocked', value: data.filter(a => a.status === 'Blocked').length },
          { label: "Today's Login", value: data.filter(a => a.lastLogin === new Date().toISOString().split('T')[0]).length },
          { label: 'Pending Approval', value: data.filter(a => a.status === 'Inactive' && !a.blocked).length },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200">
        {['Overview', 'Staff', 'Roles', 'Permissions', 'Activity Logs'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 font-medium text-sm ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' ? (
        <>
            {/* Recent Admins */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Recent Admins</h3>
                <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Username</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Password</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map(admin => (
                    <tr key={admin.id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-900">{admin.name}</td>
                        <td className="p-4 text-slate-600">{admin.username}</td>
                        <td className="p-4 text-slate-600">{admin.email}</td>
                        <td className="p-4 text-slate-600">{admin.role}</td>
                        <td className="p-4 flex items-center gap-2">
                        {showPasswords[admin.id] ? admin.password : '********'}
                        <button onClick={() => togglePassword(admin.id)} className="text-slate-400 hover:text-blue-600">{showPasswords[admin.id] ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
                        <button className="text-slate-400 hover:text-blue-600"><Copy className="w-4 h-4"/></button>
                        </td>
                        <td className="p-4"><StatusBadge status={admin.status} /></td>
                        <td className="p-4 flex gap-2">
                        <button onClick={() => handleView(admin)} className="text-blue-600 hover:text-blue-800"><Eye className="w-4 h-4"/></button>
                        <button onClick={() => handleEdit(admin)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(admin.id, admin.name)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"/></button>
                        {admin.status === 'Blocked' ? (
                          <button onClick={() => handleBlockToggle(admin)} className="text-emerald-600 hover:text-emerald-900" title="Unblock Admin"><UserCheck className="w-4 h-4"/></button>
                        ) : (
                          <button onClick={() => handleBlockToggle(admin)} className="text-slate-600 hover:text-slate-900" title="Block Admin"><UserX className="w-4 h-4"/></button>
                        )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </>
      ) : (
        <div className="p-12 text-center text-slate-500">
            {activeTab} module is under development.
        </div>
      )}

      {isDrawerOpen && <CreateSubAdminDrawer mode={drawerMode} admin={selectedAdmin} onSave={handleSave} onClose={() => setIsDrawerOpen(false)} />}
    </div>
  );
}
