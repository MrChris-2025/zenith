importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB_ExrYOQfmaYQqqS9lof8klY9Y8Qbrbc8",
  authDomain: "webpush721.firebaseapp.com",
  projectId: "webpush721",
  storageBucket: "webpush721.firebasestorage.app",
  messagingSenderId: "638081013513",
  appId: "1:638081013513:web:88960958d7e8f12be325d8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received: ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://hcforever.nekoweb.org/mo2.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
