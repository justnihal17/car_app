import React, { useState, useEffect } from 'react';
import api from '../../../../api/axios';
import { Promotion } from '../../types/promotion.types';
import { TRANSMISSIONS, PAYMENT_METHODS } from '../../data/dummyPromotions';
import { Wrench, Car, MapPin, Users, CreditCard, X, Check, Loader2 } from 'lucide-react';

interface Step3Props {
  formData: Partial<Promotion>;
  onChange: (updated: Partial<Promotion>) => void;
}

export function Step3Applicability({ formData, onChange }: Step3Props) {
  const [activeTab, setActiveTab] = useState<'services' | 'vehicle' | 'location' | 'customer' | 'payment'>('services');

  const [apiServices, setApiServices] = useState<{ id: string; name: string }[]>([]);
  const [apiCities, setApiCities] = useState<{ id: string; name: string }[]>([]);
  const [apiEmirates, setApiEmirates] = useState<{ id: string; name: string }[]>([]);
  const [apiBrands, setApiBrands] = useState<{ id: string; name: string }[]>([]);
  const [apiFuelTypes, setApiFuelTypes] = useState<{ id: string; name: string }[]>([]);
  const [apiVehicleTypes, setApiVehicleTypes] = useState<{ id: string; name: string }[]>([]);
  const [apiModels, setApiModels] = useState<{ id: string; name: string }[]>([]);
  const [apiCustomers, setApiCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loadingMasterData, setLoadingMasterData] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMasterData = async () => {
      setLoadingMasterData(true);
      try {
        // Fetch Services
        try {
          const res = await api.get('/master/service/admin');
          const raw = res.data?.data || res.data || [];
          const list = Array.isArray(raw) ? raw : (raw.services || raw.list || []);
          if (isMounted && list.length > 0) {
            setApiServices(list.map((s: any) => ({ id: typeof s === 'string' ? s : String(s._id || s.id), name: typeof s === 'string' ? s : String(s.name || s.title) })));
          }
        } catch {
          try {
            const res = await api.get('/master/service');
            const raw = res.data?.data || res.data || [];
            const list = Array.isArray(raw) ? raw : (raw.services || raw.list || []);
            if (isMounted && list.length > 0) {
              setApiServices(list.map((s: any) => ({ id: typeof s === 'string' ? s : String(s._id || s.id), name: typeof s === 'string' ? s : String(s.name || s.title) })));
            }
          } catch (e) {
            console.warn('Failed to fetch services:', e);
          }
        }

        // Fetch Cities
        try {
          const res = await api.get('/master/city/admin');
          const raw = res.data?.data || res.data || [];
          const list = Array.isArray(raw) ? raw : (raw.cities || raw.list || []);
          if (isMounted && list.length > 0) {
            setApiCities(list.map((c: any) => ({ id: typeof c === 'string' ? c : String(c._id || c.id || c.name || c), name: typeof c === 'string' ? c : String(c.name || c) })));
          }
        } catch {
          try {
            const res = await api.get('/master/city');
            const raw = res.data?.data || res.data || [];
            const list = Array.isArray(raw) ? raw : (raw.cities || raw.list || []);
            if (isMounted && list.length > 0) {
              setApiCities(list.map((c: any) => ({ id: typeof c === 'string' ? c : String(c._id || c.id || c.name || c), name: typeof c === 'string' ? c : String(c.name || c) })));
            }
          } catch (e) {
            console.warn('Failed to fetch cities:', e);
          }
        }

        // Fetch Emirates / States
        try {
          const res = await api.get('/master/state/admin');
          const raw = res.data?.data || res.data || [];
          const list = Array.isArray(raw) ? raw : (raw.states || raw.emirates || raw.list || []);
          if (isMounted && list.length > 0) {
            setApiEmirates(list.map((e: any) => ({ id: typeof e === 'string' ? e : String(e._id || e.id || e.name || e), name: typeof e === 'string' ? e : String(e.name || e) })));
          }
        } catch {
          try {
            const res = await api.get('/master/state');
            const raw = res.data?.data || res.data || [];
            const list = Array.isArray(raw) ? raw : (raw.states || raw.emirates || raw.list || []);
            if (isMounted && list.length > 0) {
              setApiEmirates(list.map((e: any) => ({ id: typeof e === 'string' ? e : String(e._id || e.id || e.name || e), name: typeof e === 'string' ? e : String(e.name || e) })));
            }
          } catch (e) {
            console.warn('Failed to fetch emirates/states:', e);
          }
        }

        // Fetch Vehicle Brands (Makes)
        try {
          const res = await api.get('/master/make/admin');
          const raw = res.data?.data || res.data || [];
          const list = Array.isArray(raw) ? raw : (raw.makes || raw.brands || raw.list || []);
          if (isMounted && list.length > 0) {
            setApiBrands(list.map((b: any) => ({ id: typeof b === 'string' ? b : String(b._id || b.id || b.name || b), name: typeof b === 'string' ? b : String(b.name || b.title || b.make || b) })));
          }
        } catch {
          try {
            const res = await api.get('/master/make');
            const raw = res.data?.data || res.data || [];
            const list = Array.isArray(raw) ? raw : (raw.makes || raw.brands || raw.list || []);
            if (isMounted && list.length > 0) {
              setApiBrands(list.map((b: any) => ({ id: typeof b === 'string' ? b : String(b._id || b.id || b.name || b), name: typeof b === 'string' ? b : String(b.name || b.title || b.make || b) })));
            }
          } catch (e) {
            console.warn('Failed to fetch vehicle brands:', e);
          }
        }

        // Fetch Fuel Types
        try {
          const res = await api.get('/master/fueltype/admin');
          const raw = res.data?.data || res.data || [];
          const list = Array.isArray(raw) ? raw : (raw.fuelTypes || raw.list || []);
          if (isMounted && list.length > 0) {
            setApiFuelTypes(list.map((f: any) => ({ id: typeof f === 'string' ? f : String(f._id || f.id || f.name || f.type || f), name: typeof f === 'string' ? f : String(f.name || f.type || f) })));
          }
        } catch {
          try {
            const res = await api.get('/master/fueltype');
            const raw = res.data?.data || res.data || [];
            const list = Array.isArray(raw) ? raw : (raw.fuelTypes || raw.list || []);
            if (isMounted && list.length > 0) {
              setApiFuelTypes(list.map((f: any) => ({ id: typeof f === 'string' ? f : String(f._id || f.id || f.name || f.type || f), name: typeof f === 'string' ? f : String(f.name || f.type || f) })));
            }
          } catch (e) {
            console.warn('Failed to fetch fuel types:', e);
          }
        }

        // Fetch Vehicle Types
        try {
          const res = await api.get('/master/vehicletype/admin/admin');
          const raw = res.data?.data || res.data || [];
          const list = Array.isArray(raw) ? raw : (raw.vehicleTypes || raw.list || []);
          if (isMounted && list.length > 0) {
            setApiVehicleTypes(list.map((v: any) => ({ id: typeof v === 'string' ? v : String(v._id || v.id || v.name || v.type || v), name: typeof v === 'string' ? v : String(v.name || v.type || v) })));
          }
        } catch {
          try {
            const res = await api.get('/master/vehicletype/admin');
            const raw = res.data?.data || res.data || [];
            const list = Array.isArray(raw) ? raw : (raw.vehicleTypes || raw.list || []);
            if (isMounted && list.length > 0) {
              setApiVehicleTypes(list.map((v: any) => ({ id: typeof v === 'string' ? v : String(v._id || v.id || v.name || v.type || v), name: typeof v === 'string' ? v : String(v.name || v.type || v) })));
            }
          } catch (e) {
            console.warn('Failed to fetch vehicle types:', e);
          }
        }

        // Fetch Car Models
        try {
          const res = await api.get('/master/model/admin');
          const raw = res.data?.data || res.data || [];
          const list = Array.isArray(raw) ? raw : (raw.models || raw.list || []);
          if (isMounted && list.length > 0) {
            setApiModels(list.map((m: any) => ({ id: typeof m === 'string' ? m : String(m._id || m.id || m.name || m), name: typeof m === 'string' ? m : String(m.name || m.title || m) })));
          }
        } catch {
          try {
            const res = await api.get('/master/model');
            const raw = res.data?.data || res.data || [];
            const list = Array.isArray(raw) ? raw : (raw.models || raw.list || []);
            if (isMounted && list.length > 0) {
              setApiModels(list.map((m: any) => ({ id: typeof m === 'string' ? m : String(m._id || m.id || m.name || m), name: typeof m === 'string' ? m : String(m.name || m.title || m) })));
            }
          } catch (e) {
            console.warn('Failed to fetch car models:', e);
          }
        }

        // Fetch Customers / Users
        try {
          const res = await api.get('/customer/customer?limit=10000');
          const raw = res.data?.data || res.data || [];
          const list = Array.isArray(raw) ? raw : (raw.customers || raw.users || raw.list || []);
          if (isMounted && list.length > 0) {
            setApiCustomers(list.map((u: any) => ({ 
              id: typeof u === 'string' ? u : String(u._id || u.id), 
              name: typeof u === 'string' ? u : String(u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || u.email || u.phone) 
            })));
          }
        } catch (e) {
          console.warn('Failed to fetch customers:', e);
        }

      } finally {
        if (isMounted) setLoadingMasterData(false);
      }
    };

    fetchMasterData();
    return () => { isMounted = false; };
  }, []);

  const servicesList = apiServices;
  const citiesList = apiCities;
  const emiratesList = apiEmirates;
  const brandsList = apiBrands;
  const fuelTypesList = apiFuelTypes;
  const vehicleTypesList = apiVehicleTypes;
  const carModelsList = apiModels;
  const customersList = apiCustomers;

  const toggleArrayItem = (key: keyof Promotion, value: string) => {
    const current = (formData[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ [key]: updated });
  };

  const selectAllArray = (key: keyof Promotion, allValues: string[]) => {
    const current = (formData[key] as string[]) || [];
    if (current.length === allValues.length) {
      onChange({ [key]: [] });
    } else {
      onChange({ [key]: [...allValues] });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Step 3: Applicability & Targeting</h2>
        <p className="text-xs text-slate-500">Configure target services, vehicles, locations, customers, and payment rules.</p>
      </div>

      {/* Applicability Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 pb-2">
        {[
          { id: 'services', label: 'Services', icon: Wrench },
          { id: 'vehicle', label: 'Vehicles', icon: Car },
          { id: 'location', label: 'Location', icon: MapPin },
          { id: 'customer', label: 'Customer Rules', icon: Users },
          { id: 'payment', label: 'Payment Rules', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Services */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Applicable Services */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                Applicable / Included Services
                {loadingMasterData && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
              </label>
              <button
                type="button"
                onClick={() => selectAllArray('applicableServices', servicesList.map(s => s.id))}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                {(formData.applicableServices || []).length === servicesList.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {servicesList.map((s) => {
                const isSelected = (formData.applicableServices || []).includes(s.id) || (formData.applicableServices || []).includes(s.name);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleArrayItem('applicableServices', s.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50/40 text-red-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{s.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-red-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
            {(formData.applicableServices || []).length === 0 && (
              <p className="text-[11px] font-semibold text-emerald-600">Applicable to all services</p>
            )}
          </div>

          {/* Excluded Services */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700">Excluded Services</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {servicesList.map((s) => {
                const isSelected = (formData.excludedServices || []).includes(s.id) || (formData.excludedServices || []).includes(s.name);
                const isDisabled = (formData.applicableServices || []).includes(s.id) || (formData.applicableServices || []).includes(s.name);
                return (
                  <div
                    key={s.id}
                    onClick={() => !isDisabled && toggleArrayItem('excludedServices', s.id)}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50'
                        : isSelected
                        ? 'border-slate-800 bg-slate-900 text-white font-bold cursor-pointer'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <span>{s.name}</span>
                    {isSelected && <X className="w-4 h-4 text-white shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Vehicles */}
      {activeTab === 'vehicle' && (
        <div className="space-y-6">
          {/* Vehicle Brands */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                Applicable Vehicle Brands
                {loadingMasterData && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
              </label>
              <button
                type="button"
                onClick={() => selectAllArray('applicableVehicleBrands', brandsList.map(b => b.id))}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                {(formData.applicableVehicleBrands || []).length === brandsList.length && brandsList.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {brandsList.map((b) => {
                const isSelected = (formData.applicableVehicleBrands || []).includes(b.id) || (formData.applicableVehicleBrands || []).includes(b.name);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleArrayItem('applicableVehicleBrands', b.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Car Models */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                Applicable Car Models
                {loadingMasterData && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
              </label>
              <button
                type="button"
                onClick={() => selectAllArray('applicableCarModels', carModelsList.map(m => m.id))}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                {(formData.applicableCarModels || []).length === carModelsList.length && carModelsList.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {carModelsList.map((m) => {
                const isSelected = (formData.applicableCarModels || []).includes(m.id) || (formData.applicableCarModels || []).includes(m.name);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleArrayItem('applicableCarModels', m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehicle Types */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                Applicable Vehicle Types
                {loadingMasterData && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
              </label>
              <button
                type="button"
                onClick={() => selectAllArray('applicableVehicleTypes', vehicleTypesList.map(t => t.id))}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                {(formData.applicableVehicleTypes || []).length === vehicleTypesList.length && vehicleTypesList.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {vehicleTypesList.map((t) => {
                const isSelected = (formData.applicableVehicleTypes || []).includes(t.id) || (formData.applicableVehicleTypes || []).includes(t.name);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleArrayItem('applicableVehicleTypes', t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fuel Types & Transmission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  Applicable Fuel Types
                  {loadingMasterData && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
                </label>
                <button
                  type="button"
                  onClick={() => selectAllArray('applicableFuelType', fuelTypesList.map(f => f.id))}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  {(formData.applicableFuelType || []).length === fuelTypesList.length && fuelTypesList.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {fuelTypesList.map((f) => {
                  const isSelected = (formData.applicableFuelType || []).includes(f.id) || (formData.applicableFuelType || []).includes(f.name);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleArrayItem('applicableFuelType', f.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700">Applicable Transmissions</label>
                <button
                  type="button"
                  onClick={() => selectAllArray('applicableTransmission', TRANSMISSIONS)}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  {(formData.applicableTransmission || []).length === TRANSMISSIONS.length && TRANSMISSIONS.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRANSMISSIONS.map((t) => {
                  const isSelected = (formData.applicableTransmission || []).includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleArrayItem('applicableTransmission', t)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Location */}
      {activeTab === 'location' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
              Applicable Cities
              {loadingMasterData && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
            </label>
            <div className="flex flex-wrap gap-2">
              {citiesList.map((c) => {
                const isSelected = (formData.applicableCities || []).includes(c.id) || (formData.applicableCities || []).includes(c.name);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleArrayItem('applicableCities', c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
              Applicable Emirates
              {loadingMasterData && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
            </label>
            <div className="flex flex-wrap gap-2">
              {emiratesList.map((e) => {
                const isSelected = (formData.applicableAmirates || []).includes(e.id) || (formData.applicableAmirates || []).includes(e.name);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleArrayItem('applicableAmirates', e.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {e.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Customer Rules */}
      {activeTab === 'customer' && (
        <div className="space-y-6">
          <div className="space-y-2 max-w-xs">
            <label className="text-xs font-bold text-slate-700">Applicable User Type</label>
            <select
              value={formData.applicableUserType || 'ALL'}
              onChange={(e) => onChange({ applicableUserType: e.target.value as any })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="all">All Users</option>
              <option value="new">New Users Only</option>
              <option value="existing">Existing Users Only</option>
              <option value="premium">Premium Tier Users</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl max-w-md">
            <div>
              <span className="text-xs font-bold text-slate-800">First Booking Only</span>
              <p className="text-[11px] text-slate-500">Apply only to customer's first completed booking.</p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ firstBookingOnly: !formData.firstBookingOnly })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                formData.firstBookingOnly ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  formData.firstBookingOnly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Included / Target Users */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
              Included / Target Users
              {loadingMasterData && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
            </label>
            <div className="flex flex-wrap gap-2">
              {customersList.map((u) => {
                const isSelected = ((formData as any).includedUsers || []).includes(u.id) || ((formData as any).includedUsers || []).includes(u.name);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleArrayItem('includedUsers' as any, u.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {u.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Excluded Users */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
              Excluded Users
              {loadingMasterData && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
            </label>
            <div className="flex flex-wrap gap-2">
              {customersList.map((u) => {
                const isSelected = (formData.excludedUsers || []).includes(u.id) || (formData.excludedUsers || []).includes(u.name);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleArrayItem('excludedUsers', u.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {u.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Payment Rules */}
      {activeTab === 'payment' && (
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-700">Payment Methods</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = (formData.paymentMethods || []).includes(pm);
              return (
                <div
                  key={pm}
                  onClick={() => toggleArrayItem('paymentMethods', pm)}
                  className={`p-3.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'border-red-500 bg-red-50/50 text-red-700 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {pm}
                </div>
              );
            })}
          </div>
          {(formData.paymentMethods || []).length === 0 && (
            <p className="text-[11px] font-semibold text-emerald-600">Valid for all payment methods</p>
          )}
        </div>
      )}
    </div>
  );
}
