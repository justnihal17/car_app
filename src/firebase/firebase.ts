import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

let app: FirebaseApp | null = null;

if (typeof window !== 'undefined') {
  try {
    if (isFirebaseConfigured) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      console.log('[FCM] Firebase Initialized successfully');
    } else {
      console.warn('[FCM] Firebase environment variables missing or invalid. Check .env file.');
    }
  } catch (error) {
    console.error('[FCM] Firebase initialization error:', error);
  }
}

export { app, firebaseConfig };
