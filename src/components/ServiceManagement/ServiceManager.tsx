import { useState } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight, BarChart2, Calendar, MapPin, Tag, Wrench, Settings } from 'lucide-react';
import { SERVICES } from '../../data/services';
import { CreateService } from './CreateService';
import { ServiceDetails } from './ServiceDetails';

const TABS = [
  { id: 'list', label: 'Service List' },
  { id: 'categories', label: 'Categories' },
  { id: 'packages', label: 'Packages' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'offers', label: 'Offers & Coupons' },
  { id: 'availability', label: 'Availability' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'analytics', label: 'Analytics' },
];

export function ServiceManager() {
  const [activeTab, setActiveTab] = useState('list');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  if (isCreating) {
    return <CreateService onBack={() => setIsCreating(false)} />;
  }

  if (selectedService) {
    return <ServiceDetails serviceId={selectedService} onBack={() => setSelectedService(null)} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Service Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage all available services and configurations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Service
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-800/60 pb-px">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <div className="bg-[#0f1218] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="p-5 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search by service name, code, or category..." 
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
                <option>Category: All</option>
                <option>Fuel Delivery</option>
                <option>Car Wash</option>
                <option>Emergency Services</option>
              </select>
              <select className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 outline-none">
                <option>Status: All</option>
                <option>Active</option>
                <option>Disabled</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="px-5 py-4 font-medium">Service Details</th>
                  <th className="px-5 py-4 font-medium">Pricing & Duration</th>
                  <th className="px-5 py-4 font-medium">Availability</th>
                  <th className="px-5 py-4 font-medium">Performance</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-800">
                {SERVICES.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer" onClick={() => setSelectedService(service.id)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <img src={service.image} alt={service.name} className="w-12 h-12 rounded-lg border border-slate-700 object-cover" />
                        <div>
                          <div className="font-medium text-white">{service.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono">{service.id}</span>
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                            <span>{service.category}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{service.price}</span>
                        {service.discount !== '0%' && (
                          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">-{service.discount}</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {service.duration} avg.
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap max-w-[150px]">
                        {service.cities.map((city, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {city}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-emerald-400">{service.revenue}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{service.orders.toLocaleString()} orders</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider
                        ${service.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          'bg-slate-800 text-slate-400 border border-slate-700'}
                      `}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
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
              <span>Showing 1 to 5 of 24 entries</span>
            </div>
            <div className="flex gap-1">
              <button className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white font-medium">1</button>
              <button className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-400">Total Revenue</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-1">$1.42M</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                +14.5% from last month
              </div>
            </div>

            <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Tag className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-400">Total Orders</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-1">39,415</div>
              <div className="text-xs text-blue-400 flex items-center gap-1">
                +8.2% from last month
              </div>
            </div>

            <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Wrench className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-400">Active Services</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-1">24</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                Across 5 categories
              </div>
            </div>

            <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-400">Avg. Satisfaction</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-1">4.8/5.0</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                +0.2 from last month
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg h-80 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <BarChart2 className="w-12 h-12 text-slate-700 mb-4 z-10" />
              <h3 className="text-lg font-medium text-white mb-2 z-10">Revenue Trend</h3>
              <p className="text-sm text-slate-500 z-10">Chart component placeholder</p>
            </div>
            
            <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
              <h3 className="text-base font-bold text-white mb-5">Top Performing Services</h3>
              <div className="space-y-4">
                {SERVICES.slice(0, 3).map((service, i) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                        #{i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{service.name}</div>
                        <div className="text-xs text-slate-500">{service.orders.toLocaleString()} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-emerald-400">{service.revenue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'list' && activeTab !== 'analytics' && (
        <div className="bg-[#0f1218] p-12 rounded-xl border border-slate-800/60 shadow-lg text-center flex flex-col items-center justify-center h-96">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">{TABS.find(t=>t.id===activeTab)?.label} Configuration</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">This section allows fine-grained control over {activeTab.toLowerCase()} rules and policies for all services.</p>
        </div>
      )}
    </div>
  );
}
