import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, RefreshCw, Globe, Edit2, Trash2, CheckCircle2, 
  XCircle, Image as ImageIcon, Upload, Loader2, ArrowUpDown, 
  AlertCircle, ExternalLink, Sparkles, Layers, Eye, MoreVertical,
  LayoutGrid, Table as TableIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { uploadImage } from '../../../services/uploadService';
import { HomePageServiceItem } from '../types/website.types';
import { DeleteConfirmationModal } from '../../DeleteConfirmationModal';

const MAX_HOME_SERVICES = 7;

interface ActionMenuProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  loadingView?: boolean;
}

function ActionMenu({ onView, onEdit, onDelete, loadingView }: ActionMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-10 overflow-hidden">
          <button 
            onClick={() => { setIsOpen(false); onView(); }}
            disabled={loadingView}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loadingView ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" /> : <Eye className="w-3.5 h-3.5" />} View Details
          </button>
          <button 
            onClick={() => { setIsOpen(false); onEdit(); }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Service
          </button>
          <button 
            onClick={() => { setIsOpen(false); onDelete(); }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function HomePageServicesManager() {
  const [services, setServices] = useState<HomePageServiceItem[]>([]);
  const [normalServices, setNormalServices] = useState<{ _id: string; name: string; image?: string; price?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'table' | 'grid'>('table');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HomePageServiceItem | null>(null);
  const [viewingItem, setViewingItem] = useState<HomePageServiceItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<HomePageServiceItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);

  // View Single Home Page Service Details via API (GET /admin/service/home/:id)
  const handleViewDetails = async (service: HomePageServiceItem) => {
    const itemId = service._id || service.id;
    if (!itemId) {
      setViewingItem(service);
      return;
    }

    setLoadingDetailsId(itemId);
    try {
      const res = await api.get(`/admin/service/home/${itemId}`);
      const data = res.data?.data || res.data || service;
      setViewingItem(data);
    } catch (err: any) {
      console.warn('Failed to load single home service details from API, using fallback data:', err);
      toast.error(err.response?.data?.message || 'Could not fetch full details, loading cached data');
      setViewingItem(service);
    } finally {
      setLoadingDetailsId(null);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    serviceId: '',
    name: '',
    title: '',
    redline: '',
    description: '',
    buttonText: '',
    image: '',
    order: 1,
    active: true,
  });

  // Fetch Normal Services for picker dropdown
  const fetchNormalServices = async () => {
    try {
      const endpoints = ['/master/service/admin', '/master/service', '/admin/subscriptions/service-tree'];
      for (const ep of endpoints) {
        try {
          const res = await api.get(ep);
          const raw = res.data?.data || res.data || [];
          const list: any[] = Array.isArray(raw) ? raw : (raw.services || raw.list || raw.docs || []);
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((s: any) => ({
              _id: String(s._id || s.id || ''),
              name: s.name || s.title || s.serviceName || 'Untitled Service',
              image: s.image || s.icon || '',
              price: s.price || s.basePrice || 0
            })).filter(s => s._id);
            setNormalServices(mapped);
            break;
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Failed to load normal services list:', err);
    }
  };

  // Fetch all Home Page Services
  const fetchHomeServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/service/home?page=1&limit=20');
      const raw = res.data?.data || res.data || [];
      const list: HomePageServiceItem[] = Array.isArray(raw) 
        ? raw 
        : (raw.docs || raw.services || raw.list || raw.homeServices || []);

      // Sort by order ascending
      const sorted = [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
      setServices(sorted);
    } catch (err: any) {
      console.error('Failed to fetch home services:', err);
      setError(err.response?.data?.message || 'Failed to load home page services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeServices();
    fetchNormalServices();
  }, []);

  // Filtered Services by search
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase().trim();
    return services.filter(s => 
      (s.name || '').toLowerCase().includes(q) ||
      (s.title || '').toLowerCase().includes(q) ||
      (s.redline || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    if (services.length >= MAX_HOME_SERVICES) {
      toast.error(`Maximum ${MAX_HOME_SERVICES} home services allowed. Please delete or update an existing one.`);
      return;
    }
    setEditingItem(null);
    setFormData({
      serviceId: normalServices[0]?._id || '',
      name: '',
      title: '',
      redline: '',
      description: '',
      buttonText: '',
      image: '',
      order: services.length + 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: HomePageServiceItem) => {
    setEditingItem(item);
    const sId = typeof item.serviceId === 'object' ? (item.serviceId?._id || item.serviceId?.id || '') : String(item.serviceId || '');
    setFormData({
      serviceId: sId,
      name: item.name || '',
      title: item.title || '',
      redline: item.redline || '',
      description: item.description || '',
      buttonText: item.buttonText || '',
      image: item.image || '',
      order: item.order ?? 1,
      active: item.active !== false,
    });
    setIsModalOpen(true);
  };

  // Handle Image File Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploadingImg(false);
    }
  };

  // Save / Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter service name');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter title');
      return;
    }
    if (!editingItem && !formData.serviceId) {
      toast.error('Please select a base normal service');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        title: formData.title.trim(),
        redline: formData.redline.trim(),
        description: formData.description.trim(),
        buttonText: formData.buttonText.trim(),
        order: Number(formData.order) || 1,
        active: Boolean(formData.active),
      };

      if (formData.image.trim()) {
        payload.image = formData.image.trim();
      }

      if (formData.serviceId) {
        payload.serviceId = formData.serviceId;
      }

      const itemId = editingItem?._id || editingItem?.id;

      if (editingItem && itemId) {
        // PATCH /admin/service/home/:id
        await api.patch(`/admin/service/home/${itemId}`, payload);
        toast.success('Home page service updated successfully!');
      } else {
        // POST /admin/service/home
        await api.post('/admin/service/home', payload);
        toast.success('Home page service created successfully!');
      }

      setIsModalOpen(false);
      fetchHomeServices();
    } catch (err: any) {
      console.error('Error saving home service:', err);
      toast.error(err.response?.data?.message || 'Failed to save home page service');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Toggle Active Status
  const handleToggleActive = async (item: HomePageServiceItem) => {
    const itemId = item._id || item.id;
    if (!itemId) return;
    const newStatus = !(item.active !== false);

    try {
      await api.patch(`/admin/service/home/${itemId}`, { active: newStatus });
      setServices(prev => prev.map(s => (s._id === itemId || s.id === itemId) ? { ...s, active: newStatus } : s));
      toast.success(`Service marked as ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Delete Home Page Service
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    const itemId = deletingItem._id || deletingItem.id;
    if (!itemId) return;

    try {
      await api.delete(`/admin/service/home/${itemId}`);
      toast.success('Home page service deleted. Slot freed!');
      setDeletingItem(null);
      fetchHomeServices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete home page service');
    }
  };

  const usedSlots = services.length;
  const slotsRemaining = Math.max(0, MAX_HOME_SERVICES - usedSlots);

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar & Slot Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Home Page Featured Services</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-50 text-red-600 border border-red-100">
              Max {MAX_HOME_SERVICES} Services
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Slot Visualizer */}
          <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <span>Slots:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: MAX_HOME_SERVICES }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i < usedSlots 
                      ? 'bg-red-600 ring-2 ring-red-200' 
                      : 'bg-slate-200'
                  }`} 
                  title={i < usedSlots ? `Slot ${i + 1} Used` : `Slot ${i + 1} Empty`}
                />
              ))}
            </div>
            <span className="text-slate-500 ml-1">({usedSlots}/{MAX_HOME_SERVICES})</span>
          </div>

          {/* Layout Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchHomeServices}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            disabled={usedSlots >= MAX_HOME_SERVICES}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs lg:text-sm font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Home Service
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, title, redline..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs lg:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-xs"
        />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-4">
              <div className="h-32 bg-slate-100 rounded-xl w-full"></div>
              <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error View */}
      {!loading && error && (
        <div className="p-8 border border-red-200 bg-red-50/50 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900">{error}</p>
          <button onClick={fetchHomeServices} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredServices.length === 0 && (
        <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-white text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-inner">
            <Globe className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Home Page Services Configured</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select and feature up to {MAX_HOME_SERVICES} services to display on the main website home page.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add First Service
          </button>
        </div>
      )}

      {/* Table View */}
      {!loading && !error && filteredServices.length > 0 && viewLayout === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wider w-16">Order</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Service Name</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wider hidden md:table-cell">Title</th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-wider w-24">Status</th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((service, idx) => {
                  const isActive = service.active !== false;
                  const cardId = service._id || service.id;
                  return (
                    <tr key={cardId || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 align-middle">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                          {service.order ?? idx + 1}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                            {service.image ? (
                              <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <span className="text-[11px] font-extrabold uppercase text-red-600 block">{service.name || 'SERVICE'}</span>
                            <span className="text-xs text-slate-500 block truncate max-w-xs">
                              ID: {(cardId || '').slice(-5)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle hidden md:table-cell">
                        <div>
                          <span className="text-sm font-bold text-slate-900 block truncate max-w-sm">{service.title}</span>
                          {service.description && (
                            <span className="text-xs text-slate-500 block truncate max-w-sm mt-0.5">{service.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(service)}
                          className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-5 py-4 align-middle text-center">
                        <ActionMenu
                          onView={() => handleViewDetails(service)}
                          onEdit={() => handleOpenEdit(service)}
                          onDelete={() => setDeletingItem(service)}
                          loadingView={loadingDetailsId === (service._id || service.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Services Grid (Max 6) */}
      {!loading && !error && filteredServices.length > 0 && viewLayout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service, idx) => {
            const isActive = service.active !== false;
            const cardId = service._id || service.id;

            return (
              <div
                key={cardId || idx}
                className={`rounded-2xl border transition-all duration-200 bg-white flex flex-col justify-between overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 ${
                  isActive ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/40 opacity-75'
                }`}
              >
                {/* Service Card Image Banner */}
                <div className="relative h-48 sm:h-52 bg-slate-50 overflow-hidden flex items-center justify-center p-3 sm:p-4 border-b border-slate-100">
                  {service.image ? (
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <ImageIcon className="w-8 h-8 stroke-1" />
                      <span className="text-[11px] font-semibold mt-1">No Image Set</span>
                    </div>
                  )}

                  {/* Active Status Badge */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(service)}
                    className={`absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-xs border transition-all cursor-pointer shadow-xs ${
                      isActive 
                        ? 'bg-emerald-500/90 text-white border-emerald-400 hover:bg-emerald-600' 
                        : 'bg-slate-700/80 text-white border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Card Content Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-red-600 block">
                      {service.name || 'SERVICE'}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                      {service.title}
                    </h3>
                    {service.redline && (
                      <p className="text-xs font-bold text-amber-600 leading-snug">
                        {service.redline}
                      </p>
                    )}
                    {service.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-end px-5 py-3 bg-slate-50/80 border-t border-slate-100">
                  <ActionMenu
                    onView={() => handleViewDetails(service)}
                    onEdit={() => handleOpenEdit(service)}
                    onDelete={() => setDeletingItem(service)}
                    loadingView={loadingDetailsId === (service._id || service.id)}
                  />
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Home Page Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {editingItem ? 'Edit Home Page Service' : 'Add Home Page Service'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              
              {/* Select Base Normal Service (if creating) */}
              {!editingItem && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Base Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => {
                      const selected = normalServices.find(s => s._id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        serviceId: e.target.value,
                        name: prev.name || selected?.name || '',
                        title: prev.title || selected?.name || '',
                        image: prev.image || selected?.image || '',
                      }));
                    }}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="">-- Choose Normal Service --</option>
                    {normalServices.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name} {s.price ? `(AED ${s.price})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Service Tag Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Badge / Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. PREMIUM CAR WASH"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              {/* Headline Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Headline Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Doorstep Premium Car Wash"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              {/* Redline / Slogan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Highlight Slogan / Redline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shine & Protect in 30 Mins"
                  value={formData.redline}
                  onChange={(e) => setFormData(prev => ({ ...prev, redline: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Eco-friendly waterless and steam car wash at your doorstep."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                />
              </div>

              {/* Button Text & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Book Wash Now"
                    value={formData.buttonText}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Order (1 - {MAX_HOME_SERVICES})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={MAX_HOME_SERVICES}
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Image Upload / URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Card Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Image URL or upload below..."
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                    {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Upload className="w-4 h-4" />}
                    <span>{uploadingImg ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImg}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.image && (
                  <div className="mt-2.5 relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-700">Display on Live Website</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? 'Save Changes' : 'Create Home Service'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* View Service Details Form Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Home Page Service Details
                </h3>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  viewingItem.active !== false
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {viewingItem.active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button 
                onClick={() => setViewingItem(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body (Exact Form Layout Structure) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              
              {/* Select Base Service */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  SELECT BASE SERVICE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={
                    typeof viewingItem.serviceId === 'object'
                      ? `${viewingItem.serviceId?.name || 'Base Service'} ${viewingItem.serviceId?.price ? `(AED ${viewingItem.serviceId.price})` : ''}`
                      : normalServices.find(s => s._id === viewingItem.serviceId)?.name || 'Linked Base Service'
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 cursor-default"
                />
              </div>

              {/* Badge / Tag Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  BADGE / TAG NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={viewingItem.name || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 cursor-default"
                />
              </div>

              {/* Headline Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  HEADLINE TITLE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={viewingItem.title || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 cursor-default"
                />
              </div>

              {/* Highlight Slogan / Redline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  HIGHLIGHT SLOGAN / REDLINE
                </label>
                <input
                  type="text"
                  readOnly
                  value={viewingItem.redline || '—'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 cursor-default"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  SHORT DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  readOnly
                  value={viewingItem.description || '—'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 resize-none cursor-default"
                />
              </div>

              {/* Button Text & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    BUTTON TEXT
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={viewingItem.buttonText || '—'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 cursor-default"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    DISPLAY ORDER (1 - {MAX_HOME_SERVICES})
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={viewingItem.order || 1}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 cursor-default"
                  />
                </div>
              </div>

              {/* Card Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CARD IMAGE
                </label>
                <input
                  type="text"
                  readOnly
                  value={viewingItem.image || 'No image URL provided'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 cursor-default"
                />

                {viewingItem.image && (
                  <div className="mt-2.5 relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-3 flex items-center justify-center">
                    <img
                      src={viewingItem.image}
                      alt={viewingItem.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Active Status Row */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">ACTIVE STATUS</span>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  viewingItem.active !== false 
                    ? 'bg-emerald-500 text-white border-emerald-400' 
                    : 'bg-slate-700 text-white border-slate-600'
                }`}>
                  {viewingItem.active !== false ? 'Active (Displayed)' : 'Inactive (Hidden)'}
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const itemToEdit = viewingItem;
                  setViewingItem(null);
                  handleOpenEdit(itemToEdit);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit This Service
              </button>

              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deletingItem)}
        name={deletingItem?.title || deletingItem?.name || 'this home service'}
        title="Remove Home Page Service?"
        description={`Are you sure you want to remove this service from the home page? This will free up 1 of the ${MAX_HOME_SERVICES} available slots.`}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
      />

    </div>
  );
}
