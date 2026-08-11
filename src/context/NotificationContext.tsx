import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { getFcmToken, onForegroundMessage } from '../firebase/messaging';
import { notificationService } from '../services/notification.service';
import { isFirebaseConfigured } from '../firebase/firebase';

export type PushNotificationStatus =
  | 'idle'
  | 'loading'
  | 'enabled'
  | 'permission_required'
  | 'disabled'
  | 'error';

export interface NotificationContextType {
  permission: NotificationPermission;
  token: string | null;
  status: PushNotificationStatus;
  error: string | null;
  lastSyncTime: string | null;
  backendResponse: any;
  registrationCount: number;
  isRegistering: boolean;
  notifications: any[];
  unreadCount: number;
  pagination: { page: number; totalPages: number; totalCount: number };
  requestPermission: () => Promise<void>;
  initializeFCM: (reason?: string) => Promise<void>;
  reRegisterToken: () => Promise<void>;
  fetchBackendNotifications: (params?: { page?: number; limit?: number; status?: string; type?: string }) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

// Helper to register Service Worker strictly once
const registerServiceWorkerSingleton = async (): Promise<ServiceWorkerRegistration | null> => {
  if (swRegistrationPromise) return swRegistrationPromise;
  if (!('serviceWorker' in navigator)) {
    console.warn('[FCM] Service workers not supported in this browser.');
    return null;
  }

  swRegistrationPromise = (async () => {
    try {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
      const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
      const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';
      const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
      const appId = import.meta.env.VITE_FIREBASE_APP_ID || '';

      const queryParams = new URLSearchParams({
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
      }).toString();

      const swUrl = `/firebase-messaging-sw.js?${queryParams}`;
      const registration = await navigator.serviceWorker.register(swUrl, { scope: '/' });
      console.log('[FCM] Service Worker Registered (Singleton)');
      return registration;
    } catch (err) {
      console.error('[FCM] Service Worker registration error:', err);
      swRegistrationPromise = null;
      return null;
    }
  })();

  return swRegistrationPromise;
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default';
  });
  const [token, setToken] = useState<string | null>(notificationService.getCachedToken());
  const [status, setStatus] = useState<PushNotificationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [backendResponse, setBackendResponse] = useState<any>(null);

  // Notifications State & Pagination
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });

  // Deduplication Set Ref
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const isInitializingRef = useRef(false);

  const isFirstFetchRef = useRef(true);

  // Sync Notifications List & Unread Count from Backend
  const fetchBackendNotifications = useCallback(async (params = {}) => {
    const res = await notificationService.fetchNotifications(params);
    setNotifications(res.notifications);
    setUnreadCount(res.unreadCount);
    setPagination(res.pagination);

    const newNotifications: any[] = [];

    // Track seen IDs for deduplication
    res.notifications.forEach((item: any) => {
      const itemId = item.id || item._id || item.notificationId;
      if (itemId) {
        if (!seenNotificationIdsRef.current.has(itemId)) {
          if (!isFirstFetchRef.current && !item.isRead && !item.read) {
            newNotifications.push(item);
          }
          seenNotificationIdsRef.current.add(itemId);
        }
      }
    });

    isFirstFetchRef.current = false;

    // Trigger toast for new notifications fetched via polling
    newNotifications.forEach(notif => {
      const title = notif.title || 'New Notification';
      const body = notif.message || notif.body || '';
      
      const eventType = (notif.type || '').toUpperCase();
      const isHighPriority = eventType === 'ORDER_CREATED' || eventType === 'CUSTOMER_CANCELLED' || eventType === 'PAYMENT_FAILED' || title.toLowerCase().includes('order');

      // Dispatch to Redux Store for real-time header bell update
      import('../store/store').then(({ store }) => {
        import('../store/notificationSlice').then(({ fetchNotifications }) => {
          store.dispatch(fetchNotifications());
        });
      });

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-in slide-in-from-top-5 fade-in zoom-in-95 duration-300' : 'animate-out slide-out-to-top-5 fade-out zoom-out-95 duration-200'
            } max-w-sm w-full bg-white text-slate-800 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.25)] rounded-2xl pointer-events-auto flex flex-col border border-slate-100 p-5 space-y-4 relative overflow-hidden`}
          >
            {/* Elegant Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-red-500 to-red-600 shadow-sm" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-inner shrink-0">
                    <span className="text-xl">🔔</span>
                  </div>
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-900 leading-tight tracking-wide">{title}</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed font-medium line-clamp-2">{body}</p>
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-all cursor-pointer shrink-0 ml-2"
              >
                ✕
              </button>
            </div>
            
            <div className="flex items-center gap-3 pt-2 relative z-10 border-t border-slate-50">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  let notifPayload: any = {};
                  try {
                    notifPayload = typeof notif.payload === 'string' ? JSON.parse(notif.payload) : (notif.payload || {});
                  } catch (e) {}
                  
                  const targetOrderId = notif.entityId || notif.referenceId || notif.entity_id || notif.reference_id || notifPayload._id || notifPayload.orderId || notifPayload.order_id || notifPayload.referenceId || notifPayload.reference_id || notifPayload.entityId || notifPayload.entity_id || (notif.actionUrl && notif.actionUrl.includes('orders/') ? notif.actionUrl.split('orders/')[1] : null);

                  if (targetOrderId || (notif.actionUrl && notif.actionUrl.includes('orders'))) {
                     window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'orders', orderId: targetOrderId } }));
                     if (targetOrderId) {
                       setTimeout(() => {
                         window.dispatchEvent(new CustomEvent('select_order', { detail: targetOrderId }));
                       }, 300);
                     }
                  }
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-red-500/20 text-center cursor-pointer hover:-translate-y-0.5"
              >
                View Order
              </button>
            </div>
          </div>
        ),
        { duration: 8000, position: 'top-center' }
      );
    });

    setLastSyncTime(new Date().toLocaleTimeString());
  }, []);

  // Flush Offline Queue
  const flushOfflineQueue = useCallback(async () => {
    const rawQueue = localStorage.getItem('pending_read_notifications');
    if (!rawQueue) return;
    try {
      const ids: string[] = JSON.parse(rawQueue);
      if (Array.isArray(ids) && ids.length > 0) {
        const ok = await notificationService.markAsRead(ids);
        if (ok) {
          localStorage.removeItem('pending_read_notifications');
          console.log('[FCM Sync] Flushed offline read queue:', ids);
        }
      }
    } catch {
      localStorage.removeItem('pending_read_notifications');
    }
  }, []);

  // Mark as read optimistically + API sync
  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => ((n.id || n._id) === id ? { ...n, isRead: true, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    const ok = await notificationService.markAsRead(id);
    if (!ok) {
      // Queue offline
      const rawQueue = localStorage.getItem('pending_read_notifications');
      const queue: string[] = rawQueue ? JSON.parse(rawQueue) : [];
      if (!queue.includes(id)) {
        queue.push(id);
        localStorage.setItem('pending_read_notifications', JSON.stringify(queue));
      }
    }
  }, []);

  // Mark all read optimistically + API sync
  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    setUnreadCount(0);
    await notificationService.markAllAsRead();
  }, []);

  // Trigger Native Desktop Notification for High-Priority Events
  const triggerNativeNotification = useCallback((title: string, body: string, deepLink?: string, isHighPriority = false) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const nativeNotif = new Notification(title, {
          body,
          icon: '/logo.png',
          tag: isHighPriority ? `high-priority-${Date.now()}` : 'stylein-notification',
        });

        nativeNotif.onclick = () => {
          window.focus();
          if (deepLink) {
            window.dispatchEvent(new CustomEvent('navigate_url', { detail: { url: deepLink } }));
          }
        };
      } catch (err) {
        console.warn('[FCM Native] Could not trigger desktop notification:', err);
      }
    }
  }, []);

  // Initialize FCM Token & Register with Backend
  const initializeFCM = useCallback(async (reason = 'Dashboard Mounted') => {
    if (isInitializingRef.current) {
      console.log(`[FCM] Initialization already in progress. Skipping duplicate call. (Reason: ${reason})`);
      return;
    }

    if (!isFirebaseConfigured) {
      console.error('[FCM] Firebase Configuration missing or invalid in environment.');
      setStatus('error');
      setError('Firebase credentials missing (VITE_FIREBASE_...).');
      return;
    }

    if (!('Notification' in window)) {
      setStatus('disabled');
      setError('Browser does not support notifications.');
      return;
    }

    const currentPerm = Notification.permission;
    setPermission(currentPerm);

    if (currentPerm === 'denied') {
      console.log('[FCM] Notification Permission is Denied.');
      setStatus('disabled');
      setError('Notifications blocked in browser settings.');
      return;
    }

    if (currentPerm === 'default') {
      setStatus('permission_required');
      return;
    }

    // Permission is 'granted'
    isInitializingRef.current = true;
    setStatus('loading');

    try {
      const swRegistration = await registerServiceWorkerSingleton();
      const fcmToken = await getFcmToken(swRegistration || undefined);

      if (fcmToken) {
        setToken(fcmToken);
        const result = await notificationService.registerToken(fcmToken, {
          reason,
          source: 'NotificationProvider',
        });

        setBackendResponse(result.data || result.statusText);
        setLastSyncTime(new Date().toLocaleTimeString());

        if (result.success) {
          setStatus('enabled');
          setError(null);
          // Initial sync with backend
          fetchBackendNotifications();
        } else {
          setStatus('error');
          setError(result.statusText || 'Failed to register token with backend.');
        }
      } else {
        setStatus('error');
        setError('Failed to generate FCM token.');
      }
    } catch (err: any) {
      console.error('[FCM] Initialization error:', err);
      setStatus('error');
      setError(err.message || 'Initialization error.');
    } finally {
      isInitializingRef.current = false;
    }
  }, [fetchBackendNotifications]);

  // Force re-register token
  const reRegisterToken = useCallback(async () => {
    if (!token) {
      await initializeFCM('Re-register token requested');
      return;
    }
    setStatus('loading');
    const result = await notificationService.registerToken(token, {
      force: true,
      reason: 'Manual Debug Re-Register',
      source: 'NotificationDebugPanel',
    });
    setBackendResponse(result.data || result.statusText);
    setLastSyncTime(new Date().toLocaleTimeString());

    if (result.success) {
      setStatus('enabled');
      setError(null);
    } else {
      setStatus('error');
      setError(result.statusText || 'Failed to register token');
    }
  }, [token, initializeFCM]);

  // Request Notification Permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Browser does not support desktop notifications.');
      return;
    }

    setStatus('loading');
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        console.log('[FCM] Permission Granted');
        await initializeFCM('Manual Permission Granted');
        toast.success("You're all set! You'll now receive instant order notifications.", {
          duration: 6000,
          style: {
            background: '#064e3b',
            color: '#ecfdf5',
            border: '1px solid #059669',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600',
          },
          icon: '🎉',
        });
      } else if (result === 'denied') {
        console.log('[FCM] Permission Denied');
        setStatus('disabled');
        setError('Notifications blocked by user.');
        toast.error('Notifications are blocked. Please enable them in browser settings.');
      } else {
        setStatus('permission_required');
      }
    } catch (err: any) {
      console.error('[FCM] Error requesting permission:', err);
      setStatus('error');
      setError('Failed to request permission.');
    }
  }, [initializeFCM]);

  // Helper to Navigate to Order Details or Deep Link
  const navigateToOrder = useCallback((orderId?: string, deepLink?: string) => {
    if (deepLink) {
      window.dispatchEvent(new CustomEvent('navigate_url', { detail: { url: deepLink } }));
    } else if (orderId) {
      window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'orders', orderId } }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('select_order', { detail: orderId }));
      }, 300);
    }
  }, []);

  // Real-time Event Listeners for Tab Visibility & Online Network Sync & Polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Sync] Tab regained focus - Synchronizing notifications...');
        fetchBackendNotifications();
      }
    };

    const handleOnline = () => {
      console.log('[Sync] Network reconnected - Flushing offline read queue...');
      flushOfflineQueue();
      fetchBackendNotifications();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        fetchBackendNotifications();
      }
    }, 15000); // 15 seconds fallback polling (FCM push handles instant notifications)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      clearInterval(pollInterval);
    };
  }, [fetchBackendNotifications, flushOfflineQueue]);

  // Set up Foreground Listener & SW Message Listener (ONCE for Provider)
  useEffect(() => {
    if (status !== 'enabled') return;

    const unsubscribeForeground = onForegroundMessage((payload) => {
      const notifId = payload.data?.notificationId || payload.data?._id || payload.data?.id || `fcm-${Date.now()}`;
      
      // Deduplication check
      if (seenNotificationIdsRef.current.has(notifId)) {
        console.log('[FCM Deduplication] Ignored duplicate notification:', notifId);
        return;
      }
      seenNotificationIdsRef.current.add(notifId);
      console.log("payload,",payload)

      // Dispatch to Redux Store for real-time header bell update
      import('../store/store').then(({ store }) => {
        import('../store/notificationSlice').then(({ fetchNotifications }) => {
          store.dispatch(fetchNotifications());
        });
      });

      const title = payload.notification?.title || payload.data?.title || 'New Order Received! 🚗';
      const body = payload.notification?.body || payload.data?.body || 'A new customer order has been created.';


      const orderNumber = payload.data?.orderNumber || payload.data?.order_number || payload.data?.referenceId || payload.data?.orderId || payload.data?.id || 'New Order';
      const customerName = payload.data?.customerName || payload.data?.customer || 'Customer';
      const vehicle = payload.data?.vehicle || payload.data?.car || 'Vehicle';
      const service = payload.data?.service || 'Service';
      const amount = payload.data?.amount ? `₹${payload.data.amount}` : '';
      const orderId = payload.data?._id || payload.data?.orderId || payload.data?.order_id || payload.data?.id || payload.data?.referenceId || payload.data?.reference_id || payload.data?.entityId || payload.data?.entity_id || payload.data?.orderNumber || payload.data?.order_number || '';
      const deepLink = payload.data?.deepLink || payload.data?.url || '';
      const eventType = (payload.data?.type || payload.data?.eventType || '').toUpperCase();

      const isHighPriority =
        eventType === 'ORDER_CREATED' ||
        eventType === 'CUSTOMER_CANCELLED' ||
        eventType === 'PAYMENT_FAILED' ||
        title.toLowerCase().includes('order') ||
        title.toLowerCase().includes('cancel');

      // Trigger Native OS Desktop Notification if tab is hidden or high-priority
      if (document.hidden || isHighPriority) {
        triggerNativeNotification(title, body, deepLink || (orderId ? `/orders` : undefined), isHighPriority);
      }

      // Re-sync with backend
      fetchBackendNotifications();

      // Dispatch to Redux Store for real-time header bell update
      import('../store/store').then(({ store }) => {
        import('../store/notificationSlice').then(({ createNotification }) => {
          store.dispatch(createNotification({
            title,
            message: body,
            type: eventType.toLowerCase() as any || 'system_alert',
            category: (title.toLowerCase().includes('order') || eventType.includes('ORDER')) ? 'Orders' 
              : title.toLowerCase().includes('payment') ? 'Payments' 
              : 'System',
            priority: isHighPriority ? 'High' : 'Normal',
            referenceId: orderNumber || orderId,
            entityId: orderId,
            actionUrl: deepLink || (orderId ? `/orders` : undefined)
          }));
        });
      });

      // Show Custom Hot Toast (Matching Light Theme)
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-in slide-in-from-top-5 fade-in zoom-in-95 duration-300' : 'animate-out slide-out-to-top-5 fade-out zoom-out-95 duration-200'
            } max-w-sm w-full bg-white text-slate-800 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.25)] rounded-2xl pointer-events-auto flex flex-col border border-slate-100 p-5 space-y-4 relative overflow-hidden`}
          >
            {/* Elegant Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-red-500 to-red-600 shadow-sm" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-inner shrink-0">
                    <span className="text-xl">🔔</span>
                  </div>
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-900 leading-tight tracking-wide">{title}</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed font-medium line-clamp-2">{body}</p>
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-all cursor-pointer shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            {orderNumber && orderNumber !== 'New Order' && (
              <div className="bg-slate-50/80 rounded-xl p-3 text-xs space-y-2 border border-slate-100 relative z-10">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-500 font-medium whitespace-nowrap">Order #:</span>
                  <span className="font-bold text-slate-900 wrap-break-words text-right">{orderNumber}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-500 font-medium whitespace-nowrap">Customer:</span>
                  <span className="font-semibold text-slate-700 wrap-break-words text-right">{customerName}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-500 font-medium whitespace-nowrap">Vehicle / Service:</span>
                  <span className="font-semibold text-slate-700 wrap-break-words text-right">{vehicle} • {service}</span>
                </div>
                {amount && (
                  <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Total Amount:</span>
                    <span className="font-bold text-emerald-600 text-sm">{amount}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1 relative z-10 border-t border-slate-50">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigateToOrder(orderId, deepLink);
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-red-500/20 text-center cursor-pointer hover:-translate-y-0.5"
              >
                View Order
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl transition-all cursor-pointer border border-slate-200 hover:border-slate-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        { duration: 8000, position: 'top-center' }
      );
    });

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NAVIGATE_ORDER') {
        navigateToOrder(event.data.orderId, event.data.deepLink);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      unsubscribeForeground();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, [status, navigateToOrder, triggerNativeNotification, fetchBackendNotifications]);

  // Initial trigger strictly once on Provider mount
  useEffect(() => {
    initializeFCM('Provider Mount');
  }, [initializeFCM]);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        token,
        status,
        error,
        lastSyncTime,
        backendResponse,
        registrationCount: notificationService.getRegistrationCount(),
        isRegistering: notificationService.isRegistering(),
        notifications,
        unreadCount,
        pagination,
        requestPermission,
        initializeFCM,
        reRegisterToken,
        fetchBackendNotifications,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function usePushNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('usePushNotifications must be used within a NotificationProvider');
  }
  return context;
}
