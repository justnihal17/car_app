import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Check, AlertCircle, Loader2, Crown, 
  CreditCard, Calendar, Clock, Tag, Percent, ShieldCheck, 
  HelpCircle, AlignLeft, Layers, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { 
  SubscriptionPlan, 
  SubscriptionFormData, 
  ApplicableService 
} from '../types/subscription.types';
import { ApplicableServicesTree } from './ApplicableServicesTree';

interface SubscriptionFormProps {
  plan?: SubscriptionPlan | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DURATION_UNITS = [
  { value: 'MONTH', label: 'Months' },
  { value: 'YEAR', label: 'Years' },
  { value: 'WEEK', label: 'Weeks' },
  { value: 'DAY', label: 'Days' },
];

const FREQUENCIES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'ONE_TIME', label: 'One Time' },
];

const extractMongoId = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') {
    if (val === '[object Object]') return '';
    return val.trim();
  }
  if (typeof val === 'object') {
    return String(val._id || val.id || val.$oid || '');
  }
  return String(val);
};

export function SubscriptionForm({ plan, onClose, onSuccess }: SubscriptionFormProps) {
  const isEdit = !!plan;

  // Form State
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: '',
    description: [],
    duration: 1,
    durationUnit: 'MONTH',
    price: 0,
    totalCredits: 0,
    frequency: 'MONTHLY',
    applicableServices: [],
    priorityBooking: false,
    additionalServiceDiscount: 0,
    benefits: [],
    isActive: true,
  });

  const [newDescInput, setNewDescInput] = useState('');
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ensure body scroll is unlocked and scroll to top on mount
  useEffect(() => {
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Initialize data on Edit
  useEffect(() => {
    if (plan) {
      // Normalize description array
      let descArray: string[] = [];
      if (Array.isArray(plan.description)) {
        descArray = plan.description;
      } else if (typeof plan.description === 'string') {
        descArray = plan.description.split('\n').map(d => d.trim()).filter(Boolean);
      }

      // Normalize benefits array
      let benefitsArray: string[] = [];
      if (Array.isArray(plan.benefits)) {
        benefitsArray = plan.benefits;
      }

      // Normalize applicableServices (handle populated objects or legacy applicableServiceIds)
      let initialApplicable: ApplicableService[] = [];
      if (Array.isArray(plan.applicableServices) && plan.applicableServices.length > 0) {
        initialApplicable = plan.applicableServices.map(item => {
          const sId = extractMongoId(item.serviceId || (item as any)._id);
          const rawSub = Array.isArray(item.subServiceIds) ? item.subServiceIds : [];
          const subIds = rawSub.map(extractMongoId).filter(Boolean);
          return {
            serviceId: sId,
            subServiceIds: subIds
          };
        }).filter(item => item.serviceId);
      } else if (Array.isArray(plan.applicableServiceIds) && plan.applicableServiceIds.length > 0) {
        // Fallback for legacy plans
        initialApplicable = plan.applicableServiceIds.map(sId => ({
          serviceId: extractMongoId(sId),
          subServiceIds: []
        })).filter(item => item.serviceId);
      }

      setFormData({
        name: plan.name || '',
        description: descArray.length > 0 ? descArray : ['Home/Office service'],
        duration: plan.duration ?? 3,
        durationUnit: plan.durationUnit || 'MONTH',
        price: plan.price ?? 0,
        totalCredits: plan.totalCredits ?? 1,
        frequency: plan.frequency || 'MONTHLY',
        applicableServices: initialApplicable,
        priorityBooking: plan.priorityBooking ?? true,
        additionalServiceDiscount: plan.additionalServiceDiscount ?? 0,
        benefits: benefitsArray.length > 0 ? benefitsArray : ['Home/Office service'],
        isActive: plan.isActive !== false,
      });
    }
  }, [plan]);

  // Dynamic Description list management
  const handleAddDescription = () => {
    if (!newDescInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      description: [...prev.description, newDescInput.trim()]
    }));
    setNewDescInput('');
  };

  const handleRemoveDescription = (index: number) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description.filter((_, idx) => idx !== index)
    }));
  };

  // Dynamic Benefits list management
  const handleAddBenefit = () => {
    if (!newBenefitInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, newBenefitInput.trim()]
    }));
    setNewBenefitInput('');
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, idx) => idx !== index)
    }));
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }

    if (formData.price === undefined || formData.price === null || formData.price < 0) {
      newErrors.price = 'Price must be a valid non-negative amount';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (!formData.totalCredits || formData.totalCredits <= 0) {
      newErrors.totalCredits = 'Total credits must be at least 1';
    }

    if (!formData.applicableServices || formData.applicableServices.length === 0) {
      newErrors.applicableServices = 'Please select at least one applicable service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }

    if (formData.price === undefined || formData.price === null || formData.price < 0) {
      newErrors.price = 'Price must be a valid non-negative amount';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (!formData.totalCredits || formData.totalCredits <= 0) {
      newErrors.totalCredits = 'Total credits must be at least 1';
    }

    if (!formData.applicableServices || formData.applicableServices.length === 0) {
      newErrors.applicableServices = 'Please select at least one applicable service';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError || 'Please resolve the form errors before submitting');
      return;
    }

    setSubmitting(true);

    try {
      // Clean and sanitize payload
      const payload: any = {
        name: formData.name.trim(),
        description: formData.description.filter(d => d.trim()),
        duration: Number(formData.duration),
        durationUnit: formData.durationUnit,
        price: Number(formData.price),
        totalCredits: Number(formData.totalCredits),
        frequency: formData.frequency,
        applicableServices: formData.applicableServices
          .map(item => ({
            serviceId: extractMongoId(item.serviceId),
            subServiceIds: (Array.isArray(item.subServiceIds) ? item.subServiceIds : [])
              .map(extractMongoId)
              .filter(Boolean)
          }))
          .filter(item => item.serviceId),
        priorityBooking: Boolean(formData.priorityBooking),
        additionalServiceDiscount: Number(formData.additionalServiceDiscount || 0),
        benefits: formData.benefits.filter(b => b.trim()),
        isActive: Boolean(formData.isActive),
      };

      const planId = plan?._id || plan?.id;

      if (isEdit && planId) {
        // Update subscription plan (PATCH /admin/subscriptions/:id)
        try {
          await api.patch(`/admin/subscriptions/${planId}`, payload);
        } catch (err: any) {
          // Fallback to singular endpoint if mounted
          if (err.response?.status === 404) {
            await api.patch(`/admin/subscription/${planId}`, payload);
          } else {
            throw err;
          }
        }
        toast.success('Subscription plan updated successfully!');
      } else {
        // Create subscription plan (POST /admin/subscriptions)
        try {
          await api.post('/admin/subscriptions', payload);
        } catch (err: any) {
          // Fallback to singular endpoint if mounted
          if (err.response?.status === 404) {
            await api.post('/admin/subscription', payload);
          } else {
            throw err;
          }
        }
        toast.success('Subscription plan created successfully!');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Subscription save error:', err);
      const serverMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to save subscription plan';
      toast.error(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5 max-w-4xl mx-auto pb-8 animate-in fade-in duration-200">
      
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-7.5 h-7.5 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight leading-none">
              {isEdit ? `Edit Subscription: ${plan?.name || 'Plan'}` : 'Create Subscription Plan'}
            </h1>
            <p className="text-[11px] text-slate-400 font-normal mt-1">
              Configure pricing, duration, credits and covered services.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-8 px-3.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 h-8 px-4 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-2xs text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {isEdit ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                {isEdit ? 'Save Changes' : 'Create Plan'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Plan Information</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Plan Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Premium 3 Months"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                className={`w-full h-8.5 px-3 py-1.5 bg-[#F8FAFC] border rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all shadow-2xs ${
                  errors.name ? 'border-red-500' : 'border-slate-200 focus:border-red-500'
                }`}
              />
              {errors.name && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.name}</p>}
            </div>

            {/* Price (AED) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Price (AED) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">AED</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price > 0 ? formData.price : ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
                    if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                  }}
                  className={`w-full h-8.5 pl-11 pr-2.5 py-1.5 bg-[#F8FAFC] border rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all shadow-2xs ${
                    errors.price ? 'border-red-500' : 'border-slate-200 focus:border-red-500'
                  }`}
                />
              </div>
              {errors.price && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.price}</p>}
            </div>

            {/* Total Credits */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Total Service Credits <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={formData.totalCredits > 0 ? formData.totalCredits : ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, totalCredits: parseInt(e.target.value, 10) || 0 }));
                  if (errors.totalCredits) setErrors(prev => ({ ...prev, totalCredits: '' }));
                }}
                className={`w-full h-8.5 px-3 py-1.5 bg-[#F8FAFC] border rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all shadow-2xs ${
                  errors.totalCredits ? 'border-red-500' : 'border-slate-200 focus:border-red-500'
                }`}
              />
              {errors.totalCredits && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.totalCredits}</p>}
            </div>

            {/* Duration & Duration Unit */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Duration <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  value={formData.duration > 0 ? formData.duration : ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, duration: parseInt(e.target.value, 10) || 0 }));
                    if (errors.duration) setErrors(prev => ({ ...prev, duration: '' }));
                  }}
                  className={`w-full h-8.5 px-3 py-1.5 bg-[#F8FAFC] border rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all shadow-2xs ${
                    errors.duration ? 'border-red-500' : 'border-slate-200 focus:border-red-500'
                  }`}
                />
                <select
                  value={formData.durationUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationUnit: e.target.value as any }))}
                  className="w-full h-8.5 px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all shadow-2xs"
                >
                  {DURATION_UNITS.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
              {errors.duration && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.duration}</p>}
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Billing Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                className="w-full h-8.5 px-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all shadow-2xs"
              >
                {FREQUENCIES.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Additional Service Discount (%) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Additional Discount (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.additionalServiceDiscount && formData.additionalServiceDiscount > 0 ? formData.additionalServiceDiscount : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalServiceDiscount: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-8.5 pl-3 pr-8 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all shadow-2xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            {/* Priority Booking Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 shadow-2xs">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Priority Booking</span>
                <span className="text-[10px] text-slate-500">Subscribers get first priority dispatch</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.priorityBooking}
                  onChange={(e) => setFormData(prev => ({ ...prev, priorityBooking: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Hierarchical Applicable Services Tree */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
          <ApplicableServicesTree
            value={formData.applicableServices}
            onChange={(updated) => {
              setFormData(prev => ({ ...prev, applicableServices: updated }));
              if (errors.applicableServices) setErrors(prev => ({ ...prev, applicableServices: '' }));
            }}
            error={errors.applicableServices}
          />
        </div>

        {/* Section 3: Description & Key Highlights */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <AlignLeft className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Plan Highlights</h4>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add key highlight (e.g. Home/Office service)..."
              value={newDescInput}
              onChange={(e) => setNewDescInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDescription();
                }
              }}
              className="flex-1 h-8.5 px-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={handleAddDescription}
              className="h-8.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-2xs shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {formData.description.length > 0 && (
            <div className="space-y-1.5 mt-2">
              {formData.description.map((desc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800 group"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    <span className="truncate">{desc}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDescription(idx)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-0.5 rounded cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Benefits List */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Member Benefits</h4>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add member benefit (e.g. Free Emergency Cancellation)..."
              value={newBenefitInput}
              onChange={(e) => setNewBenefitInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddBenefit();
                }
              }}
              className="flex-1 h-8.5 px-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={handleAddBenefit}
              className="h-8.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-2xs shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {formData.benefits.length > 0 && (
            <div className="space-y-1.5 mt-2">
              {formData.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800 group"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{benefit}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-0.5 rounded cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Plan Status */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Plan Active Status</span>
            <span className="text-[11px] text-slate-500">When enabled, customers can view and purchase this plan on the app</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-8.5 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 h-8.5 px-5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-2xs text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {isEdit ? 'Updating Plan...' : 'Creating Plan...'}
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                {isEdit ? 'Save Changes' : 'Create Subscription Plan'}
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
