export type OrderStatus = 'Pending' | 'Accepted' | 'Assigned' | 'On Route' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Wallet' | 'Bank Transfer';

export interface Order {
  _id: string;
  id?: string;
  order_number: string;
  orderNumber?: string;
  order_date: string;       // Date when order was placed
  scheduled_at: string;     // Authoritative scheduled appointment date & time
  time_slot?: {
    from: string;
    to: string;
  };
  booking_type?: 'normal' | 'instant';
  status: OrderStatus | string;
  estimated_amount?: number;
  additional_service_amount?: number;
  coupon_discount?: number;
  subscriptionDiscount?: number;
  vat_amount: number;
  vat_rate: number;
  final_amount: number;
  payment?: {
    status: PaymentStatus;
    method?: PaymentMethod | string;
    amount?: number;
    transaction_id?: string;
  };
  customer?: {
    name: string;
    phone: string;
    address: string;
  };
  customer_id?: {
    _id?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
  agent?: {
    id: string;
    name: string;
  };
  agent_id?: {
    _id?: string;
    agentId?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  service?: {
    name: string;
    price: number;
  };
  services?: Array<{
    serviceId?: any;
    subServiceId?: any;
    price?: number;
    duration?: number;
  }>;
  pickup_location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  vehicle_id?: any;
  customer_note?: string;
  agent_notes?: Array<{
    note: string;
    created_at: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  [key: string]: any;
}

export interface AgentRef {
  _id: string;
  id?: string;
  agentId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  active: boolean;
  blocked: boolean;
  rating?: number;
  profileImage?: string;
}

export interface OrderTrackMeta {
  previous_agent_id?: string | null;
  previous_agent_name?: string | null;
  new_agent_id?: string;
  new_agent_name?: string;
  reassign_reason?: string;
  is_reassignment?: boolean;
}

export interface OrderTrackItem {
  _id: string;
  order_id: string;
  action: 'ORDER_CREATED' | 'AGENT_ASSIGNED' | 'AGENT_REASSIGNED' | 'STATUS_CHANGED' | 'PAYMENT_UPDATED' | 'CUSTOMER_CANCELLED' | 'ADMIN_CANCELLED' | string;
  old_status?: string;
  new_status?: string;
  updated_by?: {
    id?: string;
    role?: string;
    name?: string;
  };
  meta?: OrderTrackMeta;
  createdAt: string;
}

export interface ReassignAgentPayload {
  agent_id: string;
  reason: string;
  version?: number;
}
