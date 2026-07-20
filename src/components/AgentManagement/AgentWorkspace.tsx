import { useState, useEffect, useRef } from 'react';
import { Car, UserCheck, UserMinus, UserX, Clock, Star, Plus, Download, Search, Filter, MoreHorizontal, RefreshCw, Briefcase, FileText, ChevronDown, X, Trash2, Edit2, Eye, EyeOff, Upload, Save, Check, ChevronRight, Sparkles, User } from 'lucide-react';
import { AnalyticsCard } from '../common/AnalyticsCard';
import { SlidePanel } from '../common/SlidePanel';
import { StatusBadge } from '../StatusBadge';
import { motion } from 'motion/react';

const AGENTS = [
  { id: 'A001', name: 'John Captain', email: 'john@stylein.com', phone: '+1234567890', area: 'Downtown', vehicle: 'Van-01', jobs: 12, rating: 4.8, status: 'Available' },
  { id: 'A002', name: 'Jane Driver', email: 'jane@stylein.com', phone: '+1987654321', area: 'Marina', vehicle: 'Car-05', jobs: 8, rating: 4.5, status: 'Busy' },
];

const AVAILABLE_SKILLS = ["Car Wash", "Oil Change", "Battery Replacement", "Tyre Change", "Fuel Delivery", "Jump Start", "Engine Check", "Car Cleaning"];

import api from '../../api/axios';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';

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

  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  const fetchSkills = async () => {
    try {
      const response = await api.get('/master/skill');
      if (response.data?.success) {
        setAvailableSkills(response.data.data.map((s: any) => s.name));
      }
    } catch (e) {
      console.error("Failed to fetch skills from master", e);
      setAvailableSkills(["Car Wash", "Oil Change", "Battery Replacement", "Tyre Change", "Fuel Delivery", "Jump Start", "Engine Check", "Car Cleaning"]);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchSkills();
  }, []);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"register" | "view" | "edit">("register");
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string, name: string}>({isOpen: false, id: '', name: ''});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const genderDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(e.target as Node)) {
        setIsGenderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [formData, setFormData] = useState({
      fullName: '', email: '', phone: '', employeeCode: '', role: 'service_agent', gender: '', userId: '', password: '', confirmPassword: '', city: 'Delhi', country: 'India', joiningDate: new Date().toISOString().split('T')[0]
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
      setDrawerMode("edit");
      setEditingAgentId(agent.id);
      setFormData({
          fullName: agent.name || '',
          email: agent.email || '',
          phone: agent.phone || '',
          employeeCode: agent.employeeCode || '',
          role: agent.role || 'service_agent',
          gender: agent.gender || '',
          userId: agent.userId || '',
          password: '',
          confirmPassword: '',
          city: agent.city || 'Delhi',
          country: agent.country || 'India',
          joiningDate: agent.joiningDate ? new Date(agent.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
      // setPhoto(agent.profileImage || null);
      setSelectedSkills(agent.skills || []);
      setIsDrawerOpen(true);
  };

  const handleViewDrawer = (e: React.MouseEvent, agent: any) => {
      e.stopPropagation();
      setDrawerMode("view");
      setEditingAgentId(agent.id);
      setFormData({
          fullName: agent.name || '',
          email: agent.email || '',
          phone: agent.phone || '',
          employeeCode: agent.employeeCode || '',
          role: agent.role || 'service_agent',
          gender: agent.gender || '',
          userId: agent.userId || '',
          password: '',
          confirmPassword: '',
          city: agent.city || 'Delhi',
          country: agent.country || 'India',
          joiningDate: agent.joiningDate ? new Date(agent.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
      // setPhoto(agent.profileImage || null);
      setSelectedSkills(agent.skills || []);
      setIsDrawerOpen(true);
  };

  const openRegister = () => {
    setDrawerMode("register");
    setEditingAgentId(null);
    setFormData({
        fullName: '', email: '', phone: '', employeeCode: '', role: 'service_agent', gender: '', userId: '', password: '', confirmPassword: '', city: 'Delhi', country: 'India', joiningDate: new Date().toISOString().split('T')[0]
    });
    setPhoto(null);
    setSelectedSkills([]);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/agent/agent/${deleteModal.id}`);
      toast.success("Agent deleted successfully");
      setAgentsList(agentsList.filter(a => a.id !== deleteModal.id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete agent");
    } finally {
      setDeleteModal({ isOpen: false, id: '', name: '' });
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
  const getInitials = (name: string) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-red-600 to-red-600 shadow-blue-200/50',
      'from-red-600 to-purple-600 shadow-indigo-200/50',
      'from-emerald-600 to-teal-600 shadow-emerald-200/50',
      'from-amber-500 to-orange-600 shadow-amber-200/50',
      'from-rose-600 to-pink-600 shadow-rose-200/50'
    ];
    let sum = 0;
    for (let i = 0; i < (name || '').length; i++) {
      sum += (name || '').charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  const filteredAgents = agentsList.filter(a => 
    (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.phone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto bg-slate-50/60 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Dashboard</span> 
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
        <span>Profile Management</span> 
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
        <span className="text-red-600 font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Agent Management
        </span>
      </div>

      {/* Hero Header */}
      <div className="bg-white/80 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Agent Management</h2>
          <p className="text-slate-500 mt-1 text-sm">Control service personnel, monitor ratings, and track job assignments.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={openRegister} 
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Register Agent
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export
          </button>
          <button onClick={fetchAgents} className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid (Matching SubAdmin & User Card Sizes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Agents', value: agentsList.length, icon: Car, color: 'text-red-600 bg-red-50 border-red-100', bgGrad: 'from-red-50/50 via-white to-white', sub: 'Accounts' },
          { label: 'Available', value: agentsList.filter(a => a.status === 'Available').length, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', bgGrad: 'from-emerald-50/50 via-white to-white', sub: 'On Duty' },
          { label: 'Busy', value: agentsList.filter(a => a.status === 'Busy').length, icon: Briefcase, color: 'text-red-600 bg-red-50 border-indigo-100', bgGrad: 'from-red-50/50 via-white to-white', sub: 'Assigned' },
          { label: 'Inactive', value: agentsList.filter(a => a.status === 'Inactive').length, icon: UserMinus, color: 'text-amber-600 bg-amber-50 border-amber-100', bgGrad: 'from-amber-50/50 via-white to-white', sub: 'Off-line' },
          { label: 'Blocked', value: agentsList.filter(a => a.blocked).length, icon: UserX, color: 'text-rose-600 bg-rose-50 border-rose-100', bgGrad: 'from-rose-50/50 via-white to-white', sub: 'Restricted' },
          { label: 'Top Rated', value: '4.8', icon: Star, color: 'text-purple-600 bg-purple-50 border-purple-100', bgGrad: 'from-purple-50/50 via-white to-white', sub: 'Avg Rating' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className={`bg-gradient-to-br ${card.bgGrad} p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 tracking-tight group-hover:text-slate-800 transition-colors uppercase">{card.label}</span>
                <div className={`p-2 rounded-xl border ${card.color} transition-all duration-300 group-hover:scale-110 shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1.5 bg-slate-200/60 rounded-2xl w-fit border border-slate-300/40 shadow-inner backdrop-blur-md">
        {['Overview', 'Available Agents', 'Busy Agents', 'Off-line', 'Performance'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === tab 
                ? 'bg-white text-red-600 shadow-sm border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Title & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Agents</h3>
              <p className="text-xs text-slate-500 mt-0.5">List of recently registered service agents and operational staff</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 shadow-2xs">
              {filteredAgents.length} Agents
            </span>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search agent name, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-xs" 
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50/80 backdrop-blur-sm text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-4 py-4 pl-6 whitespace-nowrap w-[20%]">Agent</th>
                <th className="px-4 py-4 whitespace-nowrap w-[25%]">Contact / Email</th>
                <th className="px-4 py-4 whitespace-nowrap w-[15%]">Area / Role</th>
                <th className="px-4 py-4 whitespace-nowrap w-[10%]">Jobs</th>
                <th className="px-4 py-4 whitespace-nowrap w-[10%]">Rating</th>
                <th className="px-4 py-4 whitespace-nowrap w-[10%]">Status</th>
                <th className="px-4 py-4 pr-6 text-right whitespace-nowrap w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">No service agents found</td>
                </tr>
              ) : filteredAgents.map(agent => (
                <tr key={agent.id} className="hover:bg-red-50/20 transition-all duration-150 group cursor-pointer" onClick={() => onAgentSelect(agent.id)}>
                  <td className="px-4 py-4.5 pl-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(agent.name)} flex items-center justify-center text-white text-[11px] font-bold shadow-sm ring-2 ring-slate-100 border border-white/50`}>
                        {getInitials(agent.name)}
                      </div>
                      <span className="font-medium text-slate-900 text-sm tracking-tight whitespace-nowrap">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4.5 whitespace-nowrap">
                    <div className="text-xs">
                      <span className="font-medium text-slate-600 block">{agent.email}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{agent.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4.5 text-slate-600 font-semibold text-xs whitespace-nowrap">
                    <div>
                      <span>{agent.area}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">{agent.vehicle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4.5 whitespace-nowrap">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
                      {agent.jobs}
                    </span>
                  </td>
                  <td className="px-4 py-4.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {agent.rating}
                    </span>
                  </td>
                  <td className="px-4 py-4.5 whitespace-nowrap">
                    <StatusBadge status={agent.status as any} />
                  </td>
                  <td className="px-4 py-4.5 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={(e) => handleViewDrawer(e, agent)} className="text-blue-600 hover:text-blue-800 p-1 transition-transform hover:scale-110" title="View Details"><Eye className="w-4 h-4"/></button>
                      <button onClick={(e) => handleEdit(e, agent)} className="text-emerald-600 hover:text-emerald-800 p-1 transition-transform hover:scale-110" title="Edit Agent"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={(e) => handleDeleteClick(e, agent.id, agent.name)} className="text-red-600 hover:text-red-800 p-1 transition-transform hover:scale-110" title="Delete Agent"><Trash2 className="w-4 h-4"/></button>
                      {agent.blocked ? (
                        <button onClick={(e) => handleBlockToggle(e, agent.id, true)} className="text-emerald-600 hover:text-emerald-900 p-1 transition-transform hover:scale-110" title="Unblock Agent"><UserCheck className="w-4 h-4"/></button>
                      ) : (
                        <button onClick={(e) => handleBlockToggle(e, agent.id, false)} className="text-slate-600 hover:text-slate-900 p-1 transition-transform hover:scale-110" title="Block Agent"><UserX className="w-4 h-4"/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-all duration-300">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200/80 animate-in slide-in-from-right duration-300">
            {/* Drawer Header with Project Blue Accent */}
            <div className="px-6 py-5 bg-gradient-to-r from-red-600 via-red-700 to-red-700 text-white flex items-center justify-between border-b border-red-500/30 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/15 border border-white/20 rounded-xl text-white shadow-inner backdrop-blur-md">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white capitalize">
                    {drawerMode === "view" ? "View Service Agent" : (drawerMode === "edit" ? "Edit Service Agent" : "Register New Service Agent")}
                  </h3>
                  <p className="text-xs text-red-100/90 font-medium">Configure agent profile, skills & security credentials</p>
                </div>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-xl text-red-100 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6 custom-scrollbar flex flex-col justify-between">
              <div className="space-y-6">
                {/* Profile Image Section */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Profile Photo</label>
                  <label className={`border-2 border-dashed border-blue-200 hover:border-red-500 rounded-2xl p-5 flex flex-col items-center justify-center bg-gradient-to-b from-red-50/40 via-red-50/10 to-transparent transition-all group shadow-2xs min-h-[130px] ${drawerMode === "view" ? 'cursor-default' : 'cursor-pointer hover:shadow-md hover:shadow-red-500/5'}`}>
                    <input type="file" disabled={drawerMode === "view"} className="hidden" onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImgError(false);
                        setPhoto(e.target.files[0]);
                      }
                    }} />
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200/80 shadow-md mb-2.5 overflow-hidden group-hover:scale-105 transition-all relative">
                      {photo && !imgError ? (
                        <img 
                          src={photo ? URL.createObjectURL(photo) : undefined} 
                          className="w-full h-full object-cover" 
                          alt="Agent Photo" 
                          onError={() => setImgError(true)} 
                        />
                      ) : (
                        <Car className="w-7 h-7 text-red-500" />
                      )}
                    </div>
                    {drawerMode !== "view" && (
                      <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Upload Agent Photo
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium mt-0.5">PNG, JPG or WEBP up to 5MB</span>
                  </label>
                </div>
                
                {/* Basic Info Section */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 pt-2 pb-1">
                    <div className="w-1.5 h-4 bg-red-600 rounded-full" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Basic Information</h4>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                    <input type="text" placeholder="Enter agent full name" disabled={drawerMode === "view"} value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                      <input type="email" placeholder="agent@stylein.com" disabled={drawerMode === "view"} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                      <input type="tel" placeholder="+971 50 000 0000" disabled={drawerMode === "view"} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative" ref={genderDropdownRef}>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
                      <button 
                        type="button"
                        disabled={drawerMode === "view"}
                        onClick={() => drawerMode !== "view" && setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                        className={`w-full px-3.5 py-2.5 bg-slate-50/60 border rounded-xl text-xs font-semibold flex items-center justify-between text-left transition-all shadow-2xs ${
                          isGenderDropdownOpen ? 'border-red-500 bg-white ring-4 ring-red-500/10' : 'border-slate-200'
                        } ${drawerMode === "view" ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <span className={formData.gender ? 'text-slate-900 font-bold' : 'text-slate-400 font-semibold'}>
                          {formData.gender || 'Select Gender'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isGenderDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
                      </button>

                      {isGenderDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                          {['Male', 'Female', 'Other'].map(g => {
                            const isSelected = formData.gender === g;
                            return (
                              <div
                                key={g}
                                onClick={() => {
                                  setFormData({ ...formData, gender: g });
                                  setIsGenderDropdownOpen(false);
                                }}
                                className={`px-3.5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between transition-colors ${
                                  isSelected 
                                    ? 'bg-red-50/80 text-red-600 font-black' 
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                <span>{g}</span>
                                {isSelected && <Check className="w-4 h-4 text-red-600" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Joining Date</label>
                      <input type="date" disabled={drawerMode === "view"} value={formData.joiningDate} onChange={(e) => setFormData({...formData, joiningDate: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs" />
                    </div>
                  </div>
                </div>

                {/* Security & Skills Section */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 pt-2 pb-1">
                    <div className="w-1.5 h-4 bg-red-600 rounded-full" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Security & Access</h4>
                  </div>
                  {drawerMode !== "view" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-3.5 py-2.5 pr-10 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition-colors">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Re-enter Password</label>
                        <input type="password" placeholder="••••••••" value={formData.confirmPassword || ''} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className={`w-full px-3.5 py-2.5 bg-slate-50/60 border rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 transition-all shadow-2xs ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-red-500 focus:ring-red-500/10'}`} />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Skills & Qualifications</label>
                    <div className="relative">
                      <button type="button" disabled={drawerMode === "view"} onClick={() => setIsSkillsOpen(!isSkillsOpen)} className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs text-left flex justify-between items-center disabled:opacity-60 cursor-pointer">
                        <span className={selectedSkills.length === 0 ? 'text-slate-400' : 'text-slate-900 font-bold'}>
                          {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'Select Skills'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                      {isSkillsOpen && (
                        <div className="absolute z-30 w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl mt-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                          {availableSkills.filter(s => !selectedSkills.includes(s)).map(s => (
                            <button type="button" key={s} onClick={() => { setSelectedSkills([...selectedSkills, s]); setIsSkillsOpen(false); }} className="w-full px-3.5 py-2.5 text-left hover:bg-red-50 text-xs font-bold text-slate-700 hover:text-red-600 rounded-xl transition-colors">
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center gap-3 mt-auto">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs">
                  {drawerMode === "view" ? "Close" : "Cancel"}
                </button>
                {drawerMode !== "view" && (
                  <button 
                    type="button" 
                    onClick={handleSubmit} 
                    disabled={!(formData.fullName?.trim() && formData.email?.trim() && formData.phone?.trim() && formData.gender?.trim() && (drawerMode === 'edit' || (Boolean(formData.password?.trim()) && formData.password === formData.confirmPassword)))}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
                  >
                    <Save className="w-4 h-4" /> {drawerMode === "edit" ? "Update Agent" : "Register Agent"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        name={deleteModal.name}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
