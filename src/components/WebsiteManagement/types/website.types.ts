// TypeScript interfaces for Website Management CMS Modules

export interface HomePageServiceItem {
  _id?: string;
  id?: string;
  serviceId?: string | { _id?: string; id?: string; name?: string; title?: string; image?: string };
  image: string;
  name: string;
  title: string;
  redline: string;
  description: string;
  buttonText: string;
  order: number;
  active: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceDetailStepImage {
  image: string;
  text: string;
  description: string;
  duration?: string;
  price?: number;
  points: string[];
}

export interface ServiceDetailGetStarted {
  step: string;
  points: string[];
}

export interface ServiceDetailFAQ {
  questionName: string;
  questionValue: string;
}

export interface ServiceDetailContentItem {
  _id?: string;
  id?: string;
  serviceId?: string | { _id?: string; id?: string; name?: string; title?: string; price?: number; image?: string };
  image: string;
  title: string;
  description: string;
  duration?: string;
  price?: number;
  order?: number;
  servicesImages: ServiceDetailStepImage[];
  getStarted: ServiceDetailGetStarted;
  questionsAnswered: ServiceDetailFAQ[];
  active?: boolean;
  deleted?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RescueHeroServiceItem {
  _id?: string;
  id?: string;
  image: string;
  name: string;
  title: string;
  redline: string;
  description: string;
  order: number;
}

export interface RescueServiceItem {
  _id?: string;
  id?: string;
  image: string;
  name: string;
  description: string;
  duration: string;
  points: string[];
  price: number;
}

export interface RescuePageData {
  _id?: string;
  id?: string;
  heroServices: RescueHeroServiceItem[];
  description: string;
  rescueServices: RescueServiceItem[];
  getStarted: {
    points: string[];
  };
  questionsAnswered: ServiceDetailFAQ[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandItem {
  _id?: string;
  id?: string;
  image: string;
  name: string;
  tagline?: string;
  description?: string;
  highlights?: string[];
  featured?: boolean;
  order?: number;
  active?: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
