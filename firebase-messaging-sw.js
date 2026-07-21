// firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAdjISWU8mey_5y94PBewHmBbbYia8bgsU",
  authDomain: "test-8acf8.firebaseapp.com",
  projectId: "test-8acf8",
  storageBucket: "test-8acf8.firebasestorage.app",
  messagingSenderId: "366969925622",
  appId: "1:366969925622:web:ed1eb4ddf10d2763db61d7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("[SW] Message reçu :", payload);

  const notification = payload.notification || {};

  self.registration.showNotification(
    notification.title || "Notification",
    {
      body: notification.body || ""
    }
  );
});
