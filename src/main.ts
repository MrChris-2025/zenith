import { analytics } from "./firebase";
import { logEvent } from "firebase/analytics";

const button = document.getElementById("actionBtn") as HTMLButtonElement;
const statusText = document.getElementById("status") as HTMLParagraphElement;

if (button && statusText) {
  statusText.textContent = "App connected securely to Firebase!";

  button.addEventListener("click", () => {
    try {
      // Log a custom interaction event to your Google Analytics dashboard
      logEvent(analytics, "custom_button_click", {
        button_name: "actionBtn",
        timestamp: Date.now()
      });

      statusText.textContent = "Success! Event logged to Analytics.";
      statusText.style.color = "#2e7d32"; // Green success indicator
    } catch (error) {
      console.error("Telemetry failed:", error);
      statusText.textContent = "Error transmitting event.";
      statusText.style.color = "#c62828"; // Red error indicator
    }
  });
}
