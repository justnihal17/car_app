import { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Mail, Phone, Shield } from 'lucide-react';
import { ADMINS } from '../../data/settings';

export function AdminManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Admin Accounts</h2>
          <p className="text-sm text-slate-400 mt-1">Manage administrative access and privileges</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm">
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search admins by name, email or role..." 
                className="bg-slate-900 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/50 w-full transition-all"
              />
            </div>
            <button className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-sm px-3">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-5 py-4 font-medium">Administrator</th>
                <th className="px-5 py-4 font-medium">Contact</th>
                <th className="px-5 py-4 font-medium">Role & Status</th>
                <th className="px-5 py-4 font-medium">Last Login</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800">
              {ADMINS.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {admin.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-white">{admin.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{admin.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="text-slate-300 text-xs flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500"/> {admin.email}</div>
                      <div className="text-slate-500 text-xs flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> {admin.phone}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        <Shield className="w-3 h-3" /> {admin.role}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        admin.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {admin.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">
                    {new Date(admin.lastLogin).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
