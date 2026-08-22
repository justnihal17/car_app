import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Search, RefreshCw, Edit2, Trash2, Image as ImageIcon, 
  Upload, Loader2, AlertCircle, Clock, Tag, ChevronDown, ChevronUp,
  ChevronRight, HelpCircle, ListOrdered, CheckCircle2, XCircle, 
  FileText, Sparkles, Layers, ArrowLeft, Eye, Check, X, 
  ArrowUp, ArrowDown, DollarSign, Calendar, LayoutGrid, Table as TableIcon,
  MoreVertical, MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { uploadImage } from '../../../services/uploadService';
import { 
  ServiceDetailContentItem, 
  ServiceDetailStepImage, 
  ServiceDetailFAQ 
} from '../types/website.types';
import { DeleteConfirmationModal } from '../../DeleteConfirmationModal';
import { ImageCropModal } from '../../common/ImageCropModal';

interface NormalServiceOption {
  _id: string;
  name: string;
  price?: number;
  image?: string;
}

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
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-10 overflow-hidden text-left">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onView(); }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit(); }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Content
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(); }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function ServiceDetailContentManager() {
  const [contentList, setContentList] = useState<ServiceDetailContentItem[]>([]);
  const [normalServices, setNormalServices] = useState<NormalServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'table' | 'grid'>('table');
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editor mode / State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceDetailContentItem | null>(null);
  const [viewingItem, setViewingItem] = useState<ServiceDetailContentItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ServiceDetailContentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State according to latest schema
  const [serviceId, setServiceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [servicesImages, setServicesImages] = useState<ServiceDetailStepImage[]>([]);
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(0);
  
  // Get Started Object
  const [getStartedStep, setGetStartedStep] = useState('Get Started');
  const [getStartedPoints, setGetStartedPoints] = useState<string[]>([]);
  const [newGetStartedPointInput, setNewGetStartedPointInput] = useState('');

  // FAQs Array
  const [faqs, setFaqs] = useState<ServiceDetailFAQ[]>([]);

  // Active Status Toggle & Order Sequence
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState<number>(1);

  // Image Cropping Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [cropTarget, setCropTarget] = useState<
    { type: 'hero' } | { type: 'serviceItem'; index: number } | null
  >(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Refs for scrolling to new items
  const lastServiceItemRef = useRef<HTMLDivElement>(null);
  const lastFaqRef = useRef<HTMLDivElement>(null);

  // Fetch Normal Services for existing service picker
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
              price: s.price || s.basePrice || 0,
              image: s.image || s.icon || ''
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

  // Fetch All Service Detail Contents
  const fetchContentList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/service/content?page=1&limit=50');
      const raw = res.data?.data || res.data || [];
      const list: ServiceDetailContentItem[] = Array.isArray(raw)
        ? raw
        : (raw.docs || raw.contents || raw.list || raw.services || []);
      setContentList(list);
    } catch (err: any) {
      console.error('Failed to fetch service detail contents:', err);
      setError(err.response?.data?.message || 'Failed to load service detail contents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentList();
    fetchNormalServices();
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveActionMenuId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Quick update order API (PATCH /admin/service/content/:contentId)
  const handleUpdateOrder = async (contentId: string, newOrder: number) => {
    if (!contentId || isNaN(newOrder) || newOrder < 1) return;
    try {
      try {
        await api.patch(`/admin/service/content/${contentId}`, { order: Number(newOrder) });
      } catch (err1: any) {
        if (err1.response?.status === 404 || err1.response?.status === 405) {
          await api.put(`/admin/service/content/${contentId}`, { order: Number(newOrder) });
        } else {
          throw err1;
        }
      }
      toast.success(`Display order updated to #${newOrder}`);
      fetchContentList();
    } catch (err: any) {
      console.error('Failed to update service content order:', err);
      toast.error(err.response?.data?.message || 'Failed to update order');
    }
  };

  // Filtered & Sorted list (Lower Number = Higher Priority)
  const filteredList = useMemo(() => {
    const list = !searchQuery.trim()
      ? contentList
      : contentList.filter(item => {
          const q = searchQuery.toLowerCase().trim();
          const sName = typeof item.serviceId === 'object' ? item.serviceId?.name || item.serviceId?.title || '' : '';
          return (
            (item.title || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            sName.toLowerCase().includes(q)
          );
        });

    return [...list].sort((a, b) => {
      const oA = a.order !== undefined && a.order !== null ? Number(a.order) : 9999;
      const oB = b.order !== undefined && b.order !== null ? Number(b.order) : 9999;
      return oA - oB;
    });
  }, [contentList, searchQuery]);

  // Open Create Mode
  const handleOpenCreate = () => {
    setEditingItem(null);
    setServiceId(normalServices[0]?._id || '');
    setTitle('');
    setDescription('');
    setHeroImage('');
    setOrder(contentList.length + 1);
    setServicesImages([]);
    setExpandedItemIndex(null);
    setGetStartedStep('Get Started');
    setGetStartedPoints([
      'Download the Stylein app',
      'Choose your preferred service & slot',
      'Get ready for professional doorstep care'
    ]);
    setNewGetStartedPointInput('');
    setFaqs([]);
    setActive(true);
    setIsEditorOpen(true);
  };

  // Open Edit Mode
  const handleOpenEdit = (item: ServiceDetailContentItem) => {
    setEditingItem(item);
    const sId = typeof item.serviceId === 'object' ? (item.serviceId?._id || item.serviceId?.id || '') : String(item.serviceId || '');
    setServiceId(sId);

    setTitle(item.title || '');
    setDescription(item.description || '');
    setHeroImage(item.image || '');
    setOrder(item.order !== undefined && item.order !== null ? Number(item.order) : 1);

    // Map service items preserving duration, price, points
    if (Array.isArray(item.servicesImages) && item.servicesImages.length > 0) {
      setServicesImages(
        item.servicesImages.map(img => ({
          image: img.image || '',
          text: img.text || '',
          description: img.description || '',
          duration: img.duration || item.duration || '',
          price: img.price !== undefined ? Number(img.price) : (item.price !== undefined ? Number(item.price) : 0),
          points: Array.isArray(img.points) ? img.points : []
        }))
      );
      setExpandedItemIndex(0);
    } else {
      setServicesImages([]);
      setExpandedItemIndex(null);
    }
    
    setGetStartedStep(item.getStarted?.step || 'Get Started');
    setGetStartedPoints(Array.isArray(item.getStarted?.points) ? item.getStarted.points : []);
    setNewGetStartedPointInput('');

    setFaqs(Array.isArray(item.questionsAnswered) ? item.questionsAnswered : []);
    setActive(item.active !== false && item.deleted !== true);
    setIsEditorOpen(true);
  };

  // Image Upload with Cropping Trigger
  const triggerImageFileSelect = (target: { type: 'hero' } | { type: 'serviceItem'; index: number }) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setRawSelectedFile(file);
        setRawPreviewUrl(URL.createObjectURL(file));
        setCropTarget(target);
        setCropModalOpen(true);
      }
    };
    input.click();
  };

  const handleCropComplete = async (croppedFile: File, previewUrl: string) => {
    setUploadingImage(true);
    setCropModalOpen(false);
    try {
      const uploadedUrl = await uploadImage(croppedFile);
      if (cropTarget?.type === 'hero') {
        setHeroImage(uploadedUrl);
        toast.success('Cover image uploaded!');
      } else if (cropTarget?.type === 'serviceItem' && cropTarget.index !== undefined) {
        handleUpdateServiceItem(cropTarget.index, 'image', uploadedUrl);
        toast.success(`Service item #${cropTarget.index + 1} image updated!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      setRawSelectedFile(null);
      setRawPreviewUrl(null);
      setCropTarget(null);
    }
  };

  // Service Items Helper Functions
  const handleAddServiceItem = () => {
    setServicesImages(prev => {
      const newItems = [
        ...prev,
        {
          image: '',
          text: '',
          description: '',
          duration: '45 Mins',
          price: 0,
          points: []
        }
      ];
      setExpandedItemIndex(newItems.length - 1);
      return newItems;
    });

    setTimeout(() => {
      lastServiceItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleUpdateServiceItem = (index: number, field: keyof ServiceDetailStepImage, val: any) => {
    setServicesImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveServiceItem = (index: number) => {
    setServicesImages(prev => prev.filter((_, i) => i !== index));
    if (expandedItemIndex === index) {
      setExpandedItemIndex(null);
    } else if (expandedItemIndex !== null && expandedItemIndex > index) {
      setExpandedItemIndex(expandedItemIndex - 1);
    }
  };

  const handleMoveServiceItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === servicesImages.length - 1) return;

    setServicesImages(prev => {
      const newArr = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newArr[index];
      newArr[index] = newArr[targetIndex];
      newArr[targetIndex] = temp;
      return newArr;
    });

    setExpandedItemIndex(direction === 'up' ? index - 1 : index + 1);
  };

  // Points within a Service Item
  const handleAddPointToItem = (itemIndex: number, pointText: string) => {
    if (!pointText.trim()) return;
    setServicesImages(prev => {
      const updated = [...prev];
      const item = { ...updated[itemIndex] };
      item.points = [...(item.points || []), pointText.trim()];
      updated[itemIndex] = item;
      return updated;
    });
  };

  const handleRemovePointFromItem = (itemIndex: number, pointIndex: number) => {
    setServicesImages(prev => {
      const updated = [...prev];
      const item = { ...updated[itemIndex] };
      item.points = item.points.filter((_, i) => i !== pointIndex);
      updated[itemIndex] = item;
      return updated;
    });
  };

  // FAQs Helper Functions
  const handleAddFAQ = () => {
    setFaqs(prev => [
      ...prev,
      { questionName: '', questionValue: '' }
    ]);
    setTimeout(() => {
      lastFaqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleUpdateFAQ = (index: number, field: keyof ServiceDetailFAQ, val: string) => {
    setFaqs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveFAQ = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceId) {
      toast.error('Please select a base catalog service');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a Hero Title');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a Hero Description');
      return;
    }

    // Validate prices inside servicesImages
    for (let i = 0; i < servicesImages.length; i++) {
      const item = servicesImages[i];
      if (item.price !== undefined && Number(item.price) < 0) {
        toast.error(`Service Item #${i + 1} price must be greater than or equal to 0`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Exactly matching the latest schema
      const contentPayload: any = {
        serviceId: serviceId.trim(),
        image: heroImage.trim(),
        title: title.trim(),
        description: description.trim(),
        servicesImages: servicesImages.map(s => ({
          image: s.image?.trim() || '',
          text: s.text?.trim() || '',
          description: s.description?.trim() || '',
          duration: s.duration?.trim() || '',
          price: Number(s.price) >= 0 ? Number(s.price) : 0,
          points: (s.points || []).map(p => p.trim()).filter(Boolean)
        })),
        getStarted: {
          step: getStartedStep.trim(),
          points: getStartedPoints.map(p => p.trim()).filter(Boolean)
        },
        questionsAnswered: faqs.map(f => ({
          questionName: f.questionName?.trim() || '',
          questionValue: f.questionValue?.trim() || ''
        })).filter(f => f.questionName.trim()),
        order: Math.max(1, Number(order) || 1),
        active: Boolean(active)
      };

      const itemId = editingItem?._id || editingItem?.id;

      if (editingItem && itemId) {
        // PATCH /admin/service/content/:id
        await api.patch(`/admin/service/content/${itemId}`, contentPayload);
        toast.success('Service content updated successfully!');
      } else {
        // POST /admin/service/content
        await api.post('/admin/service/content', contentPayload);
        toast.success('Service content published successfully!');
      }

      setIsEditorOpen(false);
      fetchContentList();
    } catch (err: any) {
      console.error('Error saving service content:', err);
      toast.error(err.response?.data?.message || 'Failed to save service content');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    const itemId = deletingItem._id || deletingItem.id;
    if (!itemId) return;

    try {
      await api.delete(`/admin/service/content/${itemId}`);
      toast.success('Service content deleted successfully');
      setDeletingItem(null);
      fetchContentList();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete service content');
    }
  };

  // Selected Service Name Helper
  const getServiceNameById = (id: string) => {
    const s = normalServices.find(srv => srv._id === id);
    return s ? s.name : 'Selected Service';
  };

  return (
    <div className="space-y-6">

      {/* Editor Full Screen Modal / View */}
      {isEditorOpen ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
                title="Back to List"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {editingItem ? 'Edit Service Content' : 'Create Service Content'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Configure rich hero section, procedure service items, sequence order, and customer FAQs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editingItem ? 'Save Changes' : 'Publish Content'}</span>
              </button>
            </div>
          </div>

          {/* Form Layout */}
          <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            
              {/* SECTION 1: TOP CONFIG & SERVICE SELECTION */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    1. Base Service & Visibility
                  </span>
                  
                  {/* Active Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Status:</span>
                    <button
                      type="button"
                      onClick={() => setActive(!active)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        active ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-extrabold ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Select Base Service <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    >
                      <option value="">-- Choose Catalog Service --</option>
                      {normalServices.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} {s.price ? `(AED ${s.price})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Order / Sequence <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={order}
                      onChange={(e) => setOrder(Math.max(1, Number(e.target.value)))}
                      required
                      placeholder="1"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      Lower = Shows first (1, 2, 3...)
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: HERO SECTION */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    2. Hero Presentation Section
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Hero Cover Image */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Cover Image (Hero Banner)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Image URL or upload below..."
                            value={heroImage}
                            onChange={(e) => setHeroImage(e.target.value)}
                            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => triggerImageFileSelect({ type: 'hero' })}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload & Crop</span>
                          </button>
                        </div>
                      </div>

                      {heroImage && (
                        <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 group">
                          <img src={heroImage} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setHeroImage('')}
                            className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Headline Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Professional Doorstep Car Detailing & Wash"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Comprehensive vehicle rejuvenation with pH-balanced shampoo, clay bar treatment, and ceramic protection..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SERVICES IMAGES (PROCEDURE ITEMS ARRAY) */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    3. Service Items Array ({servicesImages.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddServiceItem}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3.5 py-1.5 rounded-xl border border-red-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Service Item
                  </button>
                </div>

                {servicesImages.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                    <Layers className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-medium text-slate-400">
                      No service items added yet. Click 'Add Service Item' to build rich procedural step cards.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {servicesImages.map((item, idx) => {
                      const isExpanded = expandedItemIndex === idx;
                      return (
                        <div
                          key={idx}
                          ref={idx === servicesImages.length - 1 ? lastServiceItemRef : null}
                          className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/60 transition-all"
                        >
                          {/* Collapsible Card Header */}
                          <div 
                            onClick={() => setExpandedItemIndex(isExpanded ? null : idx)}
                            className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between cursor-pointer border-b border-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-red-50 text-red-700 text-xs font-black flex items-center justify-center border border-red-100 shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="text-xs font-extrabold text-slate-900">
                                  {item.text || `Service Item #${idx + 1}`}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                  <span>AED {item.price ?? 0}</span>
                                  {item.duration && <span>• {item.duration}</span>}
                                  <span>• {item.points?.length || 0} Points</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {/* Reorder Buttons */}
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveServiceItem(idx, 'up')}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === servicesImages.length - 1}
                                onClick={() => handleMoveServiceItem(idx, 'down')}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveServiceItem(idx)}
                                className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Remove Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setExpandedItemIndex(isExpanded ? null : idx)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Collapsible Card Body */}
                          {isExpanded && (
                            <div className="p-4 space-y-4 bg-white animate-in fade-in duration-150">
                              
                              {/* Text & Image Upload */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                    Item Headline / Name
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Deep Interior Steam Clean"
                                    value={item.text}
                                    onChange={(e) => handleUpdateServiceItem(idx, 'text', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                    Item Image
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="URL or upload..."
                                      value={item.image}
                                      onChange={(e) => handleUpdateServiceItem(idx, 'image', e.target.value)}
                                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => triggerImageFileSelect({ type: 'serviceItem', index: idx })}
                                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                                    >
                                      Upload
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                  Item Description
                                </label>
                                <textarea
                                  rows={2}
                                  placeholder="Hot vapor steam disinfects upholstery, destroys bacteria, and lifts stubborn grime..."
                                  value={item.description}
                                  onChange={(e) => handleUpdateServiceItem(idx, 'description', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none font-medium"
                                />
                              </div>

                              {/* Duration & Price */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                    Duration
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 45 Mins or 1.5 Hours"
                                    value={item.duration}
                                    onChange={(e) => handleUpdateServiceItem(idx, 'duration', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                    Price (AED)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={item.price}
                                    onChange={(e) => handleUpdateServiceItem(idx, 'price', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                                  />
                                </div>
                              </div>

                              {/* Points Management */}
                              <div className="space-y-2 pt-1 border-t border-slate-100">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                                  Key Points & Features
                                </label>

                                {item.points && item.points.length > 0 && (
                                  <div className="space-y-1.5">
                                    {item.points.map((p, pIdx) => (
                                      <div key={pIdx} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800">
                                        <span className="flex items-center gap-2">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                          {p}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemovePointFromItem(idx, pIdx)}
                                          className="text-slate-400 hover:text-red-500 font-bold px-1 cursor-pointer"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="flex gap-2 pt-1">
                                  <input
                                    type="text"
                                    placeholder="Add point (e.g. Removes stubborn grime effectively)..."
                                    id={`item-point-input-${idx}`}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const target = e.currentTarget;
                                        handleAddPointToItem(idx, target.value);
                                        target.value = '';
                                      }
                                    }}
                                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const input = document.getElementById(`item-point-input-${idx}`) as HTMLInputElement;
                                      if (input && input.value.trim()) {
                                        handleAddPointToItem(idx, input.value);
                                        input.value = '';
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                                  >
                                    + Add Point
                                  </button>
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 4: GET STARTED */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    4. Get Started / How It Works
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Step Headline
                    </label>
                    <input
                      type="text"
                      value={getStartedStep}
                      onChange={(e) => setGetStartedStep(e.target.value)}
                      placeholder="e.g. Get Started in 3 Easy Steps"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Process Points
                    </label>
                    
                    <div className="space-y-1.5 mb-2">
                      {getStartedPoints.map((point, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-[11px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            {point}
                          </span>
                          <button
                            type="button"
                            onClick={() => setGetStartedPoints(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-500 text-xs font-bold px-2 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add step point (e.g. Download the Stylein app)..."
                        value={newGetStartedPointInput}
                        onChange={(e) => setNewGetStartedPointInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newGetStartedPointInput.trim()) {
                              setGetStartedPoints(prev => [...prev, newGetStartedPointInput.trim()]);
                              setNewGetStartedPointInput('');
                            }
                          }
                        }}
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newGetStartedPointInput.trim()) {
                            setGetStartedPoints(prev => [...prev, newGetStartedPointInput.trim()]);
                            setNewGetStartedPointInput('');
                          }
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        + Add Point
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: FAQS (QUESTIONS ANSWERED) */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    5. Frequently Asked Questions ({faqs.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddFAQ}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3.5 py-1.5 rounded-xl border border-red-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add FAQ
                  </button>
                </div>

                {faqs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No FAQs configured. Click '+ Add FAQ' to provide answers to common customer questions.</p>
                ) : (
                  <div className="space-y-3">
                    {faqs.map((faq, fIdx) => (
                      <div 
                        key={fIdx} 
                        ref={fIdx === faqs.length - 1 ? lastFaqRef : null}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-slate-800">Question #{fIdx + 1}</label>
                          <button
                            type="button"
                            onClick={() => handleRemoveFAQ(fIdx)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Do you need a power/water outlet at my location?"
                          value={faq.questionName}
                          onChange={(e) => handleUpdateFAQ(fIdx, 'questionName', e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                        />
                        <textarea
                          rows={2}
                          placeholder="Detailed answer..."
                          value={faq.questionValue}
                          onChange={(e) => handleUpdateFAQ(fIdx, 'questionValue', e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 resize-none font-medium"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

          </form>
        </div>
      ) : (
        /* List View (Table & Grid) */
        <div className="space-y-6">
          
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Service Content Management</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage rich landing presentations, multi-item procedures, duration, pricing, and FAQs
              </p>
            </div>

            <div className="flex items-center gap-3">
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
                onClick={fetchContentList}
                disabled={loading}
                className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
              </button>

              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs lg:text-sm font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add Service Content
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, description, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs lg:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-xs"
            />
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="p-8 bg-white border border-slate-200 rounded-2xl animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded-md w-1/4"></div>
              <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
            </div>
          )}

          {/* Error Message */}
          {!loading && error && (
            <div className="p-8 border border-red-200 bg-red-50/50 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-sm font-bold text-slate-900">{error}</p>
              <button onClick={fetchContentList} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredList.length === 0 && (
            <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-white text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-inner">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No Service Content Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create rich landing page content, procedure step items, and FAQs for your catalog services.
                </p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Service Content
              </button>
            </div>
          )}

          {/* Table View */}
          {!loading && !error && filteredList.length > 0 && viewLayout === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[11px]">
                      <th className="py-4 px-4 text-center w-24">Order</th>
                      <th className="py-4 px-4 sm:px-6">Service Name</th>
                      <th className="py-4 px-4">Title</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {filteredList.map((item, idx) => {
                      const cardId = item._id || item.id || '';
                      const serviceObj = typeof item.serviceId === 'object' ? item.serviceId : null;
                      const sName = serviceObj?.name || serviceObj?.title || getServiceNameById(String(item.serviceId || ''));
                      const isItemActive = item.active !== false && item.deleted !== true;

                      return (
                        <tr key={cardId || idx} className="hover:bg-slate-50/70 transition-colors">
                          
                          {/* Order Sequence with Inline Input */}
                          <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center justify-center bg-slate-50 border border-slate-200 hover:border-slate-300 focus-within:border-red-500 rounded-xl px-2 py-1 shadow-xs transition-colors">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                defaultValue={item.order !== undefined && item.order !== null ? item.order : idx + 1}
                                key={`order-${cardId}-${item.order}`}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val) && val > 0 && val !== item.order) {
                                    handleUpdateOrder(cardId, val);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                  }
                                }}
                                className="w-10 text-center bg-transparent border-0 font-extrabold text-xs text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-pointer"
                                title="Change sequence number and press Enter to save"
                              />
                            </div>
                          </td>

                          {/* Service Name */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {item.image ? (
                                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                  <FileText className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-slate-900 block truncate max-w-[180px]">
                                  {sName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ID: {String(item.serviceId?._id || item.serviceId || '').slice(-6)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Title */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5 max-w-xs">
                              <span className="font-bold text-slate-900 block truncate">
                                {item.title}
                              </span>
                              {item.description && (
                                <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black ${
                              isItemActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isItemActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {isItemActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          {/* Actions Three Dots Dropdown */}
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <ActionMenu
                              onView={() => setViewingItem(item)}
                              onEdit={() => handleOpenEdit(item)}
                              onDelete={() => setDeletingItem(item)}
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

          {/* Grid View */}
          {!loading && !error && filteredList.length > 0 && viewLayout === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredList.map((item, idx) => {
                const cardId = item._id || item.id;
                const serviceObj = typeof item.serviceId === 'object' ? item.serviceId : null;
                const sName = serviceObj?.name || serviceObj?.title || getServiceNameById(String(item.serviceId || ''));
                const isItemActive = item.active !== false && item.deleted !== true;

                return (
                  <div
                    key={cardId || idx}
                    className="rounded-2xl border border-slate-200 bg-white flex flex-col justify-between overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200"
                  >
                    {/* Hero Image Banner */}
                    <div className="relative aspect-[16/9] sm:aspect-[4/3] bg-white border-b border-slate-100 overflow-hidden flex items-center justify-center p-3">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
                          <ImageIcon className="w-8 h-8 stroke-1" />
                          <span className="text-[11px] font-semibold mt-1">No Cover Banner</span>
                        </div>
                      )}

                      {/* Order Priority Sequence Badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900/90 text-white shadow-xs backdrop-blur-xs">
                        Order #{item.order !== undefined && item.order !== null ? item.order : idx + 1}
                      </span>

                      <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-xs ${
                        isItemActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isItemActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-red-600 block truncate">
                          {sName}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Metrics Summary */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          {item.servicesImages?.length || 0} Items
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                          {item.questionsAnswered?.length || 0} FAQs
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-end px-5 py-3 bg-slate-50/80 border-t border-slate-100">
                      <ActionMenu
                        onView={() => setViewingItem(item)}
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingItem(item)}
                      />
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW DETAILS MODAL */}
          {viewingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Service Content Details</h3>
                      <p className="text-xs text-slate-500 font-medium">Read-only overview of website presentation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingItem(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                  
                  {/* Hero Cover Banner */}
                  {viewingItem.image && (
                    <div className="w-full max-h-48 sm:max-h-56 rounded-2xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-2 shadow-xs">
                      <img 
                        src={viewingItem.image} 
                        alt={viewingItem.title} 
                        className="w-full h-auto max-h-44 sm:max-h-52 object-contain rounded-xl mx-auto drop-shadow-xs" 
                      />
                    </div>
                  )}

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-red-600">
                        {typeof viewingItem.serviceId === 'object' ? viewingItem.serviceId?.name : getServiceNameById(String(viewingItem.serviceId || ''))}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        viewingItem.active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {viewingItem.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {viewingItem.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {viewingItem.description}
                    </p>
                  </div>

                  {/* Service Items List */}
                  {viewingItem.servicesImages && viewingItem.servicesImages.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-red-600" />
                        Service Items ({viewingItem.servicesImages.length})
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {viewingItem.servicesImages.map((s, idx) => (
                          <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                            {s.image && (
                              <div className="w-full h-32 sm:h-36 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-1.5 mb-1 shrink-0">
                                <img 
                                  src={s.image} 
                                  alt={s.text} 
                                  className="w-full h-full object-contain rounded-lg" 
                                />
                              </div>
                            )}
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="text-xs font-extrabold text-slate-900">{s.text}</h5>
                                <span className="text-xs font-black text-red-600 shrink-0">AED {s.price ?? 0}</span>
                              </div>
                              {s.duration && (
                                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" /> {s.duration}
                                </span>
                              )}
                              {s.description && (
                                <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                              )}
                              {s.points && s.points.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  {s.points.map((p, pIdx) => (
                                    <div key={pIdx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      <span>{p}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Get Started Steps */}
                  {viewingItem.getStarted && viewingItem.getStarted.points?.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ListOrdered className="w-4 h-4 text-red-600" />
                        {viewingItem.getStarted.step || 'Get Started'}
                      </h4>
                      <div className="space-y-2">
                        {viewingItem.getStarted.points.map((p, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQs */}
                  {viewingItem.questionsAnswered && viewingItem.questionsAnswered.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-red-600" />
                        FAQs ({viewingItem.questionsAnswered.length})
                      </h4>
                      <div className="space-y-2">
                        {viewingItem.questionsAnswered.map((f, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                            <h5 className="text-xs font-extrabold text-slate-900">Q: {f.questionName}</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">{f.questionValue}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-slate-100">
                    <span>Created: {viewingItem.createdAt ? new Date(viewingItem.createdAt).toLocaleString() : '—'}</span>
                    <span>Updated: {viewingItem.updatedAt ? new Date(viewingItem.updatedAt).toLocaleString() : '—'}</span>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewingItem(null)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const item = viewingItem;
                      setViewingItem(null);
                      handleOpenEdit(item);
                    }}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit This Content</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={Boolean(deletingItem)}
            name={deletingItem?.title || 'this service content'}
            title="Delete Service Content?"
            description="Are you sure you want to remove this rich content configuration? The catalog service itself will remain intact."
            onCancel={() => setDeletingItem(null)}
            onConfirm={handleDeleteConfirm}
          />

        </div>
      )}

      {/* Reusable Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawPreviewUrl}
        file={rawSelectedFile}
        onClose={() => {
          setCropModalOpen(false);
          setRawSelectedFile(null);
          setRawPreviewUrl(null);
          setCropTarget(null);
        }}
        onCropComplete={handleCropComplete}
      />

    </div>
  );
}
