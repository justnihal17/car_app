import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Upload, Loader2, AlertCircle, Sparkles, 
  ShieldAlert, Wrench, HelpCircle, ListOrdered, Plus, 
  Trash2, Image as ImageIcon, CheckCircle2, Clock, Tag, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { uploadImage } from '../../../services/uploadService';
import { RescuePageData, RescueServiceItem, ServiceDetailFAQ } from '../types/website.types';

export function RescuePageManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State (Driven exclusively from Backend API GET /admin/rescue)
  const [heroImage, setHeroImage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Rescue Services Array
  const [rescueServices, setRescueServices] = useState<RescueServiceItem[]>([]);

  // Get Started Points
  const [getStartedPoints, setGetStartedPoints] = useState<string[]>([]);
  const [newPointInput, setNewPointInput] = useState('');

  // Questions Answered FAQs
  const [faqs, setFaqs] = useState<ServiceDetailFAQ[]>([]);

  // Fetch Rescue Page Document
  const fetchRescueData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/rescue');
      const raw = res.data?.data || res.data;
      if (raw && typeof raw === 'object') {
        if (raw.title) setTitle(raw.title);
        if (raw.description) setDescription(raw.description);
        if (raw.image) setHeroImage(raw.image);
        if (Array.isArray(raw.rescueServices) && raw.rescueServices.length > 0) {
          setRescueServices(raw.rescueServices);
        }
        if (Array.isArray(raw.getStarted?.points) && raw.getStarted.points.length > 0) {
          setGetStartedPoints(raw.getStarted.points);
        }
        if (Array.isArray(raw.questionsAnswered) && raw.questionsAnswered.length > 0) {
          setFaqs(raw.questionsAnswered);
        }
      }
    } catch (err: any) {
      console.warn('Rescue data fetch:', err);
      // 404 or empty is fine on first initialization
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
    if (!title.trim()) {
      toast.error('Please enter a headline title');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        image: heroImage.trim(),
        title: title.trim(),
        description: description.trim(),
        rescueServices: rescueServices.map(s => ({
          image: s.image?.trim() || '',
          name: s.name?.trim() || '',
          description: s.description?.trim() || '',
          duration: s.duration?.trim() || '20 Mins',
          price: Number(s.price) || 0
        })).filter(s => s.name),
        getStarted: {
          points: getStartedPoints.filter(p => p.trim())
        },
        questionsAnswered: faqs.map(f => ({
          questionName: f.questionName?.trim() || '',
          questionValue: f.questionValue?.trim() || ''
        })).filter(f => f.questionName)
      };

      await api.post('/admin/rescue', payload);
      toast.success('Rescue page published successfully!');
    } catch (err: any) {
      console.error('Error saving rescue page:', err);
      toast.error(err.response?.data?.message || 'Failed to save rescue page');
    } finally {
      setSaving(false);
    }
  };

  // Rescue Service Item Helpers
  const handleAddRescueService = () => {
    setRescueServices(prev => [
      ...prev,
      {
        image: '',
        name: '',
        description: '',
        duration: '',
        price: 0
      }
    ]);
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

  return (
    <div className="space-y-6">

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">24/7 Roadside Emergency Rescue Page</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Emergency Module
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRescueData}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs lg:text-sm font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish Page
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
          <p className="text-xs font-bold text-slate-500 mt-2">Loading rescue page content...</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* SECTION 1: HERO BANNER & INTRO */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Hero Banner & Headline</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hero Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 24/7 Roadside Emergency Rescue"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hero Subtitle / Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Fast emergency breakdown assistance anywhere in Dubai..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                  />
                </div>
              </div>

              {/* Hero Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rescue Hero Banner Image
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="Image URL or upload..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                  <label className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Banner Image</span>
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
                    <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 mt-2">
                      <img src={heroImage} alt="Hero Banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: EMERGENCY RESCUE SERVICES LIST */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Emergency Rescue Services ({rescueServices.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddRescueService}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Rescue Service
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rescueServices.map((svc, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">Rescue Service #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRescueService(idx)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Service Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat Tyre Replacement & Puncture Repair"
                      value={svc.name}
                      onChange={(e) => handleUpdateRescueService(idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="On-spot spare wheel mounting or high-speed tubeless plug..."
                      value={svc.description}
                      onChange={(e) => handleUpdateRescueService(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Est. Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 20 Mins"
                        value={svc.duration}
                        onChange={(e) => handleUpdateRescueService(idx, 'duration', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Starting Price (AED)</label>
                      <input
                        type="number"
                        value={svc.price}
                        onChange={(e) => handleUpdateRescueService(idx, 'price', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Icon / Thumbnail Image</label>
                    <input
                      type="text"
                      placeholder="Image URL..."
                      value={svc.image}
                      onChange={(e) => handleUpdateRescueService(idx, 'image', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: GET STARTED DISPATCH STEPS */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ListOrdered className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Emergency Dispatch Workflow Points ({getStartedPoints.length})
              </h3>
            </div>

            <div className="space-y-2">
              {getStartedPoints.map((point, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-black shrink-0">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setGetStartedPoints(prev => prev.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-500 font-bold px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add new roadside dispatch step point..."
                value={newPointInput}
                onChange={(e) => setNewPointInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newPointInput.trim()) {
                      setGetStartedPoints(prev => [...prev, newPointInput.trim()]);
                      setNewPointInput('');
                    }
                  }
                }}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (newPointInput.trim()) {
                    setGetStartedPoints(prev => [...prev, newPointInput.trim()]);
                    setNewPointInput('');
                  }
                }}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Add Step
              </button>
            </div>
          </div>

          {/* SECTION 4: ROADSIDE RESCUE FAQS */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  4. Roadside Rescue FAQs ({faqs.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddFAQ}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Rescue FAQ
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, fIdx) => (
                <div key={fIdx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800">FAQ #{fIdx + 1}</label>
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
                    placeholder="Question..."
                    value={faq.questionName}
                    onChange={(e) => handleUpdateFAQ(fIdx, 'questionName', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                  <textarea
                    rows={2}
                    placeholder="Answer..."
                    value={faq.questionValue}
                    onChange={(e) => handleUpdateFAQ(fIdx, 'questionValue', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex items-center justify-end pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all cursor-pointer active:scale-95"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish Roadside Rescue Page
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
