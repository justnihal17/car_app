import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Edit2, Trash2, Eye, LayoutDashboard, Shield, Wrench, UserCheck, UserX, ChevronRight, ChevronLeft, Sparkles, Upload, X, User, Car, Image as ImageIcon, ChevronDown, Layers, ExternalLink, Zap, MoreHorizontal } from 'lucide-react';
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
import { StatsShimmer, TableShimmer } from '../shimmer/ShimmerLoader';
import { ImageCropModal } from '../common/ImageCropModal';
import { SafeImage } from '../common/SafeImage';

interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'dropdown' | 'toggle' | 'number' | 'string_array';
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
  const [arrayInputs, setArrayInputs] = useState<Record<string, string>>({});
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string, name: string}>({isOpen: false, id: '', name: ''});
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionMenuId && !(event.target as HTMLElement).closest('.action-menu-container')) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenuId]);
  
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isPanelOpen) {
      const img = editingItem.image || editingItem.icon || editingItem.imageUrl || editingItem.photo || editingItem.avatar;
      if (img) {
        setPhoto(img);
      } else {
        setPhoto(null);
      }
      setSelectedFile(null);
      setRawSelectedFile(null);
      setRawPreviewUrl(null);
      setArrayInputs({});
    }
  }, [isPanelOpen, editingItem.image, editingItem.icon, editingItem.imageUrl, editingItem.photo, editingItem.avatar]);

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
          const img = item.image || item.icon || item.imageUrl || item.photo || item.avatar || '';
          return {
            ...item,
            id: item._id || item.id,
            name: item.name || item.title || item.type || '',
            title: item.title || item.name || '',
            description: desc,
            shortDescription: desc,
            detailedDescription: desc,
            image: img,
            icon: img,
            imageUrl: img,
            status: item.status || (item.active !== false ? 'Active' : 'Inactive')
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

  const handleCropComplete = async (croppedFile: File, croppedPreviewUrl: string) => {
    setPhoto(croppedPreviewUrl);
    setEditingItem(prev => ({ ...prev, image: croppedPreviewUrl }));
    
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
        const itemVal = item.name || item.title || item.type || '';
        const matchesSearch = itemVal.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = (statusFilter === 'All Status' || item.status === statusFilter);
        const isSubServiceMod = (moduleName.toLowerCase() === 'subservice' || moduleName.toLowerCase() === 'sub-service');
        const matchesService = !isSubServiceMod || serviceFilter === 'all' || 
          (String(item.serviceId) === String(serviceFilter) || String(item.service?._id || item.service?.id) === String(serviceFilter) || String(item.service?.name || item.serviceName || item.service || '').toLowerCase() === String(serviceFilter).toLowerCase() || String(item.serviceId) === String(serviceFilter));
        return matchesSearch && matchesStatus && matchesService;
    });
  }, [data, searchTerm, statusFilter, serviceFilter, moduleName]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredData.length, totalPages, currentPage]);

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
    { label: displayName.toUpperCase(), value: data.length, icon: LayoutDashboard, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Records' },
    { label: 'ACTIVE', value: data.filter(d => d.status === 'Active').length, icon: Shield, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Operational' },
    { label: 'INACTIVE', value: data.filter(d => d.status === 'Inactive').length, icon: Wrench, color: 'text-slate-600 bg-[#F8FAFC] border-slate-200', sub: 'Off-line' },
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
    const desc = item.description || item.shortDescription || item.detailedDescription || '';
    const img = item.image || item.icon || item.imageUrl || item.photo || item.avatar || '';
    setEditingItem({
      ...item,
      id: item.id || item._id,
      description: desc,
      shortDescription: desc,
      detailedDescription: desc,
      image: img,
      icon: img,
      imageUrl: img,
      state: mappedState,
      serviceId: mappedServiceId,
      makeId: mappedMakeId
    }); 
    setPhoto(img || null);
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

  const handleView = (item: any) => { 
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
    const desc = item.description || item.shortDescription || item.detailedDescription || '';
    const img = item.image || item.icon || item.imageUrl || item.photo || item.avatar || '';
    setEditingItem({
      ...item,
      id: item._id || item.id,
      name: item.name || item.title || item.type || '',
      title: item.title || item.name || '',
      description: desc,
      shortDescription: desc,
      detailedDescription: desc,
      image: img,
      icon: img,
      imageUrl: img,
      status: item.status || (item.active !== false ? 'Active' : 'Inactive'),
      state: mappedState,
      serviceId: mappedServiceId,
      makeId: mappedMakeId
    });
    setPhoto(img || null);
    setMode('view');
    setIsPanelOpen(true);
  };
  
  const handleDeleteClick = async (id: string, name: string) => {
    if (moduleName.toLowerCase() === 'service') {
      try {
        const response = await api.get('/admin/subservice/admin/service/' + id);
        const resData = response.data;
        const list = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : (resData?.subServices || resData?.list || []));
        const activeSubs = list.filter((s: any) => s.deleted !== true && s.isDeleted !== true);
        
        if (activeSubs.length > 0) {
          toast.error(
            <div className="flex flex-col text-left">
              <span className="font-bold text-red-900 text-sm">Cannot Delete Service</span>
              <span className="text-xs text-red-700 font-normal mt-0.5">Please delete all associated sub-services first.</span>
            </div>
          );
          return;
        }
      } catch (error) {
        toast.error('Failed to verify service dependencies. Please try again.');
        return;
      }
    }
    if (moduleName.toLowerCase() === 'brand' || moduleName.toLowerCase() === 'make') {
      try {
        let modelList: any[] = [];
        try {
          const response = await api.get('/master/model/admin');
          const payload = response.data?.data || response.data;
          if (Array.isArray(payload)) {
            modelList = payload;
          } else if (payload) {
            modelList = payload.models || payload.model || payload.list || payload.data || [];
            if (!Array.isArray(modelList) || modelList.length === 0) {
              const possibleArray = Object.values(payload).find(v => Array.isArray(v));
              if (possibleArray) modelList = possibleArray as any[];
            }
          }
        } catch (e) {
          const response = await api.get('/master/model');
          const payload = response.data?.data || response.data;
          if (Array.isArray(payload)) modelList = payload;
          else if (payload) modelList = payload.models || payload.list || [];
        }

        const activeModels = modelList.filter((m: any) => {
          if (m.deleted === true || m.isDeleted === true) return false;
          
          const mMakeId = typeof m.makeId === 'object' ? (m.makeId?._id || m.makeId?.id) : m.makeId;
          const mMake = typeof m.make === 'object' ? (m.make?._id || m.make?.id) : m.make;
          const mBrandId = typeof m.brandId === 'object' ? (m.brandId?._id || m.brandId?.id) : m.brandId;
          const mBrand = typeof m.brand === 'object' ? (m.brand?._id || m.brand?.id) : m.brand;
          
          const mMakeName = typeof m.makeId === 'object' ? m.makeId?.name : (typeof m.make === 'object' ? m.make?.name : (m.makeName || m.brandName || m.make || m.brand));
          
          const matchesId = (
            (mMakeId && String(mMakeId) === String(id)) ||
            (mMake && String(mMake) === String(id)) ||
            (mBrandId && String(mBrandId) === String(id)) ||
            (mBrand && String(mBrand) === String(id))
          );
          
          const matchesName = (
            mMakeName && name && String(mMakeName).trim().toLowerCase() === String(name).trim().toLowerCase()
          );

          return matchesId || matchesName;
        });

        if (activeModels.length > 0) {
          toast.error(
            <div className="flex flex-col text-left">
              <span className="font-bold text-red-900 text-sm">Cannot Delete Brand</span>
              <span className="text-xs text-red-700 font-normal mt-0.5">Please delete all models under this brand first.</span>
            </div>
          );
          return;
        }
      } catch (error) {
        console.error('Failed to verify brand model dependencies', error);
      }
    }
    if (moduleName.toLowerCase() === 'emirate' || moduleName.toLowerCase() === 'state') {
      try {
        let cityList: any[] = [];
        try {
          const response = await api.get('/master/city/admin');
          const payload = response.data?.data || response.data;
          if (Array.isArray(payload)) {
            cityList = payload;
          } else if (payload) {
            cityList = payload.cities || payload.city || payload.list || payload.data || [];
            if (!Array.isArray(cityList) || cityList.length === 0) {
              const possibleArray = Object.values(payload).find(v => Array.isArray(v));
              if (possibleArray) cityList = possibleArray as any[];
            }
          }
        } catch (e) {
          const response = await api.get('/master/city');
          const payload = response.data?.data || response.data;
          if (Array.isArray(payload)) cityList = payload;
          else if (payload) cityList = payload.cities || payload.list || [];
        }

        const activeCities = cityList.filter((c: any) => {
          if (c.deleted === true || c.isDeleted === true) return false;
          
          const cStateId = typeof c.stateId === 'object' ? (c.stateId?._id || c.stateId?.id) : c.stateId;
          const cState = typeof c.state === 'object' ? (c.state?._id || c.state?.id) : c.state;
          const cEmirateId = typeof c.emirateId === 'object' ? (c.emirateId?._id || c.emirateId?.id) : c.emirateId;
          const cEmirate = typeof c.emirate === 'object' ? (c.emirate?._id || c.emirate?.id) : c.emirate;
          
          const cStateName = typeof c.stateId === 'object' ? c.stateId?.name : (typeof c.state === 'object' ? c.state?.name : (c.stateName || c.emirateName || (typeof c.state === 'string' ? c.state : (typeof c.emirate === 'string' ? c.emirate : ''))));
          
          const matchesId = (
            (cStateId && String(cStateId) === String(id)) ||
            (cState && String(cState) === String(id)) ||
            (cEmirateId && String(cEmirateId) === String(id)) ||
            (cEmirate && String(cEmirate) === String(id))
          );
          
          const matchesName = (
            cStateName && name && String(cStateName).trim().toLowerCase() === String(name).trim().toLowerCase()
          );

          return matchesId || matchesName;
        });

        if (activeCities.length > 0) {
          toast.error(
            <div className="flex flex-col text-left">
              <span className="font-bold text-red-900 text-sm">Cannot Delete Emirate</span>
              <span className="text-xs text-red-700 font-normal mt-0.5">Please delete all cities under this emirate first.</span>
            </div>
          );
          return;
        }
      } catch (error) {
        console.error('Failed to verify emirate city dependencies', error);
      }
    }
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
            const finalImg = selectedFile ? uploadedImageUrl : (editingItem[f.name] || editingItem.image || editingItem.icon || editingItem.imageUrl || '');
            payload.image = finalImg;
            payload.icon = finalImg;
            payload.imageUrl = finalImg;
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
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold tracking-tight transition-colors uppercase text-slate-500 group-hover:text-slate-800">{card.label}</span>
                  <div className={`p-2 rounded-xl border ${card.color} transition-all duration-300 group-hover:scale-110 shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.sub}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-end">
        <div className="flex items-center gap-2.5 w-full md:w-auto">
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
          <div className="relative w-full md:w-80 group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-lg text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-sm" 
            />
          </div>
          <button className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg shadow-sm transition-all text-sm shrink-0">
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              {columns.map(col => (
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
              <TableShimmer rows={5} columns={columns.length + 1} />
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-slate-400 font-semibold">
                  No {displayName.toLowerCase()} found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
              <React.Fragment key={row.id || Math.random()}>
              <tr 
                key={row.id} 
                className={`hover:bg-slate-50 transition-colors group`}
              >
                {columns.map(col => {
                  const cUpper = col.toUpperCase();
                  const widthClass = getColWidthClass(col, columns.length);
                  const alignClass = getColAlignClass(col);
                  if (cUpper === 'ID') {
                    return <td key={col} className={`px-6 py-5 font-medium text-slate-900 ${widthClass} ${alignClass}`}>{row.id}</td>;
                  }
                  if (cUpper === 'S.NO' || cUpper === 'S.NO.') {
                    return <td key={col} className={`px-6 py-5 font-medium text-slate-900 ${widthClass} ${alignClass}`}>{index + 1}</td>;
                  }
                  if (col.toLowerCase() === 'status') {
                    return (
                      <td key={col} className={`px-6 py-5 ${widthClass} ${alignClass}`}>
                        <StatusBadge status={row.status || 'Active'} />
                      </td>
                    );
                  }
                  if (col.toLowerCase().includes('name') || col.toLowerCase() === 'title') {
                    const rawVal = row.title || row.name || '-';
                    const formattedVal = typeof rawVal === 'string' && rawVal.includes('_')
                      ? rawVal.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                      : rawVal;
                    return <td key={col} className={`px-6 py-5 text-slate-800 font-medium ${widthClass} ${alignClass}`}>{formattedVal}</td>;
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
                    return <td key={col} className={`px-6 py-5 text-slate-600 whitespace-nowrap ${widthClass} ${alignClass}`}>{serviceVal || '-'}</td>;
                  }
                  if (col.toLowerCase() === 'emirate' || col.toLowerCase() === 'state') {
                    let stateVal = row.stateId || row.emirateId || row.state || row.emirate;
                    if (stateVal && typeof stateVal === 'object') {
                      stateVal = stateVal.name || stateVal.title || '-';
                    } else if (stateVal) {
                      const found = stateOptions.find(s => s.value === stateVal);
                      if (found) stateVal = found.label;
                    }
                    return <td key={col} className={`px-6 py-5 text-slate-600 ${widthClass} ${alignClass}`}>{stateVal || '-'}</td>;
                  }
                  if (col.toLowerCase() === 'image') {
                    const hasError = imgErrors[row.id];
                    return (
                      <td key={col} className={`px-6 py-5 ${widthClass} ${alignClass}`}>
                        {row.image && !hasError ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-2xs mx-auto flex items-center justify-center bg-slate-50">
                            <SafeImage 
                              src={row.image} 
                              alt={row.name} 
                              className="w-full h-full object-contain" 
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
                <td className="px-4 py-4 pr-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end relative action-menu-container">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenActionMenuId(openActionMenuId === (row.id || row._id) ? null : (row.id || row._id));
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {openActionMenuId === (row.id || row._id) && (
                      <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-[99] animate-in fade-in zoom-in-95 duration-100 text-left ${index >= Math.max(0, paginatedData.length - 3) ? 'bottom-full mb-1 origin-bottom-right' : 'top-10 origin-top-right'}`}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleView(row); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-slate-500" /> View Details
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleEdit(row); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500" /> Edit
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleToggleStatus(row); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          {row.status === 'Active' ? <UserX className="w-4 h-4 text-slate-500" /> : <UserCheck className="w-4 h-4 text-slate-500" />} 
                          {row.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <div className="border-t border-slate-100 my-1"></div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); handleDeleteClick(row.id || row._id, row.name || row.title); }} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>

              </React.Fragment>
            )))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 font-medium">
                Showing <span className="text-slate-900 font-bold">{startIndex + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="text-slate-900 font-bold">{filteredData.length}</span> results
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1.5 px-2">
                {[...Array(totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  const isCurrent = page === currentPage;
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                          isCurrent 
                            ? 'bg-red-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={mode === 'add' ? 'Add' : ((editingItem?.name || editingItem?.title) ? `${mode === 'view' ? 'View' : 'Edit'} ${editingItem.name || editingItem.title}` : displayName)}>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-4">
            {/* Information Section Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 shadow-sm">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{moduleName} Information</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Basic details and configuration.</p>
                  </div>
                </div>
                <SectionActiveToggle 
                  checked={editingItem.status === 'Active' || editingItem.active === true} 
                  onChange={v => setEditingItem({...editingItem, status: v ? 'Active' : 'Inactive', active: v})} 
                  disabled={mode === 'view'} 
                />
              </div>

              <div className="p-5 space-y-5">
                {/* Horizontal Profile / Logo Photo Row inside Card */}
                {fields.some(f => f.name === 'image') && (
                  <div className="flex items-center gap-5 pb-2">
                    <div 
                      onClick={() => {
                        if (photo || editingItem.image) {
                          setShowImageModal(true);
                        } else if (mode !== "view") {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`w-16 h-16 shrink-0 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden transition-all relative ${(photo || editingItem.image) ? 'cursor-pointer hover:scale-105' : (mode !== "view" ? 'cursor-pointer hover:bg-slate-100' : '')}`}
                    >
                      {(photo || editingItem.image) ? (
                        <SafeImage src={photo || editingItem.image} className="w-full h-full object-cover" alt="Preview" />
                      ) : ['vehicletype', 'vehicle-type', 'make', 'model', 'brand'].includes(moduleName.toLowerCase()) ? (
                        <Car className="w-6 h-6 text-slate-400" />
                      ) : ['service', 'subservice', 'sub-service'].includes(moduleName.toLowerCase()) ? (
                        <Wrench className="w-6 h-6 text-slate-400" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    {mode !== "view" && (
                      <div className="flex flex-col gap-1.5">
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors w-fit flex items-center gap-1.5 shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-500" /> Change Photo
                        </button>
                        <span className="text-[11px] text-slate-400 font-medium">PNG, JPG or WEBP up to 5MB</span>
                      </div>
                    )}
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      disabled={mode === "view"} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const fileUrl = URL.createObjectURL(file);
                          setRawSelectedFile(file);
                          setRawPreviewUrl(fileUrl);
                          setCropModalOpen(true);
                          if (e.target) {
                            e.target.value = '';
                          }
                        }
                      }} 
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {fields.filter(f => f.name !== 'image' && f.name !== 'status').map(f => (
                      <div key={f.name}>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
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
                                  className="w-full bg-[#F8FAFC]"
                                  placement="auto"
                                />
                              );
                          })() : f.type === 'toggle' ? (
                              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg h-[38px]">
                                <span className="text-sm text-slate-700">
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
                          ) : f.type === 'string_array' ? (
                              <div className="space-y-2">
                                {mode !== 'view' && (
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="text"
                                      value={arrayInputs[f.name] || ''}
                                      onChange={(e) => setArrayInputs({...arrayInputs, [f.name]: e.target.value})}
                                      placeholder={`Enter ${f.label.toLowerCase()} point`}
                                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          let val = arrayInputs[f.name]?.trim();
                                          if (val) {
                                            val = val.replace(/^[•\-\*]\s*/g, '');
                                            const currentList = Array.isArray(editingItem[f.name]) ? editingItem[f.name] : (typeof editingItem[f.name] === 'string' && editingItem[f.name] ? [editingItem[f.name]] : []);
                                            setEditingItem({...editingItem, [f.name]: [...currentList, val]});
                                            setArrayInputs({...arrayInputs, [f.name]: ''});
                                          }
                                        }
                                      }}
                                    />
                                    <button
                                      type="button"
                                      disabled={!arrayInputs[f.name]?.trim()}
                                      onClick={() => {
                                        let val = arrayInputs[f.name]?.trim();
                                        if (val) {
                                          val = val.replace(/^[•\-\*]\s*/g, '');
                                          const currentList = Array.isArray(editingItem[f.name]) ? editingItem[f.name] : (typeof editingItem[f.name] === 'string' && editingItem[f.name] ? [editingItem[f.name]] : []);
                                          setEditingItem({...editingItem, [f.name]: [...currentList, val]});
                                          setArrayInputs({...arrayInputs, [f.name]: ''});
                                        }
                                      }}
                                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-1 font-medium text-sm whitespace-nowrap disabled:opacity-50"
                                    >
                                      <Plus className="w-4 h-4" /> Add
                                    </button>
                                  </div>
                                )}
                                {(() => {
                                  const list = Array.isArray(editingItem[f.name]) ? editingItem[f.name] : (typeof editingItem[f.name] === 'string' && editingItem[f.name] ? [editingItem[f.name]] : []);
                                  if (list.length === 0) return null;
                                  return (
                                    <ul className="space-y-1.5 mt-2 max-h-40 overflow-y-auto custom-scrollbar">
                                      {list.map((val: string, idx: number) => (
                                        <li key={idx} className="flex items-start justify-between gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-lg group">
                                          <span className="text-xs text-slate-700 leading-snug flex-1 break-words">{val}</span>
                                          {mode !== 'view' && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const newList = [...list];
                                                newList.splice(idx, 1);
                                                setEditingItem({...editingItem, [f.name]: newList});
                                              }}
                                              className="text-slate-400 hover:text-red-500 transition-all p-1 mt-0.5 shrink-0"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  );
                                })()}
                              </div>
                          ) : f.type === 'textarea' ? (
                              <textarea 
                                  disabled={mode === 'view'} 
                                  rows={3} 
                                  value={editingItem[f.name] || ''} 
                                  onChange={(e) => setEditingItem({...editingItem, [f.name]: e.target.value})} 
                                  placeholder={f.label} 
                                  className={`w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all resize-none ${mode === 'view' ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                              />
                          ) : (
                              <input 
                                type={f.type || 'text'} 
                                disabled={mode === 'view'} 
                                required={f.name !== 'description'} 
                                value={editingItem[f.name] || ''} 
                                onChange={(e) => setEditingItem({...editingItem, [f.name]: e.target.value})} 
                                placeholder={f.label} 
                                className={`w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all ${mode === 'view' ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                              />
                          )}
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer - Exact styling matching SubAdmin drawer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3 shrink-0 mt-auto">
            <button 
              type="button" 
              onClick={() => setIsPanelOpen(false)} 
              className="px-6 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={mode === 'view' || !isFormValid} 
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm shrink-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'edit' ? `Update ${moduleName}` : (mode === 'view' ? 'Save' : `Save ${moduleName}`)}
            </button>
          </div>
        </form>
      </SlidePanel>


      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        name={deleteModal.name}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={confirmDelete}
      />

      {/* Full Screen Image Modal */}
      {showImageModal && (photo || editingItem.image) && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowImageModal(false); }}
              className="absolute -top-12 right-0 md:-right-12 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            <SafeImage 
              src={photo || editingItem.image} 
              alt="Preview" 
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
