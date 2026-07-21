# Netlify Web Push Notifications PoC

A minimal, ready-to-deploy Proof of Concept (PoC) for Web Push Notifications using Netlify Serverless Functions and the VAPID protocol.

## Features

- **Frontend Subscription**: Requests permission, registers a service worker (`sw.js`), and subscribes the user with a VAPID public key.
- **Serverless Trigger**: A Netlify function (`netlify/functions/send-notification.js`) that uses the VAPID private/public keys and the `web-push` library to push notifications.
- **Background Event Handling**: A service worker (`sw.js`) that listens for `push` events and displays notifications.
- **Local Notification Sandbox**: A button to test local browser desktop notifications instantly.

## Project Structure

- `index.html` - The frontend application UI and push subscription controller.
- `public/`
  - `sw.js` - The Service Worker that handles incoming push events and shows OS notifications.
  - `icon.jpg` - Image used as the default notification icon.
- `netlify/functions/`
  - `send-notification.js` - Serverless function that triggers the push notification to the browser.
- `netlify.toml` - Netlify build configuration.
- `package.json` - Node dependencies including `web-push` and encryption libraries.
