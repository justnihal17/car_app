export interface ApplicableService {
  serviceId: string;
  subServiceIds: string[];
}

export interface ServiceTreeSubService {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  duration?: number | string;
  status?: boolean | string;
}

export interface ServiceTreeNode {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  category?: string;
  image?: string;
  icon?: string;
  subServices?: ServiceTreeSubService[];
  sub_services?: ServiceTreeSubService[];
}

export interface SubscriptionPlan {
  _id: string;
  id?: string;
  name: string;
  description: string[] | string;
  duration: number;
  durationUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  price: number;
  totalCredits: number;
  frequency: 'ONE_TIME' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  applicableServices: ApplicableService[];
  applicableServiceIds?: string[];
  priorityBooking?: boolean;
  additionalServiceDiscount?: number;
  benefits?: string[];
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionFormData {
  name: string;
  description: string[];
  duration: number;
  durationUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  price: number;
  totalCredits: number;
  frequency: 'ONE_TIME' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  applicableServices: ApplicableService[];
  priorityBooking: boolean;
  additionalServiceDiscount: number;
  benefits: string[];
  isActive: boolean;
}

export interface SubscriptionFilterState {
  search: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  frequency: 'ALL' | 'ONE_TIME' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  durationUnit: 'ALL' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}
