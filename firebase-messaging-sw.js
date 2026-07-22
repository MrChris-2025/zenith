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

// Display notification when the website is closed or in the background
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received: ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // You can replace this with your icon path later
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
