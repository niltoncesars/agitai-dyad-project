import { eq, and, desc, isNull } from "drizzle-orm";
import { getDb } from "./db";
import {
  notificationPreferences,
  userNotifications,
  eventPriceHistory,
  InsertNotificationPreference,
  InsertUserNotification,
  InsertEventPriceHistory,
} from "../drizzle/schema";

/**
 * Get or create notification preferences for a user
 */
export async function getOrCreateNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create default preferences
  const newPrefs: InsertNotificationPreference = {
    userId,
    enableUpcomingEvents: true,
    enablePriceChanges: true,
    enableFavoriteUpdates: true,
    upcomingEventsRadius: 50,
    upcomingEventsDaysBefore: 7,
  };

  await db.insert(notificationPreferences).values(newPrefs);
  return getOrCreateNotificationPreferences(userId);
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: number,
  updates: Partial<InsertNotificationPreference>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notificationPreferences)
    .set(updates)
    .where(eq(notificationPreferences.userId, userId));
}

/**
 * Create a new notification for a user
 */
export async function createNotification(
  notification: InsertUserNotification
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .insert(userNotifications)
    .values(notification);

  return result;
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false)
      )
    )
    .orderBy(desc(userNotifications.createdAt));
}

/**
 * Get all notifications for a user (paginated)
 */
export async function getUserNotifications(
  userId: number,
  limit: number = 20,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(userNotifications)
    .where(eq(userNotifications.userId, userId))
    .orderBy(desc(userNotifications.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userNotifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(eq(userNotifications.id, notificationId));
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userNotifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false)
      )
    );
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({ count: require("drizzle-orm").count() })
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false)
      )
    );

  return result[0]?.count || 0;
}

/**
 * Record a price change for an event
 */
export async function recordPriceChange(
  priceChange: InsertEventPriceHistory
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(eventPriceHistory).values(priceChange);
}

/**
 * Get recent price changes for an event
 */
export async function getRecentPriceChanges(
  eventId: string,
  hoursBack: number = 24
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  return db
    .select()
    .from(eventPriceHistory)
    .where(
      and(
        eq(eventPriceHistory.eventId, eventId),
        // createdAt >= cutoffTime (approximate)
      )
    )
    .orderBy(desc(eventPriceHistory.createdAt))
    .limit(10);
}

/**
 * Delete old notifications (older than specified days)
 */
export async function deleteOldNotifications(daysOld: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  // Delete only read notifications
  await db
    .delete(userNotifications)
    .where(
      and(
        eq(userNotifications.isRead, true),
        // createdAt < cutoffDate (approximate)
      )
    );
}
