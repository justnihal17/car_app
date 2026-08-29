import React, { useState, useEffect } from 'react';
import { Promotion } from '../../types/promotion.types';
import { FormStepper } from './FormStepper';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2DiscountLimits } from './Step2DiscountLimits';
import { Step3Applicability } from './Step3Applicability';
import { Step4ScheduleRules } from './Step4ScheduleRules';
import { Step5Review } from './Step5Review';
import { ArrowLeft, Save, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPromotionMasterData } from '../../services/promotionMasterCache';

interface PromotionFormContainerProps {
  initialData?: Promotion | null;
  onSubmit: (promo: Promotion) => void;
  onCancel: () => void;
}

export function PromotionFormContainer({ initialData, onSubmit, onCancel }: PromotionFormContainerProps) {
  const isEditMode = !!initialData;
  const [currentStep, setCurrentStep] = useState(1);

  // Preload master data in the background so step 3 and 5 are instant
  useEffect(() => {
    getPromotionMasterData();
  }, []);

  const [formData, setFormData] = useState<Partial<Promotion>>(() => {
    if (initialData) return { ...initialData };
    return {
      title: '',
      description: '',
      code: '',
      promoType: 'COUPON',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minimumOrderAmount: 0,
      status: 'ACTIVE',
      usedCount: 0,
      perUserLimit: 1,
      stackable: false,
      priority: 1,
      applicableServices: ['ALL'],
      applicableVehicleBrands: [],
      applicableVehicleTypes: [],
      applicableCities: [],
      applicableUserType: 'ALL',
      firstBookingOnly: false,
      paymentMethods: ['ALL'],
      validDays: ['ALL'],
      isDeleted: false,
      applicableFuelType: [],
      applicableTransmission: [],
      applicableCarModels: [],
      applicableAmirates: [],
      excludedServices: [],
      excludedVehicleBrands: [],
      excludedCarModels: [],
      includedUsers: ['ALL'],
      excludedUsers: [],
      includeTaxes: true,
      autoApply: false,
      startDate: new Date().toISOString().split('T')[0],
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (updated: Partial<Promotion>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title?.trim()) errs.title = 'Promotion title is required.';
      if (!formData.description?.trim()) errs.description = 'Description is required.';
      if (formData.promoType === 'COUPON') {
        if (!formData.code?.trim()) {
          errs.code = 'Promo code is required for coupon type.';
        } else if (/\s/.test(formData.code)) {
          errs.code = 'Promo code must not contain spaces.';
        }
      }
    }

    if (step === 2) {
      if (formData.discountType !== 'FREE_SERVICE') {
        if (formData.discountValue === undefined || formData.discountValue === null || formData.discountValue <= 0) {
          errs.discountValue = 'Discount value must be greater than 0.';
        } else if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
          errs.discountValue = 'Percentage discount cannot exceed 100%.';
        }
      }
    }

    if (step === 4) {
      if (!formData.startDate) errs.startDate = 'Start date is required.';
      if (formData.startDate && formData.endDate) {
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
          errs.endDate = 'End date must be later than start date.';
        }
      }
      if (formData.validTimeFrom && formData.validTimeTo) {
        if (formData.validTimeTo <= formData.validTimeFrom) {
          errs.validTimeTo = 'Valid time to must be later than valid time from.';
        }
      }
      if (formData.promoType === 'CASHBACK' && (!formData.walletCashback || formData.walletCashback <= 0)) {
        errs.walletCashback = 'Wallet cashback amount is required.';
      }
      if (formData.promoType === 'REFERRAL' && (!formData.referralReward || formData.referralReward <= 0)) {
        errs.referralReward = 'Referral reward amount is required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleFinalSubmit();
      }
    } else {
      toast.error('Please fix the errors before proceeding.');
    }
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved successfully!');
  };

  const handleFinalSubmit = () => {
    const formatISO = (dateStr?: string) => {
      if (!dateStr) return new Date().toISOString();
      try {
        return new Date(dateStr).toISOString();
      } catch (e) {
        return dateStr;
      }
    };

    const normalizeAll = (arr?: any[]) => {
      if (!arr || arr.length === 0) return [];
      if (arr.includes('ALL')) return ['ALL'];
      return arr.filter(Boolean);
    };

    const finalPromo: any = {
      ...(formData.id ? { id: formData.id } : {}),
      title: formData.title || 'Untitled Promotion',
      description: formData.description || '',
      code: formData.promoType === 'COUPON' ? (formData.code?.toUpperCase() || 'OFFER') : undefined,
      promoType: formData.promoType || 'COUPON',
      discountType: formData.discountType || 'PERCENTAGE',
      discountValue: Math.max(0, Number(formData.discountValue || 0)),
      minimumOrderAmount: Math.max(0, Number(formData.minimumOrderAmount || 0)),
      maximumDiscountAmount: Math.max(0, Number(formData.maximumDiscountAmount || 0)),
      startDate: formatISO(formData.startDate),
      endDate: formatISO(formData.endDate),
      status: formData.status || 'ACTIVE',
      usageLimit: Math.max(0, Number(formData.usageLimit || 100)),
      usedCount: Math.max(0, Number(formData.usedCount || 0)),
      perUserLimit: Math.max(1, Number(formData.perUserLimit || 1)),
      stackable: !!formData.stackable,
      priority: Math.max(1, Math.abs(Number(formData.priority !== undefined ? formData.priority : 10))),
      applicableServices: normalizeAll(formData.applicableServices),
      applicableVehicleBrands: normalizeAll(formData.applicableVehicleBrands),
      applicableVehicleTypes: normalizeAll(formData.applicableVehicleTypes),
      applicableCities: normalizeAll(formData.applicableCities),
      applicableUserType: formData.applicableUserType ? (formData.applicableUserType.toUpperCase() as any) : 'ALL',
      firstBookingOnly: !!formData.firstBookingOnly,
      paymentMethods: formData.paymentMethods && formData.paymentMethods.length > 0 ? formData.paymentMethods : ['ONLINE', 'COD'],
      validDays: formData.validDays ? formData.validDays.map(day => {
        if (typeof day === 'number') return day;
        const daysMap: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
        return daysMap[day.toString()] ?? -1;
      }).filter(d => d !== -1) : [0, 1, 2, 3, 4, 5, 6],
      validTimeFrom: formData.validTimeFrom || '00:00',
      validTimeTo: formData.validTimeTo || '23:59',
      walletCashback: Math.max(0, Number(formData.walletCashback || 0)),
      referralReward: Math.max(0, Number(formData.referralReward || 0)),
      isDeleted: false,
      applicableFuelType: normalizeAll(formData.applicableFuelType),
      applicableTransmission: normalizeAll(formData.applicableTransmission),
      applicableCarModels: normalizeAll(formData.applicableCarModels),
      applicableAmirates: normalizeAll(formData.applicableAmirates),
      excludedServices: normalizeAll(formData.excludedServices),
      excludedVehicleBrands: normalizeAll(formData.excludedVehicleBrands),
      excludedCarModels: normalizeAll(formData.excludedCarModels),
      excludedUsers: normalizeAll(formData.excludedUsers),
      includedUsers: normalizeAll((formData as any).includedUsers),
      includeTaxes: formData.includeTaxes !== false,
      autoApply: formData.promoType === 'AUTOMATIC' ? true : !!formData.autoApply,
    };

    if (formData.discountType === 'FREE_SERVICE' && formData.freeServiceId) {
      const parsedId = Array.isArray(formData.freeServiceId) ? formData.freeServiceId[0] : formData.freeServiceId;
      if (parsedId) {
        finalPromo.freeServiceId = parsedId;
      }
    }

    onSubmit(finalPromo);
  };

  return (
    <div className="space-y-3.5 max-w-4xl mx-auto pb-8 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onCancel}
            className="w-7.5 h-7.5 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight leading-none">
              {isEditMode ? `Edit Promotion: ${initialData?.title}` : 'Create New Promotion'}
            </h1>
            <p className="text-[11px] text-slate-400 font-normal mt-1">Step {currentStep} of 5</p>
          </div>
        </div>

        <button
          onClick={handleSaveDraft}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg text-xs transition-colors cursor-pointer h-7.5"
        >
          <Save className="w-3.5 h-3.5" /> Save Draft
        </button>
      </div>

      {/* Stepper */}
      <FormStepper currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

      {/* Step Content */}
      {currentStep === 1 && <Step1BasicInfo formData={formData} onChange={updateFormData} errors={errors} />}
      {currentStep === 2 && <Step2DiscountLimits formData={formData} onChange={updateFormData} errors={errors} isEditMode={isEditMode} />}
      {currentStep === 3 && <Step3Applicability formData={formData} onChange={updateFormData} />}
      {currentStep === 4 && <Step4ScheduleRules formData={formData} onChange={updateFormData} errors={errors} />}
      {currentStep === 5 && <Step5Review formData={formData} onGoToStep={(s) => setCurrentStep(s)} />}

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
        <button
          type="button"
          onClick={currentStep === 1 ? onCancel : () => setCurrentStep((prev) => prev - 1)}
          className="h-8 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 h-8 px-5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-2xs text-xs transition-all active:scale-95 cursor-pointer"
          >
            {currentStep === 5 ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" /> {isEditMode ? 'Update Promotion' : 'Create Promotion'}
              </>
            ) : (
              <>
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
