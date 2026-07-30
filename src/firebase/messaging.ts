import { getMessaging, getToken, onMessage, isSupported, Messaging, MessagePayload } from 'firebase/messaging';
import { app, isFirebaseConfigured } from './firebase';

let messagingInstance: Messaging | null = null;

export const getFcmMessaging = async (): Promise<Messaging | null> => {
  if (messagingInstance) return messagingInstance;
  if (!app || !isFirebaseConfigured) return null;

  try {
    const supported = await isSupported();
    if (supported) {
      messagingInstance = getMessaging(app);
      return messagingInstance;
    } else {
      console.warn('[FCM] Messaging is not supported in this browser environment.');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Error obtaining messaging instance:', error);
    return null;
  }
};

export const getFcmToken = async (swRegistration?: ServiceWorkerRegistration): Promise<string | null> => {
  try {
    const messaging = await getFcmMessaging();
    if (!messaging) return null;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('[FCM] VITE_FIREBASE_VAPID_KEY is missing in environment variables.');
    }

    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log('[FCM] Token Generated. Length:', token.length, 'Timestamp:', new Date().toISOString());
      return token;
    } else {
      console.warn('[FCM] No registration token available.');
      return null;
    }
  } catch (error: any) {
    console.error('[FCM] Token generation error:', error);
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: MessagePayload) => void): (() => void) => {
  let unsubscribe: (() => void) | null = null;

  getFcmMessaging().then((messaging) => {
    if (messaging) {
      console.log('[FCM] Foreground Listener Ready');
      unsubscribe = onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground Notification Received:', payload);
        callback(payload);
      });
    }
  }).catch((err) => {
    console.error('[FCM] Error attaching foreground listener:', err);
  });

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
};
