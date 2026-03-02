import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  },
  (table) => ({
    stripeCustomerIdIdx: index("user_stripe_customer_id_idx").on(table.stripeCustomerId),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Stripe customer mapping table
 * Links users to their Stripe customer IDs for payment processing
 */
export const stripeCustomers = mysqlTable(
  "stripe_customers",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull().unique(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    stripeCustomerIdIdx: index("stripe_customer_id_idx").on(table.stripeCustomerId),
  })
);

export type StripeCustomer = typeof stripeCustomers.$inferSelect;
export type InsertStripeCustomer = typeof stripeCustomers.$inferInsert;

/**
 * Ticket purchases table
 * Tracks all ticket purchases made through Stripe
 */
export const ticketPurchases = mysqlTable(
  "ticket_purchases",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull(),
    eventId: varchar("event_id", { length: 255 }).notNull(),
    eventTitle: text("event_title").notNull(),
    quantity: int("quantity").notNull().default(1),
    priceInCents: int("price_in_cents").notNull(),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).notNull().unique(),
    stripeCheckoutSessionId: varchar("stripe_checkout_session_id", { length: 255 }),
    status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("purchase_user_id_idx").on(table.userId),
    eventIdIdx: index("purchase_event_id_idx").on(table.eventId),
    stripePaymentIntentIdIdx: index("stripe_payment_intent_id_idx").on(table.stripePaymentIntentId),
    statusIdx: index("purchase_status_idx").on(table.status),
  })
);

export type TicketPurchase = typeof ticketPurchases.$inferSelect;
export type InsertTicketPurchase = typeof ticketPurchases.$inferInsert;

/**
 * Favorite events table
 * Tracks user's favorite events for quick access
 */
export const favoriteEvents = mysqlTable(
  "favorite_events",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull(),
    eventId: varchar("event_id", { length: 255 }).notNull(),
    eventTitle: text("event_title").notNull(),
    eventCity: varchar("event_city", { length: 255 }).notNull(),
    eventCategory: varchar("event_category", { length: 255 }).notNull(),
    eventPrice: decimal("event_price", { precision: 10, scale: 2 }),
    eventDate: varchar("event_date", { length: 255 }),
    eventImageUrl: text("event_image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("favorite_user_id_idx").on(table.userId),
    eventIdIdx: index("favorite_event_id_idx").on(table.eventId),
    userEventIdx: index("favorite_user_event_idx").on(table.userId, table.eventId),
  })
);

export type FavoriteEvent = typeof favoriteEvents.$inferSelect;
export type InsertFavoriteEvent = typeof favoriteEvents.$inferInsert;

/**
 * Notification preferences table
 * Stores user preferences for different types of notifications
 */
export const notificationPreferences = mysqlTable(
  "notification_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull().unique(),
    enableUpcomingEvents: boolean("enable_upcoming_events").default(true).notNull(),
    enablePriceChanges: boolean("enable_price_changes").default(true).notNull(),
    enableFavoriteUpdates: boolean("enable_favorite_updates").default(true).notNull(),
    upcomingEventsRadius: int("upcoming_events_radius").default(50).notNull(), // in km
    upcomingEventsDaysBefore: int("upcoming_events_days_before").default(7).notNull(), // days before event
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notif_pref_user_id_idx").on(table.userId),
  })
);

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * User notifications table
 * Stores all notifications sent to users
 */
export const userNotifications = mysqlTable(
  "user_notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull(),
    eventId: varchar("event_id", { length: 255 }),
    type: mysqlEnum("type", ["upcoming_event", "price_change", "favorite_update", "purchase_confirmation"]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    actionUrl: text("action_url"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    readAt: timestamp("read_at"),
  },
  (table) => ({
    userIdIdx: index("notif_user_id_idx").on(table.userId),
    eventIdIdx: index("notif_event_id_idx").on(table.eventId),
    typeIdx: index("notif_type_idx").on(table.type),
    isReadIdx: index("notif_is_read_idx").on(table.isRead),
    userReadIdx: index("notif_user_read_idx").on(table.userId, table.isRead),
  })
);

export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = typeof userNotifications.$inferInsert;

/**
 * Price change tracking table
 * Tracks price changes for events to detect when to notify users
 */
export const eventPriceHistory = mysqlTable(
  "event_price_history",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: varchar("event_id", { length: 255 }).notNull(),
    eventTitle: text("event_title").notNull(),
    previousPrice: decimal("previous_price", { precision: 10, scale: 2 }).notNull(),
    currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
    priceChangePercent: decimal("price_change_percent", { precision: 5, scale: 2 }).notNull(),
    reason: varchar("reason", { length: 255 }), // e.g., "batch_change", "promotion", "adjustment"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdIdx: index("price_history_event_id_idx").on(table.eventId),
    createdAtIdx: index("price_history_created_at_idx").on(table.createdAt),
  })
);

export type EventPriceHistory = typeof eventPriceHistory.$inferSelect;
export type InsertEventPriceHistory = typeof eventPriceHistory.$inferInsert;
