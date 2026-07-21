import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_ExrYOQfmaYQqqS9lof8klY9Y8Qbrbc8",
  authDomain: "webpush721.firebaseapp.com",
  projectId: "webpush721",
  storageBucket: "webpush721.firebasestorage.app",
  messagingSenderId: "638081013513",
  appId: "1:638081013513:web:88960958d7e8f12be325d8",
  measurementId: "G-XXXXXXXXXX"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { app, analytics, messaging };
