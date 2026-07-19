import { useState } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

// Mock data (replace with actual data later)
const USERS = [
    { id: 'U001', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1234567890', status: 'Active', orders: 12 },
    { id: 'U002', name: 'Bob Smith', email: 'bob@example.com', phone: '+1987654321', status: 'Pending', orders: 0 },
];

export function UserList({ onUserSelect }: { onUserSelect: (id: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Register User
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {USERS.filter(u => u.name.includes(searchTerm)).map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{user.name}</td>
                <td className="p-4 text-slate-600">{user.email}</td>
                <td className="p-4"><StatusBadge status={user.status as any} /></td>
                <td className="p-4 text-slate-600">{user.orders}</td>
                <td className="p-4 text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => onUserSelect(user.id)}>View</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

