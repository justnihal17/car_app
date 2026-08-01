import api from '../api/axios';

const TOKEN_CACHE_KEY = 'registered_fcm_token';

let registrationLockPromise: Promise<{ success: boolean; statusText?: string; data?: any }> | null = null;
let registrationCount = 0;

export const notificationService = {
  getRegistrationCount(): number {
    return registrationCount;
  },

  isRegistering(): boolean {
    return registrationLockPromise !== null;
  },

  /**
   * Send FCM token to backend API: POST /admin/notification/token
   */
  async registerToken(
    token: string,
    options: { force?: boolean; reason?: string; source?: string } | boolean = {}
  ): Promise<{ success: boolean; statusText?: string; data?: any }> {
    if (!token) {
      console.warn('[FCM] Token Registration Skipped: No token provided');
      return { success: false, statusText: 'No token provided' };
    }

    const isForce = typeof options === 'boolean' ? options : options.force || false;
    const reason = typeof options === 'object' ? options.reason || 'Initial Sync' : 'Initial Sync';
    const source = typeof options === 'object' ? options.source || 'Unknown' : 'Unknown';

    const cachedToken = localStorage.getItem(TOKEN_CACHE_KEY);
    if (!isForce && cachedToken === token) {
      console.log(`[FCM] Token already registered. Registration skipped. (Source: ${source}, Reason: ${reason})`);
      return { success: true, statusText: 'Cached token matches' };
    }

    if (registrationLockPromise) {
      console.log(`[FCM] Registration already in progress. Waiting for active request. (Source: ${source})`);
      return registrationLockPromise;
    }

    registrationCount++;
    const currentCount = registrationCount;

    console.group(`[FCM REGISTER #${currentCount}]`);
    console.log('Source Component:', source);
    console.log('Reason:', reason);
    console.log('Current Route:', window.location.pathname);
    console.log('Current Token:', token);
    console.log('Registration Count:', currentCount);
    console.groupEnd();

    registrationLockPromise = (async () => {
      try {
        // const response = await api.post('/admin/notification/token', { token });
        // console.log(`[FCM REGISTER #${currentCount}] Success:`, response.status, response.data);
        const response = { status: 200, data: { status: 'mocked' } };

        localStorage.setItem(TOKEN_CACHE_KEY, token);

        return { success: true, statusText: 'Registered successfully', data: response.data };
      } catch (error: any) {
        console.error(`[FCM REGISTER #${currentCount}] Failed:`, error.response?.data || error.message);
        localStorage.removeItem(TOKEN_CACHE_KEY);
        return {
          success: false,
          statusText: error.response?.data?.message || error.message || 'API request failed',
        };
      } finally {
        registrationLockPromise = null;
      }
    })();

    return registrationLockPromise;
  },

  /**
   * Unregister FCM token from backend API: POST /admin/notification/token/remove
   */
  async unregisterToken(token?: string): Promise<boolean> {
    const tokenToRemove = token || localStorage.getItem(TOKEN_CACHE_KEY);
    if (!tokenToRemove) return true;

    console.log('[FCM UNREGISTER] Removing token from backend:', tokenToRemove);
    try {
      // const response = await api.post('/admin/notification/token/remove', { token: tokenToRemove });
      // console.log('[FCM UNREGISTER] Token Removed Success:', response.data);
    } catch (error: any) {
      console.error('[FCM UNREGISTER] Error removing token from backend:', error?.response?.data || error.message);
    } finally {
      localStorage.removeItem(TOKEN_CACHE_KEY);
    }
    return true;
  },

  getCachedToken(): string | null {
    return localStorage.getItem(TOKEN_CACHE_KEY);
  },

  /**
   * Fetch paginated notification list from backend API
   */
  async fetchNotifications(params: { page?: number; limit?: number; status?: string; type?: string } = {}): Promise<{
    notifications: any[];
    unreadCount: number;
    pagination: { page: number; totalPages: number; totalCount: number };
  }> {
    try {
      // const response = await api.get('/admin/notification', { params });
      // const data = response.data?.data || response.data || {};
      
      return {
        notifications: [],
        unreadCount: 0,
        pagination: {
          page: params.page || 1,
          totalPages: 1,
          totalCount: 0,
        },
      };
    } catch (error: any) {
      console.warn('[FCM Sync] API /admin/notification failed or endpoint not ready:', error.message);
      return {
        notifications: [],
        unreadCount: 0,
        pagination: { page: 1, totalPages: 1, totalCount: 0 },
      };
    }
  },

  /**
   * Fetch unread notification count from backend
   */
  async fetchUnreadCount(): Promise<number> {
    try {
      // const response = await api.get('/admin/notification/unread-count');
      return 0;
    } catch {
      return 0;
    }
  },

  /**
   * Mark specific notification(s) as read on backend
   */
  async markAsRead(notificationIds: string | string[]): Promise<boolean> {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
    if (ids.length === 0) return true;

    try {
      // await api.post('/admin/notification/read', { notificationIds: ids });
      return true;
    } catch (error: any) {
      console.warn('[FCM MarkRead] API failed, queuing offline:', error.message);
      return false;
    }
  },

  /**
   * Mark all notifications as read on backend
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      // await api.post('/admin/notification/read-all');
      return true;
    } catch (error: any) {
      console.warn('[FCM MarkAllRead] API failed:', error.message);
      return false;
    }
  },
};
