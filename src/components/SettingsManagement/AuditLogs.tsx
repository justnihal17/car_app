import { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { AUDIT_LOGS } from '../../data/settings';

export function AuditLogs() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Audit Logs</h2>
          <p className="text-sm text-slate-400 mt-1">Monitor system and administrator activity</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 transition-colors text-sm shadow-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search logs..." 
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
                <th className="px-5 py-4 font-medium">User & Action</th>
                <th className="px-5 py-4 font-medium">Date & Time</th>
                <th className="px-5 py-4 font-medium">IP Address</th>
                <th className="px-5 py-4 font-medium">Device & Browser</th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800">
              {AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{log.action}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{log.user}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-slate-300">{new Date(log.date).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{new Date(log.date).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-slate-300 font-mono text-xs">{log.ipAddress}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-slate-300">{log.device}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{log.browser}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider border ${
                      log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {log.status === 'Success' ? <CheckCircle className="w-3.5 h-3.5"/> : <AlertCircle className="w-3.5 h-3.5"/>}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 1 to 4 of 4 logs</span>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
