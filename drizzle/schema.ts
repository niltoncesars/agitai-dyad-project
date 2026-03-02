import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, index } from "drizzle-orm/mysql-core";

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