import { AppNotification } from '../types/notification.types';

const STORAGE_KEY = 'stylein_notifications';

export const mockNotificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveNotifications: (notifications: AppNotification[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  },

  createNotification: async (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): Promise<AppNotification> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newNotification: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    const existing = await mockNotificationService.getNotifications();
    const updated = [newNotification, ...existing];
    mockNotificationService.saveNotifications(updated);
    
    return newNotification;
  },

  markAsRead: async (id: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = await mockNotificationService.getNotifications();
    const updated = existing.map(n => n.id === id ? { ...n, isRead: true } : n);
    mockNotificationService.saveNotifications(updated);
    return id;
  },
  
  markAsUnread: async (id: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = await mockNotificationService.getNotifications();
    const updated = existing.map(n => n.id === id ? { ...n, isRead: false } : n);
    mockNotificationService.saveNotifications(updated);
    return id;
  },

  markAllAsRead: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const existing = await mockNotificationService.getNotifications();
    const updated = existing.map(n => ({ ...n, isRead: true }));
    mockNotificationService.saveNotifications(updated);
  },

  deleteNotification: async (id: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const existing = await mockNotificationService.getNotifications();
    const updated = existing.filter(n => n.id !== id);
    mockNotificationService.saveNotifications(updated);
    return id;
  },
  
  clearReadNotifications: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const existing = await mockNotificationService.getNotifications();
    const updated = existing.filter(n => !n.isRead);
    mockNotificationService.saveNotifications(updated);
  }
};
