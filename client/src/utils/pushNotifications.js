/**
 * MedRescue Hospital - Push Notification Utility
 * Handles push notification subscription and permissions
 */

// Convert VAPID key from base64 to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
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
};

/**
 * Check if push notifications are supported
 */
export const isPushNotificationSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Register Service Worker
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('[Push Notifications] Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('[Push Notifications] Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Subscribe to push notifications
 * Note: You'll need to generate VAPID keys for production
 * Run: npx web-push generate-vapid-keys
 */
export const subscribeToPushNotifications = async (registration) => {
  try {
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('[Push Notifications] Already subscribed');
      return subscription;
    }

    // VAPID public key from environment variable
    const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      console.warn('[Push Notifications] VAPID public key not configured. Please set REACT_APP_VAPID_PUBLIC_KEY in .env file');
      // Try to subscribe without VAPID (may not work in production)
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true
      });
    } else {
      // Subscribe with VAPID key
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
    }

    console.log('[Push Notifications] Subscribed:', subscription);
    return subscription;
  } catch (error) {
    console.error('[Push Notifications] Subscription failed:', error);
    return null;
  }
};

/**
 * Send subscription to backend
 */
export const sendSubscriptionToBackend = async (subscription) => {
  try {
    const response = await fetch('/api/v1/user/subscribe-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to backend');
    }

    const data = await response.json();
    console.log('[Push Notifications] Subscription sent to backend:', data);
    return data;
  } catch (error) {
    console.error('[Push Notifications] Failed to send subscription:', error);
    return null;
  }
};

/**
 * Initialize push notifications (call this when user logs in or on app start)
 */
export const initializePushNotifications = async () => {
  if (!isPushNotificationSupported()) {
    console.log('[Push Notifications] Not supported on this browser');
    return false;
  }

  try {
    // Request permission
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      console.log('[Push Notifications] Permission denied');
      return false;
    }

    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      console.log('[Push Notifications] Service Worker registration failed');
      return false;
    }

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await subscribeToPushNotifications(registration);
    if (!subscription) {
      console.log('[Push Notifications] Subscription failed');
      return false;
    }

    // Send subscription to backend
    await sendSubscriptionToBackend(subscription);

    console.log('[Push Notifications] Successfully initialized');
    return true;
  } catch (error) {
    console.error('[Push Notifications] Initialization failed:', error);
    return false;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return false;
    }

    await subscription.unsubscribe();
    console.log('[Push Notifications] Unsubscribed');
    return true;
  } catch (error) {
    console.error('[Push Notifications] Unsubscribe failed:', error);
    return false;
  }
};

/**
 * Show a local notification (works offline)
 */
export const showLocalNotification = async (title, options = {}) => {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body: options.body || '',
      icon: options.icon || '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      data: options.data || {},
      ...options
    });
    return true;
  } catch (error) {
    console.error('[Push Notifications] Failed to show notification:', error);
    return false;
  }
};
