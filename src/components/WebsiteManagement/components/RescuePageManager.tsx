import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, Upload, Loader2, AlertCircle, Sparkles, 
  ShieldAlert, Wrench, HelpCircle, ListOrdered, Plus, 
  Trash2, Image as ImageIcon, CheckCircle2, Clock, Tag, Save,
  GripVertical, ArrowUp, ArrowDown, X, Eye, FileText,
  Check, ChevronDown, ChevronUp, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { uploadImage } from '../../../services/uploadService';
import { 
  RescuePageData, 
  RescueHeroServiceItem, 
  RescueServiceItem, 
  ServiceDetailFAQ 
} from '../types/website.types';

export function RescuePageManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SECTION 1: Rescue Hero Services Repeater
  const [heroServices, setHeroServices] = useState<RescueHeroServiceItem[]>([]);
  const [uploadingHeroIndex, setUploadingHeroIndex] = useState<number | null>(null);

  // SECTION 2: Rescue Page Description
  const [description, setDescription] = useState('');

  // SECTION 3: Rescue Services Details Array (with nested points)
  const [rescueServices, setRescueServices] = useState<RescueServiceItem[]>([]);
  const [uploadingServiceIndex, setUploadingServiceIndex] = useState<number | null>(null);
  const [newServicePointInputs, setNewServicePointInputs] = useState<Record<number, string>>({});
  const [expandedServices, setExpandedServices] = useState<Record<number, boolean>>({});

  // SECTION 4: Get Started Steps Points
  const [getStartedPoints, setGetStartedPoints] = useState<string[]>([]);
  const [newStepInput, setNewStepInput] = useState('');

  // SECTION 5: Questions Answered (FAQ)
  const [faqs, setFaqs] = useState<ServiceDetailFAQ[]>([]);

  // Drag-and-drop state for Hero Services
  const [draggedHeroIndex, setDraggedHeroIndex] = useState<number | null>(null);

  // State snapshot for detecting unsaved changes
  const [initialSnapshot, setInitialSnapshot] = useState<string>('');

  // Current snapshot
  const currentSnapshot = useMemo(() => {
    return JSON.stringify({
      heroServices,
      description,
      rescueServices,
      getStartedPoints,
      faqs
    });
  }, [heroServices, description, rescueServices, getStartedPoints, faqs]);

  const hasUnsavedChanges = useMemo(() => {
    if (!initialSnapshot) return false;
    return initialSnapshot !== currentSnapshot;
  }, [initialSnapshot, currentSnapshot]);

  // Unsaved changes browser prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Fetch Rescue Page Document (GET /admin/rescue)
  const fetchRescueData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/rescue');
      const raw = res.data?.data || res.data;
      if (raw && typeof raw === 'object') {
        // Hero Services
        let loadedHero: RescueHeroServiceItem[] = [];
        if (Array.isArray(raw.heroServices) && raw.heroServices.length > 0) {
          loadedHero = raw.heroServices.map((h: any) => ({
            _id: h._id || h.id,
            image: h.image || '',
            name: h.name || h.title || '',
            title: h.title || '',
            redline: h.redline || '',
            description: h.description || '',
            order: typeof h.order === 'number' ? h.order : 0
          }));
        } else if (raw.image || raw.title) {
          // Backward compatibility fallback
          loadedHero = [{
            image: raw.image || '',
            name: raw.title || '',
            title: raw.title || '',
            redline: '',
            description: '',
            order: 0
          }];
        }
        setHeroServices(loadedHero);

        // Description
        setDescription(raw.description || '');

        // Rescue Services
        if (Array.isArray(raw.rescueServices) && raw.rescueServices.length > 0) {
          const mappedServices: RescueServiceItem[] = raw.rescueServices.map((s: any) => ({
            _id: s._id || s.id,
            image: s.image || '',
            name: s.name || s.title || '',
            description: s.description || '',
            duration: s.duration || '20 Mins',
            points: Array.isArray(s.points) ? s.points.filter((p: any) => typeof p === 'string' && p.trim()) : [],
            price: typeof s.price === 'number' ? s.price : (Number(s.price) || 0)
          }));
          setRescueServices(mappedServices);
          // Expand all by default
          const exp: Record<number, boolean> = {};
          mappedServices.forEach((_, i) => { exp[i] = true; });
          setExpandedServices(exp);
        } else {
          setRescueServices([]);
        }

        // Get Started Points
        if (Array.isArray(raw.getStarted?.points) && raw.getStarted.points.length > 0) {
          setGetStartedPoints(raw.getStarted.points.filter((p: any) => typeof p === 'string' && p.trim()));
        } else {
          setGetStartedPoints([]);
        }

        // Questions Answered FAQs
        if (Array.isArray(raw.questionsAnswered) && raw.questionsAnswered.length > 0) {
          setFaqs(raw.questionsAnswered.map((f: any) => ({
            questionName: f.questionName || f.question || '',
            questionValue: f.questionValue || f.answer || ''
          })));
        } else {
          setFaqs([]);
        }

        // Take snapshot
        const snap = JSON.stringify({
          heroServices: loadedHero,
          description: raw.description || '',
          rescueServices: Array.isArray(raw.rescueServices) ? raw.rescueServices : [],
          getStartedPoints: Array.isArray(raw.getStarted?.points) ? raw.getStarted.points : [],
          faqs: Array.isArray(raw.questionsAnswered) ? raw.questionsAnswered : []
        });
        setInitialSnapshot(snap);
      }
    } catch (err: any) {
      console.warn('Rescue data fetch warning:', err);
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load rescue page content');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRescueData();
  }, []);

  // Save / Update Complete Document (POST /admin/rescue)
  const handleSave = async () => {
    // 1. Validate Hero Services
    const cleanHeroServices = heroServices
      .map(h => ({
        image: (h.image || '').trim(),
        name: (h.name || '').trim(),
        title: (h.title || '').trim(),
        redline: (h.redline || '').trim(),
        description: (h.description || '').trim(),
        order: Number(h.order) || 0
      }))
      .filter(h => h.image || h.name || h.title || h.redline || h.description)
      .sort((a, b) => a.order - b.order);

    for (let i = 0; i < cleanHeroServices.length; i++) {
      const h = cleanHeroServices[i];
      if (!h.name) {
        toast.error(`Hero Service #${i + 1} requires a Name`);
        return;
      }
      if (!h.image) {
        toast.error(`Hero Service #${i + 1} (${h.name}) requires an Image`);
        return;
      }
      if (!h.title) {
        toast.error(`Hero Service #${i + 1} (${h.name}) requires a Title`);
        return;
      }
      if (!h.redline) {
        toast.error(`Hero Service #${i + 1} (${h.name}) requires a Redline`);
        return;
      }
      if (!h.description) {
        toast.error(`Hero Service #${i + 1} (${h.name}) requires a Description`);
        return;
      }
    }

    // 2. Validate Rescue Services
    const cleanRescueServices = rescueServices
      .map(s => ({
        image: (s.image || '').trim(),
        name: (s.name || '').trim(),
        description: (s.description || '').trim(),
        duration: (s.duration || '').trim() || '20 Mins',
        points: (s.points || []).map(p => (p || '').trim()).filter(Boolean),
        price: typeof s.price === 'number' ? s.price : (Number(s.price) || 0)
      }))
      .filter(s => s.name || s.image || s.description);

    for (let i = 0; i < cleanRescueServices.length; i++) {
      const s = cleanRescueServices[i];
      if (!s.name) {
        toast.error(`Rescue Service #${i + 1} requires a Name`);
        return;
      }
      if (!s.image) {
        toast.error(`Rescue Service #${i + 1} (${s.name}) requires an Image`);
        return;
      }
      if (!s.description) {
        toast.error(`Rescue Service #${i + 1} (${s.name}) requires a Description`);
        return;
      }
      if (!s.duration) {
        toast.error(`Rescue Service #${i + 1} (${s.name}) requires a Duration (e.g. 20 Mins)`);
        return;
      }
      if (s.price === undefined || s.price === null || isNaN(s.price)) {
        toast.error(`Rescue Service #${i + 1} (${s.name}) requires a valid Price`);
        return;
      }
    }

    // 3. Clean Get Started Points
    const cleanGetStartedPoints = getStartedPoints
      .map(p => (p || '').trim())
      .filter(Boolean);

    // 4. Validate FAQs
    const cleanFaqs = faqs
      .map(f => ({
        questionName: (f.questionName || '').trim(),
        questionValue: (f.questionValue || '').trim()
      }))
      .filter(f => f.questionName || f.questionValue);

    for (let i = 0; i < cleanFaqs.length; i++) {
      const f = cleanFaqs[i];
      if (!f.questionName) {
        toast.error(`FAQ #${i + 1} requires a Question`);
        return;
      }
      if (!f.questionValue) {
        toast.error(`FAQ #${i + 1} requires an Answer`);
        return;
      }
    }

    // Exact Schema Payload
    const payload = {
      heroServices: cleanHeroServices,
      description: description.trim(),
      rescueServices: cleanRescueServices,
      getStarted: {
        points: cleanGetStartedPoints
      },
      questionsAnswered: cleanFaqs
    };

    setSaving(true);
    try {
      await api.post('/admin/rescue', payload);
      toast.success('Rescue page CMS published successfully!');
      setInitialSnapshot(JSON.stringify({
        heroServices: cleanHeroServices,
        description: description.trim(),
        rescueServices: cleanRescueServices,
        getStartedPoints: cleanGetStartedPoints,
        faqs: cleanFaqs
      }));
    } catch (err: any) {
      console.error('Error saving rescue page:', err);
      toast.error(err.response?.data?.message || 'Failed to save rescue page');
    } finally {
      setSaving(false);
    }
  };

  // --- Hero Services Repeater Handlers ---
  const handleAddHeroService = () => {
    setHeroServices(prev => [
      ...prev,
      { name: '', image: '', title: '', redline: '', description: '', order: 0 }
    ]);
  };

  const handleUpdateHeroService = (index: number, field: keyof RescueHeroServiceItem, val: any) => {
    setHeroServices(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveHeroService = (index: number) => {
    setHeroServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveHeroService = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= heroServices.length) return;
    setHeroServices(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleHeroImageUpload = async (index: number, file: File) => {
    setUploadingHeroIndex(index);
    try {
      const url = await uploadImage(file);
      handleUpdateHeroService(index, 'image', url);
      toast.success('Hero service image uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingHeroIndex(null);
    }
  };

  // --- Rescue Services Repeater Handlers ---
  const handleAddRescueService = () => {
    const newIndex = rescueServices.length;
    setRescueServices(prev => [
      ...prev,
      {
        name: '',
        image: '',
        description: '',
        duration: '20 Mins',
        points: [],
        price: 0
      }
    ]);
    setExpandedServices(prev => ({ ...prev, [newIndex]: true }));
  };

  const handleUpdateRescueService = (index: number, field: keyof RescueServiceItem, val: any) => {
    setRescueServices(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveRescueService = (index: number) => {
    setRescueServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveRescueService = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= rescueServices.length) return;
    setRescueServices(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleRescueServiceImageUpload = async (index: number, file: File) => {
    setUploadingServiceIndex(index);
    try {
      const url = await uploadImage(file);
      handleUpdateRescueService(index, 'image', url);
      toast.success('Service image uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingServiceIndex(null);
    }
  };

  // Points inside a Rescue Service Card
  const handleAddPointToService = (serviceIndex: number) => {
    const pointText = (newServicePointInputs[serviceIndex] || '').trim();
    if (!pointText) return;

    setRescueServices(prev => {
      const updated = [...prev];
      const currentPoints = updated[serviceIndex].points || [];
      updated[serviceIndex] = {
        ...updated[serviceIndex],
        points: [...currentPoints, pointText]
      };
      return updated;
    });

    setNewServicePointInputs(prev => ({ ...prev, [serviceIndex]: '' }));
  };

  const handleRemovePointFromService = (serviceIndex: number, pointIndex: number) => {
    setRescueServices(prev => {
      const updated = [...prev];
      const currentPoints = updated[serviceIndex].points || [];
      updated[serviceIndex] = {
        ...updated[serviceIndex],
        points: currentPoints.filter((_, i) => i !== pointIndex)
      };
      return updated;
    });
  };

  // --- Get Started Steps Handlers ---
  const handleAddGetStartedStep = () => {
    const text = newStepInput.trim();
    if (!text) return;
    setGetStartedPoints(prev => [...prev, text]);
    setNewStepInput('');
  };

  const handleUpdateGetStartedStep = (index: number, val: string) => {
    setGetStartedPoints(prev => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleRemoveGetStartedStep = (index: number) => {
    setGetStartedPoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveGetStartedStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= getStartedPoints.length) return;
    setGetStartedPoints(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  // --- FAQ Handlers ---
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

  const handleMoveFAQ = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= faqs.length) return;
    setFaqs(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  return (
    <div className="space-y-6">

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">24/7 Roadside Emergency Rescue Page</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Emergency Module
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage hero services carousel, overview description, rescue services with pricing, get started steps, and FAQs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Unsaved Changes
            </span>
          )}

          <button
            onClick={fetchRescueData}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Reload from Server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs lg:text-sm font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Publishing...' : 'Save & Publish Page'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Loading rescue page content...</p>
            <p className="text-xs text-slate-400">Fetching latest schema and configurations from database</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ========================================================================= */}
          {/* SECTION 1: RESCUE HERO SERVICES (Repeater with Unlimited Items)           */}
          {/* ========================================================================= */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    1. Rescue Hero Services ({heroServices.length})
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hero services displayed in the top rescue hero section. Drag and drop or use arrows to reorder.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddHeroService}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Hero Service
              </button>
            </div>

            {heroServices.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3 bg-slate-50/50">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-600">No Hero Services added yet</div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Add hero service items with name and image for the top rescue hero carousel.
                </p>
                <button
                  type="button"
                  onClick={handleAddHeroService}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add First Hero Service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroServices.map((hero, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => setDraggedHeroIndex(idx)}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={() => {
                      if (draggedHeroIndex !== null && draggedHeroIndex !== idx) {
                        handleMoveHeroService(draggedHeroIndex, idx);
                        setDraggedHeroIndex(null);
                      }
                    }}
                    className={`p-4 rounded-2xl border bg-slate-50/60 hover:bg-white hover:shadow-md transition-all duration-200 space-y-3 relative group ${
                      draggedHeroIndex === idx ? 'opacity-50 border-red-300' : 'border-slate-200'
                    }`}
                  >
                    {/* Item Card Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="w-4 h-4 text-slate-400 cursor-grab active:cursor-grabbing" />
                        <span className="text-xs font-black text-slate-800">
                          Hero Service #{idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveHeroService(idx, idx - 1)}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200/60 transition-colors"
                          title="Move Left/Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === heroServices.length - 1}
                          onClick={() => handleMoveHeroService(idx, idx + 1)}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200/60 transition-colors"
                          title="Move Right/Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveHeroService(idx)}
                          className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors ml-1"
                          title="Remove Hero Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Hero Service Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Hero Service Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Battery Change Service"
                        value={hero.name}
                        onChange={(e) => handleUpdateHeroService(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>

                    {/* Hero Service Image Upload */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Hero Service Image <span className="text-red-500">*</span>
                      </label>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Image URL or upload..."
                            value={hero.image}
                            onChange={(e) => handleUpdateHeroService(idx, 'image', e.target.value)}
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                          />
                          <label className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-1 cursor-pointer transition-colors shrink-0">
                            {uploadingHeroIndex === idx ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <span>{uploadingHeroIndex === idx ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingHeroIndex === idx}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleHeroImageUpload(idx, file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {hero.image ? (
                          <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 bg-white group/img">
                            <img src={hero.image} alt={hero.name || 'Hero'} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleUpdateHeroService(idx, 'image', '')}
                              className="absolute top-2 right-2 p-1 bg-slate-900/70 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer"
                              title="Clear Image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="h-20 border border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-white text-slate-300 text-xs">
                            No image uploaded
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hero Title */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Hero Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Fast Battery Replacement At Your Doorstep"
                        value={hero.title || ''}
                        onChange={(e) => handleUpdateHeroService(idx, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>

                    {/* Hero Redline */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Hero Redline <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 24/7 Emergency Rescue Service"
                        value={hero.redline || ''}
                        onChange={(e) => handleUpdateHeroService(idx, 'redline', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>

                    {/* Hero Description */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Hero Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Our expert rescue team arrives quickly and replaces your vehicle battery wherever you are."
                        value={hero.description || ''}
                        onChange={(e) => handleUpdateHeroService(idx, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>

                    {/* Display Order */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={hero.order ?? 0}
                        onChange={(e) => handleUpdateHeroService(idx, 'order', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: RESCUE PAGE DESCRIPTION                                       */}
          {/* ========================================================================= */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    2. Rescue Page Description
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Main overview copy describing 24/7 roadside rescue and emergency capabilities.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fast emergency breakdown assistance anywhere in Dubai & UAE. Our specialized rapid-dispatch vehicles reach your location with full equipment for battery jumpstart, puncture repair, fuel delivery, and towing..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-y"
              />
              <div className="flex justify-end text-[11px] font-semibold text-slate-400">
                {description.length} characters
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: RESCUE SERVICE DETAILS (Dynamic Repeater with Points)          */}
          {/* ========================================================================= */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    3. Rescue Service Details ({rescueServices.length})
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Complete breakdown assistance cards with image, price, duration, description, and feature points.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddRescueService}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Service
              </button>
            </div>

            {rescueServices.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3 bg-slate-50/50">
                <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-600">No Rescue Services added yet</div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Add emergency rescue services like Flat Tyre Repair, Battery Jumpstart, Emergency Towing, etc.
                </p>
                <button
                  type="button"
                  onClick={handleAddRescueService}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add First Rescue Service
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {rescueServices.map((svc, idx) => {
                  const isExpanded = expandedServices[idx] !== false;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                    >
                      {/* Service Card Header */}
                      <div 
                        onClick={() => setExpandedServices(prev => ({ ...prev, [idx]: !isExpanded }))}
                        className="px-5 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-xs font-black shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-xs sm:text-sm font-black text-slate-900">
                              {svc.name || 'Untitled Service'}
                            </span>
                            {svc.price > 0 && (
                              <span className="ml-2 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                                {svc.price} AED
                              </span>
                            )}
                            {svc.duration && (
                              <span className="ml-2 text-[11px] font-semibold text-slate-500">
                                • {svc.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveRescueService(idx, idx - 1)}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === rescueServices.length - 1}
                            onClick={() => handleMoveRescueService(idx, idx + 1)}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveRescueService(idx)}
                            className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors ml-1"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedServices(prev => ({ ...prev, [idx]: !isExpanded }))}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors ml-1"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Service Card Body */}
                      {isExpanded && (
                        <div className="p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Service Name */}
                            <div className="md:col-span-2 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Service Name <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Flat Tyre Replacement"
                                    value={svc.name}
                                    onChange={(e) => handleUpdateRescueService(idx, 'name', e.target.value)}
                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                      Duration <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. 20 Mins"
                                      value={svc.duration}
                                      onChange={(e) => handleUpdateRescueService(idx, 'duration', e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                      Price (AED) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      placeholder="0"
                                      value={svc.price}
                                      onChange={(e) => handleUpdateRescueService(idx, 'price', Number(e.target.value))}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                  Service Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                  rows={3}
                                  placeholder="Detailed service explanation, on-spot tools, technician assistance..."
                                  value={svc.description}
                                  onChange={(e) => handleUpdateRescueService(idx, 'description', e.target.value)}
                                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 resize-none"
                                />
                              </div>
                            </div>

                            {/* Service Image Upload */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Service Image <span className="text-red-500">*</span>
                              </label>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Image URL or upload..."
                                    value={svc.image}
                                    onChange={(e) => handleUpdateRescueService(idx, 'image', e.target.value)}
                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                                  />
                                  <label className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-1 cursor-pointer transition-colors shrink-0">
                                    {uploadingServiceIndex === idx ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Upload className="w-3.5 h-3.5" />
                                    )}
                                    <span>{uploadingServiceIndex === idx ? '...' : 'Upload'}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      disabled={uploadingServiceIndex === idx}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleRescueServiceImageUpload(idx, file);
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                {svc.image ? (
                                  <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200 bg-white group/img">
                                    <img src={svc.image} alt={svc.name || 'Service'} className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateRescueService(idx, 'image', '')}
                                      className="absolute top-2 right-2 p-1 bg-slate-900/70 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer"
                                      title="Clear Image"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="h-32 border border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-white text-slate-300 text-xs">
                                    No image uploaded
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Points Repeater inside Service */}
                          <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                              Service Feature Points ({svc.points?.length || 0})
                            </label>

                            {svc.points && svc.points.length > 0 && (
                              <div className="space-y-1.5">
                                {svc.points.map((pt, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800"
                                  >
                                    <span className="flex items-center gap-2">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      <span>{pt}</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePointFromService(idx, pIdx)}
                                      className="text-slate-400 hover:text-red-500 font-bold p-1 transition-colors"
                                      title="Remove point"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Add new service highlight point (e.g. 100% Genuine Battery replacement)..."
                                value={newServicePointInputs[idx] || ''}
                                onChange={(e) => setNewServicePointInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddPointToService(idx);
                                  }
                                }}
                                className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddPointToService(idx)}
                                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                              >
                                Add Point
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

          {/* ========================================================================= */}
          {/* SECTION 4: GET STARTED STEPS                                              */}
          {/* ========================================================================= */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                  <ListOrdered className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    4. Get Started Steps ({getStartedPoints.length})
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Step-by-step dispatch workflow shown to users when requesting roadside rescue assistance.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {getStartedPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 gap-3 group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-black shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => handleUpdateGetStartedStep(idx, e.target.value)}
                      placeholder={`Step ${idx + 1} description...`}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveGetStartedStep(idx, idx - 1)}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === getStartedPoints.length - 1}
                      onClick={() => handleMoveGetStartedStep(idx, idx + 1)}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveGetStartedStep(idx)}
                      className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      title="Remove Step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add new step (e.g. Tap Rescue Services and choose the required assistance)..."
                value={newStepInput}
                onChange={(e) => setNewStepInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGetStartedStep();
                  }
                }}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddGetStartedStep}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Add Step
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: QUESTIONS ANSWERED (FAQ)                                       */}
          {/* ========================================================================= */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    5. Questions Answered ({faqs.length})
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Frequently asked questions and answers specifically for the emergency roadside rescue page.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddFAQ}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add FAQ
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3 bg-slate-50/50">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-600">No FAQs added yet</div>
                <button
                  type="button"
                  onClick={handleAddFAQ}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add First FAQ
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="text-xs font-black text-slate-800">
                        FAQ #{fIdx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={fIdx === 0}
                          onClick={() => handleMoveFAQ(fIdx, fIdx - 1)}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200 transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={fIdx === faqs.length - 1}
                          onClick={() => handleMoveFAQ(fIdx, fIdx + 1)}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200 transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFAQ(fIdx)}
                          className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors ml-1"
                          title="Remove FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Question <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. How fast will the rescue vehicle reach my location?"
                          value={faq.questionName}
                          onChange={(e) => handleUpdateFAQ(fIdx, 'questionName', e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Answer <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Our average arrival time is within 20 to 30 minutes anywhere in Dubai..."
                          value={faq.questionValue}
                          onChange={(e) => handleUpdateFAQ(fIdx, 'questionValue', e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Sticky/Floating Save Action Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-semibold">
              {hasUnsavedChanges ? (
                <span className="text-amber-600 font-bold">⚠️ You have unsaved changes</span>
              ) : (
                <span className="text-emerald-600 font-bold">✓ All changes saved and published</span>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all cursor-pointer active:scale-95"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Publishing...' : 'Save & Publish Rescue Page'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
