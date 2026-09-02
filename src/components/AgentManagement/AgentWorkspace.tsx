import { useState, useEffect, useRef } from 'react';
import { Car, UserCheck, UserMinus, UserX, Clock, Star, Plus, Download, Search, Filter, MoreHorizontal, RefreshCw, Briefcase, FileText, ChevronDown, ChevronLeft, X, Trash2, Edit2, Eye, EyeOff, Upload, Save, Check, ChevronRight, Sparkles, User, Copy } from 'lucide-react';
import { AnalyticsCard } from '../common/AnalyticsCard';
import { SlidePanel } from '../common/SlidePanel';
import { StatusBadge } from '../StatusBadge';
import { motion } from 'motion/react';
import { ImageCropModal } from '../common/ImageCropModal';

const AGENTS = [
  { id: 'A001', name: 'John Captain', email: 'john@stylein.com', phone: '+1234567890', area: 'Downtown', vehicle: 'Van-01', jobs: 12, rating: 4.8, status: 'Active' },
  { id: 'A002', name: 'Jane Driver', email: 'jane@stylein.com', phone: '+1987654321', area: 'Marina', vehicle: 'Car-05', jobs: 8, rating: 4.5, status: 'Inactive' },
];

import api from '../../api/axios';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { ConfirmationModal, ActionType } from '../ConfirmationModal';
import { uploadImage } from '../../services/uploadService';
import { getCompactDrawerClass, SectionActiveToggle } from '../SubAdminManagement/utils/subAdminFormUtils';
import { getLoggedInAdminName } from '../SubAdminManagement/subAdminDrawerUtils';
import { SafeImage } from '../common/SafeImage';

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

const getSavedAgentPassword = (agent: any): string => {
  if (!agent) return '';
  if (agent.password && typeof agent.password === 'string' && !agent.password.startsWith('$2b$') && !agent.password.startsWith('$2a$') && agent.password !== '[protected]') {
    return agent.password;
  }
  if (agent.plainPassword) return agent.plainPassword;
  if (agent.plain_password) return agent.plain_password;
  try {
    const raw = localStorage.getItem('agent_saved_passwords_cache');
    if (raw) {
      const map = JSON.parse(raw);
      const keys = [
        agent._id,
        agent.id,
        agent.userId,
        agent.email?.toLowerCase().trim(),
        agent.phone?.replace(/\D/g, ''),
        agent.employeeCode,
        agent.agentId
      ].filter(Boolean);
      for (const k of keys) {
        if (map[k]) return map[k];
      }
    }
  } catch (e) {}
  return agent.password || '';
};

const saveAgentPasswordToCache = (pass: string, agentData: any, newId?: string) => {
  if (!pass) return;
  try {
    const raw = localStorage.getItem('agent_saved_passwords_cache');
    const map = raw ? JSON.parse(raw) : {};
    const keys = [
      newId,
      agentData?._id,
      agentData?.id,
      agentData?.userId,
      agentData?.email?.toLowerCase().trim(),
      agentData?.phone?.replace(/\D/g, ''),
      agentData?.employeeCode,
      agentData?.agentId
    ].filter(Boolean);
    keys.forEach(k => {
      map[k] = pass;
    });
    localStorage.setItem('agent_saved_passwords_cache', JSON.stringify(map));
  } catch (e) {}
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
        const autoPassword = a.plainPassword || a.plain_password || getSavedAgentPassword(a) || a.password || '';
        const formattedRole = a.role === 'service_agent' ? 'Service Agent' : (a.role || 'Service Agent');
        return {
          ...a,
          id: a._id,
          agentId: autoAgentId,
          name: a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Agent',
          phone: a.phone || '-',
          email: a.email || '-',
          emirate: a.emirate || a.state || '-',
          city: a.city || '-',
          password: autoPassword,
          role: formattedRole,
          gender: a.gender || '-',
          joiningDate: a.joiningDate ? new Date(a.joiningDate).toISOString().split('T')[0] : (a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : '-'),
          skills: Array.isArray(a.skills) && a.skills.length > 0 ? a.skills.join(', ') : (typeof a.skills === 'string' && a.skills ? a.skills : '-'),
          area: a.city || a.area || a.state || '-',
          vehicle: a.vehicle || a.vehicleType || '-',
          jobs: a.jobsCompleted || a.jobs || 0,
          rating: a.rating ?? 0,
          status: a.blocked ? 'Blocked' : (a.active ? 'Active' : 'Inactive')
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

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isEmirateOpen, setIsEmirateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  const DEFAULT_EMIRATES = [
    'Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain'
  ];

  const DEFAULT_CITIES_LIST: { name: string; emirate: string }[] = [
    { name: 'Al Ain', emirate: 'Abu Dhabi' },
    { name: 'Al Aqah', emirate: 'Fujairah' },
    { name: 'Al Bidyah', emirate: 'Fujairah' },
    { name: 'Al Hamriyah', emirate: 'Sharjah' },
    { name: 'Al Jazirah Al Hamra', emirate: 'Ras Al Khaimah' },
    { name: 'Al Manama', emirate: 'Ajman' },
    { name: 'Al Raas', emirate: 'Umm Al Quwain' },
    { name: 'Al Rams', emirate: 'Ras Al Khaimah' },
    { name: 'Al Salamah', emirate: 'Umm Al Quwain' },
    { name: 'Dibba Al-fujairah', emirate: 'Fujairah' },
    { name: 'Dibba Al-hisn', emirate: 'Sharjah' },
    { name: 'Dubai City', emirate: 'Dubai' },
    { name: 'Falaj Al Mualla', emirate: 'Umm Al Quwain' },
    { name: 'Hatta', emirate: 'Dubai' },
    { name: 'Jebel Ali', emirate: 'Dubai' },
    { name: 'Khatt', emirate: 'Ras Al Khaimah' },
    { name: 'Khor Fakkan', emirate: 'Sharjah' },
    { name: 'Madinat Zayed', emirate: 'Abu Dhabi' },
    { name: 'Masfout', emirate: 'Ajman' },
    { name: 'Ruwais', emirate: 'Abu Dhabi' },
  ];

  const EMIRATE_CITIES_MAP: Record<string, string[]> = {
    'Abu Dhabi': ['Abu Dhabi', 'Al Ain', 'Madinat Zayed', 'Ruwais', 'Al Dhafra'],
    'Ajman': ['Ajman', 'Al Manama', 'Masfout'],
    'Dubai': ['Dubai City', 'Dubai', 'Jebel Ali', 'Hatta'],
    'Fujairah': ['Fujairah', 'Al Aqah', 'Al Bidyah', 'Dibba Al-fujairah'],
    'Ras Al Khaimah': ['Ras Al Khaimah', 'Al Jazirah Al Hamra', 'Al Rams', 'Khatt', 'Digdaga'],
    'Sharjah': ['Sharjah', 'Al Hamriyah', 'Dibba Al-hisn', 'Khor Fakkan', 'Kalba'],
    'Umm Al Quwain': ['Umm Al Quwain', 'Al Raas', 'Al Salamah', 'Falaj Al Mualla'],
  };

  const [availableEmirates, setAvailableEmirates] = useState<string[]>(DEFAULT_EMIRATES);
  const [cityMasterList, setCityMasterList] = useState<{ name: string; emirate: string }[]>(DEFAULT_CITIES_LIST);

  const fetchSkills = async () => {
    try {
      const response = await api.get('/master/skill/admin').catch(() => api.get('/master/skill'));
      const payload = response?.data?.data || response?.data;
      let rawList: any[] = [];
      if (Array.isArray(payload)) {
        rawList = payload;
      } else if (payload && typeof payload === 'object') {
        rawList = payload.skills || payload.skill || payload.list || payload.data || [];
        if (!Array.isArray(rawList) || rawList.length === 0) {
          const possibleArray = Object.values(payload).find(v => Array.isArray(v));
          if (possibleArray) rawList = possibleArray as any[];
        }
      }
      
      if (Array.isArray(rawList) && rawList.length > 0) {
        const names = rawList
          .filter((item: any) => item.active !== false && item.status !== 'Inactive')
          .map((item: any) => item.name || item.title || item.skillName || item.type || (typeof item === 'string' ? item : ''))
          .filter((name: string) => Boolean(name && name.trim()));
        
        if (names.length > 0) {
          setAvailableSkills(Array.from(new Set(names)));
        }
      }
    } catch (err) {
      console.warn('Failed to load skills from server:', err);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    if (isDrawerOpen) {
      fetchSkills();

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
  const emirateDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const skillsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(target)) {
        setIsGenderDropdownOpen(false);
        setIsGenderOpen(false);
      }
      if (emirateDropdownRef.current && !emirateDropdownRef.current.contains(target)) {
        setIsEmirateOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(target)) {
        setIsCityOpen(false);
      }
      if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(target)) {
        setIsSkillsOpen(false);
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

  const handleCropComplete = async (croppedFile: File, croppedPreviewUrl: string) => {
    setPhotoPreview(croppedPreviewUrl);
    setImgError(false);
    
    toast.loading('Uploading Image...', { id: 'imgUpload' });
    try {
      const uploadedUrl = await uploadImage(croppedFile);
      toast.dismiss('imgUpload');
      toast.success('Image uploaded successfully');
      setPhoto(uploadedUrl);
      setPhotoPreview(uploadedUrl);
      setSelectedImageFile(null);
    } catch (err: any) {
      toast.dismiss('imgUpload');
      toast.error(err.message || 'Image upload failed');
      setSelectedImageFile(croppedFile);
    }
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
          gender: formData.gender || 'Male',
          city: formData.city || 'Dubai',
          state: formData.emirate || 'Dubai',
          emirate: formData.emirate || 'Dubai',
          country: formData.country || 'UAE',
          role: formData.role || 'service_agent',
          joiningDate: formData.joiningDate,
          skills: selectedSkills.length > 0 ? selectedSkills : ['Car Wash'],
          active: true,
          ...(finalProfileUrl ? { profileImage: finalProfileUrl, profileUrl: finalProfileUrl, imageUrl: finalProfileUrl } : {})
        };

        if (editingAgentId) {
          const response = await api.put(`/agent/agent/${editingAgentId}`, payload);
          if (formData.password) {
            saveAgentPasswordToCache(formData.password, payload, editingAgentId);
          }
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
          const createdId = response.data?.data?._id || response.data?.data?.id || response.data?._id;
          if (formData.password) {
            saveAgentPasswordToCache(formData.password, payload, createdId);
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
      setEditingAgentId(agent.id || agent._id);
      const resolvedAgentId = agent.agentId || agent.employeeCode || agent.userId || (agent._id ? (typeof agent._id === 'string' ? agent._id : '') : (agent.id || ''));
      const editFirstName = agent.firstName || (agent.name ? agent.name.split(' ')[0] : '');
      const editLastName = agent.lastName || (agent.name ? agent.name.split(' ').slice(1).join(' ') : '');
      const parsedSkills = parseSkillsArray(agent.skills);
      const defaultEmirate = agent.emirate || agent.state || 'Dubai';
      const defaultCity = agent.city || 'Dubai';
      const defaultGender = agent.gender || 'Male';
      const agentPass = getSavedAgentPassword(agent) || agent.password || agent.plainPassword || '';
      setFormData({
          agentId: resolvedAgentId,
          fullName: agent.name || '',
          firstName: editFirstName,
          lastName: editLastName,
          email: agent.email || '',
          phone: agent.phone || '',
          employeeCode: agent.employeeCode || resolvedAgentId,
          role: agent.role || 'service_agent',
          gender: defaultGender,
          userId: agent.userId || '',
          password: agentPass,
          confirmPassword: '',
          emirate: defaultEmirate,
          city: defaultCity,
          country: agent.country || 'UAE',
          joiningDate: agent.joiningDate ? new Date(agent.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          active: agent.active !== undefined ? agent.active : (agent.status !== 'Blocked' && agent.status !== 'Inactive')
      });
      const agentPhoto = agent.profileImage || agent.profileUrl || agent.imageUrl || null;
      setPhoto(agentPhoto);
      setPhotoPreview(agentPhoto);
      setSelectedSkills(parsedSkills.length > 0 ? parsedSkills : (availableSkills.length > 0 ? [availableSkills[0]] : []));
      setIsDrawerOpen(true);
  };

  const handleViewDrawer = (e: React.MouseEvent, agent: any) => {
      e?.stopPropagation();
      setDrawerMode("view");
      setEditingAgentId(agent.id || agent._id);
      const resolvedAgentId = agent.agentId || agent.employeeCode || agent.userId || (agent._id ? (typeof agent._id === 'string' ? agent._id : '') : (agent.id || ''));
      const viewFirstName = agent.firstName || (agent.name ? agent.name.split(' ')[0] : '');
      const viewLastName = agent.lastName || (agent.name ? agent.name.split(' ').slice(1).join(' ') : '');
      const agentPass = getSavedAgentPassword(agent) || agent.password || agent.plainPassword || '';
      setFormData({
          agentId: resolvedAgentId,
          fullName: agent.name || '',
          firstName: viewFirstName,
          lastName: viewLastName,
          email: agent.email || '',
          phone: agent.phone || '',
          employeeCode: agent.employeeCode || resolvedAgentId,
          role: agent.role || 'service_agent',
          gender: agent.gender || '',
          userId: agent.userId || '',
          password: agentPass,
          confirmPassword: '',
          emirate: agent.emirate || agent.state || 'Dubai',
          city: agent.city || 'Dubai',
          joiningDate: agent.joiningDate ? new Date(agent.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          active: agent.active !== undefined ? agent.active : (agent.status !== 'Blocked' && agent.status !== 'Inactive')
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
        agentId: '', fullName: '', firstName: '', lastName: '', email: '', phone: '', employeeCode: '', gender: '', userId: '', password: '', confirmPassword: '', emirate: 'Dubai', city: 'Dubai', joiningDate: new Date().toISOString().split('T')[0], active: true
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
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    try {
      await api.put(`/agent/agent/${agent.id}`, { active: !isCurrentlyActive });
      toast.success(`Agent status updated to ${newStatus}`);
      setAgentsList(prev => prev.map(item => item.id === agent.id ? { ...item, active: !isCurrentlyActive, status: item.blocked ? 'Blocked' : (isCurrentlyActive ? 'Inactive' : 'Active') } : item));
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
    if (selectedCard === 'Active' || selectedCard === 'ACTIVE') return a.status === 'Active';
    if (selectedCard === 'Inactive' || selectedCard === 'INACTIVE' || selectedCard === 'DEACTIVATED') return a.status === 'Inactive';
    if (selectedCard === 'Blocked' || selectedCard === 'BLOCKED') return Boolean(a.blocked);
    if (selectedCard === 'Top Rated' || selectedCard === 'TOP RATED') return (a.rating || 0) >= 4.5;

    return true;
  });

  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const paginatedAgents = filteredAgents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-3.5 sm:p-4 lg:p-5 space-y-3.5 sm:space-y-4 w-full bg-slate-50/60 min-h-screen">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          <span>Dashboard</span> 
          <ChevronRight className="w-3 h-3 text-slate-400" /> 
          <span>Profile Management</span> 
          <ChevronRight className="w-3 h-3 text-slate-400" /> 
          <span className="text-red-600 font-semibold">
            Agent Management
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={openRegister} 
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-xs transition-all active:scale-95 text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" /> Create
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-3.5 w-full">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[90px] bg-slate-200/70 animate-pulse rounded-xl p-3.5 border border-slate-200/50 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-2.5 w-12 bg-slate-300 rounded" />
                <div className="w-6 h-6 bg-slate-300 rounded-lg" />
              </div>
              <div className="h-5 w-8 bg-slate-300 rounded mt-2" />
            </div>
          ))
        ) : (
          [
            { label: 'AGENTS', value: agentsList.length, icon: Car, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Accounts' },
            { label: 'ACTIVE', value: agentsList.filter(a => a.status === 'Active').length, icon: UserCheck, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'On Duty' },
            { label: 'INACTIVE', value: agentsList.filter(a => a.status === 'Inactive').length, icon: UserMinus, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Off-line' },
            { label: 'BLOCKED', value: agentsList.filter(a => a.blocked).length, icon: UserX, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Restricted' },
            { label: 'TOP RATED', value: agentsList.filter(a => Number(a.rating || 0) > 4).length, icon: Star, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Rating > 4.0' },
          ].map((card, i) => {
            const Icon = card.icon;
            const isFocused = selectedCard === card.label;
            return (
              <div 
                key={i} 
                onClick={() => setSelectedCard(prev => prev === card.label ? null : card.label)}
                className={`bg-white p-3.5 sm:p-4 rounded-xl transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 min-h-[88px] sm:min-h-[92px] ${
                  isFocused 
                    ? `border border-slate-300 bg-white shadow-xs` 
                    : 'border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10.5px] font-semibold tracking-wider transition-colors uppercase leading-none ${isFocused ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-800'}`}>{card.label}</span>
                  <div className={`p-1.5 rounded-lg border ${card.color} transition-all duration-200 group-hover:scale-105 shadow-2xs`}>
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between w-full mt-3">
                  <span className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight leading-none">{card.value}</span>
                  <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{card.sub}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="flex justify-end">
          <div className="flex items-center gap-1.5 w-full md:w-[320px]">
            <div className="relative flex-1 group">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-normal placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs h-8" 
              />
            </div>
            <button className="px-4 py-1.5 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg shadow-2xs transition-all text-xs shrink-0 h-8 cursor-pointer">
              Search
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-visible">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#FFF] text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr className="bg-slate-50/70 border-b border-slate-200/80">
                <th className="px-4 py-3 pl-5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider rounded-tl-xl w-[60%]">Agent Name</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider w-[25%]">Status</th>
                <th className="px-4 py-3 pr-5 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wider rounded-tr-xl w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-2.5 pl-5"><div className="flex items-center gap-2.5"><div className="w-7.5 h-7.5 rounded-full bg-slate-200" /><div className="h-3.5 w-28 bg-slate-200 rounded" /></div></td>
                    <td className="px-4 py-2.5"><div className="h-3.5 w-16 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-2.5 pr-5"><div className="h-3.5 w-8 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400 font-medium text-xs">No service agents found</td>
                </tr>
              ) : paginatedAgents.map((agent, index) => (
                <tr key={agent.id} className="hover:bg-slate-50/70 transition-colors duration-150 group cursor-pointer border-b border-slate-100 last:border-0" onClick={(e) => handleViewDrawer(e, agent)}>
                  <td className="px-4 py-2.5 pl-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-7.5 h-7.5 shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(agent.name)} flex items-center justify-center text-white text-[11px] font-semibold shadow-2xs ring-2 ring-slate-100 border border-white/50 overflow-hidden relative`}>
                        {(agent.profileImage || agent.profileUrl || agent.imageUrl) ? (
                          <SafeImage 
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
                        <span className="font-medium text-slate-900 text-[13px] tracking-tight whitespace-nowrap leading-tight">{agent.name}</span>
                        <span className="text-xs text-slate-400 font-normal mt-0.5">{agent.email || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <StatusBadge status={agent.blocked ? 'Blocked' : (agent.active !== false ? 'Active' : 'Inactive')} />
                  </td>
                  <td className="px-4 py-2.5 pr-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end relative action-menu-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenuId(openActionMenuId === agent.id ? null : agent.id);
                        }}
                        className="w-7.5 h-7.5 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                    {openActionMenuId === agent.id && (
                      <div className={`absolute right-0 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-[99] animate-in fade-in zoom-in-95 duration-100 text-left ${index >= Math.max(0, paginatedAgents.length - 3) ? 'bottom-full mb-1 origin-bottom-right' : 'top-8 origin-top-right'}`}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleViewDrawer(e, agent); }} 
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" /> View Details
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleEdit(e, agent); }} 
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleToggleAgentStatus(agent); }} 
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          {agent.active !== false ? <UserX className="w-3.5 h-3.5 text-slate-500" /> : <UserCheck className="w-3.5 h-3.5 text-slate-500" />} 
                          {agent.active !== false ? 'Deactivate' : 'Activate'}
                        </button>
                        <div className="border-t border-slate-100 my-1"></div>
                        {agent.blocked ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'unblock', agent }); }} 
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Unblock
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'block', agent }); }} 
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          >
                            <UserX className="w-3.5 h-3.5" /> Block
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); setActionModal({ isOpen: true, actionType: 'delete', agent }); }} 
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
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
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-normal">
                <span>Showing</span>
                <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                  {filteredAgents.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} – {Math.min(currentPage * ITEMS_PER_PAGE, filteredAgents.length)}
                </span>
                <span>of</span>
                <span className="font-semibold text-slate-800">{filteredAgents.length}</span>
                <span>results</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${currentPage === page ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 transition-opacity duration-200 ease-out">
          <div className="bg-[#F8FAFC] w-full max-w-lg md:max-w-xl rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200 ease-out">
            {/* Header - White, minimal, top accent */}
            <div className="px-4 py-2.5 bg-white flex items-center justify-between border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 shadow-2xs">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 capitalize leading-tight flex items-center gap-2">
                    {(drawerMode === "view" || drawerMode === "edit")
                      ? (`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || "Edit Agent")
                      : "Create Agent"}
                    {(drawerMode === "view" || drawerMode === "edit") && (formData.agentId || formData.employeeCode) && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        ID: {formData.agentId || formData.employeeCode}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {drawerMode === "view" ? 'View agent details.' : (drawerMode === "edit" ? 'Manage agent details and skills.' : 'Add a new agent to the system.')}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer" aria-label="Close modal">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar relative pb-6">
              
              {/* Personal Information Section */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white border border-slate-200 rounded-md text-slate-600 shadow-2xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Personal Information</h4>
                      <p className="text-[10px] text-slate-500">Basic contact and profile details.</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  {/* Profile Photo Horizontal Row */}
                  <div className="flex items-center gap-3.5 pb-1">
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
                      <div className={`w-12 h-12 rounded-full border border-slate-200 shadow-2xs overflow-hidden bg-slate-50 flex items-center justify-center transition-all ${photoPreview || (photo && !imgError) ? 'cursor-pointer hover:scale-105' : (drawerMode !== "view" ? 'cursor-pointer hover:bg-slate-100' : '')} ${drawerMode === "view" ? '' : 'group-hover:border-red-100'}`}>
                        {(photoPreview || (photo && !imgError)) ? (
                          <SafeImage 
                            src={photoPreview || (typeof photo === 'string' ? photo : undefined)} 
                            className="w-full h-full object-cover" 
                            alt="Profile" 
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-1 justify-center">
                      {drawerMode !== "view" && (
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-md hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3 h-3 text-slate-500" />
                            Change Photo
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400">PNG, JPG or WEBP · Max 5MB</p>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const localUrl = URL.createObjectURL(file);
                            setRawSelectedFile(file);
                            setRawPreviewUrl(localUrl);
                            setCropModalOpen(true);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">First Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="e.g. John"
                        value={formData.firstName || ''}
                        disabled={drawerMode === "view"}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Last Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="e.g. Doe"
                        value={formData.lastName || ''}
                        disabled={drawerMode === "view"}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Email Address <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        placeholder="e.g. agent@example.com"
                        value={formData.email || ''}
                        disabled={drawerMode === "view"}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Phone Number <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        placeholder="e.g. +1 234 567 8900"
                        value={formData.phone || ''}
                        disabled={drawerMode === "view"}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Account Status</h4>
                    <p className="text-[10px] text-slate-500">Enable or disable this agent account.</p>
                  </div>
                  <SectionActiveToggle 
                    checked={formData.active !== undefined ? formData.active : true} 
                    onChange={v => setFormData({...formData, active: v})} 
                    disabled={drawerMode === "view"} 
                  />
                </div>
              </div>

              {/* Agent Details Section */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-visible">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white border border-slate-200 rounded-md text-slate-600 shadow-2xs">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Agent Details</h4>
                      <p className="text-[10px] text-slate-500">Role, location, and skills.</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Agent ID Field */}
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700">Agent ID</label>
                        {(formData.agentId || formData.employeeCode) && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(formData.agentId || formData.employeeCode || '');
                              toast.success('Agent ID copied to clipboard!');
                            }}
                            className="text-[10px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Copy Agent ID"
                          >
                            <Copy className="w-2.5 h-2.5" /> Copy
                          </button>
                        )}
                      </div>
                      <input 
                        disabled={true} 
                        value={formData.agentId || formData.employeeCode || (drawerMode === 'view' ? 'N/A' : 'Auto-generated on creation')} 
                        type="text" 
                        placeholder="Auto-generated" 
                        className="w-full h-8 px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-mono font-medium disabled:bg-slate-50 disabled:text-slate-600 transition-colors select-all shadow-2xs" 
                      />
                    </div>

                    {/* Role Field */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Role</label>
                      <input 
                        disabled={true} 
                        value={formData.role === 'service_agent' ? 'Service Agent' : (formData.role || 'Service Agent')} 
                        type="text" 
                        className="w-full h-8 px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-medium disabled:bg-slate-50 disabled:text-slate-600 transition-colors shadow-2xs" 
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Gender <span className="text-red-500">*</span></label>
                      <button 
                        type="button" 
                        disabled={drawerMode === "view"} 
                        onClick={() => { setIsGenderOpen(!isGenderOpen); setIsEmirateOpen(false); setIsCityOpen(false); setIsSkillsOpen(false); }} 
                        className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-left flex justify-between items-center transition-all shadow-2xs ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50 text-slate-900' : 'cursor-pointer focus:border-slate-300 focus:ring-1 focus:ring-slate-200'}`}
                      >
                        <span className={!formData.gender ? 'text-slate-400' : 'text-slate-900 font-medium'}>
                          {formData.gender || 'Select Gender'}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      {isGenderOpen && (
                        <div className="absolute top-full mt-1 z-40 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar p-1">
                          {['Male', 'Female', 'Other'].map(s => (
                            <button 
                              type="button" 
                              key={s} 
                              onClick={() => { setFormData({...formData, gender: s}); setIsGenderOpen(false); }} 
                              className="w-full px-2.5 py-1.5 text-left hover:bg-red-50 text-xs font-medium text-slate-700 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700">Password {drawerMode === "register" && <span className="text-red-500">*</span>}</label>
                        {formData.password && (
                          <button
                            type="button"
                            onClick={(e) => handleCopyPassword(e, 'drawer-pass', formData.password)}
                            className="text-[10px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={formData.password || ''} 
                          onChange={(e) => drawerMode !== "view" && setFormData({...formData, password: e.target.value})} 
                          disabled={drawerMode === "view"}
                          className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 transition-all pr-8 shadow-2xs ${drawerMode === "view" ? 'opacity-90 bg-slate-50 cursor-default font-medium' : 'focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'}`} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="relative" ref={emirateDropdownRef}>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Emirate <span className="text-red-500">*</span></label>
                      <button 
                        type="button" 
                        disabled={drawerMode === "view"} 
                        onClick={() => { setIsEmirateOpen(!isEmirateOpen); setIsGenderOpen(false); setIsCityOpen(false); setIsSkillsOpen(false); }} 
                        className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border rounded-lg text-xs text-left flex justify-between items-center transition-all shadow-2xs ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50 text-slate-900 border-slate-200' : isEmirateOpen ? 'border-red-500 ring-1 ring-red-500 bg-white cursor-pointer' : 'border-slate-200 cursor-pointer hover:border-slate-300'}`}
                      >
                        <span className={!formData.emirate ? 'text-slate-400' : 'text-slate-900 font-medium'}>
                          {formData.emirate || 'Select Emirate'}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isEmirateOpen ? 'rotate-180 text-red-600' : 'text-slate-400'}`} />
                      </button>
                      {isEmirateOpen && (
                        <div className="absolute top-full mt-1 z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar p-1">
                          {availableEmirates.map(e => {
                            const isSelected = formData.emirate?.toLowerCase() === e.toLowerCase();
                            return (
                              <button 
                                type="button" 
                                key={e} 
                                onClick={() => { handleEmirateChange(e); setIsEmirateOpen(false); }} 
                                className={`w-full px-2.5 py-1.5 text-left text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                                  isSelected ? 'bg-red-50 text-red-600 font-semibold' : 'text-slate-700 hover:bg-red-50 hover:text-red-600 font-medium'
                                }`}
                              >
                                <span>{e}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={cityDropdownRef}>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">City <span className="text-red-500">*</span></label>
                      <button 
                        type="button" 
                        disabled={drawerMode === "view"} 
                        onClick={() => { setIsCityOpen(!isCityOpen); setIsGenderOpen(false); setIsEmirateOpen(false); setIsSkillsOpen(false); }} 
                        className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border rounded-lg text-xs text-left flex justify-between items-center transition-all shadow-2xs ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50 text-slate-900 border-slate-200' : isCityOpen ? 'border-red-500 ring-1 ring-red-500 bg-white cursor-pointer' : 'border-slate-200 cursor-pointer hover:border-slate-300'}`}
                      >
                        <span className={!formData.city ? 'text-slate-400' : 'text-slate-900 font-medium'}>
                          {formData.city || 'Select City'}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCityOpen ? 'rotate-180 text-red-600' : 'text-slate-400'}`} />
                      </button>
                      {isCityOpen && (
                        <div className="absolute top-full mt-1 z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto custom-scrollbar p-1">
                          {(cityMasterList.length > 0 ? cityMasterList : DEFAULT_CITIES_LIST)
                            .slice()
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(c => {
                              const isSelected = formData.city?.toLowerCase() === c.name.toLowerCase();
                              return (
                                <button 
                                  type="button" 
                                  key={c.name} 
                                  onClick={() => { 
                                    setFormData(prev => ({
                                      ...prev, 
                                      city: c.name,
                                      emirate: c.emirate || prev.emirate || 'Dubai'
                                    })); 
                                    setIsCityOpen(false); 
                                  }} 
                                  className={`w-full px-2.5 py-1.5 text-left text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                                    isSelected 
                                      ? 'bg-red-50 text-red-600 font-semibold' 
                                      : 'text-slate-700 hover:bg-red-50 hover:text-red-600 font-medium'
                                  }`}
                                >
                                  <span>{c.name}</span>
                                  <div className="flex items-center gap-1">
                                    {c.emirate && <span className="text-[10px] text-slate-400 font-normal">({c.emirate})</span>}
                                    {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0 ml-1" />}
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Skills <span className="text-red-500">*</span></label>
                      <div className="relative" ref={skillsDropdownRef}>
                        {(() => {
                          const skillsArr = parseSkillsArray(selectedSkills);
                          const filteredSkills = availableSkills.filter(s => 
                            s.toLowerCase().includes(skillSearch.toLowerCase())
                          );

                          return (
                            <>
                              {/* Selected Skills Chips */}
                              {skillsArr.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                  {skillsArr.map((skill) => (
                                    <span
                                      key={skill}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 shadow-2xs"
                                    >
                                      {skill}
                                      {drawerMode !== 'view' && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSkills(skillsArr.filter((s) => s !== skill));
                                          }}
                                          className="hover:text-red-900 rounded-full p-0.5 ml-0.5 cursor-pointer"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Trigger Button */}
                              <button 
                                type="button" 
                                disabled={drawerMode === "view"} 
                                onClick={() => { setIsSkillsOpen(!isSkillsOpen); setIsGenderOpen(false); setIsEmirateOpen(false); setIsCityOpen(false); }} 
                                className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-left flex justify-between items-center transition-all shadow-2xs ${drawerMode === "view" ? 'opacity-80 cursor-default bg-slate-50 text-slate-900' : 'cursor-pointer focus:border-red-500 focus:ring-1 focus:ring-red-500'}`}
                              >
                                <span className={skillsArr.length === 0 ? 'text-slate-400' : 'text-slate-900 font-medium'}>
                                  {skillsArr.length === 0 ? 'Select Skills' : `+ Add / Manage Skills (${skillsArr.length} selected)`}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSkillsOpen ? 'rotate-180 text-red-600' : ''}`} />
                              </button>

                              {/* Dropdown Menu */}
                              {isSkillsOpen && (
                                <div className="absolute top-full mt-1 z-50 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-hidden flex flex-col p-1">
                                  {/* Quick Search inside dropdown */}
                                  <div className="p-1 border-b border-slate-100 mb-0.5">
                                    <input
                                      type="text"
                                      placeholder="Search skills..."
                                      value={skillSearch}
                                      onChange={(e) => setSkillSearch(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium text-slate-800 focus:outline-none focus:border-red-500"
                                    />
                                  </div>

                                  {/* Skills Options List */}
                                  <div className="overflow-y-auto max-h-44 custom-scrollbar space-y-0.5">
                                    {filteredSkills.map((s) => {
                                      const isSelected = skillsArr.includes(s);
                                      return (
                                        <button 
                                          type="button" 
                                          key={s} 
                                          onClick={() => {
                                            if (isSelected) {
                                              setSelectedSkills(skillsArr.filter((item) => item !== s));
                                            } else {
                                              setSelectedSkills([...skillsArr, s]);
                                            }
                                          }} 
                                          className={`w-full px-2.5 py-1.5 text-left text-xs font-medium rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                                            isSelected 
                                              ? 'bg-red-50 text-red-700 font-bold' 
                                              : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                                          }`}
                                        >
                                          <span>{s}</span>
                                          {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                                        </button>
                                      );
                                    })}

                                    {filteredSkills.length === 0 && (
                                      <div className="p-2 text-center text-[11px] text-slate-400">
                                        No matching skills found
                                      </div>
                                    )}
                                  </div>
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
            <div className="px-4 py-2.5 border-t border-slate-200 bg-white flex items-center justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsDrawerOpen(false)} 
                className="h-8 px-3.5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-xs shadow-2xs cursor-pointer"
              >
                {drawerMode === "view" ? "Close" : "Cancel"}
              </button>
              {drawerMode === "view" && (
                <button
                  type="button"
                  onClick={() => setDrawerMode("edit")}
                  className="flex items-center gap-1.5 h-8 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-2xs transition-colors text-xs cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Agent
                </button>
              )}
              {drawerMode !== "view" && (
                <button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={loading || !(formData.firstName?.trim() && formData.lastName?.trim() && formData.email?.trim() && formData.phone?.trim() && (drawerMode === 'edit' || (Boolean(formData.gender?.trim()) && Boolean(formData.emirate?.trim()) && Boolean(formData.city?.trim()) && selectedSkills.length > 0 && Boolean(formData.password?.trim()))))}
                  className="flex items-center justify-center gap-1.5 h-8 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-2xs transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> 
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
          className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowImageModal(false); }}
              className="absolute -top-12 right-0 md:-right-12 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            <SafeImage 
              src={photoPreview || (typeof photo === 'string' ? photo : undefined)} 
              alt="Agent Photo Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/20"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
      
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawPreviewUrl}
        file={rawSelectedFile}
        onClose={() => {
          setCropModalOpen(false);
          setRawSelectedFile(null);
          setRawPreviewUrl(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
