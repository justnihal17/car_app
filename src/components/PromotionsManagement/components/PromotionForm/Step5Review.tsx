import React from 'react';
import { Promotion } from '../../types/promotion.types';
import { Edit2, Tag, Calendar, Layers, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../../../api/axios';

interface Step5Props {
  formData: Partial<Promotion>;
  onGoToStep: (step: number) => void;
}

export function Step5Review({ formData, onGoToStep }: Step5Props) {
  const [apiServices, setApiServices] = useState<{ id: string; name: string }[]>([]);
  const [apiBrands, setApiBrands] = useState<{ id: string; name: string }[]>([]);
  const [apiVehicleTypes, setApiVehicleTypes] = useState<{ id: string; name: string }[]>([]);
  const [apiCities, setApiCities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMasterData = async () => {
      setLoading(true);
      try {
        const [servicesRes, brandsRes, vehicleTypesRes, citiesRes] = await Promise.allSettled([
          api.get('/master/service/admin').catch(() => api.get('/master/service')),
          api.get('/master/make/admin').catch(() => api.get('/master/make')),
          api.get('/master/vehicletype').catch(() => api.get('/master/vehicletype')),
          api.get('/master/city/admin').catch(() => api.get('/master/city'))
        ]);

        if (!isMounted) return;

        if (servicesRes.status === 'fulfilled' && servicesRes.value) {
          const raw = servicesRes.value.data?.data || servicesRes.value.data || [];
          const list = Array.isArray(raw) ? raw : (raw.services || raw.list || []);
          setApiServices(list.map((s: any) => ({ id: typeof s === 'string' ? s : String(s._id || s.id), name: typeof s === 'string' ? s : String(s.name || s.title) })));
        }

        if (brandsRes.status === 'fulfilled' && brandsRes.value) {
          const raw = brandsRes.value.data?.data || brandsRes.value.data || [];
          const list = Array.isArray(raw) ? raw : (raw.brands || raw.list || []);
          setApiBrands(list.map((b: any) => ({ id: typeof b === 'string' ? b : String(b._id || b.id), name: typeof b === 'string' ? b : String(b.name || b.title) })));
        }

        if (vehicleTypesRes.status === 'fulfilled' && vehicleTypesRes.value) {
          const raw = vehicleTypesRes.value.data?.data || vehicleTypesRes.value.data || [];
          const list = Array.isArray(raw) ? raw : (raw.vehicleTypes || raw.list || []);
          setApiVehicleTypes(list.map((v: any) => ({ id: typeof v === 'string' ? v : String(v._id || v.id), name: typeof v === 'string' ? v : String(v.name || v.type) })));
        }

        if (citiesRes.status === 'fulfilled' && citiesRes.value) {
          const raw = citiesRes.value.data?.data || citiesRes.value.data || [];
          const list = Array.isArray(raw) ? raw : (raw.cities || raw.list || []);
          setApiCities(list.map((c: any) => ({ id: typeof c === 'string' ? c : String(c._id || c.id), name: typeof c === 'string' ? c : String(c.name) })));
        }
      } catch (error) {
        console.warn('Failed to fetch master data for review:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMasterData();
    return () => { isMounted = false; };
  }, []);

  const getServiceNames = (ids?: any[]) => {
    if (!ids || ids.length === 0) return 'Applicable to all services';
    return ids.map(id => {
      if (typeof id === 'object' && id !== null) return id.name || id.title;
      return apiServices.find(s => s.id === id)?.name || id;
    }).filter(Boolean).join(', ');
  };

  const getBrandNames = (ids?: any[]) => {
    if (!ids || ids.length === 0) return 'Applicable to all vehicle brands';
    return ids.map(id => {
      if (typeof id === 'object' && id !== null) return id.name || id.title;
      return apiBrands.find(b => b.id === id)?.name || id;
    }).filter(Boolean).join(', ');
  };

  const getVehicleTypeNames = (ids?: any[]) => {
    if (!ids || ids.length === 0) return 'All Vehicle Types';
    return ids.map(id => {
      if (typeof id === 'object' && id !== null) return id.name || id.type;
      return apiVehicleTypes.find(v => v.id === id)?.name || id;
    }).filter(Boolean).join(', ');
  };

  const getCityNames = (ids?: any[]) => {
    if (!ids || ids.length === 0) return 'All Cities';
    return ids.map(id => {
      if (typeof id === 'object' && id !== null) return id.name;
      return apiCities.find(c => c.id === id)?.name || id;
    }).filter(Boolean).join(', ');
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Step 5: Review & Create</h2>
        <p className="text-xs text-slate-500">Review all configured rules before activating this promotion.</p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Section 1: Basic Info & Type */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-red-600" /> Basic Information & Type
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-red-600 hover:underline font-bold flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 1
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><span className="text-slate-500">Title:</span> <strong className="text-slate-900">{formData.title}</strong></div>
            <div><span className="text-slate-500">Promo Type:</span> <strong className="text-slate-900 uppercase">{formData.promoType}</strong></div>
            <div><span className="text-slate-500">Promo Code:</span> <strong className="font-mono text-slate-900">{formData.code || 'N/A (Auto Applied)'}</strong></div>
            <div><span className="text-slate-500">Initial Status:</span> <strong className="text-slate-900 uppercase">{formData.status}</strong></div>
            <div className="sm:col-span-2"><span className="text-slate-500">Description:</span> <span className="text-slate-800">{formData.description}</span></div>
          </div>
        </div>

        {/* Section 2: Discount & Limits */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-red-600" /> Discount & Limits
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-red-600 hover:underline font-bold flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 2
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><span className="text-slate-500">Discount Type:</span> <strong className="text-slate-900 capitalize">{formData.discountType?.replace('_', ' ')}</strong></div>
            <div>
              <span className="text-slate-500">Value:</span>{' '}
              <strong className="text-slate-900">
                {formData.discountType === 'FLAT' ? `₹${formData.discountValue}` : formData.discountType === 'PERCENTAGE' ? `${formData.discountValue}%` : 'Free Service'}
              </strong>
            </div>
            <div><span className="text-slate-500">Min Order:</span> <strong className="text-slate-900">₹{formData.minimumOrderAmount || 0}</strong></div>
            <div><span className="text-slate-500">Max Discount Cap:</span> <strong className="text-slate-900">{formData.maximumDiscountAmount ? `₹${formData.maximumDiscountAmount}` : 'None'}</strong></div>
            <div><span className="text-slate-500">Total Usage Limit:</span> <strong className="text-slate-900">{formData.usageLimit || 'Unlimited'}</strong></div>
            <div><span className="text-slate-500">Per User Limit:</span> <strong className="text-slate-900">{formData.perUserLimit || 1}</strong></div>
            <div><span className="text-slate-500">Stackable:</span> <strong className="text-slate-900">{formData.stackable ? 'Yes' : 'No'}</strong></div>
            <div><span className="text-slate-500">Priority:</span> <strong className="text-slate-900">P{formData.priority || 1}</strong></div>
          </div>
        </div>

        {/* Section 3: Applicability */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-red-600" /> Target Applicability
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(3)}
              className="text-red-600 hover:underline font-bold flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 3
            </button>
          </div>
          <div className="space-y-1.5">
            <div><span className="text-slate-500 flex items-center gap-1">Services: {loading && <Loader2 className="w-3 h-3 animate-spin text-slate-400"/>}</span> <span className="font-semibold text-slate-800">{getServiceNames(formData.applicableServices)}</span></div>
            <div><span className="text-slate-500">Excluded Services:</span> <span className="font-semibold text-slate-800">{getServiceNames(formData.excludedServices)}</span></div>
            <div><span className="text-slate-500 flex items-center gap-1">Vehicle Brands: {loading && <Loader2 className="w-3 h-3 animate-spin text-slate-400"/>}</span> <span className="font-semibold text-slate-800">{getBrandNames(formData.applicableVehicleBrands)}</span></div>
            <div><span className="text-slate-500 flex items-center gap-1">Vehicle Types: {loading && <Loader2 className="w-3 h-3 animate-spin text-slate-400"/>}</span> <span className="font-semibold text-slate-800">{getVehicleTypeNames(formData.applicableVehicleTypes)}</span></div>
            <div><span className="text-slate-500 flex items-center gap-1">Cities: {loading && <Loader2 className="w-3 h-3 animate-spin text-slate-400"/>}</span> <span className="font-semibold text-slate-800">{getCityNames(formData.applicableCities)}</span></div>
            <div><span className="text-slate-500">User Tier:</span> <span className="font-bold text-slate-900 capitalize">{formData.applicableUserType} Users</span></div>
            <div><span className="text-slate-500">Payment Methods:</span> <span className="font-semibold text-slate-800">{formData.paymentMethods?.length ? formData.paymentMethods.join(', ') : 'All Payment Methods'}</span></div>
          </div>
        </div>

        {/* Section 4: Schedule & Additional */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-red-600" /> Schedule & Rules
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(4)}
              className="text-red-600 hover:underline font-bold flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 4
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><span className="text-slate-500">Start Date:</span> <strong className="text-slate-900">{formData.startDate}</strong></div>
            <div><span className="text-slate-500">End Date:</span> <strong className="text-slate-900">{formData.endDate || 'No Expiry Date'}</strong></div>
            <div><span className="text-slate-500">Valid Days:</span> <strong className="text-slate-900">{formData.validDays?.length ? formData.validDays.join(', ') : 'Every Day'}</strong></div>
            <div><span className="text-slate-500">Time Range:</span> <strong className="text-slate-900">{formData.validTimeFrom && formData.validTimeTo ? `${formData.validTimeFrom} - ${formData.validTimeTo}` : 'All Day'}</strong></div>
            <div><span className="text-slate-500">Auto Apply:</span> <strong className="text-slate-900">{formData.autoApply ? 'Yes' : 'No'}</strong></div>
            <div><span className="text-slate-500">Include Taxes:</span> <strong className="text-slate-900">{formData.includeTaxes ? 'Yes' : 'No'}</strong></div>
            {formData.walletCashback ? <div><span className="text-slate-500">Wallet Cashback:</span> <strong className="text-emerald-600">₹{formData.walletCashback}</strong></div> : null}
            {formData.referralReward ? <div><span className="text-slate-500">Referral Reward:</span> <strong className="text-amber-600">₹{formData.referralReward}</strong></div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
