import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { favoriteEvents, InsertFavoriteEvent } from "../drizzle/schema";

/**
 * Add an event to user's favorites
 */
export async function addFavorite(
  userId: number,
  eventId: string,
  eventTitle: string,
  eventCity: string,
  eventCategory: string,
  eventPrice?: string,
  eventDate?: string,
  eventImageUrl?: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if already favorited
  const existing = await db
    .select()
    .from(favoriteEvents)
    .where(
      and(
        eq(favoriteEvents.userId, userId),
        eq(favoriteEvents.eventId, eventId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return; // Already favorited
  }

  // Add to favorites
  await db.insert(favoriteEvents).values({
    userId,
    eventId,
    eventTitle,
    eventCity,
    eventCategory,
    eventPrice: eventPrice ? parseFloat(eventPrice) : null,
    eventDate,
    eventImageUrl,
  } as InsertFavoriteEvent);
}

/**
 * Remove an event from user's favorites
 */
export async function removeFavorite(userId: number, eventId: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(favoriteEvents)
    .where(
      and(
        eq(favoriteEvents.userId, userId),
        eq(favoriteEvents.eventId, eventId)
      )
    );
}

/**
 * Check if an event is favorited by user
 */
export async function isFavorited(userId: number, eventId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  const result = await db
    .select()
    .from(favoriteEvents)
    .where(
      and(
        eq(favoriteEvents.userId, userId),
        eq(favoriteEvents.eventId, eventId)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Get all favorites for a user
 */
export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db
    .select()
    .from(favoriteEvents)
    .where(eq(favoriteEvents.userId, userId))
    .orderBy((t) => t.createdAt);
}

/**
 * Get count of favorites for a user
 */
export async function getFavoritesCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  const result = await db
    .select({ count: favoriteEvents.id })
    .from(favoriteEvents)
    .where(eq(favoriteEvents.userId, userId));

  return result.length > 0 ? result.length : 0;
}
