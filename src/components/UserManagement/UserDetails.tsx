import { 
  ArrowLeft, Mail, Phone, MessageSquare, MapPin, Calendar, CheckCircle2, 
  ShieldAlert, Car, CreditCard, History, FileText, ChevronRight, Edit, Trash2, Plus
} from 'lucide-react';
import { useState } from 'react';
import { USERS } from '../../data/users';

const TABS = [
  { id: 'profile', label: 'Profile Overview' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'payments', label: 'Payment Methods' },
  { id: 'orders', label: 'Order History' },
  { id: 'service', label: 'Service History' },
];

export function UserDetails({ userId, onBack }: { userId: string, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('profile');
  
  const user = USERS.find(u => u.id === userId);
  if (!user) return <div>User not found</div>;

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
          <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={onBack}>User Management</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-300 font-medium">Customer Profile</span>
        </div>
      </div>

      {/* Profile Card Header */}
      <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl border-2 border-slate-700 object-cover shadow-xl" />
              <div className="absolute -bottom-2 -right-2 bg-blue-500 p-1.5 rounded-lg border-2 border-[#0f1218]" title="Verified User">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">{user.name}</h1>
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider
                  ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                  ${user.status === 'Verified' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
                  ${user.status === 'Inactive' ? 'bg-slate-800 text-slate-400 border border-slate-700' : ''}
                `}>
                  {user.status}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-3">Customer ID: <span className="font-mono text-slate-300">{user.id}</span></p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs">Membership</span>
                  <span className="text-emerald-400 font-medium">{user.membership}</span>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs">Wallet Balance</span>
                  <span className="text-white font-medium">{user.walletBalance}</span>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs">Reward Points</span>
                  <span className="text-white font-medium">{user.rewardPoints} pts</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a href={`tel:${user.phone}`} className="p-2.5 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors shadow-sm" title="Call">
              <Phone className="w-4 h-4" />
            </a>
            <a href={`mailto:${user.email}`} className="p-2.5 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors shadow-sm" title="Email">
              <Mail className="w-4 h-4" />
            </a>
            <button onClick={() => alert(`Messaging ${user.name}...`)} className="p-2.5 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors shadow-sm" title="Message">
              <MessageSquare className="w-4 h-4" />
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
                    <div className="text-sm text-slate-200 font-medium">{user.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Email Address</div>
                    <div className="text-sm text-slate-200 font-medium">{user.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Phone Number</div>
                    <div className="text-sm text-slate-200 font-medium">{user.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">City</div>
                    <div className="text-sm text-slate-200 font-medium">{user.city}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Registration Date</div>
                    <div className="text-sm text-slate-200 font-medium">{user.registeredDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Language</div>
                    <div className="text-sm text-slate-200 font-medium">English (US)</div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
                <h2 className="text-lg font-bold text-white tracking-tight mb-6">Account Security</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Identity Verification</div>
                        <div className="text-xs text-slate-500">Document verified on {user.registeredDate}</div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">Verified</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <History className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Last Login</div>
                        <div className="text-xs text-slate-500">Today at 10:42 AM via iOS App</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'vehicles' && (
            <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white tracking-tight">Vehicle Management</h2>
                <button className="flex items-center gap-2 text-sm text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                  <Plus className="w-4 h-4" /> Add Vehicle
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl relative group">
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-white transition-colors"><Edit className="w-4 h-4"/></button>
                    <button className="p-1.5 text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center">
                      <Car className="w-8 h-8 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Toyota Camry</div>
                      <div className="text-xs text-slate-500">2022 • White</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm pt-4 border-t border-slate-800">
                    <span className="text-slate-500 font-mono">DXB-78421</span>
                    <span className="text-emerald-400 font-medium text-xs bg-emerald-500/10 px-2 py-0.5 rounded">Default</span>
                  </div>
                </div>
                
                {user.vehicles > 1 && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl relative group">
                    <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-white transition-colors"><Edit className="w-4 h-4"/></button>
                      <button className="p-1.5 text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center">
                        <Car className="w-8 h-8 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Nissan Patrol</div>
                        <div className="text-xs text-slate-500">2023 • Black</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm pt-4 border-t border-slate-800">
                      <span className="text-slate-500 font-mono">DXB-12994</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
              <h2 className="text-lg font-bold text-white tracking-tight mb-6">Order History</h2>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                      <th className="px-4 py-3 font-medium">Order ID</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Service</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-800">
                    <tr className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-300">ORD-8921</td>
                      <td className="px-4 py-4 text-slate-400">Oct 12, 2023</td>
                      <td className="px-4 py-4 text-slate-300">Super98 Fuel Delivery</td>
                      <td className="px-4 py-4 font-medium text-white">$45.00</td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Completed</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-slate-400 hover:text-white transition-colors"><FileText className="w-4 h-4 ml-auto" /></button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-300">ORD-8902</td>
                      <td className="px-4 py-4 text-slate-400">Sep 28, 2023</td>
                      <td className="px-4 py-4 text-slate-300">Car Wash - Premium</td>
                      <td className="px-4 py-4 font-medium text-white">$25.00</td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Completed</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-slate-400 hover:text-white transition-colors"><FileText className="w-4 h-4 ml-auto" /></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white tracking-tight">Saved Addresses</h2>
                <button className="flex items-center gap-2 text-sm text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-900 border border-emerald-500/30 rounded-xl relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                      <span className="font-medium text-white">Home</span>
                      <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Default</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-slate-400 hover:text-white"><Edit className="w-4 h-4"/></button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Villa 45, Street 12<br/>
                    Jumeirah 3, Dubai<br/>
                    United Arab Emirates
                  </p>
                  <div className="pt-3 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                    <span>25.2048° N, 55.2708° E</span>
                    <span>Last used: 2 days ago</span>
                  </div>
                </div>

                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <span className="font-medium text-white">Office</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-slate-400 hover:text-white"><Edit className="w-4 h-4"/></button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Floor 14, Boulevard Plaza Tower 1<br/>
                    Downtown Dubai<br/>
                    United Arab Emirates
                  </p>
                  <div className="pt-3 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                    <span>25.1972° N, 55.2744° E</span>
                    <span>Last used: 1 week ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white tracking-tight">Payment Methods</h2>
                <button className="flex items-center gap-2 text-sm text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                  <Plus className="w-4 h-4" /> Add Method
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center text-blue-600 font-bold italic">
                      VISA
                    </div>
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        •••• 4242
                        <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Default</span>
                      </div>
                      <div className="text-xs text-slate-500">Expires 12/25</div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-white"><Trash2 className="w-4 h-4"/></button>
                </div>
                
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-white font-bold text-xs border border-slate-700">
                      Apple Pay
                    </div>
                    <div>
                      <div className="text-white font-medium">Connected</div>
                      <div className="text-xs text-slate-500">Added Sep 2023</div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-white"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'service' && (
            <div className="bg-[#0f1218] p-6 rounded-xl border border-slate-800/60 shadow-lg">
              <h2 className="text-lg font-bold text-white tracking-tight mb-6">Service Timeline</h2>
              
              <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 pb-4">
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#0f1218] flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-[#0f1218]" />
                  </div>
                  <div className="text-xs text-slate-500 mb-1">Oct 12, 2023 at 14:30</div>
                  <div className="text-sm font-medium text-white mb-1">Service Completed</div>
                  <p className="text-xs text-slate-400">Driver finished Super98 Fuel Delivery. Invoice #INV-8921 generated.</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-[#0f1218]"></div>
                  <div className="text-xs text-slate-500 mb-1">Oct 12, 2023 at 14:15</div>
                  <div className="text-sm font-medium text-white mb-1">Service Started</div>
                  <p className="text-xs text-slate-400">Driver arrived at location and commenced fueling.</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-700 ring-4 ring-[#0f1218]"></div>
                  <div className="text-xs text-slate-500 mb-1">Oct 12, 2023 at 13:45</div>
                  <div className="text-sm font-medium text-white mb-1">Driver Assigned</div>
                  <p className="text-xs text-slate-400">Driver Ahmed M. assigned to the order.</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-700 ring-4 ring-[#0f1218]"></div>
                  <div className="text-xs text-slate-500 mb-1">Oct 12, 2023 at 13:42</div>
                  <div className="text-sm font-medium text-white mb-1">Service Booked</div>
                  <p className="text-xs text-slate-400">Customer placed an order for Super98 via iOS App.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Panel */}
        <div className="space-y-6">
          <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg">
            <h2 className="text-sm font-bold text-white tracking-tight uppercase mb-5">Customer Analytics</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Profile Completeness</span>
                  <span className="text-white font-medium">92%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Lifetime Value</div>
                  <div className="text-lg font-bold text-white">{user.totalSpending}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Avg. Order Value</div>
                  <div className="text-lg font-bold text-white">$65.40</div>
                </div>
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
                <div className="text-xs text-slate-500 mb-0.5">Today, 10:42 AM</div>
                <div className="text-sm font-medium text-slate-200">Logged in via iOS App</div>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 ring-4 ring-[#0f1218]"></div>
                <div className="text-xs text-slate-500 mb-0.5">Oct 12, 2023</div>
                <div className="text-sm font-medium text-slate-200">Completed Order ORD-8921</div>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 ring-4 ring-[#0f1218]"></div>
                <div className="text-xs text-slate-500 mb-0.5">Sep 28, 2023</div>
                <div className="text-sm font-medium text-slate-200">Added new vehicle (Toyota Camry)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Add Plus icon import at top
