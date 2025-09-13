/* eslint-disable no-undef */

(function init() {
  try {
    importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');
  } catch (e) {
    console.error('Firebase scripts failed to load in SW:', e);
    return;
  }

  try {
    const url = new URL(self.location);
    const sp = url.searchParams;
    const cfg = {};
    ['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId','measurementId'].forEach((k)=>{
      const v = sp.get(k);
      if (v) cfg[k] = v;
    });
    if (!cfg['messagingSenderId']) {
      console.warn('SW missing messagingSenderId; FCM disabled');
      return;
    }
    firebase.initializeApp(cfg);
  } catch (e) {
    console.error('Firebase init failed in SW:', e);
    return;
  }

  try {
    const messaging = firebase.messaging();
    const relayToClients = (payload) => {
      const data = (payload && payload.data) || {};
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((c) => {
          try { c.postMessage({ __fcm: true, payload: data }); } catch {}
        });
      });
    };
    messaging.onBackgroundMessage((payload) => {
      const data = (payload && payload.data) || {};
      const title = data.displayTitle || 'Cryptic Hunt';
      const body = data.displayBody || 'You have a new update';
      const options = {
        body,
        icon: '/icon.png',
        badge: '/favicon.png',
        data,
      };
      relayToClients(payload);
      self.registration.showNotification(title, options);
    });
  } catch (e) {
    console.error('Firebase messaging setup failed in SW:', e);
  }
})();

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const data = event.notification && event.notification.data || {};
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      try { allClients.forEach((c)=>c.postMessage({ __fcm: true, payload: data })); } catch {}
      const target = allClients.find((c) => c.url && 'focus' in c);
      if (target) return target.focus();
      return clients.openWindow('/');
    })()
  );
});
