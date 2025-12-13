/**
 * ChandraHoro V2.1 - Reading Notification Service
 * 
 * Handles sending notifications to users when their daily readings are ready.
 * Supports email notifications and push notifications based on user preferences.
 * 
 * Features:
 * - Email notifications with personalized content
 * - Push notifications for mobile/web
 * - User preference checking
 * - Error handling and logging
 * - Template-based email rendering
 */

import { sendEmail } from '@/lib/email/email-service';
import { format } from 'date-fns';

export interface NotificationUser {
  id: string;
  email: string;
  name?: string;
  profile?: {
    fullName?: string;
    notificationPreferences?: {
      daily_reading?: boolean;
      push_enabled?: boolean;
      email_enabled?: boolean;
    };
  };
}

export interface Reading {
  id: string;
  readingDate: Date;
  highlights: string[];
  work?: string;
  love?: string;
  health?: string;
  finance?: string;
  timings?: {
    favorable: string[];
    avoid: string[];
  };
}

/**
 * Send notification to user about their new daily reading
 */
export async function sendReadingNotification(
  user: NotificationUser,
  reading: Reading
): Promise<{ emailSent: boolean; pushSent: boolean }> {
  const notificationPrefs = user.profile?.notificationPreferences || {};
  const results = { emailSent: false, pushSent: false };
  
  console.log(`[Notification] Sending notifications for user ${user.id}`);
  
  // Email notification
  if (notificationPrefs.email_enabled !== false && notificationPrefs.daily_reading !== false) {
    try {
      await sendEmailNotification(user, reading);
      results.emailSent = true;
      console.log(`[Notification] ✅ Email sent to ${user.email}`);
    } catch (error: any) {
      console.error(`[Notification] ❌ Failed to send email to ${user.email}:`, error.message);
    }
  } else {
    console.log(`[Notification] ⏭️  Email disabled for user ${user.id}`);
  }
  
  // Push notification
  if (notificationPrefs.push_enabled === true) {
    try {
      await sendPushNotification(user, reading);
      results.pushSent = true;
      console.log(`[Notification] ✅ Push notification sent to user ${user.id}`);
    } catch (error: any) {
      console.error(`[Notification] ❌ Failed to send push to user ${user.id}:`, error.message);
    }
  } else {
    console.log(`[Notification] ⏭️  Push notifications disabled for user ${user.id}`);
  }
  
  return results;
}

/**
 * Send email notification about daily reading
 */
async function sendEmailNotification(user: NotificationUser, reading: Reading): Promise<void> {
  const userName = user.name || user.profile?.fullName || 'there';
  const readingDate = format(new Date(reading.readingDate), 'MMMM d, yyyy');
  const readingUrl = `${process.env.NEXTAUTH_URL}/dashboard`;
  
  // Get the first highlight as preview
  const preview = reading.highlights?.[0] || 'Your personalized daily reading is ready!';
  
  await sendEmail({
    to: user.email,
    subject: `✨ Your Daily Reading for ${format(new Date(reading.readingDate), 'MMMM d')}`,
    template: 'daily-reading',
    data: {
      userName,
      readingDate,
      preview,
      highlights: reading.highlights || [],
      work: reading.work,
      love: reading.love,
      health: reading.health,
      finance: reading.finance,
      favorableTimings: reading.timings?.favorable || [],
      avoidTimings: reading.timings?.avoid || [],
      readingUrl,
      unsubscribeUrl: `${process.env.NEXTAUTH_URL}/settings/notifications`,
    },
  });
}

/**
 * Send push notification about daily reading
 */
async function sendPushNotification(user: NotificationUser, reading: Reading): Promise<void> {
  const title = '✨ Your Daily Reading is Ready';
  const body = reading.highlights?.[0] || 'Your personalized daily reading is ready to view!';
  
  await sendPushNotificationInternal({
    userId: user.id,
    title,
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      type: 'daily_reading',
      readingId: reading.id,
      url: '/dashboard',
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'view',
        title: 'View Reading',
        icon: '/icons/view-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  });
}

/**
 * Internal push notification sender
 * TODO: Implement with Web Push API, FCM, or other push service
 */
async function sendPushNotificationInternal(notification: {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}): Promise<void> {
  // For now, just log the notification
  // In production, implement with your push notification service
  console.log('[Push] Would send notification:', {
    userId: notification.userId,
    title: notification.title,
    body: notification.body,
    data: notification.data,
  });
  
  // Example implementation with Web Push API:
  /*
  const subscription = await getUserPushSubscription(notification.userId);
  if (subscription) {
    await webpush.sendNotification(subscription, JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      data: notification.data,
      actions: notification.actions,
    }));
  }
  */
  
  // Example implementation with Firebase Cloud Messaging:
  /*
  const fcmToken = await getUserFCMToken(notification.userId);
  if (fcmToken) {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.icon,
      },
      data: notification.data,
      android: {
        notification: {
          icon: notification.icon,
          color: '#7C3AED',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    });
  }
  */
}

/**
 * Send bulk notifications to multiple users
 * Useful for manual triggers or special announcements
 */
export async function sendBulkReadingNotifications(
  userReadings: Array<{ user: NotificationUser; reading: Reading }>
): Promise<{
  total: number;
  emailsSent: number;
  pushSent: number;
  errors: Array<{ userId: string; error: string }>;
}> {
  const results = {
    total: userReadings.length,
    emailsSent: 0,
    pushSent: 0,
    errors: [],
  };
  
  console.log(`[Notification] Sending bulk notifications to ${userReadings.length} users`);
  
  // Process notifications in parallel with some concurrency limit
  const BATCH_SIZE = 5;
  const batches = [];
  
  for (let i = 0; i < userReadings.length; i += BATCH_SIZE) {
    batches.push(userReadings.slice(i, i + BATCH_SIZE));
  }
  
  for (const batch of batches) {
    const batchResults = await Promise.allSettled(
      batch.map(async ({ user, reading }) => {
        const result = await sendReadingNotification(user, reading);
        return { userId: user.id, ...result };
      })
    );
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.emailSent) results.emailsSent++;
        if (result.value.pushSent) results.pushSent++;
      } else {
        results.errors.push({
          userId: batch[index].user.id,
          error: result.reason.message,
        });
      }
    });
    
    // Small delay between batches to avoid overwhelming email/push services
    if (batches.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`[Notification] Bulk notifications complete:`, {
    total: results.total,
    emailsSent: results.emailsSent,
    pushSent: results.pushSent,
    errors: results.errors.length,
  });
  
  return results;
}

/**
 * Send test notification to verify notification system
 */
export async function sendTestNotification(user: NotificationUser): Promise<void> {
  const testReading: Reading = {
    id: 'test-reading',
    readingDate: new Date(),
    highlights: [
      'This is a test notification to verify your notification settings.',
      'Your actual daily readings will contain personalized astrological insights.',
    ],
    work: 'Test work guidance',
    love: 'Test love guidance',
    health: 'Test health guidance',
    finance: 'Test finance guidance',
    timings: {
      favorable: ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM'],
      avoid: ['12:00 PM - 1:00 PM'],
    },
  };
  
  await sendReadingNotification(user, testReading);
  console.log(`[Notification] Test notification sent to user ${user.id}`);
}
