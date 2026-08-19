export type OrderStatus = 'Pending' | 'Accepted' | 'Assigned' | 'On Route' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Wallet' | 'Bank Transfer';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  scheduledDate: string;
  scheduledTime: string;
  payment: {
    status: PaymentStatus;
    method?: PaymentMethod;
    amount?: number;
  };
  customer?: {
    name: string;
    phone: string;
    address: string;
  };
  agent?: {
    id: string;
    name: string;
  };
  service?: {
    name: string;
    price: number;
  };
  [key: string]: any;
}
