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
    const userId = req.body.userId;
    const subscription = req.body;

    // Save subscription to user
    await userModel.findByIdAndUpdate(userId, {
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
      icon: '/logo192svg',
      badge: '/logo192svg',
      data: {
        url: payload.url || '/notification',
        ...payload
      }
    });

    await webPush.sendNotification(
      user.pushSubscription,
      notificationPayload
    );

    console.log('Push notification sent successfully to user:', userId);
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

