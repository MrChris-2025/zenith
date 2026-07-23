import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics, isSupported as isAnalyticsSupported } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getMessaging, isSupported as isMessagingSupported } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_ExrYOQfmaYQqqS9lof8klY9Y8Qbrbc8",
  authDomain: "webpush721.firebaseapp.com",
  projectId: "webpush721",
  storageBucket: "webpush721.firebasestorage.app",
  messagingSenderId: "638081013513",
  appId: "1:638081013513:web:88960958d7e8f12be325d8",
  measurementId: "G-ZE56P5MBX6"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Safe Initialization with Support Checks
let analytics = null;
let messaging = null;

// Initialize Analytics safely
isAnalyticsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Messaging safely (Requires HTTPS or localhost)
isMessagingSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  } else {
    console.warn("Firebase Messaging is not supported in this browser context.");
  }
});

export { app, analytics, messaging };
