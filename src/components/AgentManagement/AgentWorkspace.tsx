import { useState } from 'react';
import { Car, UserCheck, UserMinus, UserX, Clock, Star, Plus, Download, Search, Filter, MoreHorizontal, RefreshCw, Briefcase, FileText, ChevronDown, X } from 'lucide-react';
import { AnalyticsCard } from '../common/AnalyticsCard';
import { SlidePanel } from '../common/SlidePanel';
import { StatusBadge } from '../StatusBadge';
import { motion } from 'motion/react';

const AGENTS = [
  { id: 'A001', name: 'John Captain', email: 'john@cafu.com', phone: '+1234567890', area: 'Downtown', vehicle: 'Van-01', jobs: 12, rating: 4.8, status: 'Available' },
  { id: 'A002', name: 'Jane Driver', email: 'jane@cafu.com', phone: '+1987654321', area: 'Marina', vehicle: 'Car-05', jobs: 8, rating: 4.5, status: 'Busy' },
];

const AVAILABLE_SKILLS = ["Car Wash", "Oil Change", "Battery Replacement", "Tyre Change", "Fuel Delivery", "Jump Start", "Engine Check", "Car Cleaning"];

export function AgentWorkspace({ onAgentSelect }: { onAgentSelect: (id: string) => void }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState({
      fullName: '', email: '', phone: '', employeeCode: '', role: 'service_agent', gender: 'male', userId: '', password: ''
  });

  const handleSubmit = () => {
      console.log('Registering Agent:', { ...formData, photo, selectedSkills });
      setIsDrawerOpen(false);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-slate-500 mb-2">Dashboard {' > '} Profile Management {' > '} <span className="text-blue-600 font-medium">Agent Management</span></div>
          <h1 className="text-3xl font-bold text-slate-900">Agent Management Workspace</h1>
          <p className="text-slate-600 mt-1">Manage field agents, assignments, attendance, documents, and performance.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-all shadow-lg shadow-blue-200">
            <Plus className="w-4 h-4" /> Register Agent
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnalyticsCard title="Total Agents" value="500" icon={Car} trend="5%" trendUp />
        <AnalyticsCard title="Available" value="400" icon={UserCheck} trend="2%" trendUp />
        <AnalyticsCard title="Busy" value="40" icon={Briefcase} />
        <AnalyticsCard title="Rating" value="4.8" icon={Star} trend="0.1%" trendUp />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search agents..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="p-4">Agent</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Area/Vehicle</th>
              <th className="p-4">Jobs</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {AGENTS.map(agent => (
              <motion.tr key={agent.id} whileHover={{ backgroundColor: '#f8fafc' }} className="cursor-pointer" onClick={() => onAgentSelect(agent.id)}>
                <td className="p-4 font-medium text-slate-900">{agent.name}</td>
                <td className="p-4 text-slate-600">{agent.email}<br/>{agent.phone}</td>
                <td className="p-4 text-slate-600">{agent.area}<br/>{agent.vehicle}</td>
                <td className="p-4 text-slate-600">{agent.jobs}</td>
                <td className="p-4 text-slate-600">{agent.rating}</td>
                <td className="p-4"><StatusBadge status={agent.status as any} /></td>
                <td className="p-4"><MoreHorizontal className="w-5 h-5 text-slate-400" /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidePanel isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Register New Service Agent">
        <div className="p-6 space-y-8">
          <label className="block cursor-pointer text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:border-blue-400 transition-colors">
            <input type="file" className="hidden" onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setPhoto(URL.createObjectURL(e.target.files[0]));
              }
            }} />
            {photo ? (
              <img src={photo} className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-white shadow-sm" alt="Preview" />
            ) : (
              <div className="w-24 h-24 mx-auto bg-white rounded-full mb-4 flex items-center justify-center border-2 border-slate-100 shadow-sm">
                  <Car className="w-10 h-10 text-slate-400" />
              </div>
            )}
            <p className="text-sm font-medium text-blue-600 mt-2">Upload Agent Photo</p>
          </label>
          
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value="AGT1001" readOnly placeholder="Agent ID" className="w-full p-4 bg-slate-100 border border-slate-200 rounded-xl" />
                <input type="text" placeholder="Employee Code" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <input type="text" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" />
                <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="service_agent">Service Agent</option>
                      <option value="supervisor">Supervisor</option>
                  </select>
                  <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
              </select>
              <input type="text" placeholder="User ID" value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" />
              <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" />
              
              <div className="relative">
                <button onClick={() => setIsSkillsOpen(!isSkillsOpen)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-left flex justify-between items-center">
                    <span className={selectedSkills.length === 0 ? 'text-slate-400' : 'text-slate-900'}>
                        {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'Select Skills'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {isSkillsOpen && (
                    <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                        {AVAILABLE_SKILLS.filter(s => !selectedSkills.includes(s)).map(s => (
                            <button key={s} onClick={() => { setSelectedSkills([...selectedSkills, s]); setIsSkillsOpen(false); }} className="w-full p-3 text-left hover:bg-blue-50 text-sm">
                                {s}
                            </button>
                        ))}
                    </div>
                )}
              </div>
              
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">Upload Documents</div>
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="font-medium text-slate-700">Active Status</span>
                <input type="checkbox" className="w-6 h-6" defaultChecked />
              </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button onClick={() => setIsDrawerOpen(false)} className="flex-1 p-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 p-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-200">Register Agent</button>
          </div>
        </div>
      </SlidePanel>
    </div>
  );
}

