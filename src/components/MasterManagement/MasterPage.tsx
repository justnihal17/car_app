import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, Edit2, Trash2, Eye, LayoutDashboard, Shield, Wrench, UserCheck, UserX, ChevronRight, Sparkles, Upload, X, User } from 'lucide-react';
import { AnalyticsCard } from '../common/AnalyticsCard';
import { StatusBadge } from '../StatusBadge';
import { SlidePanel } from '../common/SlidePanel';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { getCompactDrawerClass, SectionActiveToggle } from '../SubAdminManagement/utils/subAdminFormUtils';
import { getLoggedInAdminName } from '../SubAdminManagement/subAdminDrawerUtils';

interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'dropdown' | 'toggle';
    options?: string[];
}

interface MasterPageProps {
  moduleName: string;
  columns: string[];
  fields: FieldConfig[];
}

export function MasterPage({ moduleName, columns, fields }: MasterPageProps) {
  const loggedInAdminName = getLoggedInAdminName();
  const [data, setData] = useState<any[]>([]);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>({});
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string, name: string}>({isOpen: false, id: '', name: ''});
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
  const [makeOptions, setMakeOptions] = useState<{ label: string; value: string }[]>([]);
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string }[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (isPanelOpen) {
      if (editingItem.image) {
        setPhoto(editingItem.image);
      } else {
        setPhoto(null);
      }
    }
  }, [isPanelOpen, editingItem.image]);

  const fetchData = async () => {
    try {
      const isSubService = moduleName.toLowerCase() === 'subservice';
      const endpoint = isSubService ? '/master/subservice' : `/master/${moduleName.toLowerCase()}`;
      let response;
      try {
        response = await api.get(endpoint);
      } catch (err: any) {
        if (err.response?.status === 404) {
          response = await api.get(`${endpoint}?all=true`);
        } else {
          throw err;
        }
      }

      if (response && (response.data?.success || Array.isArray(response.data?.data) || Array.isArray(response.data))) {
        const rawList = Array.isArray(response.data?.data) 
          ? response.data.data 
          : (Array.isArray(response.data) 
              ? response.data
              : (response.data?.makes || response.data?.models || response.data?.services || response.data?.list || [])
            );
          
        const mapped = rawList.map((item: any) => ({
          id: item._id || item.id,
          name: item.name || item.type || '',
          status: item.active !== false ? 'Active' : 'Inactive',
          ...item
        }));
        setData(mapped);
      }
    } catch (error: any) {
      console.error(`Failed to fetch ${moduleName}:`, error);
      const isLiveModule = ['role', 'state', 'city', 'service', 'skill', 'brand', 'color', 'make', 'model'].includes(moduleName.toLowerCase());
      if (!isLiveModule) {
        // Fallback for non-live master pages
        setData([
          { id: '1', name: `${moduleName} 1`, status: 'Active' as const },
          { id: '2', name: `${moduleName} 2`, status: 'Inactive' as const },
        ]);
      } else {
        setData([]);
        toast.error(`Failed to fetch ${moduleName} list`);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [moduleName]);

  useEffect(() => {
    if (moduleName.toLowerCase() === 'city') {
      const fetchStatesForDropdown = async () => {
        try {
          const response = await api.get('/master/state');
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
          let response;
          try {
            response = await api.get('/master/make');
          } catch (err: any) {
            response = await api.get('/master/make?all=true');
          }
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
          const response = await api.get('/master/service');
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
    }
  }, [moduleName]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
        const itemVal = item.name || item.type || '';
        return itemVal.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'All Status' || item.status === statusFilter);
    });
  }, [data, searchTerm, statusFilter]);

  const pluralNames: Record<string, string> = {
    role: 'Roles',
    skill: 'Skills',
    state: 'States',
    city: 'Cities',
    service: 'Services',
    color: 'Colors',
    make: 'Brands',
    model: 'Models'
  };
  const displayName = pluralNames[moduleName.toLowerCase()] || `${moduleName}s`;

  const stats = [
    { label: `Total ${displayName}`, value: data.length, icon: LayoutDashboard, color: 'text-red-600 bg-red-50 border-red-100', bgGrad: 'from-red-50/50 via-white to-white', sub: 'All' },
    { label: 'Active', value: data.filter(d => d.status === 'Active').length, icon: Shield, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', bgGrad: 'from-emerald-50/50 via-white to-white', sub: 'Operational' },
    { label: 'Inactive', value: data.filter(d => d.status === 'Inactive').length, icon: Wrench, color: 'text-amber-600 bg-amber-50 border-amber-100', bgGrad: 'from-amber-50/50 via-white to-white', sub: 'Disabled' },
  ];

  const handleAdd = () => { setMode('add'); setEditingItem({ status: 'Active' }); setIsPanelOpen(true); };
  
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
      const cleanModuleName = moduleName.toLowerCase();
      const payload: any = {
        status: newStatus
      };
      if (item.name) payload.name = item.name;
      if (item.code) payload.code = item.code;
      if (item.image) payload.image = item.image;
      if (item.makeId) payload.makeId = typeof item.makeId === 'object' ? item.makeId.id || item.makeId._id : item.makeId;

      const response = await api.put(`/master/${cleanModuleName}/${item.id}`, payload);
      if (response.data?.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleView = async (item: any) => { 
    try {
      const isSubService = moduleName.toLowerCase() === 'subservice';
      const endpoint = isSubService ? `/master/subservice/${item.id}` : `/master/${moduleName.toLowerCase()}/${item.id}`;
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
        setEditingItem({
          id: doc._id,
          name: doc.name || doc.type || '',
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
    if (moduleName === 'State' && data.some(d => d.name === name)) { // Placeholder: needs actual linked-city check
        alert(`This state has linked cities. Remove them first.`);
        return;
    }
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      const isSubService = moduleName.toLowerCase() === 'subservice';
      const endpoint = isSubService ? `/master/subservice/${deleteModal.id}` : `/master/${moduleName.toLowerCase()}/${deleteModal.id}`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mainFieldKey = 'name';
    const mainValue = editingItem[mainFieldKey] || editingItem.name || '';
    if (data.some(d => (d.name || d.type) === mainValue && d.id !== editingItem.id)) {
        alert("This name already exists.");
        return;
    }

    try {
      const payload: any = {
        name: mainValue
      };
      if (editingItem.status !== undefined) {
        payload.active = editingItem.status === 'Active';
      }
      fields.forEach(f => {
        if (f.name !== 'status' && f.name !== 'name' && f.name !== 'type') {
          let val = editingItem[f.name];
          if ((f.name === 'price' || f.name === 'duration') && val !== undefined && val !== null && val !== '') {
            const parsed = Number(val);
            if (!isNaN(parsed)) {
              val = parsed;
            }
          }
          payload[f.name] = val;
        }
      });

      const isSubService = moduleName.toLowerCase() === 'subservice';

      if (mode === 'add') {
        const endpoint = isSubService ? '/master/subservice' : `/master/${moduleName.toLowerCase()}`;
        const response = await api.post(endpoint, payload);
        if (response.data?.success) {
          toast.success(response.data?.message || `${moduleName} created successfully`);
          fetchData();
        }
      } else {
        const endpoint = isSubService ? `/master/subservice/${editingItem.id}` : `/master/${moduleName.toLowerCase()}/${editingItem.id}`;
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
    if (total === 2) {
      return 'w-1/3';
    }
    if (total === 4) {
      if (cLower.includes('name')) return 'w-[30%]';
      if (cLower === 'category' || cLower.includes('code') || cLower.includes('make') || cLower.includes('brand')) return 'w-[25%]';
      if (cLower === 'price' || cLower.includes('image')) return 'w-[20%]';
      if (cLower === 'status') return 'w-[15%]';
    }
    if (cLower.includes('name')) {
      return 'w-[50%]';
    }
    if (cLower === 'status') {
      return 'w-[15%]';
    }
    return 'w-[20%]';
  };

  const getColAlignClass = (col: string) => {
    const cLower = col.toLowerCase();
    if (cLower.includes('name')) {
      return 'text-left px-6';
    }
    return 'text-center';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full bg-slate-50/60 min-h-screen">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Dashboard</span> 
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> 
          <span>Master Management</span> 
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
        {stats.map((card, i) => {
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
        })}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-xl px-5 py-3 bg-white text-slate-700 font-medium outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              {columns.map(col => (
                <th key={col} className={`px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs ${getColWidthClass(col, columns.length)} ${getColAlignClass(col)}`}>
                  {col}
                </th>
              ))}
              <th className={`px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs text-right ${columns.length === 2 ? 'w-1/3' : (columns.length === 4 ? 'w-[15%]' : 'w-[15%]')}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((row, index) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
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
                  if (col.toLowerCase().includes('name')) {
                    return <td key={col} className={`px-6 py-5 text-slate-600 ${widthClass} ${alignClass}`}>{row.name}</td>;
                  }
                  if (col.toLowerCase() === 'status') {
                    return (
                      <td key={col} className={`px-6 py-5 ${widthClass} ${alignClass}`}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(row);
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mx-auto ${
                            row.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              row.status === 'Active' ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                    );
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
                    return (
                      <td key={col} className={`px-6 py-5 ${widthClass} ${alignClass}`}>
                        {row.image ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-2xs mx-auto flex items-center justify-center bg-slate-50">
                            <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">-</span>
                        )}
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
                <td className={`px-6 py-5 ${columns.length === 2 ? 'w-1/3' : (columns.length === 4 ? 'w-[15%]' : 'w-[15%]')}`}>
                  <div className="flex gap-3 items-center justify-end">
                    <button onClick={(e) => { e.stopPropagation(); handleView(row); }} className="text-red-600 hover:text-red-800 p-1 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="text-emerald-600 hover:text-emerald-800 p-1 transition-colors"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(row.id, row.name); }} className="text-red-600 hover:text-red-800 p-1 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={mode === 'add' ? 'Add' : ((editingItem?.name || editingItem?.title) ? `${mode === 'view' ? 'View' : 'Edit'} ${editingItem.name || editingItem.title}` : displayName)}>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-4">
            {/* Logo / Image Upload container at the top of the form if fields config has an 'image' field */}
            {fields.some(f => f.name === 'image') && (
              <div className="space-y-2">
                <label className="sub-admin-form-label">IMAGE</label>
                <label className={`block w-full border-2 border-dashed border-blue-200 hover:border-red-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-gradient-to-b from-red-50/40 via-red-50/10 to-transparent transition-all group shadow-2xs ${mode === "view" ? 'cursor-default' : 'cursor-pointer hover:shadow-md hover:shadow-red-500/5'}`}>
                  <input 
                    type="file" 
                    disabled={mode === "view"} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setPhoto(URL.createObjectURL(file));
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditingItem(prev => ({ ...prev, image: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200/80 shadow-md mb-3 overflow-hidden group-hover:scale-105 transition-all relative">
                    {photo ? (
                      <img src={photo} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <User className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                  {mode !== "view" && (
                    <>
                      <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Upload Image
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium mt-1">PNG, JPG, WEBP up to 5MB</span>
                    </>
                  )}
                </label>
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

              {fields.filter(f => f.name !== 'image' && f.name !== 'status' && f.type !== 'toggle').map(f => (
                  <div key={f.name}>
                      <label className="sub-admin-form-label">{f.label}</label>
                      {f.type === 'dropdown' ? (
                          <select 
                              disabled={mode === 'view' || (moduleName === 'State' && f.name === 'country')} 
                              value={editingItem[f.name] || (moduleName === 'State' && f.name === 'country' ? 'UAE' : '')} 
                              onChange={(e) => setEditingItem({...editingItem, [f.name]: e.target.value})} 
                              className="sub-admin-form-input cursor-pointer"
                          >
                              <option value="">Select {f.label}</option>
                              {(
                                f.name === 'state' && moduleName.toLowerCase() === 'city' ? stateOptions :
                                (f.name === 'makeId' && moduleName.toLowerCase() === 'model' ? makeOptions :
                                (f.name === 'serviceId' && (moduleName.toLowerCase() === 'subservice' || moduleName.toLowerCase() === 'sub-service') ? serviceOptions : (f.options || [])))
                              ).map((o: any) => {
                                 const isObj = typeof o === 'object';
                                 const label = isObj ? o.label : o;
                                 const val = isObj ? o.value : o;
                                 return <option key={val} value={val}>{label}</option>;
                              })}
                          </select>
                      ) : f.type === 'toggle' ? (
                          <div className="flex items-center justify-between p-3.5 bg-slate-50/60 border border-slate-200 rounded-xl">
                            <span className="text-xs font-semibold text-slate-900">{editingItem[f.name] || 'Inactive'}</span>
                            <button 
                              type="button" 
                              disabled={mode === 'view'}
                              onClick={() => setEditingItem({...editingItem, [f.name]: editingItem[f.name] === 'Active' ? 'Inactive' : 'Active'})}
                              className={`w-11 h-6 rounded-full transition-colors relative disabled:opacity-50 ${editingItem[f.name] === 'Active' ? 'bg-red-600' : 'bg-slate-300'}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${editingItem[f.name] === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
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
              disabled={mode === 'view'}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
            >
              {mode === 'edit' ? 'Update' : (mode === 'view' ? 'Save' : 'Save')}
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
    </div>
  );
}
