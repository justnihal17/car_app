export type OrderStatus = 'Pending' | 'Accepted' | 'Assigned' | 'On Route' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Wallet' | 'Bank Transfer';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  address: string;
}

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  registrationNumber: string;
  image?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  currentOrders: number;
  status: 'Available' | 'Busy' | 'Offline';
}

export interface OrderTimelineEvent {
  id: string;
  status: OrderStatus;
  timestamp: string;
  description: string;
}

export interface PaymentDetails {
  status: PaymentStatus;
  method?: PaymentMethod;
  transactionId?: string;
  amount: number;
  subtotal: number;
  tax: number;
  discount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  vehicle: Vehicle;
  service: Service;
  agent?: Agent;
  scheduledDate: string;
  scheduledTime: string;
  createdAt: string;
  status: OrderStatus;
  payment: PaymentDetails;
  notes?: string;
  timeline: OrderTimelineEvent[];
}
