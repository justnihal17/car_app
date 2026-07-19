import { Search, Filter, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight, Star, MapPin } from 'lucide-react';
import { DRIVERS } from '../../data/drivers';

export function DriverList({ onDriverSelect }: { onDriverSelect: (id: string) => void }) {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Driver Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage all registered service agents</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm">
            <Plus className="w-4 h-4" />
            Add Driver
          </button>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
        {/* Search and Filter Bar */}
        <div className="p-5 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by name, ID, phone, or plate..." 
                className="bg-slate-900 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/50 w-full transition-all"
              />
            </div>
            <button className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-sm px-3">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced Filters</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <select className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 outline-none">
              <option>Status: All</option>
              <option>Online</option>
              <option>Offline</option>
              <option>Busy</option>
            </select>
            <select className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 outline-none">
              <option>City: All</option>
              <option>Dubai</option>
              <option>Abu Dhabi</option>
              <option>Sharjah</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-5 py-4 font-medium">Driver</th>
                <th className="px-5 py-4 font-medium">Contact</th>
                <th className="px-5 py-4 font-medium">Vehicle</th>
                <th className="px-5 py-4 font-medium">Performance</th>
                <th className="px-5 py-4 font-medium">Status & Location</th>
                <th className="px-5 py-4 font-medium">Earnings</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800">
              {DRIVERS.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer" onClick={() => onDriverSelect(driver.id)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={driver.avatar} alt={driver.name} className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-[#0f1218] rounded-full
                          ${driver.status === 'Online' ? 'bg-emerald-500' : 
                            driver.status === 'Busy' ? 'bg-yellow-500' : 'bg-slate-500'}
                        `}></div>
                      </div>
                      <div>
                        <div className="font-medium text-white flex items-center gap-2">
                          {driver.name}
                          {driver.verification === 'Verified' && (
                            <span className="w-3 h-3 bg-blue-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold" title="Verified">✓</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{driver.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-slate-300">{driver.phone}</div>
                    <div className="text-xs text-slate-500">{driver.city}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    <div className="font-medium text-white">{driver.vehicle.brand} {driver.vehicle.model}</div>
                    <div className="text-xs text-slate-500">{driver.vehicle.plate} • {driver.vehicle.type}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Star className="w-3.5 h-3.5 fill-emerald-400" />
                      {driver.rating}
                    </div>
                    <div className="text-xs text-slate-500">{driver.completedJobs} jobs</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider
                        ${driver.availability === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          driver.availability === 'On Job' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                          'bg-slate-800 text-slate-400 border border-slate-700'}
                      `}>
                        {driver.availability}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 truncate max-w-[150px]">
                      <MapPin className="w-3 h-3" />
                      {driver.currentLocation}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-emerald-400">{driver.todayEarnings} <span className="text-xs text-slate-500 font-normal">today</span></div>
                    <div className="text-xs text-slate-500">{driver.totalEarnings} total</div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      onClick={(e) => { e.stopPropagation(); /* show dropdown */ }}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Showing 1 to 5 of 842 entries</span>
            <select className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 outline-none">
              <option>10 rows</option>
              <option>20 rows</option>
              <option>50 rows</option>
            </select>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white font-medium">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors font-medium">2</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors font-medium">3</button>
            <span className="px-2 py-1.5">...</span>
            <button className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
