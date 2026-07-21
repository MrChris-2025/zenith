importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "webpush721.firebaseapp.com",
  projectId: "webpush721",
  messagingSenderId: "638081013513",
  appId: "YOUR_APP_ID"
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
