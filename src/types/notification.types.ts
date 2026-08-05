export type NotificationType = 
  | 'order_created' | 'order_accepted' | 'order_assigned' | 'order_status_changed' 
  | 'order_completed' | 'order_cancelled' | 'payment_received' | 'payment_failed' 
  | 'user_registered' | 'agent_registered' | 'agent_status_changed' 
  | 'promotion_created' | 'system_alert';

export type NotificationCategory = 'Orders' | 'Payments' | 'Users' | 'Agents' | 'Promotions' | 'System';

export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Critical';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  referenceId?: string; // e.g. ORD000109 (display string)
  entityId?: string; // e.g. MongoDB ObjectId
  actionUrl?: string; // Deep link to related record
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: 'All' | NotificationCategory;
    status: 'All' | 'Unread' | 'Read';
    priority: 'All' | NotificationPriority;
  };
}
