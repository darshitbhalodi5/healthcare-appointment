# 🔔 MedRescue Hospital - Mobile Push Notifications Setup Guide

This guide will help you enable real mobile push notifications for your PWA.

## ✅ What's Already Done

I've set up the frontend infrastructure:

1. ✅ **Service Worker** (`client/public/service-worker.js`)
   - Handles push notifications
   - Caches app for offline use
   - Manages notification clicks

2. ✅ **Push Notification Utility** (`client/src/utils/pushNotifications.js`)
   - Requests user permission
   - Subscribes to push notifications
   - Sends subscription to backend

3. ✅ **App Integration** (`client/src/App.js`)
   - Auto-registers service worker
   - Initializes push notifications when user logs in

## 🔧 What You Need to Do

### Step 1: Install Web Push Library (Backend)

```bash
cd /home/darshit/Documents/health1
npm install web-push
```

### Step 2: Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

**Save the output!** You'll get something like:
```
Public Key: BKxSxxx...
Private Key: yyy...
```

Add these to your `.env` file:
```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=mailto:admin@medrescue.com
```

### Step 3: Update User Model

Add push subscription field to `/models/userModels.js`:

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields ...

  pushSubscription: {
    type: Object,
    default: null
  }
}, { timestamps: true });
```

### Step 4: Create Push Notification Controller

Create `/controllers/pushNotificationCtrl.js`:

```javascript
const webPush = require('web-push');
const userModel = require('../models/userModels');

// Configure web-push with VAPID keys
webPush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@medrescue.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Subscribe user to push notifications
const subscribePush = async (req, res) => {
  try {
    const { _id } = req.body.userId;
    const subscription = req.body;

    // Save subscription to user
    await userModel.findByIdAndUpdate(_id, {
      pushSubscription: subscription
    });

    res.status(200).json({
      success: true,
      message: 'Subscribed to push notifications'
    });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to push notifications'
    });
  }
};

// Send push notification to a user
const sendPushToUser = async (userId, payload) => {
  try {
    const user = await userModel.findById(userId);

    if (!user || !user.pushSubscription) {
      console.log('User has no push subscription');
      return false;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title || 'MedRescue Hospital',
      body: payload.body || payload.message,
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: {
        url: payload.url || '/notification',
        ...payload
      }
    });

    await webPush.sendNotification(
      user.pushSubscription,
      notificationPayload
    );

    console.log('Push notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);

    // If subscription is invalid, remove it
    if (error.statusCode === 410) {
      await userModel.findByIdAndUpdate(userId, {
        pushSubscription: null
      });
    }

    return false;
  }
};

// Send push to multiple users
const sendPushToMultipleUsers = async (userIds, payload) => {
  const promises = userIds.map(userId => sendPushToUser(userId, payload));
  return await Promise.all(promises);
};

module.exports = {
  subscribePush,
  sendPushToUser,
  sendPushToMultipleUsers
};
```

### Step 5: Add Routes

Update `/routes/userRoutes.js`:

```javascript
const { subscribePush } = require('../controllers/pushNotificationCtrl');

// Add this route
router.post('/subscribe-push', authMiddleware, subscribePush);
```

### Step 6: Send Push Notifications on Events

Update your existing controllers to send push notifications. For example, in `/controllers/doctorCtrl.js`:

```javascript
const { sendPushToUser } = require('./pushNotificationCtrl');

// When doctor approves/rejects appointment
const updateStatus = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;

    // ... existing code ...

    // Send push notification to patient
    const appointment = await appointmentModel.findById(appointmentsId);
    await sendPushToUser(appointment.userId, {
      title: 'Appointment Status Update',
      body: `Your appointment has been ${status}`,
      url: '/appointments'
    });

    // ... rest of code ...
  } catch (error) {
    // ... error handling ...
  }
};
```

Similarly, update other controllers:
- When admin approves doctor
- When appointment is booked
- When doctor adds notes/prescription
- When documents are commented

### Step 7: Update Frontend VAPID Key

In `client/src/utils/pushNotifications.js`, update line 66:

```javascript
const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY_HERE';
```

Add to `client/.env`:
```env
REACT_APP_VAPID_PUBLIC_KEY=your_public_key_from_step_2
```

## 📱 Testing Push Notifications

### On Desktop:
1. Start your app: `npm run dev`
2. Open http://localhost:3052 in Chrome
3. Login as a user
4. Allow notification permission when prompted
5. Open DevTools > Application > Service Workers
6. Check "Update on reload"
7. Trigger an event (like booking appointment)
8. You should see a push notification!

### On Mobile:
1. Deploy your app to HTTPS (required for PWA)
2. Open on mobile browser
3. Add to Home Screen
4. Login and allow notifications
5. Trigger an event
6. You'll get a native mobile notification!

## 🎯 Example: Sending Test Notification

Create a test route in `userRoutes.js`:

```javascript
router.post('/test-push', authMiddleware, async (req, res) => {
  try {
    const { sendPushToUser } = require('../controllers/pushNotificationCtrl');

    await sendPushToUser(req.body.userId, {
      title: '🏥 Test Notification',
      body: 'Push notifications are working!',
      url: '/notification'
    });

    res.status(200).json({
      success: true,
      message: 'Test notification sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

## 🔐 Important Notes

1. **HTTPS Required**: Push notifications only work on HTTPS (except localhost)
2. **User Permission**: Users must grant notification permission
3. **Browser Support**: Works on Chrome, Firefox, Edge, Safari (iOS 16.4+)
4. **Battery Impact**: Minimal - notifications are event-driven
5. **Privacy**: Users can revoke permission anytime

## 🎨 Customizing Notifications

In your backend, when sending notifications, you can customize:

```javascript
await sendPushToUser(userId, {
  title: '📋 New Appointment',
  body: 'Dr. Smith has approved your appointment',
  icon: '/logo192.png',
  badge: '/logo192.png',
  url: '/appointments',
  data: {
    appointmentId: '123',
    type: 'appointment-approved'
  },
  actions: [
    { action: 'view', title: 'View Details' },
    { action: 'dismiss', title: 'Dismiss' }
  ],
  requireInteraction: false, // true = stays until user interacts
  vibrate: [200, 100, 200] // vibration pattern
});
```

## 🚀 Going to Production

1. **Deploy to HTTPS domain** (Vercel, Netlify, etc.)
2. **Update Service Worker scope** if needed
3. **Test on real mobile devices**
4. **Monitor notification delivery** in your logs
5. **Handle unsubscribe requests** properly

## 📊 Analytics (Optional)

Track notification effectiveness:
- Click-through rate
- Delivery success rate
- User engagement

## 🆘 Troubleshooting

**Notifications not showing?**
- Check browser permission
- Verify HTTPS connection
- Check service worker registration
- Look at browser console for errors

**Mobile not working?**
- Ensure app is added to home screen
- Check if permission was granted
- Verify HTTPS connection
- Test on different devices

## ✨ Summary

Once complete, your users will:
1. ✅ Get real-time mobile notifications
2. ✅ Receive updates even when app is closed
3. ✅ Click notifications to open relevant pages
4. ✅ Manage notification preferences
5. ✅ Have native mobile app experience

---

**Need Help?** Check the browser console for detailed logs or test the service worker in DevTools.
