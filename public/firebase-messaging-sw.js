/* global importScripts, firebase, self */
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Parse config from URL query parameters if provided during registration
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: urlParams.get('apiKey') || '',
  authDomain: urlParams.get('authDomain') || '',
  projectId: urlParams.get('projectId') || '',
  storageBucket: urlParams.get('storageBucket') || '',
  messagingSenderId: urlParams.get('messagingSenderId') || '',
  appId: urlParams.get('appId') || '',
};

// Initialize Firebase App in Service Worker if config exists
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[FCM SW] Background Notification Received:', payload);

    const title = payload.notification?.title || payload.data?.title || 'New Order Alert';
    const body = payload.notification?.body || payload.data?.body || 'A new customer order has been created.';
    const icon = payload.notification?.icon || payload.data?.icon || '/logo.png';
    const badge = payload.notification?.badge || payload.data?.badge || '/logo.png';
    const image = payload.notification?.image || payload.data?.image || undefined;
    const orderId = payload.data?.orderId || payload.data?.id || payload.data?.order_id || '';

    const options = {
      body: body,
      icon: icon,
      badge: badge,
      image: image,
      timestamp: Date.now(),
      data: {
        orderId: orderId,
        url: orderId ? `/orders/${orderId}` : '/orders',
      },
      tag: orderId ? `order-${orderId}` : 'order-notification',
      renotify: true,
      requireInteraction: true,
    };

    return self.registration.showNotification(title, options);
  });
} else {
  console.warn('[FCM SW] Service Worker initialized without Firebase configuration credentials.');
}

self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification Clicked:', event.notification);
  event.notification.close();

  const orderId = event.notification.data?.orderId;
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a dashboard window tab is already open, focus it and post navigation event
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NAVIGATE_ORDER',
            orderId: orderId,
            url: targetUrl,
          });
          return;
        }
      }
      // If no window is open, open a new browser window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
