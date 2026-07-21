import { analytics } from "./firebase.js";
import { logEvent } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

const button = document.getElementById("actionBtn");
const statusText = document.getElementById("status");

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
