export type PromoType = 'coupon' | 'automatic' | 'referral' | 'cashback';
export type DiscountType = 'flat' | 'percentage' | 'free_service';
export type ApplicableUserType = 'all' | 'new' | 'existing' | 'premium';
export type PromotionStatus = 'active' | 'inactive';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  code?: string;
  promoType: PromoType;
  discountType: DiscountType;
  discountValue?: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  startDate: string;
  endDate?: string;
  status: PromotionStatus;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  stackable: boolean;
  priority?: number;
  applicableServices: string[];
  applicableVehicleBrands: string[];
  applicableVehicleTypes: string[];
  applicableCities: string[];
  applicableUserType: ApplicableUserType;
  firstBookingOnly: boolean;
  paymentMethods: string[];
  validDays: string[];
  validTimeFrom?: string;
  validTimeTo?: string;
  walletCashback?: number;
  freeServiceId?: string;
  referralReward?: number;
  isDeleted: boolean;
  applicableFuelType: string[];
  applicableTransmission: string[];
  applicableCarModels: string[];
  applicableAmirates: string[];
  excludedServices: string[];
  excludedUsers: string[];
  includeTaxes: boolean;
  autoApply: boolean;
}

export interface PromotionFilterState {
  search: string;
  promoType: string;
  status: string;
  discountType: string;
  dateFilter: string;
}

export interface ServiceOption {
  id: string;
  name: string;
  category?: string;
}

export interface BrandOption {
  id: string;
  name: string;
}

export interface ModelOption {
  id: string;
  brandId: string;
  name: string;
}

export interface CustomerOption {
  id: string;
  name: string;
  email: string;
}
