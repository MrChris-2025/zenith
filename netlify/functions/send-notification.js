const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handler = async (event) => {
  const subscription = JSON.parse(event.body);

  const payload = JSON.stringify({
    title: 'Hello',
    body: 'This is a real push notification',
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return { statusCode: 200, body: 'Sent' };
  } catch (e) {
    return { statusCode: 500, body: e.toString() };
  }
};
