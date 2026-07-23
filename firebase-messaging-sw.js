importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB_ExrYOQfmaYQqqS9lof8klY9Y8Qbrbc8",
  authDomain: "webpush721.firebaseapp.com",
  projectId: "webpush721",
  messagingSenderId: "638081013513",
  appId: "1:638081013513:web:88960958d7e8f12be325d8"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message received: ", payload);

  // Extract title/body safely from either notification or data payload
  const notificationTitle = payload.notification?.title || payload.data?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: '/firebase-logo.png'
  };

  // ONLY call showNotification manually if the server sends data-only payloads.
  // If your server sends a 'notification' key in the FCM payload, 
  // FCM displays it automatically and you can omit the line below.
  return self.registration.showNotification(notificationTitle, notificationOptions);
});
