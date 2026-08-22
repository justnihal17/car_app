import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, RefreshCw, Edit2, Trash2, CheckCircle2, 
  XCircle, Image as ImageIcon, Upload, Loader2, Star, 
  Sparkles, AlertCircle, Eye, ChevronLeft, ChevronRight, 
  Layers, Check, ExternalLink, Car, LayoutGrid, Table as TableIcon, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { uploadImage } from '../../../services/uploadService';
import { BrandItem } from '../types/website.types';
import { DeleteConfirmationModal } from '../../DeleteConfirmationModal';

interface ActionMenuProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ActionMenu({ onView, onEdit, onDelete }: ActionMenuProps) {
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
            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>
          <button 
            onClick={() => { setIsOpen(false); onEdit(); }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Brand
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

export function BrandManager() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'table' | 'grid'>('table');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BrandItem | null>(null);
  const [viewingItem, setViewingItem] = useState<BrandItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<BrandItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    tagline: '',
    description: '',
    highlights: [] as string[],
    featured: false,
    order: 1,
    active: true,
  });
  const [newHighlightInput, setNewHighlightInput] = useState('');

  // Fetch Brands from Backend API
  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await api.get(`/admin/brand?${params.toString()}`);
      const raw = res.data?.data;
      const list: BrandItem[] = Array.isArray(raw) 
        ? raw 
        : (raw?.docs || raw?.brands || raw?.list || []);

      setBrands(list);

      const pagination = res.data?.pagination || res.data?.data?.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        setTotalDocs(pagination.totalDocs || list.length);
      } else {
        setTotalPages(1);
        setTotalDocs(list.length);
      }
    } catch (err: any) {
      console.error('Failed to fetch brands:', err);
      setError(err.response?.data?.message || 'Failed to load brand management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [page, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      image: '',
      tagline: '',
      description: '',
      highlights: [],
      featured: false,
      order: (totalDocs || brands.length) + 1,
      active: true,
    });
    setNewHighlightInput('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: BrandItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      image: item.image || '',
      tagline: item.tagline || '',
      description: item.description || '',
      highlights: Array.isArray(item.highlights) ? [...item.highlights] : [],
      featured: Boolean(item.featured),
      order: item.order ?? 1,
      active: item.active !== false,
    });
    setNewHighlightInput('');
    setIsModalOpen(true);
  };

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Brand logo/image uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploadingImg(false);
    }
  };

  // Add Highlight Point
  const handleAddHighlight = () => {
    if (!newHighlightInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlightInput.trim()]
    }));
    setNewHighlightInput('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== idx)
    }));
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter brand name');
      return;
    }
    if (!formData.image.trim()) {
      toast.error('Please provide or upload a brand image/logo');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        image: formData.image.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        highlights: formData.highlights.filter(h => h.trim()),
        featured: Boolean(formData.featured),
        order: Number(formData.order) || 0,
        active: Boolean(formData.active),
      };

      const itemId = editingItem?._id || editingItem?.id;

      if (editingItem && itemId) {
        // PATCH /admin/brand/:id
        await api.patch(`/admin/brand/${itemId}`, payload);
        toast.success('Brand updated successfully!');
      } else {
        // POST /admin/brand
        await api.post('/admin/brand', payload);
        toast.success('Brand created successfully!');
      }

      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      console.error('Error saving brand:', err);
      toast.error(err.response?.data?.message || 'Failed to save brand');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Toggle Active Status
  const handleToggleActive = async (item: BrandItem) => {
    const itemId = item._id || item.id;
    if (!itemId) return;
    const newStatus = !(item.active !== false);

    try {
      await api.patch(`/admin/brand/${itemId}`, { active: newStatus });
      setBrands(prev => prev.map(b => (b._id === itemId || b.id === itemId) ? { ...b, active: newStatus } : b));
      toast.success(`Brand marked as ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update active status');
    }
  };

  // Quick Toggle Featured Status
  const handleToggleFeatured = async (item: BrandItem) => {
    const itemId = item._id || item.id;
    if (!itemId) return;
    const newFeatured = !item.featured;

    try {
      await api.patch(`/admin/brand/${itemId}`, { featured: newFeatured });
      setBrands(prev => prev.map(b => (b._id === itemId || b.id === itemId) ? { ...b, featured: newFeatured } : b));
      toast.success(newFeatured ? 'Brand set as Featured!' : 'Brand removed from Featured');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update featured status');
    }
  };

  // Soft-Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    const itemId = deletingItem._id || deletingItem.id;
    if (!itemId) return;

    try {
      await api.delete(`/admin/brand/${itemId}`);
      toast.success('Brand deleted successfully');
      setDeletingItem(null);
      fetchBrands();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete brand');
    }
  };

  const featuredCount = brands.filter(b => b.featured).length;
  const activeCount = brands.filter(b => b.active !== false).length;

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Luxury Brand Management</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-50 text-red-600 border border-red-100">
              Website Showcase
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Metrics Badges */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <span className="text-slate-500">Total:</span>
            <span className="text-slate-900">{totalDocs}</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-600 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {featuredCount} Featured
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-600">{activeCount} Active</span>
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
            onClick={fetchBrands}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs lg:text-sm font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add New Brand
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search brands by name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
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
          <button onClick={fetchBrands} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && brands.length === 0 && (
        <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-white text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-inner">
            <Car className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Brands Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add luxury vehicle brands (Bentley, Porsche, Rolls-Royce, etc.) to showcase on the website.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create First Brand
          </button>
        </div>
      )}

      {/* Table View */}
      {!loading && !error && brands.length > 0 && viewLayout === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Brand</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tagline</th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-wider w-24">Status</th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brands.map((brand, idx) => {
                  const isActive = brand.active !== false;
                  const isFeatured = Boolean(brand.featured);
                  const cardId = brand._id || brand.id;
                  return (
                    <tr key={cardId || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                            {brand.image ? (
                              <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block">{brand.name}</span>
                            {brand.description && (
                              <span className="text-xs text-slate-500 block truncate max-w-xs">{brand.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle hidden md:table-cell">
                        <span className="text-xs font-medium text-slate-600 truncate max-w-sm block">{brand.tagline || '—'}</span>
                      </td>
                      <td className="px-5 py-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(brand)}
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
                          onView={() => setViewingItem(brand)}
                          onEdit={() => handleOpenEdit(brand)}
                          onDelete={() => setDeletingItem(brand)}
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

      {/* Brands Cards Grid */}
      {!loading && !error && brands.length > 0 && viewLayout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {brands.map((brand, idx) => {
            const isActive = brand.active !== false;
            const isFeatured = Boolean(brand.featured);
            const cardId = brand._id || brand.id;
            const highlights = Array.isArray(brand.highlights) ? brand.highlights : [];

            return (
              <div
                key={cardId || idx}
                className={`rounded-2xl border transition-all duration-200 bg-white flex flex-col justify-between overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 ${
                  isActive ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/40 opacity-75'
                }`}
              >
                {/* Brand Logo / Image Header */}
                <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center p-4">
                  {brand.image ? (
                    <img 
                      src={brand.image} 
                      alt={brand.name} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <ImageIcon className="w-8 h-8 stroke-1" />
                      <span className="text-[11px] font-semibold mt-1">No Logo</span>
                    </div>
                  )}

                  {/* Top Right Badges: Featured & Active */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(brand)}
                      className={`p-1.5 rounded-full backdrop-blur-xs border transition-all cursor-pointer shadow-xs ${
                        isFeatured 
                          ? 'bg-amber-500 text-white border-amber-400 hover:bg-amber-600' 
                          : 'bg-white/80 text-slate-400 border-slate-200 hover:text-amber-500'
                      }`}
                      title={isFeatured ? 'Featured on Homepage (Click to toggle)' : 'Mark as Featured'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-white' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(brand)}
                      className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-xs border transition-all cursor-pointer shadow-xs ${
                        isActive 
                          ? 'bg-emerald-500/90 text-white border-emerald-400 hover:bg-emerald-600' 
                          : 'bg-slate-700/80 text-white border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        {brand.name}
                      </h3>
                      {isFeatured && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Featured
                        </span>
                      )}
                    </div>

                    {brand.tagline && (
                      <p className="text-xs font-bold text-red-600 leading-snug">
                        {brand.tagline}
                      </p>
                    )}

                    {brand.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-0.5">
                        {brand.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-end px-5 py-3 bg-slate-50/80 border-t border-slate-100">
                  <ActionMenu
                    onView={() => setViewingItem(brand)}
                    onEdit={() => handleOpenEdit(brand)}
                    onDelete={() => setDeletingItem(brand)}
                  />
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages} ({totalDocs} Total Brands)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {editingItem ? 'Edit Luxury Brand' : 'Add Luxury Brand'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bentley, Rolls-Royce, Porsche"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Marketing Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Detailing & Bespoke Vehicle Care"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Certified specialists providing ultra-premium detailing..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                />
              </div>

              {/* Image Upload / URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand Logo / Cover Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Image URL or upload..."
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    required
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
                  <div className="mt-2.5 relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center justify-center">
                    <img src={formData.image} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>

              {/* Highlights Bullet Builder */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Brand Highlights / Key Features ({formData.highlights.length})
                </label>
                <div className="space-y-1.5">
                  {formData.highlights.map((point, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
                      <span>• {point}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-slate-400 hover:text-red-500 font-bold px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add bullet highlight..."
                    value={newHighlightInput}
                    onChange={(e) => setNewHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Add Point
                  </button>
                </div>
              </div>

              {/* Order Sequence & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Order Sequence
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  {/* Featured Toggle */}
                  <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500" /> Featured on Homepage
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                  </label>

                  {/* Active Toggle */}
                  <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Active Status</span>
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                  </label>
                </div>
              </div>

              {/* Form Actions */}
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
                  <span>{editingItem ? 'Save Changes' : 'Create Brand'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* View Brand Details Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Brand Details</h3>
              <button 
                onClick={() => setViewingItem(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="h-40 bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-center">
                {viewingItem.image ? (
                  <img src={viewingItem.image} alt={viewingItem.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <Car className="w-12 h-12 text-slate-300" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900">{viewingItem.name}</h2>
                  <div className="flex items-center gap-2">
                    {viewingItem.featured && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Featured
                      </span>
                    )}
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      viewingItem.active !== false 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {viewingItem.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {viewingItem.tagline && (
                  <p className="text-sm font-bold text-red-600">{viewingItem.tagline}</p>
                )}

                {viewingItem.description && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">{viewingItem.description}</p>
                )}
              </div>

              {Array.isArray(viewingItem.highlights) && viewingItem.highlights.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Highlights</span>
                  <div className="space-y-1.5">
                    {viewingItem.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
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
        name={deletingItem?.name || 'this brand'}
        title="Delete Luxury Brand?"
        description="Are you sure you want to soft-delete this brand? It will be marked as deleted and hidden from the website."
        onCancel={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
      />

    </div>
  );
}
