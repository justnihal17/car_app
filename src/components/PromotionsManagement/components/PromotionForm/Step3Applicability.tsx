import React, { useState } from 'react';
import { Promotion } from '../../types/promotion.types';
import {
  DUMMY_SERVICES,
  DUMMY_BRANDS,
  DUMMY_MODELS,
  DUMMY_CUSTOMERS,
  VEHICLE_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  CITIES,
  EMIRATES,
  PAYMENT_METHODS,
} from '../../data/dummyPromotions';
import { Wrench, Car, MapPin, Users, CreditCard, X, Check } from 'lucide-react';

interface Step3Props {
  formData: Partial<Promotion>;
  onChange: (updated: Partial<Promotion>) => void;
}

export function Step3Applicability({ formData, onChange }: Step3Props) {
  const [activeTab, setActiveTab] = useState<'services' | 'vehicle' | 'location' | 'customer' | 'payment'>('services');

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
          { id: 'vehicle', label: 'Vehicle Rules', icon: Car },
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
              <label className="text-xs font-bold text-slate-700">Applicable Services</label>
              <button
                type="button"
                onClick={() => selectAllArray('applicableServices', DUMMY_SERVICES.map(s => s.id))}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                {(formData.applicableServices || []).length === DUMMY_SERVICES.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DUMMY_SERVICES.map((s) => {
                const isSelected = (formData.applicableServices || []).includes(s.id);
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
              {DUMMY_SERVICES.map((s) => {
                const isSelected = (formData.excludedServices || []).includes(s.id);
                const isDisabled = (formData.applicableServices || []).includes(s.id);
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

      {/* Tab 2: Vehicle Rules */}
      {activeTab === 'vehicle' && (
        <div className="space-y-6">
          {/* Vehicle Brands */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Applicable Vehicle Brands</label>
            <div className="flex flex-wrap gap-2">
              {DUMMY_BRANDS.map((b) => {
                const isSelected = (formData.applicableVehicleBrands || []).includes(b.id);
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

          {/* Vehicle Types */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700">Applicable Vehicle Types</label>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_TYPES.map((t) => {
                const isSelected = (formData.applicableVehicleTypes || []).includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleArrayItem('applicableVehicleTypes', t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fuel Types & Transmission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Applicable Fuel Types</label>
              <div className="flex flex-wrap gap-1.5">
                {FUEL_TYPES.map((f) => {
                  const isSelected = (formData.applicableFuelType || []).includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleArrayItem('applicableFuelType', f)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Applicable Transmissions</label>
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
            <label className="text-xs font-bold text-slate-700">Applicable Cities</label>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => {
                const isSelected = (formData.applicableCities || []).includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleArrayItem('applicableCities', c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700">Applicable Emirates</label>
            <div className="flex flex-wrap gap-2">
              {EMIRATES.map((e) => {
                const isSelected = (formData.applicableAmirates || []).includes(e);
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleArrayItem('applicableAmirates', e)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {e}
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
              value={formData.applicableUserType || 'all'}
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
