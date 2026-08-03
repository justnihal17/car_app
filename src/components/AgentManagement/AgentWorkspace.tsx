import { useState, useEffect, useRef } from 'react';
import { Car, UserCheck, UserMinus, UserX, Clock, Star, Plus, Download, Search, Filter, MoreHorizontal, RefreshCw, Briefcase, FileText, ChevronDown, ChevronLeft, X, Trash2, Edit2, Eye, EyeOff, Upload, Save, Check, ChevronRight, Sparkles, User, Copy } from 'lucide-react';
import { AnalyticsCard } from '../common/AnalyticsCard';
import { SlidePanel } from '../common/SlidePanel';
import { StatusBadge } from '../StatusBadge';
import { motion } from 'motion/react';

const AGENTS = [
  { id: 'A001', name: 'John Captain', email: 'john@stylein.com', phone: '+1234567890', area: 'Downtown', vehicle: 'Van-01', jobs: 12, rating: 4.8, status: 'Available' },
  { id: 'A002', name: 'Jane Driver', email: 'jane@stylein.com', phone: '+1987654321', area: 'Marina', vehicle: 'Car-05', jobs: 8, rating: 4.5, status: 'Busy' },
];

import api from '../../api/axios';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { ConfirmationModal, ActionType } from '../ConfirmationModal';
import { uploadImage } from '../../services/uploadService';
import { getCompactDrawerClass, SectionActiveToggle } from '../SubAdminManagement/utils/subAdminFormUtils';
import { getLoggedInAdminName } from '../SubAdminManagement/subAdminDrawerUtils';

export function AgentWorkspace({ onAgentSelect }: { onAgentSelect: (id: string) => void }) {
  const loggedInAdminName = getLoggedInAdminName();
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [actionModal, setActionModal] = useState<{isOpen: boolean, actionType: ActionType, agent: any}>({isOpen: false, actionType: 'view', agent: null});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showRowPasswords, setShowRowPasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionMenuId && !(event.target as HTMLElement).closest('.action-menu-container')) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenuId]);

  const toggleRowPassword = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setShowRowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPassword = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Password copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/agent/agent');
      const rawAgents = Array.isArray(response.data.data) ? response.data.data : (response.data.data?.agents || []);
      setAgentsList(rawAgents.map((a: any, idx: number) => {
        const autoAgentId = a.agentId || a.employeeCode || `AGT-${1001 + idx}`;
        const autoPassword = a.plainPassword || a.password || 'Agent@123';
        const formattedRole = a.role === 'service_agent' ? 'Service Agent' : (a.role || 'Service Agent');
        return {
          ...a,
          id: a._id,
          agentId: autoAgentId,
          name: a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Agent',
          phone: a.phone || '-',
          email: a.email || '-',
          emirate: a.emirate || a.state || 'Dubai',
          city: a.city || 'Dubai',
          password: autoPassword,
          role: formattedRole,
          gender: a.gender || 'Male',
          joiningDate: a.joiningDate ? new Date(a.joiningDate).toISOString().split('T')[0] : (a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : '-'),
          skills: Array.isArray(a.skills) && a.skills.length > 0 ? a.skills.join(', ') : (typeof a.skills === 'string' ? a.skills : 'Car Wash'),
          area: a.city || 'Delhi',
          vehicle: a.vehicle || 'Service Van',
          jobs: a.jobsCompleted || 0,
          rating: a.rating || 4.5,
          status: a.blocked ? 'Blocked' : (a.active ? 'Available' : 'Inactive')
        };
      }));
    } catch (error) {
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"register" | "view" | "edit">("register");
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<any>(null);
  const [imgError, setImgError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isEmirateOpen, setIsEmirateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  const DEFAULT_EMIRATES = [
    'Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain'
  ];

  const EMIRATE_CITIES_MAP: Record<string, string[]> = {
    'Abu Dhabi': ['Abu Dhabi', 'Al Ain', 'Al Dhafra', 'Ruwais'],
    'Ajman': ['Ajman', 'Al Manama', 'Masfout'],
    'Dubai': ['Dubai', 'Jebel Ali', 'Hatta'],
    'Fujairah': ['Fujairah', 'Al Aqah', 'Al Bidyah', 'Dibba Al-Fujairah'],
    'Ras Al Khaimah': ['Ras Al Khaimah', 'Al Jazira Al Hamra', 'Al Rams', 'Digdaga'],
    'Sharjah': ['Sharjah', 'Al Hamriyah', 'Khor Fakkan', 'Kalba', 'Diba Al Hisn'],
    'Umm Al Quwain': ['Umm Al Quwain', 'Al Raas', 'Al Salamah', 'Falaj Al Mualla'],
  };

  const [availableEmirates, setAvailableEmirates] = useState<string[]>(DEFAULT_EMIRATES);
  const [cityMasterList, setCityMasterList] = useState<{ name: string; emirate: string }[]>([]);

  useEffect(() => {
    if (isDrawerOpen) {
      const fetchSkills = async () => {
        try {
          const response = await api.get('/master/skill/admin');
          const rawList = Array.isArray(response.data?.data)
            ? response.data.data
            : (Array.isArray(response.data) ? response.data : (response.data?.skills || response.data?.list || []));
          
          if (Array.isArray(rawList) && rawList.length > 0) {
            const names = rawList
              .map((item: any) => item.name || item.title || item.skillName || (typeof item === 'string' ? item : ''))
              .filter((name: string) => Boolean(name.trim()));
            if (names.length > 0) {
              setAvailableSkills(Array.from(new Set(names)));
            }
          }
        } catch (err) {
          console.warn('Failed to load skills:', err);
        }
      };

      const fetchEmiratesAndCities = async () => {
        try {
          const stateRes = await api.get('/master/state/admin').catch(() => api.get('/master/state'));
          const stateList = Array.isArray(stateRes.data?.data)
            ? stateRes.data.data
            : (Array.isArray(stateRes.data) ? stateRes.data : (stateRes.data?.states || stateRes.data?.list || []));

          if (Array.isArray(stateList) && stateList.length > 0) {
            const eNames = stateList
              .map((s: any) => s.name || s.title || s.stateName || (typeof s === 'string' ? s : ''))
              .filter((n: string) => Boolean(n.trim()));
            if (eNames.length > 0) {
              setAvailableEmirates(Array.from(new Set([...DEFAULT_EMIRATES, ...eNames])));
            }
          }
        } catch (e) {
          console.warn('Failed to load emirates:', e);
        }

        try {
          const cityRes = await api.get('/master/city/admin').catch(() => api.get('/master/city'));
          const cList = Array.isArray(cityRes.data?.data)
            ? cityRes.data.data
            : (Array.isArray(cityRes.data) ? cityRes.data : (cityRes.data?.cities || cityRes.data?.list || []));

          if (Array.isArray(cList) && cList.length > 0) {
            const mapped = cList.map((c: any) => {
              const cName = c.name || c.cityName || c.title || (typeof c === 'string' ? c : '');
              const cEmirate = typeof c.stateId === 'object' ? c.stateId?.name : (typeof c.state === 'object' ? c.state?.name : (c.stateName || c.emirateName || (typeof c.state === 'string' ? c.state : (typeof c.emirate === 'string' ? c.emirate : ''))));
              return { name: cName, emirate: cEmirate || '' };
            }).filter((c: any) => Boolean(c.name.trim()));

            setCityMasterList(mapped);
          }
        } catch (e) {
          console.warn('Failed to load cities:', e);
        }
      };

      fetchSkills();
      fetchEmiratesAndCities();
    }
  }, [isDrawerOpen]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
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
  const [formData, setFormData] = useState<Record<string, any>>({
      fullName: '', firstName: '', lastName: '', email: '', phone: '', employeeCode: '', gender: '', userId: '', password: '', confirmPassword: '', emirate: 'Dubai', city: 'Dubai', joiningDate: new Date().toISOString().split('T')[0], active: true
  });

  const getCitiesForEmirate = (selectedEmirate: string) => {
    if (!selectedEmirate) return [];
    
    const matched = cityMasterList
      .filter(c => c.emirate && c.emirate.toLowerCase().trim() === selectedEmirate.toLowerCase().trim())
      .map(c => c.name);

    if (matched.length > 0) {
      return Array.from(new Set(matched));
    }

    const fallbackKey = Object.keys(EMIRATE_CITIES_MAP).find(k => k.toLowerCase().trim() === selectedEmirate.toLowerCase().trim());
    if (fallbackKey) {
      return EMIRATE_CITIES_MAP[fallbackKey];
    }

    return [selectedEmirate];
  };

  const handleEmirateChange = (newEmirate: string) => {
    const cities = getCitiesForEmirate(newEmirate);
    const defaultCity = cities[0] || newEmirate;
    setFormData(prev => ({
      ...prev,
      emirate: newEmirate,
      city: defaultCity,
    }));
  };

  const handleSubmit = async () => {
      if (loading) return;
      setLoading(true);

      let finalProfileUrl = (typeof photo === 'string' ? photo : null) || '';

      if (selectedImageFile) {
        setStatusMessage('Uploading Image...');
        try {
          finalProfileUrl = await uploadImage(selectedImageFile);
        } catch (uploadErr: any) {
          setLoading(false);
          setStatusMessage('');
          const errText = uploadErr.message || 'Image upload failed';
          toast.error(errText);
          return; // STOP! DO NOT CALL CREATE/EDIT API
        }
      }

      setStatusMessage('Saving Data...');

      try {
        const firstName = (formData.firstName || '').trim();
        const lastName = (formData.lastName || '').trim();

        const payload: any = {
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          ...(formData.password ? { password: formData.password } : {}),
          gender: formData.gender,
          city: formData.city,
          country: formData.country,
          role: formData.role,
          joiningDate: formData.joiningDate,
          skills: selectedSkills,
          active: true,
          ...(finalProfileUrl ? { profileImage: finalProfileUrl, profileUrl: finalProfileUrl, imageUrl: finalProfileUrl } : {})
        };

        if (editingAgentId) {
          const response = await api.put(`/agent/agent/${editingAgentId}`, payload);
          toast.success(response.data?.message || 'Agent updated successfully');
        } else {
          if (!payload.password) payload.password = "Agent@123";
          let response;
          try {
            response = await api.post('/agent/agent/register', payload);
          } catch (e: any) {
            if (e.response?.data?.message === "Customer not found" || e.response?.status === 404) {
              response = await api.post('/agent/register', payload);
            } else {
              throw e;
            }
          }
          toast.success(response.data?.message || 'Agent registered successfully');
        }
        
        setIsDrawerOpen(false);
        setEditingAgentId(null);
        setSelectedImageFile(null);
        setPhotoPreview(null);
        fetchAgents();
      } catch (error: any) {
        toast.error(error.response?.data?.message || (editingAgentId ? 'Failed to update agent' : 'Failed to register agent'));
        console.error(editingAgentId ? 'Update failed:' : 'Registration failed:', error);
      } finally {
        setLoading(false);
        setStatusMessage('');
      }
  };

  const parseSkillsArray = (skills: any): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      return skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const handleEdit = (e: React.MouseEvent, agent: any) => {
      e.stopPropagation();
      setDrawerMode("edit");
      setEditingAgentId(agent.id);
      const editFirstName = agent.firstName || (agent.name ? agent.name.split(' ')[0] : '');
      const editLastName = agent.lastName || (agent.name ? agent.name.split(' ').slice(1).join(' ') : '');
      setFormData({
          fullName: agent.name || '',
          firstName: editFirstName,
          lastName: editLastName,
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
      setPhoto(agent.profileImage || agent.profileUrl || agent.imageUrl || null);
      setPhotoPreview(agent.profileImage || agent.profileUrl || agent.imageUrl || null);
      setSelectedSkills(parseSkillsArray(agent.skills));
      setIsDrawerOpen(true);
  };

  const handleViewDrawer = (e: React.MouseEvent, agent: any) => {
      e?.stopPropagation();
      setDrawerMode("view");
      setEditingAgentId(agent.id);
      const viewFirstName = agent.firstName || (agent.name ? agent.name.split(' ')[0] : '');
      const viewLastName = agent.lastName || (agent.name ? agent.name.split(' ').slice(1).join(' ') : '');
      setFormData({
          fullName: agent.name || '',
          firstName: viewFirstName,
          lastName: viewLastName,
          email: agent.email || '',
          phone: agent.phone || '',
          employeeCode: agent.employeeCode || '',
          role: agent.role || 'service_agent',
          gender: agent.gender || '',
          userId: agent.userId || '',
          password: agent.password || '',
          confirmPassword: '',
          emirate: agent.emirate || agent.state || 'Dubai',
          city: agent.city || 'Dubai',
          joiningDate: agent.joiningDate ? new Date(agent.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
      setPhoto(agent.profileImage || agent.profileUrl || agent.imageUrl || null);
      setPhotoPreview(agent.profileImage || agent.profileUrl || agent.imageUrl || null);
      setSelectedSkills(parseSkillsArray(agent.skills));
      setIsDrawerOpen(true);
  };

  const openRegister = () => {
    setDrawerMode("register");
    setEditingAgentId(null);
    setFormData({
        fullName: '', firstName: '', lastName: '', email: '', phone: '', employeeCode: '', gender: '', userId: '', password: '', confirmPassword: '', emirate: 'Dubai', city: 'Dubai', joiningDate: new Date().toISOString().split('T')[0]
    });
    setPhoto(null);
    setPhotoPreview(null);
    setSelectedSkills([]);
    setIsDrawerOpen(true);
  };

  const handleAgentActionConfirm = async () => {
    const { actionType, agent } = actionModal;
    if (!agent) return;

    if (actionType === 'view') {
      setActionModal({ isOpen: false, actionType: 'view', agent: null });
      handleViewDrawer(null as any, agent);
    } else if (actionType === 'edit') {
      setActionModal({ isOpen: false, actionType: 'edit', agent: null });
      handleEdit(null as any, agent);
    } else if (actionType === 'delete') {
      try {
        await api.delete(`/agent/agent/${agent.id}`);
        toast.success("Agent deleted successfully");
        setAgentsList(agentsList.filter(a => a.id !== agent.id));
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete agent");
      } finally {
        setActionModal({ isOpen: false, actionType: 'delete', agent: null });
      }
    } else if (actionType === 'block' || actionType === 'unblock') {
      const isBlocked = agent.blocked;
      try {
        await api.put(`/agent/agent/${agent.id}`, { blocked: !isBlocked });
        toast.success(isBlocked ? "Agent unblocked successfully" : "Agent blocked successfully");
        setAgentsList(agentsList.map(a => a.id === agent.id ? { ...a, blocked: !isBlocked } : a));
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update agent status");
      } finally {
        setActionModal({ isOpen: false, actionType: 'block', agent: null });
      }
    }
  };

  const handleToggleAgentStatus = async (agent: any) => {
    const isCurrentlyActive = agent.active !== false;
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Available';
    try {
      await api.put(`/agent/agent/${agent.id}`, { active: !isCurrentlyActive });
      toast.success(`Agent status updated to ${newStatus}`);
      setAgentsList(prev => prev.map(item => item.id === agent.id ? { ...item, active: !isCurrentlyActive, status: item.blocked ? 'Blocked' : (isCurrentlyActive ? 'Inactive' : 'Available') } : item));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update agent status');
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

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const filteredAgents = agentsList.filter(a => {
    const matchesSearch = 
      (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.phone || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (!selectedCard || selectedCard === 'Total Agents' || selectedCard === 'AGENTS') return true;
    if (selectedCard === 'Available' || selectedCard === 'AVAILABLE') return a.status === 'Available';
    if (selectedCard === 'Busy' || selectedCard === 'BUSY') return a.status === 'Busy';
    if (selectedCard === 'Inactive' || selectedCard === 'INACTIVE' || selectedCard === 'DEACTIVATED') return a.status === 'Inactive';
    if (selectedCard === 'Blocked' || selectedCard === 'BLOCKED') return Boolean(a.blocked);
    if (selectedCard === 'Top Rated' || selectedCard === 'TOP RATED') return (a.rating || 0) >= 4.5;

    return true;
  });

  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const paginatedAgents = filteredAgents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full bg-slate-50/60 min-h-screen">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Dashboard</span> 
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
          <span>Profile Management</span> 
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
          <span className="text-red-600 font-bold">
            Agent Management
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={openRegister} 
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Create
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold rounded-xl shadow-xs transition-all hover:border-slate-300 text-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[105px] bg-slate-200/70 animate-pulse rounded-2xl p-5 border border-slate-200/50 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-slate-300 rounded" />
                <div className="w-8 h-8 bg-slate-300 rounded-xl" />
              </div>
              <div className="h-6 w-12 bg-slate-300 rounded mt-2" />
            </div>
          ))
        ) : (
          [
            { label: 'AGENTS', value: agentsList.length, icon: Car, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Accounts' },
            { label: 'AVAILABLE', value: agentsList.filter(a => a.status === 'Available').length, icon: UserCheck, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'On Duty' },
            { label: 'BUSY', value: agentsList.filter(a => a.status === 'Busy').length, icon: Briefcase, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Assigned' },
            { label: 'DEACTIVATED', value: agentsList.filter(a => a.status === 'Inactive').length, icon: UserMinus, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Off-line' },
            { label: 'BLOCKED', value: agentsList.filter(a => a.blocked).length, icon: UserX, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Restricted' },
            { label: 'TOP RATED', value: agentsList.filter(a => Number(a.rating || 0) > 4).length, icon: Star, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Rating > 4.0' },
          ].map((card, i) => {
            const Icon = card.icon;
            const isFocused = selectedCard === card.label;
            return (
              <div 
                key={i} 
                onClick={() => setSelectedCard(prev => prev === card.label ? null : card.label)}
                className={`bg-white p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 ${
                  isFocused 
                    ? `border border-slate-300 bg-white shadow-md` 
                    : 'border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold tracking-tight transition-colors uppercase ${isFocused ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-800'}`}>{card.label}</span>
                  <div className={`p-2 rounded-xl border ${card.color} transition-all duration-300 group-hover:scale-110 shadow-xs`}>
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.sub}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-4">

        {/* Title & Search Bar */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative w-full md:w-80 group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-lg text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-sm" 
              />
            </div>
            <button className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg shadow-sm transition-all text-sm shrink-0">
              Search
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-visible">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#FFF] backdrop-blur-sm text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-4 py-4 pl-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-xl w-[300px]">Agent Name</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px]">Role</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px]">Phone</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px]">Status</th>
                <th className="px-4 py-4 pr-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tr-xl w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4 pl-6"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-slate-200" /><div className="h-4 w-28 bg-slate-200 rounded" /></div></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4 pr-6"><div className="h-4 w-12 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">No service agents found</td>
                </tr>
              ) : paginatedAgents.map((agent, index) => (
                <tr key={agent.id} className="hover:bg-[#FEFEFE] transition-all duration-150 group cursor-pointer border-b border-slate-100 last:border-0" onClick={(e) => handleViewDrawer(e, agent)}>
                  <td className="px-4 py-4 pl-6 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(agent.name)} flex items-center justify-center text-white text-[11px] font-bold shadow-sm ring-2 ring-slate-100 border border-white/50 overflow-hidden relative`}>
                        {(agent.profileImage || agent.profileUrl || agent.imageUrl) ? (
                          <img 
                            src={agent.profileImage || agent.profileUrl || agent.imageUrl} 
                            alt={agent.name} 
                            className="w-full h-full object-cover absolute inset-0" 
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span>{getInitials(agent.name)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 text-[15px] tracking-tight whitespace-nowrap leading-tight">{agent.name}</span>
                        <span className="text-sm text-slate-400 mt-0.5">{agent.email || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-slate-600 text-sm">{agent.role || 'Service Agent'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-slate-600 text-sm font-mono">{agent.phone || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge status={agent.blocked ? 'Blocked' : (agent.active !== false ? 'Active' : 'Inactive')} />
                  </td>
                  <td className="px-4 py-4 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end relative action-menu-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenuId(openActionMenuId === agent.id ? null : agent.id);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                    {openActionMenuId === agent.id && (
                      <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-[99] animate-in fade-in zoom-in-95 duration-100 text-left ${index >= Math.max(0, paginatedAgents.length - 3) ? 'bottom-full mb-1 origin-bottom-right' : 'top-10 origin-top-right'}`}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleViewDrawer(e, agent); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-slate-500" /> View Details
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleEdit(e, agent); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500" /> Edit
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleToggleAgentStatus(agent); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          {agent.active !== false ? <UserX className="w-4 h-4 text-slate-500" /> : <UserCheck className="w-4 h-4 text-slate-500" />} 
                          {agent.active !== false ? 'Deactivate' : 'Activate'}
                        </button>
                        <div className="border-t border-slate-100 my-1"></div>
                        {agent.blocked ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'unblock', agent }); }} 
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <UserCheck className="w-4 h-4" /> Unblock
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'block', agent }); }} 
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <UserX className="w-4 h-4" /> Block
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'delete', agent }); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <div className="text-sm text-slate-500 font-medium">
                Showing <span className="text-slate-900 font-semibold">{filteredAgents.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAgents.length)}</span> of <span className="text-slate-900 font-semibold">{filteredAgents.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === page ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 transition-opacity duration-200 ease-out">
          <div className="bg-[#F8FAFC] w-full max-w-full md:max-w-2xl rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 ease-out">
            {/* Header - White, minimal, top accent */}
            <div className="px-6 py-4 bg-white flex items-center justify-between border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 shadow-sm">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900 capitalize leading-tight">
                    {(drawerMode === "view" || drawerMode === "edit")
                      ? (`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || "Edit Agent")
                      : "Create Agent"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {drawerMode === "view" ? 'View agent details.' : (drawerMode === "edit" ? 'Manage agent details and skills.' : 'Add a new agent to the system.')}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" aria-label="Close modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar relative pb-10">
              
              {/* Personal Information Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Personal Information</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Basic contact and profile details.</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-5">
                  {/* Profile Photo Horizontal Row */}
                  <div className="flex items-center gap-5 pb-2">
                    <div 
                      className="relative group shrink-0"
                      onClick={() => {
                        if (photoPreview || (photo && !imgError)) {
                          setShowImageModal(true);
                        } else if (drawerMode !== "view") {
                          fileInputRef.current?.click();
                        }
                      }}
                    >
                      <div className={`w-16 h-16 rounded-full border-2 border-slate-100 shadow-sm overflow-hidden bg-slate-50 flex items-center justify-center transition-all ${photoPreview || (photo && !imgError) ? 'cursor-pointer hover:scale-105' : (drawerMode !== "view" ? 'cursor-pointer hover:bg-slate-100' : '')} ${drawerMode === "view" ? '' : 'group-hover:border-red-100'}`}>
                        {(photoPreview || (photo && !imgError)) ? (
                          <img 
                            src={photoPreview || (typeof photo === 'string' ? photo : undefined)} 
                            className="w-full h-full object-cover" 
                            alt="Profile" 
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <User className="w-7 h-7 text-slate-300" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2 justify-center">
                      {drawerMode !== "view" && (
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Change Photo
                          </button>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 font-medium">PNG, JPG or WEBP · Maximum 5MB</p>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const localUrl = URL.createObjectURL(file);
                            setPhotoPreview(localUrl);
                            setImgError(false);
                            toast.loading('Uploading Image...', { id: 'imgUpload' });
                            try {
                              const uploadedUrl = await uploadImage(file);
                              toast.dismiss('imgUpload');
                              toast.success('Image uploaded successfully');
                              setPhoto(uploadedUrl);
                              setPhotoPreview(uploadedUrl);
                              setSelectedImageFile(null);
                            } catch (err: any) {
                              toast.dismiss('imgUpload');
                              toast.error(err.message || 'Image upload failed');
                              setSelectedImageFile(file);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="e.g. John"
                        value={formData.firstName || ''}
                        disabled={drawerMode === "view"}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={`w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="e.g. Doe"
                        value={formData.lastName || ''}
                        disabled={drawerMode === "view"}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={`w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        placeholder="e.g. agent@example.com"
                        value={formData.email || ''}
                        disabled={drawerMode === "view"}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        placeholder="e.g. +1 234 567 8900"
                        value={formData.phone || ''}
                        disabled={drawerMode === "view"}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Account Status</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Enable or disable this agent account.</p>
                  </div>
                  <SectionActiveToggle 
                    checked={formData.active !== undefined ? formData.active : true} 
                    onChange={v => setFormData({...formData, active: v})} 
                    disabled={drawerMode === "view"} 
                  />
                </div>
              </div>

              {/* Agent Details Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 shadow-sm">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Agent Details</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Role, location, and skills.</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender <span className="text-red-500">*</span></label>
                      <button 
                        type="button" 
                        disabled={drawerMode === "view"} 
                        onClick={() => { setIsGenderOpen(!isGenderOpen); setIsEmirateOpen(false); setIsCityOpen(false); setIsSkillsOpen(false); }} 
                        className={`w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-left flex justify-between items-center transition-all ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50 text-slate-900' : 'cursor-pointer focus:border-red-500 focus:ring-1 focus:ring-red-500'}`}
                      >
                        <span className={!formData.gender ? 'text-slate-400' : 'text-slate-900 font-medium'}>
                          {formData.gender || 'Select Gender'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                      {isGenderOpen && (
                        <div className="absolute mt-1.5 z-30 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-y-auto custom-scrollbar p-1.5">
                          {['Male', 'Female', 'Other'].map(s => (
                            <button 
                              type="button" 
                              key={s} 
                              onClick={() => { setFormData({...formData, gender: s}); setIsGenderOpen(false); }} 
                              className="w-full px-3 py-2 text-left hover:bg-red-50 text-sm font-medium text-slate-700 hover:text-red-600 rounded-lg transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password {drawerMode === "create" && <span className="text-red-500">*</span>}</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={formData.password || ''} 
                          onChange={(e) => drawerMode !== "view" && setFormData({...formData, password: e.target.value})} 
                          disabled={drawerMode === "view"}
                          className={`w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 transition-all pr-10 ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50' : 'focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'}`} 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Emirate <span className="text-red-500">*</span></label>
                      <button 
                        type="button" 
                        disabled={drawerMode === "view"} 
                        onClick={() => { setIsEmirateOpen(!isEmirateOpen); setIsGenderOpen(false); setIsCityOpen(false); setIsSkillsOpen(false); }} 
                        className={`w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-left flex justify-between items-center transition-all ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50 text-slate-900' : 'cursor-pointer focus:border-red-500 focus:ring-1 focus:ring-red-500'}`}
                      >
                        <span className={!formData.emirate ? 'text-slate-400' : 'text-slate-900 font-medium'}>
                          {formData.emirate || 'Select Emirate'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                      {isEmirateOpen && (
                        <div className="absolute bottom-full mb-1.5 z-30 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                          {availableEmirates.map(e => (
                            <button 
                              type="button" 
                              key={e} 
                              onClick={() => { handleEmirateChange(e); setIsEmirateOpen(false); }} 
                              className="w-full px-3 py-2 text-left hover:bg-red-50 text-sm font-medium text-slate-700 hover:text-red-600 rounded-lg transition-colors"
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">City <span className="text-red-500">*</span></label>
                      <button 
                        type="button" 
                        disabled={drawerMode === "view"} 
                        onClick={() => { setIsCityOpen(!isCityOpen); setIsGenderOpen(false); setIsEmirateOpen(false); setIsSkillsOpen(false); }} 
                        className={`w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-left flex justify-between items-center transition-all ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50 text-slate-900' : 'cursor-pointer focus:border-red-500 focus:ring-1 focus:ring-red-500'}`}
                      >
                        <span className={!formData.city ? 'text-slate-400' : 'text-slate-900 font-medium'}>
                          {formData.city || 'Select City'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                      {isCityOpen && (
                        <div className="absolute bottom-full mb-1.5 z-30 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                          {getCitiesForEmirate(formData.emirate || '').map(c => (
                            <button 
                              type="button" 
                              key={c} 
                              onClick={() => { setFormData({...formData, city: c}); setIsCityOpen(false); }} 
                              className="w-full px-3 py-2 text-left hover:bg-red-50 text-sm font-medium text-slate-700 hover:text-red-600 rounded-lg transition-colors"
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Skills <span className="text-red-500">*</span></label>
                      <div className="relative">
                        {(() => {
                          const skillsArr = parseSkillsArray(selectedSkills);
                          return (
                            <>
                              <button 
                                type="button" 
                                disabled={drawerMode === "view"} 
                                onClick={() => { setIsSkillsOpen(!isSkillsOpen); setIsGenderOpen(false); setIsEmirateOpen(false); setIsCityOpen(false); }} 
                                className={`w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-left flex justify-between items-center transition-all ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50 text-slate-900' : 'cursor-pointer focus:border-red-500 focus:ring-1 focus:ring-red-500'}`}
                              >
                                <span className={skillsArr.length === 0 ? 'text-slate-400' : 'text-slate-900 font-medium'}>
                                  {skillsArr.length > 0 ? skillsArr.join(', ') : 'Select Skills'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              </button>
                              {isSkillsOpen && (
                                <div className="absolute bottom-full mb-1.5 z-30 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                                  {availableSkills.filter(s => !skillsArr.includes(s)).map(s => (
                                    <button 
                                      type="button" 
                                      key={s} 
                                      onClick={() => { setSelectedSkills([...skillsArr, s]); setIsSkillsOpen(false); }} 
                                      className="w-full px-3 py-2 text-left hover:bg-red-50 text-sm font-medium text-slate-700 hover:text-red-600 rounded-lg transition-colors"
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsDrawerOpen(false)} 
                className="px-6 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm shadow-sm"
              >
                {drawerMode === "view" ? "Close" : "Cancel"}
              </button>
              {drawerMode === "view" && (
                <button
                  type="button"
                  onClick={() => setDrawerMode("edit")}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4" /> Edit Agent
                </button>
              )}
              {drawerMode !== "view" && (
                <button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={loading || !(formData.firstName?.trim() && formData.lastName?.trim() && formData.email?.trim() && formData.phone?.trim() && formData.gender?.trim() && formData.emirate?.trim() && formData.city?.trim() && selectedSkills.length > 0 && (drawerMode === 'edit' || Boolean(formData.password?.trim())))}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> 
                      {drawerMode === "edit" ? "Update Agent" : "Register Agent"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        actionType={actionModal.actionType}
        name={actionModal.agent?.name}
        onCancel={() => setActionModal({ isOpen: false, actionType: 'view', agent: null })}
        onConfirm={handleAgentActionConfirm}
      />
      {/* Full Screen Image Modal */}
      {showImageModal && (photoPreview || photo) && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowImageModal(false); }}
              className="absolute -top-12 right-0 md:-right-12 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={photoPreview || (typeof photo === 'string' ? photo : undefined)} 
              alt="Agent Photo Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/20"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
