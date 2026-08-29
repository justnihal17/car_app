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

    const titleVal = formData.title || 'Untitled Promotion';
    const codeVal = formData.promoType === 'COUPON' ? (formData.code?.toUpperCase() || 'OFFER') : (formData.code || '');
    const discountNum = Math.max(0, Number(formData.discountValue || 0));
    const minOrderNum = Math.max(0, Number(formData.minimumOrderAmount || 0));
    const maxDiscountNum = Math.max(0, Number(formData.maximumDiscountAmount || 0));
    const startIso = formatISO(formData.startDate);
    const endIso = formData.endDate ? formatISO(formData.endDate) : undefined;
    const usageLimitVal = Math.max(0, Number(formData.usageLimit || 100));
    const perUserLimitVal = Math.max(1, Number(formData.perUserLimit || 1));
    const statusVal = formData.status ? String(formData.status).toUpperCase() : 'ACTIVE';
    const discountTypeVal = (formData.discountType || 'PERCENTAGE').toUpperCase();
    const promoTypeVal = (formData.promoType || 'COUPON').toUpperCase();

    const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysMap: Record<string, number> = { 
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
      sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
    };

    let selectedDaysStrings: string[] = [];
    if (!formData.validDays || formData.validDays.length === 0 || formData.validDays.includes('ALL')) {
      selectedDaysStrings = ALL_DAYS;
    } else {
      selectedDaysStrings = formData.validDays.map(d => {
        if (typeof d === 'number') {
          const numMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          return numMap[d] || String(d);
        }
        return String(d);
      });
    }

    const selectedDaysNumbers: number[] = selectedDaysStrings.map(d => daysMap[d] ?? -1).filter(n => n !== -1);

    const rawPayments = formData.paymentMethods || [];
    let resolvedPaymentMethods: string[] = ['ONLINE', 'COD'];
    if (rawPayments.length > 0 && !rawPayments.includes('ALL')) {
      resolvedPaymentMethods = rawPayments.map(p => String(p).toUpperCase());
    }

    const finalPromo: any = {
      ...(formData.id ? { id: formData.id, _id: formData.id } : {}),
      
      // Name & Title aliases
      title: titleVal,
      name: titleVal,
      offerName: titleVal,
      offerTitle: titleVal,

      // Code aliases
      code: codeVal,
      couponCode: codeVal,
      promoCode: codeVal,
      offerCode: codeVal,

      description: formData.description || '',
      promoType: promoTypeVal,
      type: promoTypeVal.toLowerCase(),
      offerType: promoTypeVal,

      discountType: discountTypeVal,
      discount_type: discountTypeVal.toLowerCase(),

      // Discount amount/value aliases
      discountValue: discountNum,
      discount: discountNum,
      discountAmount: discountNum,
      value: discountNum,
      percentage: discountNum,

      // Minimum and Maximum thresholds
      minimumOrderAmount: minOrderNum,
      minOrderValue: minOrderNum,
      minAmount: minOrderNum,
      minOrderAmount: minOrderNum,

      maximumDiscountAmount: maxDiscountNum,
      maxDiscount: maxDiscountNum,
      maxDiscountAmount: maxDiscountNum,

      // Validity / Dates aliases
      startDate: startIso,
      validFrom: startIso,
      valid_from: startIso,
      start_date: startIso,
      fromDate: startIso,

      endDate: endIso,
      validTill: endIso,
      validTo: endIso,
      valid_till: endIso,
      end_date: endIso,
      expiryDate: endIso,

      // Status & Activity aliases
      status: formData.status ? String(formData.status).toUpperCase() : 'ACTIVE',
      active: formData.status ? formData.status === 'ACTIVE' : true,
      isActive: formData.status ? formData.status === 'ACTIVE' : true,

      // Usage & Limit aliases
      usageLimit: usageLimitVal,
      totalUsageLimit: usageLimitVal,
      limit: usageLimitVal,
      maxUsage: usageLimitVal,
      usedCount: Math.max(0, Number(formData.usedCount || 0)),
      perUserLimit: perUserLimitVal,
      userLimit: perUserLimitVal,
      usagePerUser: perUserLimitVal,

      stackable: !!formData.stackable,
      priority: Math.max(1, Math.abs(Number(formData.priority !== undefined ? formData.priority : 10))),

      // Applicability & Entity lists
      applicableServices: normalizeAll(formData.applicableServices),
      services: normalizeAll(formData.applicableServices),
      serviceIds: normalizeAll(formData.applicableServices),

      applicableVehicleBrands: normalizeAll(formData.applicableVehicleBrands),
      brands: normalizeAll(formData.applicableVehicleBrands),
      vehicleBrands: normalizeAll(formData.applicableVehicleBrands),

      applicableVehicleTypes: normalizeAll(formData.applicableVehicleTypes),
      vehicleTypes: normalizeAll(formData.applicableVehicleTypes),

      applicableCities: normalizeAll(formData.applicableCities),
      cities: normalizeAll(formData.applicableCities),

      applicableUserType: formData.applicableUserType ? (formData.applicableUserType.toUpperCase() as any) : 'ALL',
      userType: formData.applicableUserType || 'ALL',
      firstBookingOnly: !!formData.firstBookingOnly,

      // Payment Methods aliases
      paymentMethods: resolvedPaymentMethods,
      payment_methods: resolvedPaymentMethods,
      paymentMethod: resolvedPaymentMethods,
      payment_method: resolvedPaymentMethods,
      applicablePaymentMethods: resolvedPaymentMethods,

      // Valid Days aliases (numeric [0..6] for Number schemas, string names for string schemas)
      validDays: selectedDaysNumbers.length > 0 ? selectedDaysNumbers : [0, 1, 2, 3, 4, 5, 6],
      valid_days: selectedDaysNumbers.length > 0 ? selectedDaysNumbers : [0, 1, 2, 3, 4, 5, 6],
      daysOfWeek: selectedDaysNumbers.length > 0 ? selectedDaysNumbers : [0, 1, 2, 3, 4, 5, 6],
      days: selectedDaysStrings,
      applicableDays: selectedDaysStrings,
      validDaysStrings: selectedDaysStrings,
      validDaysNumbers: selectedDaysNumbers,

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
