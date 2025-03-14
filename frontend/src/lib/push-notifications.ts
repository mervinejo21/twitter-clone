import api from './api/axios';

let swRegistration: ServiceWorkerRegistration | null = null;

// Check if service workers and push messaging are supported
export const isPushNotificationSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Register service worker
export const registerServiceWorker = async () => {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js');
    return true;
  } catch (error) {
    console.error('Service Worker Error', error);
    return false;
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!isPushNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Permission request error:', error);
    return 'denied';
  }
};

// Get VAPID public key from server
const getPublicKey = async () => {
  const response = await api.get('/push-notifications/public-key');
  return response.data.publicKey;
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async () => {
  if (!swRegistration) {
    const registered = await registerServiceWorker();
    if (!registered) return false;
  }

  try {
    const publicKey = await getPublicKey();
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // Send subscription to server
    await api.post('/push-notifications/subscribe', subscription);
    return true;
  } catch (error) {
    console.error('Subscription error:', error);
    return false;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async () => {
  if (!swRegistration) return false;

  try {
    const subscription = await swRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await api.delete('/push-notifications/unsubscribe', {
        data: { endpoint: subscription.endpoint },
      });
    }
    return true;
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return false;
  }
};

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 