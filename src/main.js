import { analytics, messaging } from "./firebase.js";
import { logEvent } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

const button = document.getElementById("actionBtn");
const notiBtn = document.getElementById("notiBtn");
const statusText = document.getElementById("status");
const tokenDisplay = document.getElementById("tokenDisplay");

if (button && statusText) {
  statusText.textContent = "App connected securely to Firebase!";

  button.addEventListener("click", () => {
    try {
      logEvent(analytics, "custom_button_click", {
        button_name: "actionBtn",
        timestamp: Date.now()
      });
      statusText.textContent = "Success! Event logged to Analytics.";
      statusText.style.color = "#2e7d32";
    } catch (error) {
      console.error("Telemetry failed:", error);
      statusText.textContent = "Error transmitting event.";
      statusText.style.color = "#c62828";
    }
  });
}

if (notiBtn && tokenDisplay) {
  notiBtn.addEventListener("click", async () => {
    statusText.textContent = "Requesting permission...";
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      statusText.textContent = "Permission granted! Fetching push token...";
      try {
        // Retrieve the FCM registration token 
        const token = await getToken(messaging, {
          vapidKey: "BEgs6yLKrhZ9Ayb_R4jRVkEmwplVWgM4vGwXojCDCoyw1fvb-qaADXv_j-Xi5KRX4_VQqRxlxLuXoD5g09vQWlg" // Generate this in Settings > Cloud Messaging > Web Push certificates
        });
        
        if (token) {
          tokenDisplay.textContent = token;
          statusText.textContent = "Push Notifications Active!";
          statusText.style.color = "#2e7d32";
          console.log("FCM Token:", token);
        } else {
          statusText.textContent = "Failed to retrieve registration token.";
          statusText.style.color = "#c62828";
        }
      } catch (err) {
        console.error("Error retrieving token:", err);
        statusText.textContent = "Error getting push token.";
        statusText.style.color = "#c62828";
      }
    } else {
      statusText.textContent = "Notification permission denied.";
      statusText.style.color = "#c62828";
    }
  });

  // Handle incoming messages while your website tab is open (foreground)
  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    alert(`Incoming Notification:\n${payload.notification.title}\n${payload.notification.body}`);
  });
}
