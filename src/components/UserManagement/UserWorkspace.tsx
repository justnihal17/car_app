import { useState } from 'react';
import { Users, UserCheck, UserX, UserMinus, UserPlus, LogIn, Plus, Download, Search, Filter, MoreHorizontal, Settings, RefreshCw } from 'lucide-react';
import { AnalyticsCard } from '../common/AnalyticsCard';
import { SlidePanel } from '../common/SlidePanel';
import { StatusBadge } from '../StatusBadge';
import { motion } from 'motion/react';

const USERS = [
  { id: 'U001', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1234567890', city: 'New York', status: 'Active', orders: 12, membership: 'Premium' },
  { id: 'U002', name: 'Bob Smith', email: 'bob@example.com', phone: '+1987654321', city: 'London', status: 'Pending', orders: 0, membership: 'Standard' },
];

export function UserWorkspace({ onUserSelect }: { onUserSelect: (id: string) => void }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-slate-500 mb-2">Dashboard {' > '} Profile Management {' > '} <span className="text-blue-600 font-medium">User Management</span></div>
          <h1 className="text-3xl font-bold text-slate-900">User Management Workspace</h1>
          <p className="text-slate-600 mt-1">Manage all registered users, permissions, account status and activity.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-all shadow-lg shadow-blue-200">
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
        <AnalyticsCard title="Total Users" value="2,400" icon={Users} trend="12%" trendUp />
        <AnalyticsCard title="Active" value="2,100" icon={UserCheck} trend="5%" trendUp />
        <AnalyticsCard title="Inactive" value="250" icon={UserMinus} trend="2%" />
        <AnalyticsCard title="Blocked" value="50" icon={UserX} trend="1%" />
        <AnalyticsCard title="Pending" value="100" icon={LogIn} trend="3%" />
        <AnalyticsCard title="Today" value="20" icon={Plus} trend="8%" trendUp />
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
            {USERS.map(user => (
              <motion.tr key={user.id} whileHover={{ backgroundColor: '#f8fafc' }} className="cursor-pointer" onClick={() => onUserSelect(user.id)}>
                <td className="p-4 font-medium text-slate-900">{user.name}</td>
                <td className="p-4 text-slate-600">{user.email}<br/>{user.phone}</td>
                <td className="p-4 text-slate-600">{user.city}</td>
                <td className="p-4 text-slate-600">{user.orders}</td>
                <td className="p-4 text-slate-600">{user.membership}</td>
                <td className="p-4"><StatusBadge status={user.status as any} /></td>
                <td className="p-4"><MoreHorizontal className="w-5 h-5 text-slate-400" /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidePanel isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Register User">
        <div className="p-4 space-y-4">
          <div className="p-4 border-2 border-dashed rounded-xl text-center text-slate-400">Upload Profile Photo</div>
          <input type="text" placeholder="Full Name" className="w-full p-3 border border-slate-200 rounded-xl" />
          <input type="email" placeholder="Email" className="w-full p-3 border border-slate-200 rounded-xl" />
          <input type="tel" placeholder="Phone" className="w-full p-3 border border-slate-200 rounded-xl" />
          <div className="flex gap-4">
            <button className="flex-1 p-3 bg-blue-600 text-white rounded-xl font-medium">Register</button>
            <button onClick={() => setIsDrawerOpen(false)} className="flex-1 p-3 bg-slate-100 text-slate-700 rounded-xl font-medium">Cancel</button>
          </div>
        </div>
      </SlidePanel>
    </div>
  );
}
