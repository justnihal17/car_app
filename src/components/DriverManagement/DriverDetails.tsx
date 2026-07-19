import { 
  ArrowLeft, Mail, Phone, MessageSquare, MapPin, Calendar, CheckCircle2, 
  ShieldAlert, Car, History, FileText, ChevronRight, Edit, Trash2, Plus, Star, Map, Activity, Clock, MoreHorizontal
} from 'lucide-react';
import { useState } from 'react';
import { DRIVERS } from '../../data/drivers';

const TABS = [
  { id: 'profile', label: 'Profile Overview' },
  { id: 'verification', label: 'Verification & Docs' },
  { id: 'live', label: 'Live Tracking' },
  { id: 'availability', label: 'Availability' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'performance', label: 'Performance' },
];

export function DriverDetails({ driverId, onBack }: { driverId: string, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('profile');
  
  const driver = DRIVERS.find(d => d.id === driverId);
  if (!driver) return <div className="p-8 text-slate-400">Driver not found</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={onBack}
          className="p-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={onBack}>Driver Management</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-300 font-medium">Driver Profile</span>
        </div>
      </div>

      {/* Profile Card Header */}
      <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img src={driver.avatar} alt={driver.name} className="w-24 h-24 rounded-2xl border-2 border-slate-700 object-cover shadow-xl" />
              <div className={`absolute -bottom-2 -right-2 w-6 h-6 border-4 border-[#0f1218] rounded-full
                ${driver.status === 'Online' ? 'bg-emerald-500' : 
                  driver.status === 'Busy' ? 'bg-yellow-500' : 'bg-slate-500'}
              `} title={`Status: ${driver.status}`}></div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">{driver.name}</h1>
                {driver.verification === 'Verified' && (
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded flex items-center gap-1 text-[11px] font-bold uppercase">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                )}
                {driver.verification === 'Pending' && (
                  <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-0.5 rounded flex items-center gap-1 text-[11px] font-bold uppercase">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-3">Driver ID: <span className="font-mono text-slate-300">{driver.id}</span></p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs">Rating</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-emerald-400" /> {driver.rating}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs">Completed Jobs</span>
                  <span className="text-white font-medium">{driver.completedJobs}</span>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs">Availability</span>
                  <span className={`font-medium 
                    ${driver.availability === 'Available' ? 'text-emerald-400' : 
                      driver.availability === 'On Job' ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {driver.availability}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors shadow-sm" title="Call">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors shadow-sm" title="Email">
              <Mail className="w-4 h-4" />
            </button>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm">
              <Plus className="w-4 h-4" />
              Assign Order
            </button>
            <div className="w-px h-6 bg-slate-800 mx-1"></div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors shadow-sm text-sm font-medium">
              <ShieldAlert className="w-4 h-4" />
              Suspend
            </button>
          </div>
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

      {/* Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <>
              {/* Personal Information */}
              <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white tracking-tight">Personal Information</h2>
                  <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Full Name</div>
                    <div className="text-sm text-slate-200 font-medium">{driver.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Email Address</div>
                    <div className="text-sm text-slate-200 font-medium">{driver.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Phone Number</div>
                    <div className="text-sm text-slate-200 font-medium">{driver.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">City</div>
                    <div className="text-sm text-slate-200 font-medium">{driver.city}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Registration Date</div>
                    <div className="text-sm text-slate-200 font-medium">{driver.joinedDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Emergency Contact</div>
                    <div className="text-sm text-slate-200 font-medium">+971 50 000 0000 (Wife)</div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white tracking-tight">Assigned Vehicle</h2>
                  <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0">
                    <Car className="w-10 h-10 text-slate-600" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Vehicle Make & Model</div>
                      <div className="text-sm text-slate-200 font-medium">{driver.vehicle.brand} {driver.vehicle.model} ({driver.vehicle.year})</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Plate Number</div>
                      <div className="text-sm text-slate-200 font-mono font-medium">{driver.vehicle.plate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Vehicle Type</div>
                      <div className="text-sm text-slate-200 font-medium">{driver.vehicle.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Fuel & Color</div>
                      <div className="text-sm text-slate-200 font-medium">{driver.vehicle.fuelType} • {driver.vehicle.color}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'verification' && (
            <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white tracking-tight">Document Verification</h2>
                {driver.verification === 'Pending' && (
                  <button className="text-sm bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Approve All
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Driving License', id: driver.license, exp: '15 Nov 2025', status: 'Approved' },
                  { name: 'Emirates ID', id: '784-XXXX-XXXXXXX-X', exp: '10 Aug 2026', status: 'Approved' },
                  { name: 'Vehicle Registration (Mulkiya)', id: 'REG-99120', exp: '05 Jan 2024', status: driver.verification === 'Pending' ? 'Pending' : 'Approved' },
                  { name: 'Insurance Certificate', id: 'INS-A48291', exp: '05 Jan 2024', status: driver.verification === 'Pending' ? 'Pending' : 'Approved' },
                  { name: 'Background Check', id: 'BG-2023-991', exp: '-', status: 'Approved' },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${doc.status === 'Approved' ? 'bg-emerald-500/10' : 'bg-yellow-500/10'}`}>
                        <FileText className={`w-5 h-5 ${doc.status === 'Approved' ? 'text-emerald-400' : 'text-yellow-400'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{doc.name}</div>
                        <div className="text-xs text-slate-500">ID: {doc.id} • Expires: {doc.exp}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-md border
                        ${doc.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}
                      `}>{doc.status}</span>
                      <button className="p-1.5 text-slate-400 hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'live' && (
            <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white tracking-tight">Live Tracking</h2>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {driver.currentLocation}
                  </span>
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-[#05070a] border border-slate-800/60 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" 
                     style={{ backgroundImage: 'radial-gradient(#34d399 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <Map className="w-12 h-12 text-slate-700 mb-2" />
                  <p className="text-slate-500 text-sm">Interactive map would load here.</p>
                  <p className="text-slate-600 text-xs mt-1">Center: {driver.currentLocation}</p>
                </div>

                {/* Mock Driver Marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="relative">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.6)] border-2 border-[#05070a] flex items-center justify-center">
                      <Car className="w-3 h-3 text-[#05070a] fill-current" />
                    </div>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border border-slate-700 shadow-xl font-medium flex items-center gap-2">
                      <span>{driver.name.split(' ')[0]}</span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {['availability', 'earnings', 'performance'].includes(activeTab) && (
            <div className="bg-[#0f1218] p-12 rounded-xl border border-slate-800/60 shadow-lg text-center flex flex-col items-center justify-center h-96">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{TABS.find(t=>t.id===activeTab)?.label} Data</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">Detailed {activeTab} metrics and history will be displayed in this view.</p>
            </div>
          )}
        </div>

        {/* Right Side Panel */}
        <div className="space-y-6">
          <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg">
            <h2 className="text-sm font-bold text-white tracking-tight uppercase mb-5">Quick Stats</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <span className="text-sm text-slate-300">Average Rating</span>
                </div>
                <span className="font-bold text-white">{driver.rating}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Completion Rate</span>
                </div>
                <span className="font-bold text-white">98.5%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">Avg. Arrival Time</span>
                </div>
                <span className="font-bold text-white">12 mins</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-white tracking-tight uppercase">Recent Activities</h2>
            </div>
            
            <div className="relative border-l border-slate-800/60 ml-3 space-y-6">
              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#0f1218]"></div>
                <div className="text-xs text-slate-500 mb-0.5">Today, 08:30 AM</div>
                <div className="text-sm font-medium text-slate-200">Shift Started</div>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 ring-4 ring-[#0f1218]"></div>
                <div className="text-xs text-slate-500 mb-0.5">Yesterday, 17:45 PM</div>
                <div className="text-sm font-medium text-slate-200">Shift Ended</div>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 ring-4 ring-[#0f1218]"></div>
                <div className="text-xs text-slate-500 mb-0.5">Yesterday, 15:20 PM</div>
                <div className="text-sm font-medium text-slate-200">Completed Order ORD-1029</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
