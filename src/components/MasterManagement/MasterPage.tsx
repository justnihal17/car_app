import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Edit2, Trash2, Eye, LayoutDashboard, Shield, Wrench, UserCheck, UserX, ChevronRight, Sparkles, Upload, X, User, Car, Image as ImageIcon, ChevronDown, Layers, ExternalLink, Zap } from 'lucide-react';
import { AnalyticsCard } from '../common/AnalyticsCard';
import { CustomSelect } from '../common/CustomSelect';
import { StatusBadge } from '../StatusBadge';
import { SlidePanel } from '../common/SlidePanel';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { getCompactDrawerClass, SectionActiveToggle } from '../SubAdminManagement/utils/subAdminFormUtils';
import { getLoggedInAdminName } from '../SubAdminManagement/subAdminDrawerUtils';
import { uploadImage } from '../../services/uploadService';
import { ImageCropModal } from '../common/ImageCropModal';
import { StatsShimmer, TableShimmer } from '../shimmer/ShimmerLoader';

interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'dropdown' | 'toggle' | 'number';
    options?: (string | { label: string; value: string; })[];
}

interface MasterPageProps {
  moduleName: string;
  columns: string[];
  fields: FieldConfig[];
}

export function MasterPage({ moduleName, columns, fields }: MasterPageProps) {
  const loggedInAdminName = getLoggedInAdminName();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>({});
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string, name: string}>({isOpen: false, id: '', name: ''});
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [serviceFilter, setServiceFilter] = useState(() => localStorage.getItem('master_service_filter') || 'all');
  const [subServicesList, setSubServicesList] = useState<any[]>([]);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
  const [makeOptions, setMakeOptions] = useState<{ label: string; value: string }[]>([]);
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string }[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isPanelOpen) {
      if (editingItem.image) {
        setPhoto(editingItem.image);
      } else {
        setPhoto(null);
      }
      setSelectedFile(null);
      setRawSelectedFile(null);
      setRawPreviewUrl(null);
    }
  }, [isPanelOpen, editingItem.image]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const isSubService = moduleName.toLowerCase() === 'subservice' || moduleName.toLowerCase() === 'sub-service';
      const isVehicleType = moduleName.toLowerCase() === 'vehicletype';
      let baseEndpoint = moduleName.toLowerCase();
      if (baseEndpoint === 'subservice' || baseEndpoint === 'sub-service') baseEndpoint = 'subservice';
      else if (baseEndpoint === 'vehicletype') baseEndpoint = 'vehicletype';
      else if (baseEndpoint === 'fueltype') baseEndpoint = 'fueltype';
      else if (baseEndpoint === 'brand') baseEndpoint = 'make';
      
      const endpoint = `/master/${baseEndpoint}/admin`;
      let response;
      try {
        response = await api.get(endpoint);
      } catch (err: any) {
        throw err;
      }

      if (response && response.data) {
        let rawList: any[] = [];
        const payload = response.data?.data || response.data;
        if (Array.isArray(payload)) {
          rawList = payload;
        } else if (payload) {
          rawList = payload.fuelTypes || payload.fuelType || payload.list || payload.makes || payload.models || payload.services || payload.data || [];
          if (!Array.isArray(rawList) || rawList.length === 0) {
            const possibleArray = Object.values(payload).find(v => Array.isArray(v));
            if (possibleArray) {
              rawList = possibleArray as any[];
            }
          }
        }
          
        const mapped = rawList.map((item: any) => {
          const desc = item.description || item.shortDescription || item.detailedDescription || '';
          return {
            id: item._id || item.id,
            name: item.name || item.title || item.type || '',
            title: item.title || item.name || '',
            description: desc,
            shortDescription: desc,
            detailedDescription: desc,
            status: item.active !== false ? 'Active' : 'Inactive',
            ...item
          };
        });
        setData(mapped);
      }
    } catch (error: any) {
      console.error(`Failed to fetch ${moduleName}:`, error);
      setData([]);
      toast.error(`Failed to fetch ${moduleName} list`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (moduleName.toLowerCase() === 'subservice' || moduleName.toLowerCase() === 'sub-service') {
      const savedFilter = localStorage.getItem('master_service_filter');
      if (savedFilter) {
        setServiceFilter(savedFilter);
        localStorage.removeItem('master_service_filter');
      } else {
        setServiceFilter('all');
      }
    } else {
      setServiceFilter('all');
    }
    setExpandedServiceId(null);
  }, [moduleName]);

  useEffect(() => {
    fetchData();

    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener('refresh_master_data', handleRefresh);
    return () => {
      window.removeEventListener('refresh_master_data', handleRefresh);
    };
  }, [moduleName, serviceFilter]);

  useEffect(() => {
    if (moduleName.toLowerCase() === 'city') {
      const fetchStatesForDropdown = async () => {
        try {
          const response = await api.get('/master/state/admin');
          if (response.data?.success || Array.isArray(response.data?.data)) {
            const list = response.data?.data || response.data || [];
            setStateOptions(list.map((s: any) => ({ label: s.name, value: s._id || s.id })));
          }
        } catch (e) {
          console.error("Failed to load states for dropdown", e);
        }
      };
      fetchStatesForDropdown();
    } else if (moduleName.toLowerCase() === 'model') {
      const fetchMakesForDropdown = async () => {
        try {
          const response = await api.get('/master/make/admin');
          if (response && (response.data?.success || Array.isArray(response.data?.data) || Array.isArray(response.data))) {
            const rawList = Array.isArray(response.data?.data) 
              ? response.data.data 
              : (Array.isArray(response.data) ? response.data : (response.data?.makes || response.data?.list || []));
            setMakeOptions(rawList.map((m: any) => ({ label: m.name, value: m._id || m.id })));
          }
        } catch (e) {
          console.error("Failed to load makes for dropdown", e);
        }
      };
      fetchMakesForDropdown();
    } else if (moduleName.toLowerCase() === 'subservice' || moduleName.toLowerCase() === 'sub-service') {
      const fetchServicesForDropdown = async () => {
        try {
          const response = await api.get('/master/service/admin');
          if (response && (response.data?.success || Array.isArray(response.data?.data) || Array.isArray(response.data))) {
            const rawList = Array.isArray(response.data?.data) 
              ? response.data.data 
              : (Array.isArray(response.data) ? response.data : (response.data?.services || response.data?.list || []));
            setServiceOptions(rawList.map((s: any) => ({ label: s.name, value: s._id || s.id })));
          }
        } catch (e) {
          console.error("Failed to load services for dropdown", e);
        }
      };
      fetchServicesForDropdown();
    } else if (moduleName.toLowerCase() === 'service') {
      const fetchAllSubServices = async () => {
        try {
          const response = await api.get('/master/subservice/admin');
          if (response && (response.data?.success || Array.isArray(response.data?.data) || Array.isArray(response.data))) {
            const rawList = Array.isArray(response.data?.data) 
              ? response.data.data 
              : (Array.isArray(response.data) ? response.data : (response.data?.subservices || response.data?.list || []));
            const mapped = rawList.map((item: any) => ({
              id: item._id || item.id,
              name: item.name || item.title || item.type || '',
              title: item.title || item.name || '',
              status: item.active !== false ? 'Active' : 'Inactive',
              ...item
            }));
            if (mapped.length > 0) {
              setSubServicesList(mapped);
              return;
            }
          }
        } catch (e) {
          console.error("Failed to load subservices for service view", e);
        }
        setSubServicesList([
          { id: 'sub1', name: 'Full Body Wash', serviceName: 'car wash', serviceId: '1', price: '500', duration: '30 mins', status: 'Active', image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=150&q=80' },
          { id: 'sub2', name: 'Interior Vacuum & Clean', serviceName: 'car wash', serviceId: '1', price: '400', duration: '20 mins', status: 'Active', image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=150&q=80' },
          { id: 'sub3', name: 'Battery Health Check', serviceName: 'battrey', serviceId: '2', price: '200', duration: '15 mins', status: 'Active', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=150&q=80' },
          { id: 'sub4', name: 'Battery Terminal Cleaning', serviceName: 'battrey', serviceId: '2', price: '300', duration: '20 mins', status: 'Active', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=150&q=80' },
          { id: 'sub5', name: 'Emergency Jump Start', serviceName: 'Jump Battery', serviceId: '3', price: '500', duration: '15 mins', status: 'Active', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=150&q=80' },
        ]);
      };
      fetchAllSubServices();
    }
  }, [moduleName]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
        const itemVal = item.name || item.type || '';
        const matchesSearch = itemVal.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = (statusFilter === 'All Status' || item.status === statusFilter);
        const isSubServiceMod = (moduleName.toLowerCase() === 'subservice' || moduleName.toLowerCase() === 'sub-service');
        const matchesService = !isSubServiceMod || serviceFilter === 'all' || 
          (String(item.serviceId) === String(serviceFilter) || String(item.service?._id || item.service?.id) === String(serviceFilter) || String(item.service?.name || item.serviceName || item.service || '').toLowerCase() === String(serviceFilter).toLowerCase() || String(item.serviceId) === String(serviceFilter));
        return matchesSearch && matchesStatus && matchesService;
    });
  }, [data, searchTerm, statusFilter, serviceFilter, moduleName]);

  const getServiceSubServices = (serviceRow: any) => {
    return subServicesList.filter(s => {
      const sId = s.serviceId || (typeof s.service === 'object' ? (s.service._id || s.service.id) : s.service) || (typeof s.parentService === 'object' ? (s.parentService._id || s.parentService.id) : s.parentService);
      const sName = (typeof s.service === 'object' ? s.service.name : (typeof s.parentService === 'object' ? s.parentService.name : (s.serviceName || (typeof s.service === 'string' ? s.service : ''))));
      
      const rowIdMatch = sId && (String(sId) === String(serviceRow.id) || String(sId) === String(serviceRow._id) || String(sId) === String(serviceRow.value));
      const rowNameMatch = sName && (String(sName).trim().toLowerCase() === String(serviceRow.name || serviceRow.title || '').trim().toLowerCase());
      
      return rowIdMatch || rowNameMatch;
    });
  };

  const pluralNames: Record<string, string> = {
    role: 'Roles',
    skill: 'Skills',
    state: 'Emirates',
    emirate: 'Emirates',
    city: 'Cities',
    service: 'Services',
    color: 'Colors',
    make: 'Brands',
    model: 'Models',
    fueltype: 'Fuel Types',
    banner: 'Banners'
  };
  const displayName = pluralNames[moduleName.toLowerCase()] || `${moduleName}s`;

  const stats = [
    { label: displayName, value: data.length, icon: LayoutDashboard, color: 'text-red-600 bg-red-50 border-red-100', bgGrad: 'from-red-50/50 via-white to-white', sub: 'All' },
    { label: 'Active', value: data.filter(d => d.status === 'Active').length, icon: Shield, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', bgGrad: 'from-emerald-50/50 via-white to-white', sub: 'Operational' },
    { label: 'Inactive', value: data.filter(d => d.status === 'Inactive').length, icon: Wrench, color: 'text-amber-600 bg-amber-50 border-amber-100', bgGrad: 'from-amber-50/50 via-white to-white', sub: 'Disabled' },
  ];

  const handleAdd = () => { 
    setMode('add'); 
    setEditingItem({ 
      status: 'Active',
      ...((moduleName.toLowerCase() === 'subservice' || moduleName.toLowerCase() === 'sub-service') && serviceFilter !== 'all' ? { serviceId: serviceFilter } : {})
    }); 
    setIsPanelOpen(true); 
  };
  
  const handleEdit = (item: any) => { 
    setMode('edit'); 
    let mappedState = item.state;
    if (typeof item.state === 'object' && item.state) {
      mappedState = item.state._id || item.state.id;
    }
    let mappedServiceId = item.serviceId;
    if (typeof item.serviceId === 'object' && item.serviceId) {
      mappedServiceId = item.serviceId._id || item.serviceId.id;
    }
    let mappedMakeId = item.makeId;
    if (typeof item.makeId === 'object' && item.makeId) {
      mappedMakeId = item.makeId._id || item.makeId.id;
    }
    setEditingItem({
      ...item,
      id: item.id,
      state: mappedState,
      serviceId: mappedServiceId,
      makeId: mappedMakeId
    }); 
    setIsPanelOpen(true); 
  };

  const handleToggleStatus = async (item: any) => {
    try {
      const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
      const isSubService = moduleName.toLowerCase() === 'subservice' || moduleName.toLowerCase() === 'sub-service';
      const isVehicleType = moduleName.toLowerCase() === 'vehicletype';
      const isFuelType = moduleName.toLowerCase() === 'fueltype';
      const cleanModuleName = isVehicleType ? 'vehicleType' : (isFuelType ? 'fuelType' : moduleName.toLowerCase());
      const endpoint = isSubService ? `/master/subservice/${item.id}` : `/master/${cleanModuleName}/${item.id}`;
      
      const payload: any = {
        status: newStatus,
        active: newStatus === 'Active' // Many master APIs rely on `active` boolean
      };
      if (item.name) payload.name = item.name;
      if (item.code) payload.code = item.code;
      if (item.image) payload.image = item.image;
      if (item.makeId) payload.makeId = typeof item.makeId === 'object' ? item.makeId.id || item.makeId._id : item.makeId;
      if (moduleName.toLowerCase() === 'banner') {
        payload.title = item.title || item.name;
        payload.type = item.type;
        payload.position = item.position;
        if (item.description) payload.description = item.description;
      }
      if (item.description || item.shortDescription || item.detailedDescription) {
        const desc = item.description || item.shortDescription || item.detailedDescription;
        payload.description = desc;
        payload.shortDescription = desc;
        payload.detailedDescription = desc;
      }

      const response = await api.put(endpoint, payload);
      if (response.data?.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleToggleInstant = async (item: any) => {
    try {
      const currentIsInstant = item.isInstant === true || item.isInstant === 'true';
      const isSubService = moduleName.toLowerCase() === 'subservice' || moduleName.toLowerCase() === 'sub-service';
      const isVehicleType = moduleName.toLowerCase() === 'vehicletype';
      const isFuelType = moduleName.toLowerCase() === 'fueltype';
      const cleanModuleName = isVehicleType ? 'vehicleType' : (isFuelType ? 'fuelType' : moduleName.toLowerCase());
      const endpoint = isSubService ? `/master/subservice/${item.id || item._id}` : `/master/${cleanModuleName}/${item.id || item._id}`;
      
      const payload: any = {
        active: item.status === 'Active' || item.active === true,
        status: item.status,
        isInstant: !currentIsInstant
      };
      if (item.name) payload.name = item.name;
      if (item.code) payload.code = item.code;
      if (item.image) payload.image = item.image;
      if (item.price) payload.price = item.price;
      if (item.makeId) payload.makeId = typeof item.makeId === 'object' ? item.makeId.id || item.makeId._id : item.makeId;
      if (item.description || item.shortDescription || item.detailedDescription) {
        const desc = item.description || item.shortDescription || item.detailedDescription;
        payload.description = desc;
        payload.shortDescription = desc;
        payload.detailedDescription = desc;
      }

      const response = await api.put(endpoint, payload);
      if (response.data?.success) {
        toast.success(`Instant status updated`);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update instant status');
    }
  };

  const handleView = async (item: any) => { 
    try {
      const isSubService = moduleName.toLowerCase() === 'subservice';
      const isVehicleType = moduleName.toLowerCase() === 'vehicletype';
      const isFuelType = moduleName.toLowerCase() === 'fueltype';
      const endpoint = isSubService 
        ? `/master/subservice/${item.id}` 
        : (isVehicleType ? `/master/vehicleType/${item.id}` : (isFuelType ? `/master/fuelType/${item.id}` : `/master/${moduleName.toLowerCase()}/${item.id}`));
      const response = await api.get(endpoint);
      if (response.data?.success) {
        const doc = response.data.data;
        let mappedState = doc.state;
        if (typeof doc.state === 'object' && doc.state) {
          mappedState = doc.state._id || doc.state.id;
        }
        let mappedServiceId = doc.serviceId;
        if (typeof doc.serviceId === 'object' && doc.serviceId) {
          mappedServiceId = doc.serviceId._id || doc.serviceId.id;
        }
        let mappedMakeId = doc.makeId;
        if (typeof doc.makeId === 'object' && doc.makeId) {
          mappedMakeId = doc.makeId._id || doc.makeId.id;
        }
        const desc = doc.description || doc.shortDescription || doc.detailedDescription || '';
        setEditingItem({
          id: doc._id,
          name: doc.name || doc.title || doc.type || '',
          title: doc.title || doc.name || '',
          description: desc,
          shortDescription: desc,
          detailedDescription: desc,
          status: doc.active !== false ? 'Active' : 'Inactive',
          ...doc,
          state: mappedState,
          serviceId: mappedServiceId,
          makeId: mappedMakeId
        });
        setMode('view');
        setIsPanelOpen(true);
      }
    } catch (error: any) {
      setMode('view');
      setEditingItem(item);
      setIsPanelOpen(true);
    }
  };
  
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      const isSubService = moduleName.toLowerCase() === 'subservice';
      const isVehicleType = moduleName.toLowerCase() === 'vehicletype';
      const isFuelType = moduleName.toLowerCase() === 'fueltype';
      const endpoint = isSubService 
        ? `/master/subservice/${deleteModal.id}` 
        : (isVehicleType ? `/master/vehicleType/${deleteModal.id}` : (isFuelType ? `/master/fuelType/${deleteModal.id}` : `/master/${moduleName.toLowerCase()}/${deleteModal.id}`));
      const response = await api.delete(endpoint);
      if (response.data?.success) {
        toast.success(response.data?.message || `${moduleName} deleted successfully`);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to delete ${moduleName}`);
    } finally {
      setDeleteModal({ isOpen: false, id: '', name: '' });
    }
  };

  const isFormValid = useMemo(() => {
    if (mode === 'view') return false;

    if (moduleName.toLowerCase() === 'banner') {
      if (!editingItem.title?.trim()) return false;
      if (!editingItem.type?.trim()) return false;
      if (!editingItem.position?.trim()) return false;
    } else {
      if (!editingItem.name?.trim()) return false;
    }

    for (const f of fields) {
      if (f.name === 'image' || f.name === 'status' || f.type === 'toggle' || f.name === 'description') {
        continue;
      }
      const val = editingItem[f.name];
      if (val === undefined || val === null || String(val).trim() === '') {
        return false;
      }
    }

    return true;
  }, [editingItem, fields, mode, moduleName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mainFieldKey = 'name';
    const mainValue = editingItem[mainFieldKey] || editingItem.name || '';
    if (data.some(d => (d.name || d.type) === mainValue && d.id !== editingItem.id)) {
        alert("This name already exists.");
        return;
    }

    try {
      const payload: any = {};
      if (moduleName.toLowerCase() === 'banner') {
        payload.title = editingItem.title || editingItem.name || mainValue;
      } else {
        payload.name = mainValue;
      }
      if (editingItem.status !== undefined) {
        payload.active = editingItem.status === 'Active';
      }
      let uploadedImageUrl = editingItem.image || '';
      if (selectedFile) {
        toast.loading('Uploading Image...', { id: 'uploadToast' });
        try {
          uploadedImageUrl = await uploadImage(selectedFile);
          toast.dismiss('uploadToast');
        } catch (err: any) {
          toast.dismiss('uploadToast');
          toast.error(err.message || 'Image upload failed');
          return;
        }
      }

      fields.forEach(f => {
        if (f.name !== 'status' && f.name !== 'name' && (f.name !== 'type' || moduleName.toLowerCase() === 'banner')) {
          if (f.name === 'image') {
            payload[f.name] = selectedFile ? uploadedImageUrl : (editingItem[f.name] || editingItem.image || '');
          } else {
            let val = editingItem[f.name];
            if ((f.name === 'price' || f.name === 'duration' || f.name === 'position' || f.type === 'number') && val !== undefined && val !== null && val !== '') {
              const parsed = Number(val);
              if (!isNaN(parsed)) {
                val = parsed;
              }
            }
            payload[f.name] = val;
          }
        }
      });

      if (payload.description !== undefined) {
        payload.shortDescription = payload.description;
        payload.detailedDescription = payload.description;
      }

      const isSubService = moduleName.toLowerCase() === 'subservice';
      const isVehicleType = moduleName.toLowerCase() === 'vehicletype';
      const isFuelType = moduleName.toLowerCase() === 'fueltype';

      if (mode === 'add') {
        const endpoint = isSubService 
          ? '/master/subservice' 
          : (isVehicleType ? '/master/vehicleType' : (isFuelType ? '/master/fuelType' : `/master/${moduleName.toLowerCase()}`));
        const response = await api.post(endpoint, payload);
        if (response.data?.success) {
          toast.success(response.data?.message || `${moduleName} created successfully`);
          fetchData();
        }
      } else {
        const endpoint = isSubService 
          ? `/master/subservice/${editingItem.id}` 
          : (isVehicleType ? `/master/vehicleType/${editingItem.id}` : (isFuelType ? `/master/fuelType/${editingItem.id}` : `/master/${moduleName.toLowerCase()}/${editingItem.id}`));
        const response = await api.put(endpoint, payload);
        if (response.data?.success) {
          toast.success(response.data?.message || `${moduleName} updated successfully`);
          fetchData();
        }
      }
      setIsPanelOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to save ${moduleName}`);
    }
  };

  const getColWidthClass = (col: string, total: number) => {
    const cLower = col.toLowerCase();
    
    if (total === 6) {
      if (cLower === 'name') return 'w-[25%]';
      if (cLower.includes('service')) return 'w-[20%]';
      if (cLower === 'image') return 'w-[15%]';
      if (cLower === 'price') return 'w-[15%]';
      if (cLower === 'duration') return 'w-[15%]';
    }

    if (total === 2) {
      return 'w-[40%]';
    }
    if (total === 3) {
      if (cLower.includes('name')) return 'w-[40%]';
      return 'w-[30%]';
    }
    if (total === 4) {
      if (cLower.includes('name')) return 'w-[30%]';
      if (cLower === 'category' || cLower.includes('code') || cLower.includes('make') || cLower.includes('brand')) return 'w-[25%]';
      if (cLower === 'price' || cLower.includes('image')) return 'w-[20%]';
      if (cLower === 'status') return 'w-[15%]';
    }
    if (total === 5) {
      if (cLower === 'title' || cLower.includes('name')) return 'w-[25%]';
      if (cLower === 'type' || cLower === 'position') return 'w-[20%]';
      if (cLower === 'image' || cLower === 'status') return 'w-[15%]';
      return 'w-[15%]';
    }
    if (cLower.includes('name')) {
      return 'w-[30%]';
    }
    return 'w-[15%]';
  };

  const getActionsColWidth = (total: number) => {
    if (total === 2) return 'w-[20%]';
    if (total === 3) return 'w-[20%]';
    if (total === 4) return 'w-[15%]';
    if (total === 6) return 'w-[10%]';
    return 'w-[15%]';
  };

  const getColAlignClass = (col: string) => {
    const cLower = col.toLowerCase();
    if (cLower.includes('name') || cLower === 'title') {
      return 'text-left px-6';
    }
    return 'text-center';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full bg-slate-50/60 min-h-screen">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <button 
            type="button"
            className="cursor-pointer hover:text-red-600 transition-colors font-semibold uppercase tracking-wider"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate_view', { detail: 'dashboard' }))}
          >
            Dashboard
          </button> 
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
          <button 
            type="button"
            className="cursor-pointer hover:text-red-600 transition-colors font-semibold uppercase tracking-wider"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate_view', { detail: 'master-role' }))}
          >
            Master Management
          </button> 
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
          <span className="text-red-600 font-bold">
            {displayName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 text-sm lg:text-base">
            <Plus className="w-4 h-4 stroke-[2.5]" /> Create
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {loading ? (
          <StatsShimmer count={3} />
        ) : (
          stats.map((card, i) => {
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
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-1">{card.sub}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 outline-none" />
        </div>
        {(moduleName.toLowerCase() === 'subservice' || moduleName.toLowerCase() === 'sub-service') && (
          <div className="w-56">
            <CustomSelect
              value={serviceFilter}
              onChange={setServiceFilter}
              options={[
                { label: 'All Services', value: 'all' },
                ...serviceOptions
              ]}
              className="bg-white border-slate-200 hover:border-slate-300 rounded-xl"
            />
          </div>
        )}
        <div className="w-48">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Status', value: 'All Status' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' }
            ]}
            className="bg-white border-slate-200 hover:border-slate-300 rounded-xl"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              {columns.filter(col => col.toLowerCase() !== 'status').map(col => (
                <th key={col} className={`px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs ${getColWidthClass(col, columns.length)} ${getColAlignClass(col)}`}>
                  {col}
                </th>
              ))}
              <th className={`px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs text-right ${getActionsColWidth(columns.length)}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <TableShimmer rows={5} columns={columns.filter(col => col.toLowerCase() !== 'status').length + 1} />
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-400 font-semibold">
                  No {displayName.toLowerCase()} found
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
              <React.Fragment key={row.id || Math.random()}>
              <tr 
                key={row.id} 
                className={`hover:bg-slate-50 transition-colors group`}
              >
                {columns.filter(col => col.toLowerCase() !== 'status').map(col => {
                  const cUpper = col.toUpperCase();
                  const widthClass = getColWidthClass(col, columns.length);
                  const alignClass = getColAlignClass(col);
                  if (cUpper === 'ID') {
                    return <td key={col} className={`px-6 py-5 font-medium text-slate-900 ${widthClass} ${alignClass}`}>{row.id}</td>;
                  }
                  if (cUpper === 'S.NO' || cUpper === 'S.NO.') {
                    return <td key={col} className={`px-6 py-5 font-medium text-slate-900 ${widthClass} ${alignClass}`}>{index + 1}</td>;
                  }
                  if (col.toLowerCase().includes('name') || col.toLowerCase() === 'title') {
                    return <td key={col} className={`px-6 py-5 text-slate-800 font-semibold ${widthClass} ${alignClass}`}>{row.title || row.name || '-'}</td>;
                    return <td key={col} className={`px-6 py-5 text-slate-600 ${widthClass} ${alignClass}`}>{row.title || row.name || '-'}</td>;
                  }
                  if (col.toLowerCase() === 'make' || col.toLowerCase() === 'make / brand' || col.toLowerCase() === 'brand') {
                    let makeVal = row.makeId || row.make;
                    if (makeVal && typeof makeVal === 'object') {
                      makeVal = makeVal.name || makeVal.title || '-';
                    } else if (makeVal) {
                      const found = makeOptions.find(m => m.value === makeVal);
                      if (found) makeVal = found.label;
                    }
                    return <td key={col} className={`px-6 py-5 text-slate-600 ${widthClass} ${alignClass}`}>{makeVal || '-'}</td>;
                  }
                  if (col.toLowerCase() === 'service' || col.toLowerCase() === 'parent service') {
                    let serviceVal = row.serviceId || row.service;
                    if (serviceVal && typeof serviceVal === 'object') {
                      serviceVal = serviceVal.name || serviceVal.title || '-';
                    } else if (serviceVal) {
                      const found = serviceOptions.find(s => s.value === serviceVal);
                      if (found) serviceVal = found.label;
                    }
                    return <td key={col} className={`px-6 py-5 text-slate-600 ${widthClass} ${alignClass}`}>{serviceVal || '-'}</td>;
                  }
                  if (col.toLowerCase() === 'image') {
                    const hasError = imgErrors[row.id];
                    return (
                      <td key={col} className={`px-6 py-5 ${widthClass} ${alignClass}`}>
                        {row.image && !hasError ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-2xs mx-auto flex items-center justify-center bg-slate-50">
                            <img 
                              src={row.image} 
                              alt={row.name} 
                              className="w-full h-full object-cover" 
                              onError={() => setImgErrors(prev => ({ ...prev, [row.id]: true }))}
                            />
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">-</span>
                        )}
                      </td>
                    );
                  }
                  if (col.toLowerCase() === 'instant') {
                    const isInstant = row.isInstant === true || row.isInstant === 'true';
                    return (
                      <td key={col} className={`px-6 py-5 ${widthClass} ${alignClass}`}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleInstant(row);
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isInstant ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              isInstant ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                    );
                  }
                  const fieldKey = col.toLowerCase().replace(' ', '');
                  let cellValue = row[fieldKey];
                  if (cellValue && typeof cellValue === 'object') {
                    cellValue = cellValue.name || cellValue.type || cellValue.title || JSON.stringify(cellValue);
                  }
                  return <td key={col} className={`px-6 py-5 text-slate-600 ${widthClass} ${alignClass}`}>{cellValue || '-'}</td>;
                })}
                <td className={`px-6 py-5 ${getActionsColWidth(columns.length)}`}>
                  <div className="flex gap-3 items-center justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(row);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none mr-0.5 ${
                        row.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          row.status === 'Active' ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleView(row); }} className="text-blue-600 hover:text-blue-800 p-1 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="text-emerald-600 hover:text-emerald-800 p-1 transition-colors"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(row.id, row.name); }} className="text-red-600 hover:text-red-800 p-1 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>

              </React.Fragment>
            )))}
          </tbody>
        </table>
      </div>

      <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={mode === 'add' ? 'Add' : ((editingItem?.name || editingItem?.title) ? `${mode === 'view' ? 'View' : 'Edit'} ${editingItem.name || editingItem.title}` : displayName)}>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-4">
            {/* Logo / Image Upload container at the top of the form if fields config has an 'image' field */}
            {fields.some(f => f.name === 'image') && (
              <div className="space-y-2">
                <div 
                  onClick={() => mode !== "view" && fileInputRef.current?.click()} 
                  className={`border-2 border-dashed border-blue-200 hover:border-red-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-gradient-to-b from-red-50/40 via-red-50/10 to-transparent transition-all group shadow-2xs ${mode === "view" ? 'cursor-default' : 'cursor-pointer hover:shadow-md hover:shadow-red-500/5'}`}
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200/80 shadow-md mb-3 overflow-hidden group-hover:scale-105 transition-all relative">
                    {photo ? (
                      <img src={photo} className="w-full h-full object-cover" alt="Preview" />
                    ) : ['vehicletype', 'vehicle-type', 'make', 'model', 'brand'].includes(moduleName.toLowerCase()) ? (
                      <Car className="w-8 h-8 text-red-500" />
                    ) : ['service', 'subservice', 'sub-service'].includes(moduleName.toLowerCase()) ? (
                      <Wrench className="w-8 h-8 text-red-500" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                  {mode !== "view" && (
                    <>
                      <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Upload Image
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium mt-1">PNG, JPG or WEBP up to 5MB</span>
                    </>
                  )}
                </div>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  disabled={mode === "view"} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setRawSelectedFile(file);
                      setRawPreviewUrl(URL.createObjectURL(file));
                      setCropModalOpen(true);
                    }
                  }} 
                />
              </div>
            )}

            {/* Information Section with Active Toggle Opposite */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pt-1 pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-red-600 rounded-full" />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Information</h4>
                </div>
                <SectionActiveToggle 
                  checked={editingItem.status === 'Active' || editingItem.active === true} 
                  onChange={v => setEditingItem({...editingItem, status: v ? 'Active' : 'Inactive', active: v})} 
                  disabled={mode === 'view'} 
                />
              </div>

              {fields.filter(f => f.name !== 'image' && f.name !== 'status').map(f => (
                  <div key={f.name}>
                      <label className="sub-admin-form-label">{f.label}</label>
                      {f.type === 'dropdown' ? (() => {
                          const rawOptions = (f.name === 'state' || f.name === 'emirate') && moduleName.toLowerCase() === 'city' ? stateOptions :
                                           (f.name === 'makeId' && moduleName.toLowerCase() === 'model' ? makeOptions :
                                           (f.name === 'serviceId' && (moduleName.toLowerCase() === 'subservice' || moduleName.toLowerCase() === 'sub-service') ? serviceOptions : (f.options || [])));
                          
                          const formattedOptions = rawOptions.map((o: any) => {
                             const isObj = typeof o === 'object';
                             return {
                               label: isObj ? o.label : o,
                               value: isObj ? o.value : o
                             };
                          });

                          return (
                            <CustomSelect
                              disabled={mode === 'view' || ((moduleName === 'State' || moduleName === 'Emirate') && f.name === 'country')}
                              value={editingItem[f.name] || ((moduleName === 'State' || moduleName === 'Emirate') && f.name === 'country' ? 'UAE' : '')}
                              onChange={(val) => setEditingItem({...editingItem, [f.name]: val})}
                              options={formattedOptions}
                              placeholder={`Select ${f.label}`}
                              className="w-full bg-slate-50/50"
                            />
                          );
                      })() : f.type === 'toggle' ? (
                          <div className="flex items-center justify-between p-3.5 bg-slate-50/60 border border-slate-200 rounded-xl mt-1">
                            <span className="text-xs font-semibold text-slate-900">
                              {f.name === 'isInstant' ? (editingItem[f.name] ? 'Yes' : 'No') : (editingItem[f.name] || 'Inactive')}
                            </span>
                            <button 
                              type="button" 
                              disabled={mode === 'view'}
                              onClick={() => {
                                if (f.name === 'isInstant') {
                                  setEditingItem({...editingItem, [f.name]: !editingItem[f.name]});
                                } else {
                                  setEditingItem({...editingItem, [f.name]: editingItem[f.name] === 'Active' ? 'Inactive' : 'Active'});
                                }
                              }}
                              className={`w-11 h-6 rounded-full transition-colors relative disabled:opacity-50 ${(f.name === 'isInstant' ? editingItem[f.name] : editingItem[f.name] === 'Active') ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${(f.name === 'isInstant' ? editingItem[f.name] : editingItem[f.name] === 'Active') ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                      ) : f.type === 'textarea' ? (
                          <textarea 
                              disabled={mode === 'view'} 
                              rows={3} 
                              value={editingItem[f.name] || ''} 
                              onChange={(e) => setEditingItem({...editingItem, [f.name]: e.target.value})} 
                              placeholder={f.label} 
                              className="sub-admin-form-input resize-none py-2.5" 
                          />
                      ) : (
                          <input type={f.type || 'text'} disabled={mode === 'view'} required value={editingItem[f.name] || ''} onChange={(e) => setEditingItem({...editingItem, [f.name]: e.target.value})} placeholder={f.label} className="sub-admin-form-input" />
                      )}
                  </div>
              ))}
            </div>
          </div>

          {/* Form Actions Footer - Exact position matching user screenshot */}
          <div className="pt-4 border-t border-slate-200/80 flex items-center gap-3 mt-auto">
            <button 
              type="button" 
              onClick={() => setIsPanelOpen(false)} 
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={mode === 'view' || !isFormValid} 
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
            >
              {mode === 'edit' ? 'Update' : (mode === 'view' ? 'Save' : 'Save')}
            </button>
          </div>
        </form>
      </SlidePanel>

      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawPreviewUrl}
        file={rawSelectedFile}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={async (croppedFile, croppedUrl) => {
          setPhoto(croppedUrl);
          setEditingItem(prev => ({ ...prev, image: croppedUrl }));
          toast.loading('Uploading Image...', { id: 'imgUpload' });
          try {
            const uploadedUrl = await uploadImage(croppedFile);
            toast.dismiss('imgUpload');
            toast.success('Image uploaded successfully');
            setPhoto(uploadedUrl);
            setEditingItem(prev => ({ ...prev, image: uploadedUrl }));
            setSelectedFile(null);
          } catch (err: any) {
            toast.dismiss('imgUpload');
            toast.error(err.message || 'Image upload failed');
            setSelectedFile(croppedFile);
          }
        }}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        name={deleteModal.name}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
