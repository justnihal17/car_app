import { useState, useEffect } from 'react';
import { Car, UserCheck, UserMinus, UserX, Clock, Star, Plus, Download, Search, Filter, MoreHorizontal, RefreshCw, Briefcase, FileText, ChevronDown, X, Trash2, Edit2 } from 'lucide-react';
import { AnalyticsCard } from '../common/AnalyticsCard';
import { SlidePanel } from '../common/SlidePanel';
import { StatusBadge } from '../StatusBadge';
import { motion } from 'motion/react';

const AGENTS = [
  { id: 'A001', name: 'John Captain', email: 'john@cafu.com', phone: '+1234567890', area: 'Downtown', vehicle: 'Van-01', jobs: 12, rating: 4.8, status: 'Available' },
  { id: 'A002', name: 'Jane Driver', email: 'jane@cafu.com', phone: '+1987654321', area: 'Marina', vehicle: 'Car-05', jobs: 8, rating: 4.5, status: 'Busy' },
];

const AVAILABLE_SKILLS = ["Car Wash", "Oil Change", "Battery Replacement", "Tyre Change", "Fuel Delivery", "Jump Start", "Engine Check", "Car Cleaning"];

import api from '../../api/axios';
import toast from 'react-hot-toast';

export function AgentWorkspace({ onAgentSelect }: { onAgentSelect: (id: string) => void }) {
  const [agentsList, setAgentsList] = useState<any[]>([]);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/agent/agent');
      const mapped = response.data.data.map((agent: any) => ({
        id: agent._id,
        name: `${agent.firstName} ${agent.lastName}`,
        email: agent.email,
        phone: agent.phone,
        area: agent.city || 'N/A',
        vehicle: agent.role === 'service_agent' ? 'Service' : 'Supervisor',
        jobs: 0,
        rating: 5.0,
        status: agent.blocked ? 'Blocked' : (agent.active ? 'Available' : 'Inactive'),
        blocked: agent.blocked,
        ...agent // keep raw data for edit
      }));
      setAgentsList(mapped);
    } catch (error) {
      toast.error("Failed to load agents list");
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState({
      fullName: '', email: '', phone: '', employeeCode: '', role: 'service_agent', gender: '', userId: '', password: '', city: 'Delhi', country: 'India', joiningDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async () => {
      try {
        const nameParts = formData.fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const payload = {
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          ...(formData.password ? { password: formData.password } : {}), // only include password if it was typed, otherwise don't overwrite
          gender: formData.gender,
          city: formData.city,
          country: formData.country,
          role: formData.role,
          joiningDate: formData.joiningDate,
          skills: selectedSkills,
          active: true
        };

        if (editingAgentId) {
          const response = await api.put(`/agent/agent/${editingAgentId}`, payload);
          toast.success(response.data?.message || 'Agent updated successfully');
        } else {
          // If no password provided during create, use default
          if (!payload.password) payload.password = "Agent@123";
          const response = await api.post('/agent/agent/register', payload);
          toast.success(response.data?.message || 'Agent registered successfully');
        }
        
        setIsDrawerOpen(false);
        setEditingAgentId(null);
        fetchAgents(); // Refresh list after create/edit
      } catch (error: any) {
        toast.error(error.response?.data?.message || (editingAgentId ? 'Failed to update agent' : 'Failed to register agent'));
        console.error(editingAgentId ? 'Update failed:' : 'Registration failed:', error);
      }
  };

  const handleEdit = (e: React.MouseEvent, agent: any) => {
    e.stopPropagation();
    setEditingAgentId(agent.id);
    
    // Simulate setting data. If agent data structure is different, map accordingly
    setFormData({
        fullName: agent.name || '',
        email: agent.email || '',
        phone: agent.phone || '',
        employeeCode: '',
        role: 'service_agent',
        gender: '',
        userId: '',
        password: '',
        city: 'Delhi',
        country: 'India',
        joiningDate: new Date().toISOString().split('T')[0]
    });
    setPhoto(agent.profileImage || null);
    setSelectedSkills(agent.skills || []);
    setIsDrawerOpen(true);
  };

  const openRegister = () => {
    setEditingAgentId(null);
    setFormData({
        fullName: '', email: '', phone: '', employeeCode: '', role: 'service_agent', gender: '', userId: '', password: '', city: 'Delhi', country: 'India', joiningDate: new Date().toISOString().split('T')[0]
    });
    setPhoto(null);
    setSelectedSkills([]);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`/agent/agent/${id}`);
        toast.success("Agent deleted successfully");
        setAgentsList(agentsList.filter(a => a.id !== id));
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete agent");
      }
    }
  };

  const handleBlockToggle = async (e: React.MouseEvent, id: string, isBlocked: boolean) => {
    e.stopPropagation();
    try {
      await api.put(`/agent/agent/${id}`, { blocked: !isBlocked });
      toast.success(isBlocked ? "Agent unblocked successfully" : "Agent blocked successfully");
      setAgentsList(agentsList.map(a => a.id === id ? { ...a, blocked: !isBlocked } : a));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update agent status");
    }
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
          <button onClick={openRegister} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-all shadow-lg shadow-blue-200">
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
            {agentsList.map(agent => (
              <motion.tr key={agent.id} whileHover={{ backgroundColor: '#f8fafc' }} className="cursor-pointer" onClick={() => onAgentSelect(agent.id)}>
                <td className="p-4 font-medium text-slate-900">{agent.name}</td>
                <td className="p-4 text-slate-600">{agent.email}<br/>{agent.phone}</td>
                <td className="p-4 text-slate-600">{agent.area}<br/>{agent.vehicle}</td>
                <td className="p-4 text-slate-600">{agent.jobs}</td>
                <td className="p-4 text-slate-600">{agent.rating}</td>
                <td className="p-4"><StatusBadge status={agent.status as any} /></td>
                <td className="p-4 flex gap-2 items-center">
                  <button onClick={(e) => handleEdit(e, agent)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Agent">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={(e) => handleBlockToggle(e, agent.id, agent.blocked || false)} className={`p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors ${agent.blocked ? 'hover:text-green-500 text-red-500' : 'hover:text-amber-500'}`} title={agent.blocked ? "Unblock Agent" : "Block Agent"}>
                    {agent.blocked ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(agent.id, agent.name); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Agent">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <MoreHorizontal className="w-5 h-5 text-slate-400" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidePanel isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editingAgentId ? "Edit Service Agent" : "Register New Service Agent"}>
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
              <input type="text" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" />
                <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl ${!formData.gender ? 'text-slate-500' : 'text-slate-900'}`}>
                      <option value="" disabled>Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                  </select>
                  <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
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
            <button onClick={handleSubmit} className="flex-1 p-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-200">{editingAgentId ? "Update Agent" : "Register Agent"}</button>
          </div>
        </div>
      </SlidePanel>
    </div>
  );
}

