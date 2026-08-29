import React, { useState, useEffect } from 'react';
import api from '../../../../api/axios';
import { Promotion } from '../../types/promotion.types';
import { PAYMENT_METHODS } from '../../data/dummyPromotions';
import { Wrench, Car, MapPin, Users, CreditCard, Check, Loader2, Info } from 'lucide-react';
import { CustomSelect } from '../../../common/CustomSelect';
import { CustomMultiSelect } from '../../../common/CustomMultiSelect';
import { getPromotionMasterData, getCachedMasterDataSync, PromotionMasterData } from '../../services/promotionMasterCache';

interface Step3Props {
  formData: Partial<Promotion>;
  onChange: (updated: Partial<Promotion>) => void;
}

export function Step3Applicability({ formData, onChange }: Step3Props) {
  const [activeTab, setActiveTab] = useState<'services' | 'vehicle' | 'location' | 'customer' | 'payment'>('services');

  const [masterData, setMasterData] = useState<PromotionMasterData>(() => {
    return getCachedMasterDataSync() || {
      services: [],
      brands: [],
      models: [],
      vehicleTypes: [],
      fuelTypes: [],
      cities: [],
      emirates: [],
      customers: [],
    };
  });
  const [loadingMasterData, setLoadingMasterData] = useState<boolean>(!getCachedMasterDataSync());

  useEffect(() => {
    let isMounted = true;
    getPromotionMasterData().then((data) => {
      if (isMounted) {
        setMasterData(data);
        setLoadingMasterData(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const servicesList = masterData.services;
  const citiesList = masterData.cities;
  const emiratesList = masterData.emirates;
  const brandsList = masterData.brands;
  const fuelTypesList = masterData.fuelTypes;
  const vehicleTypesList = masterData.vehicleTypes;
  const carModelsList = masterData.models;
  const customersList = masterData.customers;

  // Mutex helpers for Services
  const isApplicableServicesActive = Boolean(
    formData.applicableServices &&
    formData.applicableServices.length > 0 &&
    !formData.applicableServices.includes('ALL')
  );

  const isExcludedServicesActive = Boolean(
    formData.excludedServices &&
    formData.excludedServices.length > 0
  );

  // Mutex helpers for Vehicles
  const isApplicableVehiclesActive = Boolean(
    (formData.applicableVehicleBrands && formData.applicableVehicleBrands.filter(b => b !== 'ALL').length > 0) ||
    (formData.applicableCarModels && formData.applicableCarModels.filter(m => m !== 'ALL').length > 0) ||
    (formData.applicableVehicleTypes && formData.applicableVehicleTypes.filter(t => t !== 'ALL').length > 0) ||
    (formData.applicableFuelType && formData.applicableFuelType.filter(f => f !== 'ALL').length > 0)
  );

  const isExcludedVehiclesActive = Boolean(
    (formData.excludedVehicleBrands && formData.excludedVehicleBrands.length > 0) ||
    (formData.excludedCarModels && formData.excludedCarModels.length > 0)
  );

  // Mutex helpers for Users
  const isIncludedUsersActive = Boolean(
    (formData as any).includedUsers && (formData as any).includedUsers.filter((u: string) => u !== 'ALL').length > 0
  );

  const isExcludedUsersActive = Boolean(
    formData.excludedUsers && formData.excludedUsers.length > 0
  );

  const toggleApplicableService = (id: string) => {
    if (isExcludedServicesActive) return; // Locked: cannot select if excluded services are active
    const current = (formData.applicableServices || []).filter((sId) => sId !== 'ALL');
    const updated = current.includes(id)
      ? current.filter((sId) => sId !== id)
      : [...current, id];
    onChange({
      applicableServices: updated.length === 0 ? ['ALL'] : updated,
    });
  };

  const toggleExcludedService = (id: string) => {
    if (isApplicableServicesActive) return; // Locked: cannot select if applicable services are active
    const current = (formData.excludedServices || []).filter((sId) => sId !== 'ALL');
    const updated = current.includes(id)
      ? current.filter((sId) => sId !== id)
      : [...current, id];
    onChange({
      excludedServices: updated,
    });
  };

  const togglePaymentMethod = (pm: string) => {
    const current = (formData.paymentMethods || []).filter((item) => item !== 'ALL');
    const updated = current.includes(pm)
      ? current.filter((item) => item !== pm)
      : [...current, pm];
    onChange({
      paymentMethods: updated.length === 0 || updated.length === PAYMENT_METHODS.length ? ['ALL'] : updated,
    });
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-2.5">
        <h2 className="text-sm font-semibold text-slate-900">Step 3: Applicability & Targeting</h2>
        <p className="text-xs text-slate-400 font-normal mt-0.5">Configure target services, vehicles, locations, customers, and payment rules.</p>
      </div>

      {/* Applicability Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 pb-2.5">
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
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Services */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600">
              Select specific services to <strong>Include</strong> OR <strong>Exclude</strong>. If neither is selected, the promotion will apply to <strong>All Services</strong> by default.
            </p>
          </div>

          {/* Applicable / Included Services */}
          <div className={`space-y-2 transition-opacity ${isExcludedServicesActive ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                Applicable / Included Services
                {isApplicableServicesActive && (
                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">
                    {formData.applicableServices?.filter(s => s !== 'ALL').length} Selected
                  </span>
                )}
                {isExcludedServicesActive && (
                  <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Locked — Unselect Excluded Services first
                  </span>
                )}
              </label>
              {isApplicableServicesActive && (
                <button
                  type="button"
                  onClick={() => onChange({ applicableServices: ['ALL'] })}
                  className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
                >
                  Unselect All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {servicesList.map((s) => {
                const isSelected =
                  isApplicableServicesActive &&
                  (formData.applicableServices || []).includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => !isExcludedServicesActive && toggleApplicableService(s.id)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all select-none ${
                      isSelected
                        ? 'border-slate-300 bg-slate-50 text-slate-900 font-medium'
                        : isExcludedServicesActive
                        ? 'border-slate-200/50 bg-slate-50/50 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <span className="truncate pr-2">{s.name}</span>
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Excluded Services */}
          <div className={`space-y-2 pt-3 border-t border-slate-100 transition-opacity ${isApplicableServicesActive ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                Excluded Services
                {isExcludedServicesActive && (
                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">
                    {formData.excludedServices?.length} Excluded
                  </span>
                )}
                {isApplicableServicesActive && (
                  <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Locked — Unselect Applicable Services first
                  </span>
                )}
              </label>
              {isExcludedServicesActive && (
                <button
                  type="button"
                  onClick={() => onChange({ excludedServices: [] })}
                  className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
                >
                  Unselect All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {servicesList.map((s) => {
                const isSelected = (formData.excludedServices || []).includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => !isApplicableServicesActive && toggleExcludedService(s.id)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all select-none ${
                      isSelected
                        ? 'border-slate-300 bg-slate-50 text-slate-900 font-medium'
                        : isApplicableServicesActive
                        ? 'border-slate-200/50 bg-slate-50/50 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <span className="truncate pr-2">{s.name}</span>
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Vehicles */}
      {activeTab === 'vehicle' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600">
              Select specific vehicle brands, models, or types to <strong>Include</strong> OR <strong>Exclude</strong>. If neither is selected, the promotion will apply to <strong>All Vehicles</strong> by default.
            </p>
          </div>

          {/* Top Section: Applicable / Included Vehicles */}
          <div className={`space-y-3 p-3.5 rounded-lg border bg-slate-50/40 transition-all ${
            isExcludedVehiclesActive 
              ? 'border-slate-200/50 opacity-50' 
              : 'border-slate-200/90 opacity-100'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                Applicable / Included Vehicles
                {isApplicableVehiclesActive && (
                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">
                    Filter Active
                  </span>
                )}
                {isExcludedVehiclesActive && (
                  <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Locked — Unselect Excluded Vehicles first
                  </span>
                )}
              </label>
              {isApplicableVehiclesActive && (
                <button
                  type="button"
                  onClick={() => onChange({ 
                    applicableVehicleBrands: ['ALL'], 
                    applicableCarModels: ['ALL'], 
                    applicableVehicleTypes: ['ALL'], 
                    applicableFuelType: ['ALL'] 
                  })}
                  className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
                >
                  Unselect All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Applicable Brands */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Applicable Vehicle Brands</label>
                <CustomMultiSelect
                  values={(formData.applicableVehicleBrands || []).filter(b => b !== 'ALL')}
                  onChange={(vals) => onChange({ applicableVehicleBrands: vals.length === 0 ? ['ALL'] : vals })}
                  options={brandsList.map((b) => ({ value: b.id, label: b.name }))}
                  placeholder="All Vehicle Brands"
                  disabled={isExcludedVehiclesActive}
                  size="sm"
                />
              </div>

              {/* Applicable Models */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Applicable Car Models</label>
                <CustomMultiSelect
                  values={(formData.applicableCarModels || []).filter(m => m !== 'ALL')}
                  onChange={(vals) => onChange({ applicableCarModels: vals.length === 0 ? ['ALL'] : vals })}
                  options={carModelsList.map((m) => ({ value: m.id, label: m.name }))}
                  placeholder="All Car Models"
                  disabled={isExcludedVehiclesActive}
                  size="sm"
                />
              </div>

              {/* Applicable Vehicle Types */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Applicable Vehicle Types</label>
                <CustomMultiSelect
                  values={(formData.applicableVehicleTypes || []).filter(t => t !== 'ALL')}
                  onChange={(vals) => onChange({ applicableVehicleTypes: vals.length === 0 ? ['ALL'] : vals })}
                  options={vehicleTypesList.map((t) => ({ value: t.id, label: t.name }))}
                  placeholder="All Vehicle Types"
                  disabled={isExcludedVehiclesActive}
                  size="sm"
                />
              </div>

              {/* Applicable Fuel Types */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Applicable Fuel Types</label>
                <CustomMultiSelect
                  values={(formData.applicableFuelType || []).filter(f => f !== 'ALL')}
                  onChange={(vals) => onChange({ applicableFuelType: vals.length === 0 ? ['ALL'] : vals })}
                  options={fuelTypesList.map((f) => ({ value: f.id, label: f.name }))}
                  placeholder="All Fuel Types"
                  disabled={isExcludedVehiclesActive}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Bottom Section (Niche): Excluded Vehicles */}
          <div className={`space-y-3 p-3.5 rounded-lg border bg-slate-50/40 transition-all ${
            isApplicableVehiclesActive 
              ? 'border-slate-200/50 opacity-50' 
              : 'border-slate-200/90 opacity-100'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                Excluded Vehicles
                {isExcludedVehiclesActive && (
                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">
                    {(formData.excludedVehicleBrands?.length || 0) + (formData.excludedCarModels?.length || 0)} Excluded
                  </span>
                )}
                {isApplicableVehiclesActive && (
                  <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Locked — Unselect Applicable Vehicles first
                  </span>
                )}
              </label>
              {isExcludedVehiclesActive && (
                <button
                  type="button"
                  onClick={() => onChange({ excludedVehicleBrands: [], excludedCarModels: [] })}
                  className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
                >
                  Unselect All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Excluded Brands */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Excluded Vehicle Brands</label>
                <CustomMultiSelect
                  values={formData.excludedVehicleBrands || []}
                  onChange={(vals) => onChange({ excludedVehicleBrands: vals })}
                  options={brandsList.map((b) => ({ value: b.id, label: b.name }))}
                  placeholder="None Excluded"
                  disabled={isApplicableVehiclesActive}
                  size="sm"
                />
              </div>

              {/* Excluded Models */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Excluded Car Models</label>
                <CustomMultiSelect
                  values={formData.excludedCarModels || []}
                  onChange={(vals) => onChange({ excludedCarModels: vals })}
                  options={carModelsList.map((m) => ({ value: m.id, label: m.name }))}
                  placeholder="None Excluded"
                  disabled={isApplicableVehiclesActive}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Location (Dropdowns) */}
      {activeTab === 'location' && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Applicable Cities */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Applicable Cities</label>
              <CustomMultiSelect
                values={(formData.applicableCities || []).filter(c => c !== 'ALL')}
                onChange={(vals) => onChange({ applicableCities: vals.length === 0 ? ['ALL'] : vals })}
                options={citiesList.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="All Cities"
                size="sm"
              />
            </div>

            {/* Applicable Emirates */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Applicable Emirates</label>
              <CustomMultiSelect
                values={(formData.applicableAmirates || []).filter(e => e !== 'ALL')}
                onChange={(vals) => onChange({ applicableAmirates: vals.length === 0 ? ['ALL'] : vals })}
                options={emiratesList.map((e) => ({ value: e.id, label: e.name }))}
                placeholder="All Emirates"
                size="sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Customer Rules */}
      {activeTab === 'customer' && (
        <div className="space-y-4">
          <div className="space-y-1 max-w-xs">
            <label className="text-xs font-semibold text-slate-700">Applicable User Type</label>
            <CustomSelect
              value={formData.applicableUserType || 'ALL'}
              onChange={(val) => onChange({ applicableUserType: val as any })}
              options={[
                { value: 'ALL', label: 'All Users' },
                { value: 'NEW', label: 'New Users Only' },
                { value: 'EXISTING', label: 'Existing Users Only' },
                { value: 'PREMIUM', label: 'Premium Tier Users' },
              ]}
              size="sm"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50/60 border border-slate-200/90 rounded-lg max-w-md">
            <div>
              <span className="text-xs font-semibold text-slate-800">First Booking Only</span>
              <p className="text-[11px] text-slate-400">Apply only to customer's first completed booking.</p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ firstBookingOnly: !formData.firstBookingOnly })}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                formData.firstBookingOnly ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${
                  formData.firstBookingOnly ? 'translate-x-4.5' : 'translate-x-0.75'
                }`}
              />
            </button>
          </div>

          {/* Top Section: Included / Target Users */}
          <div className={`space-y-2 p-3.5 rounded-lg border bg-slate-50/40 transition-all ${
            isExcludedUsersActive ? 'border-slate-200/50 opacity-50' : 'border-slate-200/90 opacity-100'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                Included / Target Users
                {isIncludedUsersActive && (
                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">
                    {((formData as any).includedUsers?.filter((u: string) => u !== 'ALL').length || 0)} Selected
                  </span>
                )}
                {isExcludedUsersActive && (
                  <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Locked — Unselect Excluded Users first
                  </span>
                )}
              </label>
              {isIncludedUsersActive && (
                <button
                  type="button"
                  onClick={() => onChange({ ['includedUsers' as any]: ['ALL'] })}
                  className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
                >
                  Unselect All
                </button>
              )}
            </div>

            <div className="space-y-1">
              <CustomMultiSelect
                values={((formData as any).includedUsers || []).filter((u: string) => u !== 'ALL')}
                onChange={(vals) => onChange({ ['includedUsers' as any]: vals.length === 0 ? ['ALL'] : vals })}
                options={customersList.map((u) => ({ value: u.id, label: u.name }))}
                placeholder="All Users"
                disabled={isExcludedUsersActive}
                size="sm"
              />
            </div>
          </div>

          {/* Bottom Section: Excluded Users */}
          <div className={`space-y-2 p-3.5 rounded-lg border bg-slate-50/40 transition-all ${
            isIncludedUsersActive ? 'border-slate-200/50 opacity-50' : 'border-slate-200/90 opacity-100'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                Excluded Users
                {isExcludedUsersActive && (
                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">
                    {formData.excludedUsers?.length} Excluded
                  </span>
                )}
                {isIncludedUsersActive && (
                  <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Locked — Unselect Included Users first
                  </span>
                )}
              </label>
              {isExcludedUsersActive && (
                <button
                  type="button"
                  onClick={() => onChange({ excludedUsers: [] })}
                  className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
                >
                  Unselect All
                </button>
              )}
            </div>

            <div className="space-y-1">
              <CustomMultiSelect
                values={formData.excludedUsers || []}
                onChange={(vals) => onChange({ excludedUsers: vals })}
                options={customersList.map((u) => ({ value: u.id, label: u.name }))}
                placeholder="None Excluded"
                disabled={isIncludedUsersActive}
                size="sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Payment Rules */}
      {activeTab === 'payment' && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700">Payment Methods</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PAYMENT_METHODS.map((pm) => {
              const isSelected =
                (formData.paymentMethods || []).includes('ALL') ||
                (formData.paymentMethods || []).includes(pm);
              return (
                <div
                  key={pm}
                  onClick={() => togglePaymentMethod(pm)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all select-none ${
                    isSelected
                      ? 'border-slate-300 bg-slate-50 text-slate-900 font-medium'
                      : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{pm}</span>
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
          {((formData.paymentMethods || []).includes('ALL') || (formData.paymentMethods || []).length === 0) && (
            <p className="text-[10.5px] font-medium text-emerald-600">Valid for all payment methods (default)</p>
          )}
        </div>
      )}
    </div>
  );
}
