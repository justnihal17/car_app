import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, UserMinus, UserPlus, LogIn, Plus, Download, Search, Filter, MoreHorizontal, Settings, RefreshCw, Trash2, Eye, Edit2 } from 'lucide-react';
import { AnalyticsCard } from '../common/AnalyticsCard';
import { SlidePanel } from '../common/SlidePanel';
import { StatusBadge } from '../StatusBadge';
import { motion } from 'motion/react';

const USERS = [
  { id: 'U001', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1234567890', city: 'New York', status: 'Active', orders: 12, membership: 'Premium' },
  { id: 'U002', name: 'Bob Smith', email: 'bob@example.com', phone: '+1987654321', city: 'London', status: 'Pending', orders: 0, membership: 'Standard' },
];

import { UserRegistrationDrawer } from './registration/UserRegistrationDrawer';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export function UserWorkspace({ onUserSelect }: { onUserSelect: (id: string) => void }) {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"register" | "view">("register");
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/customer/customer');
      const mapped = response.data.data.map((user: any) => ({
        id: user._id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        city: 'N/A', // Assuming city isn't in backend payload right now
        status: user.active ? 'Active' : (user.blocked ? 'Blocked' : 'Pending'),
        orders: 0,
        membership: 'Standard',
        ...user
      }));
      setUsersList(mapped);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch customers');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const response = await api.delete(`/customer/customer/${id}`);
        toast.success(response.data?.message || 'Customer soft deleted successfully');
        setUsersList(usersList.filter(u => u.id !== id));
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  const handleBlockToggle = async (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const isCurrentlyBlocked = user.status === 'Blocked';
    if (window.confirm(`Are you sure you want to ${isCurrentlyBlocked ? 'unblock' : 'block'} ${user.name}?`)) {
      try {
      const newBlockedStatus = !(user.status === 'Blocked');
      const response = await api.put(`/customer/customer/admin/${user.id}`, { blocked: newBlockedStatus });
      toast.success(response.data?.message || `Customer ${newBlockedStatus ? 'blocked' : 'unblocked'} successfully`);
      setUsersList(usersList.map(u => u.id === user.id ? { ...u, status: newBlockedStatus ? 'Blocked' : 'Active' } : u));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update customer status');
    }
  }
};

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-slate-500 mb-2">Dashboard {' > '} Profile Management {' > '} <span className="text-blue-600 font-medium">User Management</span></div>
          <h1 className="text-3xl font-bold text-slate-900">User Management Workspace</h1>
          <p className="text-slate-600 mt-1">Manage all registered users, permissions, account status and activity.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setDrawerMode("register"); setSelectedUserForDrawer(null); setIsDrawerOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-all shadow-lg shadow-blue-200">
            <Plus className="w-4 h-4" /> Register User
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <AnalyticsCard title="Total Users" value={usersList.length.toString()} icon={Users} />
        <AnalyticsCard title="Active" value={usersList.filter(u => u.status === 'Active').length.toString()} icon={UserCheck} />
        <AnalyticsCard title="Inactive" value={usersList.filter(u => u.status === 'Inactive').length.toString()} icon={UserMinus} />
        <AnalyticsCard title="Blocked" value={usersList.filter(u => u.status === 'Blocked').length.toString()} icon={UserX} />
        <AnalyticsCard title="Pending" value={usersList.filter(u => u.status === 'Pending').length.toString()} icon={LogIn} />
        <AnalyticsCard title="Today" value={usersList.filter(u => u.createdAt && new Date(u.createdAt).toDateString() === new Date().toDateString()).length.toString()} icon={Plus} />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search users..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium">
          <Filter className="w-4 h-4" /> Advanced Filters
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Contact</th>
              <th className="p-4">City</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Membership</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usersList.map(user => (
              <motion.tr key={user.id} whileHover={{ backgroundColor: '#f8fafc' }} className="cursor-pointer" onClick={() => onUserSelect(user.id)}>
                <td className="p-4 font-medium text-slate-900">{user.name}</td>
                <td className="p-4 text-slate-600">{user.email}<br/>{user.phone}</td>
                <td className="p-4 text-slate-600">{user.city}</td>
                <td className="p-4 text-slate-600">{user.orders}</td>
                <td className="p-4 text-slate-600">{user.membership}</td>
                <td className="p-4"><StatusBadge status={user.status as any} /></td>
                <td className="p-4 flex gap-2 items-center">
                  <button onClick={(e) => { e.stopPropagation(); setDrawerMode("view"); setSelectedUserForDrawer(user); setIsDrawerOpen(true); }} className="text-blue-600 hover:text-blue-800 p-1" title="View Details"><Eye className="w-4 h-4"/></button>
                  <button onClick={(e) => { e.stopPropagation(); setDrawerMode("edit"); setSelectedUserForDrawer(user); setIsDrawerOpen(true); }} className="text-blue-600 hover:text-blue-800 p-1" title="Edit User"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={(e) => handleDelete(e, user.id, user.name)} className="text-red-600 hover:text-red-800 p-1" title="Delete User"><Trash2 className="w-4 h-4"/></button>
                  {user.status === 'Blocked' ? (
                    <button onClick={(e) => handleBlockToggle(e, user)} className="text-emerald-600 hover:text-emerald-900 p-1" title="Unblock User"><UserCheck className="w-4 h-4"/></button>
                  ) : (
                    <button onClick={(e) => handleBlockToggle(e, user)} className="text-slate-600 hover:text-slate-900 p-1" title="Block User"><UserX className="w-4 h-4"/></button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserRegistrationDrawer 
        isOpen={isDrawerOpen} 
        mode={drawerMode}
        initialData={selectedUserForDrawer}
        onClose={() => {
            setIsDrawerOpen(false);
            if (drawerMode === "register" || drawerMode === "edit") {
              fetchUsers(); // Refresh list after potential update or registration
            }
        }} 
      />
    </div>
  );
}
