import { getDb } from "./db";
import {
  createNotification,
  getOrCreateNotificationPreferences,
  recordPriceChange,
} from "./notifications";
import { users, favoriteEvents } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { events } from "../client/src/lib/mock-data";

/**
 * Check for upcoming events near users and send notifications
 * This should be called periodically (e.g., every hour)
 */
export async function checkUpcomingEventsNotifications() {
  const db = await getDb();
  if (!db) return;

  try {
    const allUsers = await db.select().from(users);

    for (const user of allUsers) {
      const prefs = await getOrCreateNotificationPreferences(user.id);

      if (!prefs.enableUpcomingEvents) continue;

      // Get user's favorite events
      const favorites = await db
        .select()
        .from(favoriteEvents)
        .where(eq(favoriteEvents.userId, user.id));

      // Check each favorite event
      for (const favorite of favorites) {
        const event = events.find((e) => e.id === favorite.eventId);
        if (!event) continue;

        // Parse event date
        const eventDate = new Date(event.date);
        const now = new Date();
        const daysUntilEvent = Math.floor(
          (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if event is within notification window
        if (
          daysUntilEvent === prefs.upcomingEventsDaysBefore &&
          daysUntilEvent > 0
        ) {
          await createNotification({
            userId: user.id,
            eventId: event.id,
            type: "upcoming_event",
            title: `${event.title} está próximo!`,
            message: `${event.title} acontece em ${daysUntilEvent} dia${daysUntilEvent !== 1 ? "s" : ""} em ${event.city_name}`,
            actionUrl: `/map?eventId=${event.id}`,
          });

          console.log(
            `[Notification] Upcoming event notification sent to user ${user.id} for event ${event.id}`
          );
        }
      }
    }
  } catch (error) {
    console.error("[NotificationService] Error checking upcoming events:", error);
  }
}

/**
 * Check for price changes and send notifications
 * This should be called periodically (e.g., every 30 minutes)
 */
export async function checkPriceChangeNotifications() {
  const db = await getDb();
  if (!db) return;

  try {
    const allUsers = await db.select().from(users);

    // Track price changes (in a real app, you'd compare with previous prices)
    const priceChanges: Record<
      string,
      { oldPrice: number; newPrice: number; percent: number }
    > = {};

    // Simulate price change detection
    // In production, you'd compare with stored prices in eventPriceHistory table
    for (const event of events) {
      // Example: check if price has changed significantly
      // This is a simplified example
      if (event.price > 0 && Math.random() > 0.95) {
        // Simulate 5% chance of price change
        const oldPrice = event.price * 0.95;
        const newPrice = event.price;
        const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;

        priceChanges[event.id] = {
          oldPrice,
          newPrice,
          percent: percentChange,
        };
      }
    }

    // Send notifications for price changes
    for (const user of allUsers) {
      const prefs = await getOrCreateNotificationPreferences(user.id);

      if (!prefs.enablePriceChanges) continue;

      // Get user's favorite events
      const favorites = await db
        .select()
        .from(favoriteEvents)
        .where(eq(favoriteEvents.userId, user.id));

      // Check price changes for favorite events
      for (const favorite of favorites) {
        if (priceChanges[favorite.eventId]) {
          const change = priceChanges[favorite.eventId];
          const event = events.find((e) => e.id === favorite.eventId);

          if (event) {
            // Record price change
            await recordPriceChange({
              eventId: event.id,
              eventTitle: event.title,
              previousPrice: change.oldPrice.toString(),
              currentPrice: change.newPrice.toString(),
              priceChangePercent: change.percent.toString(),
              reason: change.percent > 0 ? "price_increase" : "price_decrease",
            });

            // Send notification
            const direction = change.percent > 0 ? "aumentou" : "diminuiu";
            await createNotification({
              userId: user.id,
              eventId: event.id,
              type: "price_change",
              title: `Preço de ${event.title} ${direction}!`,
              message: `O preço do ingresso ${direction} ${Math.abs(change.percent).toFixed(1)}%. Novo preço: R$ ${change.newPrice.toFixed(2)}`,
              actionUrl: `/map?eventId=${event.id}`,
            });

            console.log(
              `[Notification] Price change notification sent to user ${user.id} for event ${event.id}`
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("[NotificationService] Error checking price changes:", error);
  }
}

/**
 * Initialize notification service with periodic checks
 * Call this once when the server starts
 */
export function initializeNotificationService() {
  console.log("[NotificationService] Initializing notification service...");

  // Check upcoming events every hour
  setInterval(() => {
    console.log("[NotificationService] Running upcoming events check...");
    checkUpcomingEventsNotifications().catch((error) => {
      console.error("[NotificationService] Error in upcoming events check:", error);
    });
  }, 60 * 60 * 1000); // 1 hour

  // Check price changes every 30 minutes
  setInterval(() => {
    console.log("[NotificationService] Running price change check...");
    checkPriceChangeNotifications().catch((error) => {
      console.error("[NotificationService] Error in price change check:", error);
    });
  }, 30 * 60 * 1000); // 30 minutes

  // Run initial checks after 5 seconds
  setTimeout(() => {
    checkUpcomingEventsNotifications().catch((error) => {
      console.error("[NotificationService] Error in initial upcoming events check:", error);
    });
    checkPriceChangeNotifications().catch((error) => {
      console.error("[NotificationService] Error in initial price change check:", error);
    });
  }, 5000);

  console.log("[NotificationService] Notification service initialized");
}
