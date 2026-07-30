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

interface NotificationContextType {
  permission: NotificationPermission;
  token: string | null;
  status: PushNotificationStatus;
  error: string | null;
  lastSyncTime: string | null;
  backendResponse: any;
  registrationCount: number;
  isRegistering: boolean;
  requestPermission: () => Promise<void>;
  initializeFCM: (reason?: string) => Promise<void>;
  reRegisterToken: () => Promise<void>;
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

  const isInitializingRef = useRef(false);

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
  }, []);

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

  // Helper to Navigate to Order Details
  const navigateToOrder = useCallback((orderId?: string) => {
    console.log('[FCM] Notification Clicked - Navigating to order:', orderId);
    window.dispatchEvent(
      new CustomEvent('navigate_view', {
        detail: { view: 'orders', orderId },
      })
    );
    if (orderId) {
      window.dispatchEvent(
        new CustomEvent('select_order', {
          detail: orderId,
        })
      );
    }
  }, []);

  // Set up Foreground Listener & SW Message Listener (ONCE for the Provider)
  useEffect(() => {
    if (status !== 'enabled') return;

    const unsubscribeForeground = onForegroundMessage((payload) => {
      const title = payload.notification?.title || payload.data?.title || 'New Order Received! 🚗';
      const body = payload.notification?.body || payload.data?.body || 'A new customer order has been created.';

      const orderNumber = payload.data?.orderNumber || payload.data?.order_number || payload.data?.orderId || payload.data?.id || 'New Order';
      const customerName = payload.data?.customerName || payload.data?.customer || 'Customer';
      const vehicle = payload.data?.vehicle || payload.data?.car || 'Vehicle';
      const service = payload.data?.service || 'Service';
      const amount = payload.data?.amount ? `₹${payload.data.amount}` : '';
      const orderId = payload.data?.orderId || payload.data?.id || '';

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-slate-900 text-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col border border-red-500/40 p-4 space-y-3`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold text-lg border border-red-500/30">
                  🔔
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">{title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{body}</p>
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-slate-400 hover:text-white text-xs p-1 font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 text-xs space-y-1.5 border border-slate-700/80">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Order #:</span>
                <span className="font-bold text-red-400">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Customer:</span>
                <span className="font-semibold text-slate-200">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Vehicle / Service:</span>
                <span className="font-semibold text-slate-200">{vehicle} • {service}</span>
              </div>
              {amount && (
                <div className="flex justify-between pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400 font-medium">Total Amount:</span>
                  <span className="font-bold text-emerald-400">{amount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigateToOrder(orderId);
                }}
                className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md text-center cursor-pointer"
              >
                View Order
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        { duration: 10000 }
      );
    });

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NAVIGATE_ORDER') {
        navigateToOrder(event.data.orderId);
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
  }, [status, navigateToOrder]);

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
        requestPermission,
        initializeFCM,
        reRegisterToken,
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
