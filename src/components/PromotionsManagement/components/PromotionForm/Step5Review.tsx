import React, { useState, useEffect } from 'react';
import { Promotion } from '../../types/promotion.types';
import { Edit2, Tag, Calendar, Layers, ShieldCheck, CheckCircle2, Loader2, Wrench, Car, MapPin, Users, CreditCard } from 'lucide-react';
import api from '../../../../api/axios';
import { getPromotionMasterData, getCachedMasterDataSync, PromotionMasterData } from '../../services/promotionMasterCache';

interface Step5Props {
  formData: Partial<Promotion>;
  onGoToStep: (step: number) => void;
}

export function Step5Review({ formData, onGoToStep }: Step5Props) {
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
  const [loading, setLoading] = useState<boolean>(!getCachedMasterDataSync());

  useEffect(() => {
    let isMounted = true;
    getPromotionMasterData().then((data) => {
      if (isMounted) {
        setMasterData(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const apiServices = masterData.services;
  const apiBrands = masterData.brands;
  const apiModels = masterData.models;
  const apiVehicleTypes = masterData.vehicleTypes;
  const apiFuelTypes = masterData.fuelTypes;
  const apiCities = masterData.cities;
  const apiEmirates = masterData.emirates;
  const apiCustomers = masterData.customers;

  // Helper to map IDs / Names to clean string without Mongo ObjectIds
  const resolveNames = (
    ids: any[] | undefined,
    masterList: { id: string; name: string }[],
    allLabel: string,
    noneLabel: string = 'None Selected'
  ) => {
    if (!ids || ids.length === 0) {
      return noneLabel;
    }
    if (ids.includes('ALL') || (masterList.length > 0 && ids.length >= masterList.length)) {
      return allLabel;
    }
    const resolved = ids.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return item.name || item.title || item.type || item.fullName || '';
      }
      const strItem = String(item);
      const match = masterList.find((m) => m.id === strItem || m.name === strItem);
      if (match && match.name) return match.name;
      // If it's a 24-character hexadecimal MongoDB ID, don't show the ugly hex ID
      if (/^[0-9a-fA-F]{24}$/.test(strItem)) {
        return '';
      }
      return strItem;
    }).filter(Boolean);

    if (resolved.length === 0) {
      return loading ? 'Loading...' : noneLabel;
    }
    return resolved.join(', ');
  };

  const getValidDaysDisplay = (days?: any[]) => {
    if (!days || days.length === 0) {
      return 'None Selected';
    }
    if (days.includes('ALL') || days.length === 7) {
      return 'Everyday (All Days)';
    }
    return days.join(', ');
  };

  const getPaymentMethodsDisplay = (methods?: string[]) => {
    if (!methods || methods.length === 0) {
      return 'None Selected';
    }
    if (methods.includes('ALL') || (methods.length >= 2)) {
      return 'All Payment Methods';
    }
    return methods.join(', ');
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-2.5">
        <h2 className="text-sm font-semibold text-slate-900">Step 5: Review & Create</h2>
        <p className="text-xs text-slate-400 font-normal mt-0.5">Review all configured rules before activating this promotion.</p>
      </div>

      <div className="space-y-3 text-xs">
        {/* Section 1: Basic Info & Type */}
        <div className="bg-slate-50/60 p-3.5 rounded-lg border border-slate-200/90 space-y-2.5">
          <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-red-600" /> Basic Information & Type
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-red-600 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 1
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div><span className="text-slate-500">Title:</span> <strong className="text-slate-900 font-semibold">{formData.title}</strong></div>
            <div><span className="text-slate-500">Promo Type:</span> <strong className="text-slate-900 font-semibold uppercase">{formData.promoType}</strong></div>
            <div><span className="text-slate-500">Promo Code:</span> <strong className="font-mono font-semibold text-slate-900">{formData.code || 'N/A (Auto Applied)'}</strong></div>
            <div><span className="text-slate-500">Initial Status:</span> <strong className="text-slate-900 font-semibold uppercase">{formData.status}</strong></div>
            <div className="sm:col-span-2"><span className="text-slate-500">Description:</span> <span className="text-slate-800">{formData.description}</span></div>
          </div>
        </div>

        {/* Section 2: Discount & Limits */}
        <div className="bg-slate-50/60 p-3.5 rounded-lg border border-slate-200/90 space-y-2.5">
          <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600" /> Discount & Limits
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-red-600 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 2
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><span className="text-slate-500">Discount Type:</span> <strong className="text-slate-900 capitalize">{formData.discountType?.replace('_', ' ')}</strong></div>
            <div>
              <span className="text-slate-500">Value:</span>{' '}
              <strong className="text-slate-900">
                {formData.discountType === 'FLAT' ? `AED ${formData.discountValue}` : formData.discountType === 'PERCENTAGE' ? `${formData.discountValue}%` : 'Free Service'}
              </strong>
            </div>
            <div><span className="text-slate-500">Min Order:</span> <strong className="text-slate-900">AED {formData.minimumOrderAmount || 0}</strong></div>
            <div><span className="text-slate-500">Max Discount Cap:</span> <strong className="text-slate-900">{formData.maximumDiscountAmount ? `AED ${formData.maximumDiscountAmount}` : 'None'}</strong></div>
            <div><span className="text-slate-500">Total Usage Limit:</span> <strong className="text-slate-900">{formData.usageLimit || 'Unlimited'}</strong></div>
            <div><span className="text-slate-500">Per User Limit:</span> <strong className="text-slate-900">{formData.perUserLimit || 1}</strong></div>
            <div><span className="text-slate-500">Stackable:</span> <strong className="text-slate-900">{formData.stackable ? 'Yes' : 'No'}</strong></div>
            <div><span className="text-slate-500">Priority:</span> <strong className="text-slate-900">P{formData.priority || 1}</strong></div>
          </div>
        </div>

        {/* Section 3: Applicability */}
        <div className="bg-slate-50/60 p-3.5 rounded-lg border border-slate-200/90 space-y-2.5">
          <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-red-600" /> Target Applicability
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(3)}
              className="text-red-600 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 3
            </button>
          </div>
          <div className="space-y-1.5">
            {/* Services */}
            <div>
              <span className="text-slate-500">Services:</span>{' '}
              <span className="font-semibold text-slate-800">
                {formData.applicableServices && formData.applicableServices.length > 0 && !formData.applicableServices.includes('ALL')
                  ? resolveNames(formData.applicableServices, apiServices, 'All Services', 'All Services')
                  : formData.excludedServices && formData.excludedServices.length > 0
                  ? `All Services (Except: ${resolveNames(formData.excludedServices, apiServices, 'All Services', '')})`
                  : 'All Services'}
              </span>
            </div>

            {/* Vehicle Brands */}
            <div>
              <span className="text-slate-500">Vehicle Brands:</span>{' '}
              <span className="font-semibold text-slate-800">
                {formData.applicableVehicleBrands && formData.applicableVehicleBrands.length > 0 && !formData.applicableVehicleBrands.includes('ALL')
                  ? resolveNames(formData.applicableVehicleBrands, apiBrands, 'All Vehicle Brands', 'All Vehicle Brands')
                  : formData.excludedVehicleBrands && formData.excludedVehicleBrands.length > 0
                  ? `All Vehicle Brands (Except: ${resolveNames(formData.excludedVehicleBrands, apiBrands, 'All Vehicle Brands', '')})`
                  : 'All Vehicle Brands'}
              </span>
            </div>

            {/* Car Models */}
            <div>
              <span className="text-slate-500">Car Models:</span>{' '}
              <span className="font-semibold text-slate-800">
                {formData.applicableCarModels && formData.applicableCarModels.length > 0 && !formData.applicableCarModels.includes('ALL')
                  ? resolveNames(formData.applicableCarModels, apiModels, 'All Car Models', 'All Car Models')
                  : formData.excludedCarModels && formData.excludedCarModels.length > 0
                  ? `All Car Models (Except: ${resolveNames(formData.excludedCarModels, apiModels, 'All Car Models', '')})`
                  : 'All Car Models'}
              </span>
            </div>

            {/* Vehicle Types */}
            <div>
              <span className="text-slate-500">Vehicle Types:</span>{' '}
              <span className="font-semibold text-slate-800">
                {resolveNames(formData.applicableVehicleTypes, apiVehicleTypes, 'All Vehicle Types', 'All Vehicle Types')}
              </span>
            </div>

            {/* Fuel Types */}
            <div>
              <span className="text-slate-500">Fuel Types:</span>{' '}
              <span className="font-semibold text-slate-800">
                {resolveNames(formData.applicableFuelType, apiFuelTypes, 'All Fuel Types', 'All Fuel Types')}
              </span>
            </div>

            {/* Locations */}
            <div>
              <span className="text-slate-500">Cities:</span>{' '}
              <span className="font-semibold text-slate-800">
                {resolveNames(formData.applicableCities, apiCities, 'All Cities', 'All Cities')}
              </span>
            </div>

            <div>
              <span className="text-slate-500">Emirates:</span>{' '}
              <span className="font-semibold text-slate-800">
                {resolveNames(formData.applicableAmirates, apiEmirates, 'All Emirates', 'All Emirates')}
              </span>
            </div>

            {/* Customers */}
            <div>
              <span className="text-slate-500">User Tier:</span>{' '}
              <span className="font-semibold text-slate-900 capitalize">
                {formData.applicableUserType || 'All'} Users
              </span>
            </div>

            <div>
              <span className="text-slate-500">Target Customers:</span>{' '}
              <span className="font-semibold text-slate-800">
                {(formData as any).includedUsers && (formData as any).includedUsers.length > 0 && !(formData as any).includedUsers.includes('ALL')
                  ? resolveNames((formData as any).includedUsers, apiCustomers, 'All Users', 'All Users')
                  : formData.excludedUsers && formData.excludedUsers.length > 0
                  ? `All Users (Except: ${resolveNames(formData.excludedUsers, apiCustomers, 'All Users', '')})`
                  : 'All Users'}
              </span>
            </div>

            {/* Payment Methods */}
            <div>
              <span className="text-slate-500">Payment Methods:</span>{' '}
              <span className="font-semibold text-slate-800">
                {getPaymentMethodsDisplay(formData.paymentMethods)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Schedule & Additional */}
        <div className="bg-slate-50/60 p-3.5 rounded-lg border border-slate-200/90 space-y-2.5">
          <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-600" /> Schedule & Rules
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(4)}
              className="text-red-600 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Edit2 className="w-3 h-3" /> Edit Step 4
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div><span className="text-slate-500">Start Date:</span> <strong className="text-slate-900">{formData.startDate}</strong></div>
            <div><span className="text-slate-500">End Date:</span> <strong className="text-slate-900">{formData.endDate || 'No Expiry Date'}</strong></div>
            <div><span className="text-slate-500">Valid Days:</span> <strong className="text-slate-900">{getValidDaysDisplay(formData.validDays)}</strong></div>
            <div><span className="text-slate-500">Time Range:</span> <strong className="text-slate-900">{formData.validTimeFrom && formData.validTimeTo ? `${formData.validTimeFrom} - ${formData.validTimeTo}` : 'All Day'}</strong></div>
            <div><span className="text-slate-500">Auto Apply:</span> <strong className="text-slate-900">{formData.autoApply ? 'Yes' : 'No'}</strong></div>
            <div><span className="text-slate-500">Include Taxes:</span> <strong className="text-slate-900">{formData.includeTaxes ? 'Yes' : 'No'}</strong></div>
            {formData.walletCashback ? <div><span className="text-slate-500">Wallet Cashback:</span> <strong className="text-emerald-600">AED {formData.walletCashback}</strong></div> : null}
            {formData.referralReward ? <div><span className="text-slate-500">Referral Reward:</span> <strong className="text-amber-600">AED {formData.referralReward}</strong></div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
