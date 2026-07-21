import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "webpush721.firebaseapp.com",
  projectId: "webpush721",
  storageBucket: "webpush721.firebasestorage.app",
  messagingSenderId: "638081013513",
  appId: "YOUR_APP_ID",
  measurementId: "G-XXXXXXXXXX" // Put your real measurement ID here
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
