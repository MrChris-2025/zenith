// Import Firebase App and Messaging Compat SDKs from Google's CDN
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize Firebase inside the service worker with your project credentials
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

// Retrieve the Firebase Cloud Messaging instance
const messaging = firebase.messaging();

// Listen for background notifications when the PWA is closed
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification?.title || 'Live Sports Update!';
  const notificationOptions = {
    body: payload.notification?.body || 'Check out the latest score!',
    icon: '/favicon.png' // Path to your PWA icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
