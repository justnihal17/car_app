import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, RefreshCw, Edit2, Trash2, Image as ImageIcon, 
  Upload, Loader2, AlertCircle, Clock, Tag, ChevronDown, 
  ChevronRight, HelpCircle, ListOrdered, CheckCircle2, XCircle, 
  FileText, Sparkles, Layers, ArrowLeft
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

export function ServiceDetailContentManager() {
  const [contentList, setContentList] = useState<ServiceDetailContentItem[]>([]);
  const [normalServices, setNormalServices] = useState<{ _id: string; name: string; price?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Editor mode / State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceDetailContentItem | null>(null);
  const [creationMode, setCreationMode] = useState<'EXISTING_SERVICE' | 'NEW_SERVICE'>('EXISTING_SERVICE');
  const [deletingItem, setDeletingItem] = useState<ServiceDetailContentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [serviceId, setServiceId] = useState('');
  
  // For New Service (Case B)
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(0);
  const [newServiceImage, setNewServiceImage] = useState('');
  const [newServiceIsInstant, setNewServiceIsInstant] = useState(false);

  // For Detail Content (Shared for Case A & Case B)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [heroImage, setHeroImage] = useState('');
  
  // Step Images Array
  const [servicesImages, setServicesImages] = useState<ServiceDetailStepImage[]>([]);
  
  // Get Started Object
  const [getStartedStep, setGetStartedStep] = useState('');
  const [getStartedPoints, setGetStartedPoints] = useState<string[]>([]);
  const [newGetStartedPointInput, setNewGetStartedPointInput] = useState('');

  // FAQs Array
  const [faqs, setFaqs] = useState<ServiceDetailFAQ[]>([]);

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

  // Filtered list by search
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return contentList;
    const q = searchQuery.toLowerCase().trim();
    return contentList.filter(item => {
      const sName = typeof item.serviceId === 'object' ? item.serviceId?.name || '' : '';
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        sName.toLowerCase().includes(q)
      );
    });
  }, [contentList, searchQuery]);

  // Open Create Mode
  const handleOpenCreate = () => {
    setEditingItem(null);
    setCreationMode('EXISTING_SERVICE');
    setServiceId(normalServices[0]?._id || '');
    
    setNewServiceName('');
    setNewServiceDesc('');
    setNewServicePrice(0);
    setNewServiceImage('');
    setNewServiceIsInstant(false);

    setTitle('');
    setDescription('');
    setDuration('');
    setPrice(0);
    setHeroImage('');

    setServicesImages([]);

    setGetStartedStep('');
    setGetStartedPoints([]);
    setNewGetStartedPointInput('');

    setFaqs([]);

    setIsEditorOpen(true);
  };

  // Open Edit Mode
  const handleOpenEdit = (item: ServiceDetailContentItem) => {
    setEditingItem(item);
    setCreationMode('EXISTING_SERVICE');
    const sId = typeof item.serviceId === 'object' ? (item.serviceId?._id || item.serviceId?.id || '') : String(item.serviceId || '');
    setServiceId(sId);

    setTitle(item.title || '');
    setDescription(item.description || '');
    setDuration(item.duration || '');
    setPrice(item.price ?? 0);
    setHeroImage(item.image || '');

    setServicesImages(Array.isArray(item.servicesImages) && item.servicesImages.length > 0 ? item.servicesImages : []);
    
    setGetStartedStep(item.getStarted?.step || '');
    setGetStartedPoints(Array.isArray(item.getStarted?.points) ? item.getStarted.points : []);
    setNewGetStartedPointInput('');

    setFaqs(Array.isArray(item.questionsAnswered) ? item.questionsAnswered : []);
    setIsEditorOpen(true);
  };

  // Step Images Helpers
  const handleAddStepImage = () => {
    setServicesImages(prev => [
      ...prev,
      {
        image: '',
        text: '',
        description: '',
        points: []
      }
    ]);
  };

  const handleUpdateStepImage = (index: number, field: keyof ServiceDetailStepImage, val: any) => {
    setServicesImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveStepImage = (index: number) => {
    setServicesImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddStepPoint = (stepIndex: number, pointText: string) => {
    if (!pointText.trim()) return;
    setServicesImages(prev => {
      const updated = [...prev];
      const step = { ...updated[stepIndex] };
      step.points = [...(step.points || []), pointText.trim()];
      updated[stepIndex] = step;
      return updated;
    });
  };

  const handleRemoveStepPoint = (stepIndex: number, pointIndex: number) => {
    setServicesImages(prev => {
      const updated = [...prev];
      const step = { ...updated[stepIndex] };
      step.points = step.points.filter((_, i) => i !== pointIndex);
      updated[stepIndex] = step;
      return updated;
    });
  };

  // FAQ Helpers
  const handleAddFAQ = () => {
    setFaqs(prev => [
      ...prev,
      { questionName: '', questionValue: '' }
    ]);
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

    if (!title.trim()) {
      toast.error('Please enter a content title');
      return;
    }

    setSubmitting(true);
    try {
      const contentPayload: any = {
        image: heroImage.trim(),
        title: title.trim(),
        description: description.trim(),
        duration: duration.trim(),
        price: Number(price) || 0,
        servicesImages: servicesImages.map(s => ({
          image: s.image?.trim() || '',
          text: s.text?.trim() || '',
          description: s.description?.trim() || '',
          points: (s.points || []).filter(p => p.trim())
        })),
        getStarted: {
          step: getStartedStep.trim(),
          points: getStartedPoints.filter(p => p.trim())
        },
        questionsAnswered: faqs.map(f => ({
          questionName: f.questionName?.trim() || '',
          questionValue: f.questionValue?.trim() || ''
        })).filter(f => f.questionName)
      };

      const itemId = editingItem?._id || editingItem?.id;

      if (editingItem && itemId) {
        // PATCH /admin/service/content/:id
        await api.patch(`/admin/service/content/${itemId}`, contentPayload);
        toast.success('Service detail content updated successfully!');
      } else {
        // POST /admin/service/content
        if (creationMode === 'EXISTING_SERVICE') {
          if (!serviceId) {
            toast.error('Please select an existing service');
            setSubmitting(false);
            return;
          }
          await api.post('/admin/service/content', {
            serviceId,
            ...contentPayload
          });
          toast.success('Detail content linked to service successfully!');
        } else {
          // Case B: New Service + Content
          if (!newServiceName.trim()) {
            toast.error('Please enter new service name');
            setSubmitting(false);
            return;
          }
          await api.post('/admin/service/content', {
            service: {
              name: newServiceName.trim(),
              description: newServiceDesc.trim(),
              price: Number(newServicePrice) || Number(price) || 0,
              image: newServiceImage.trim() || heroImage.trim(),
              isInstant: Boolean(newServiceIsInstant)
            },
            content: contentPayload
          });
          toast.success('New service and detail content created successfully!');
        }
      }

      setIsEditorOpen(false);
      fetchContentList();
    } catch (err: any) {
      console.error('Error saving detail content:', err);
      toast.error(err.response?.data?.message || 'Failed to save service detail content');
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
      toast.success('Service detail content deleted successfully');
      setDeletingItem(null);
      fetchContentList();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete content');
    }
  };

  return (
    <div className="space-y-6">

      {/* Editor Full Screen Modal / View */}
      {isEditorOpen ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
                title="Back to List"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {editingItem ? 'Edit Service Detail Content' : 'Create Service Detail Content'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Configure rich hero presentation, step-by-step procedures, and customer FAQs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Detail Content</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Mode Selection (Only for Create) */}
            {!editingItem && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Creation Mode
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setCreationMode('EXISTING_SERVICE')}
                    className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                      creationMode === 'EXISTING_SERVICE'
                        ? 'bg-white border-red-500 text-slate-900 ring-2 ring-red-500/20 shadow-xs'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold">Attach to Existing Normal Service</span>
                      {creationMode === 'EXISTING_SERVICE' && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Select an already created master service and enrich its detail page</p>
                  </div>

                  <div
                    onClick={() => setCreationMode('NEW_SERVICE')}
                    className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                      creationMode === 'NEW_SERVICE'
                        ? 'bg-white border-red-500 text-slate-900 ring-2 ring-red-500/20 shadow-xs'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold">Create New Normal Service + Content</span>
                      {creationMode === 'NEW_SERVICE' && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Create both the base catalog service and its website detail content in one call</p>
                  </div>
                </div>

                {creationMode === 'EXISTING_SERVICE' ? (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Choose Service <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    >
                      <option value="">-- Select Service --</option>
                      {normalServices.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} {s.price ? `(AED ${s.price})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">New Service Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. CERAMIC COATING 9H"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Base Price (AED)</label>
                      <input
                        type="number"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Short Description</label>
                      <input
                        type="text"
                        placeholder="Permanent nano protection..."
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 1: HERO PRESENTATION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Hero Section Presentation</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Hero Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Professional 9H Nano Ceramic Coating"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Detailed Hero Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Deep multi-stage cleaning, paint decontamination..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 45 Mins or 3 Hours"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Starting Price (AED)
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Banner Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hero Banner Image
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Image URL or upload..."
                      value={heroImage}
                      onChange={(e) => setHeroImage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                    <label className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await uploadImage(file);
                              setHeroImage(url);
                              toast.success('Hero image uploaded!');
                            } catch (err: any) {
                              toast.error(err.message || 'Upload failed');
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {heroImage && (
                      <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200 mt-2">
                        <img src={heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: STEP-BY-STEP IMAGES & POINTS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    2. Step-by-Step Procedure Cards ({servicesImages.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddStepImage}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </button>
              </div>

              {servicesImages.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No step procedures added. Click 'Add Step' to create visual steps.</p>
              ) : (
                <div className="space-y-4">
                  {servicesImages.map((step, sIdx) => (
                    <div key={sIdx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800">Step {sIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStepImage(sIdx)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Step Headline</label>
                          <input
                            type="text"
                            placeholder="e.g. Step 1: Snow Foam Pre-Wash"
                            value={step.text}
                            onChange={(e) => handleUpdateStepImage(sIdx, 'text', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Step Image URL</label>
                          <input
                            type="text"
                            placeholder="Image URL or upload..."
                            value={step.image}
                            onChange={(e) => handleUpdateStepImage(sIdx, 'image', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                        <textarea
                          rows={2}
                          placeholder="pH-neutral foam loosens surface grime..."
                          value={step.description}
                          onChange={(e) => handleUpdateStepImage(sIdx, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs resize-none"
                        />
                      </div>

                      {/* Step Key Points */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[11px] font-bold text-slate-600">Key Points / Bullet Highlights</label>
                        <div className="flex flex-wrap gap-1.5">
                          {(step.points || []).map((point, pIdx) => (
                            <span key={pIdx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700">
                              <span>• {point}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveStepPoint(sIdx, pIdx)}
                                className="text-slate-400 hover:text-red-500 ml-1 font-bold"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Add new bullet point..."
                            id={`step-point-input-${sIdx}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget;
                                handleAddStepPoint(sIdx, input.value);
                                input.value = '';
                              }
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(`step-point-input-${sIdx}`) as HTMLInputElement;
                              if (input) {
                                handleAddStepPoint(sIdx, input.value);
                                input.value = '';
                              }
                            }}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
                          >
                            Add Point
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 3: GET STARTED */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <ListOrdered className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. How It Works / Get Started</h3>
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
                    placeholder="e.g. Select Date, Slot & Address"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Workflow Points
                  </label>
                  <div className="space-y-1.5">
                    {getStartedPoints.map((point, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
                        <span>{idx + 1}. {point}</span>
                        <button
                          type="button"
                          onClick={() => setGetStartedPoints(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500 text-xs font-bold px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add another workflow point..."
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
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
                    >
                      Add Point
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: FAQS / QUESTIONS ANSWERED */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-red-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    4. Frequently Asked Questions ({faqs.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddFAQ}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add FAQ
                </button>
              </div>

              {faqs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No FAQs configured for this service.</p>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq, fIdx) => (
                    <div key={fIdx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-800">Question {fIdx + 1}</label>
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
                        placeholder="e.g. Do you require electricity or water connection?"
                        value={faq.questionName}
                        onChange={(e) => handleUpdateFAQ(fIdx, 'questionName', e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      />
                      <textarea
                        rows={2}
                        placeholder="Detailed answer..."
                        value={faq.questionValue}
                        onChange={(e) => handleUpdateFAQ(fIdx, 'questionValue', e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
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
                <span>{editingItem ? 'Save Changes' : 'Publish Detail Content'}</span>
              </button>
            </div>

          </form>
        </div>
      ) : (
        /* List View */
        <div className="space-y-6">
          
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Service Detail Content Pages</h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchContentList}
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
                Add Service Content
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, description..."
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
                  <div className="h-28 bg-slate-100 rounded-xl w-full"></div>
                  <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
                </div>
              ))}
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
                <h3 className="text-base font-bold text-slate-900">No Service Detail Content Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create rich landing page content, step descriptions, and FAQs for your catalog services.
                </p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create First Content Page
              </button>
            </div>
          )}

          {/* Content Cards Grid */}
          {!loading && !error && filteredList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredList.map((item, idx) => {
                const cardId = item._id || item.id;
                const serviceObj = typeof item.serviceId === 'object' ? item.serviceId : null;
                const sName = serviceObj?.name || serviceObj?.title || 'Catalog Service';

                return (
                  <div
                    key={cardId || idx}
                    className="rounded-2xl border border-slate-200/90 bg-white flex flex-col justify-between overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200"
                  >
                    {/* Hero Image */}
                    <div className="relative h-48 sm:h-52 bg-slate-50 overflow-hidden flex items-center justify-center p-3 sm:p-4 border-b border-slate-100">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                          <ImageIcon className="w-8 h-8 stroke-1" />
                          <span className="text-[11px] font-semibold mt-1">No Hero Banner</span>
                        </div>
                      )}

                      {/* Price Badge */}
                      {item.price !== undefined && (
                        <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-slate-900/85 backdrop-blur-xs text-white text-xs font-black shadow-md">
                          AED {item.price}
                        </span>
                      )}

                      {/* Duration Badge */}
                      {item.duration && (
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-extrabold shadow-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-600" />
                          {item.duration}
                        </span>
                      )}
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

                      {/* Metrics Summary (Steps & FAQs) */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          {item.servicesImages?.length || 0} Steps
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                          {item.questionsAnswered?.length || 0} FAQs
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-end gap-1 px-5 py-3 bg-slate-50/80 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Content"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Content"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={Boolean(deletingItem)}
            name={deletingItem?.title || 'this service detail content'}
            title="Delete Service Detail Content?"
            description="Are you sure you want to remove this rich content configuration? The catalog service itself will remain intact."
            onCancel={() => setDeletingItem(null)}
            onConfirm={handleDeleteConfirm}
          />

        </div>
      )}

    </div>
  );
}
