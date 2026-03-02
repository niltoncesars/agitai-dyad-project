import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `sample-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Sample User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("notifications", () => {
  it("should get notification preferences for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const prefs = await caller.notifications.getPreferences();

    expect(prefs).toBeDefined();
    expect(prefs.userId).toBe(ctx.user!.id);
    expect(prefs.enableUpcomingEvents).toBe(true);
    expect(prefs.enablePriceChanges).toBe(true);
    expect(prefs.enableFavoriteUpdates).toBe(true);
    expect(prefs.upcomingEventsRadius).toBe(50);
    expect(prefs.upcomingEventsDaysBefore).toBe(7);
  });

  it("should update notification preferences", async () => {
    const ctx = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);

    // Get initial preferences
    const initialPrefs = await caller.notifications.getPreferences();

    // Update preferences
    const result = await caller.notifications.updatePreferences({
      enableUpcomingEvents: false,
      upcomingEventsRadius: 100,
      upcomingEventsDaysBefore: 14,
    });

    expect(result.success).toBe(true);

    // Get updated preferences
    const updatedPrefs = await caller.notifications.getPreferences();

    expect(updatedPrefs.enableUpcomingEvents).toBe(false);
    expect(updatedPrefs.upcomingEventsRadius).toBe(100);
    expect(updatedPrefs.upcomingEventsDaysBefore).toBe(14);
  });

  it("should get unread notifications count", async () => {
    const ctx = createAuthContext(3);
    const caller = appRouter.createCaller(ctx);

    const countData = await caller.notifications.getUnreadCount();

    expect(countData).toBeDefined();
    expect(countData.count).toBeGreaterThanOrEqual(0);
    expect(typeof countData.count).toBe("number");
  });

  it("should get all notifications paginated", async () => {
    const ctx = createAuthContext(4);
    const caller = appRouter.createCaller(ctx);

    const notifications = await caller.notifications.getAll({
      limit: 20,
      offset: 0,
    });

    expect(Array.isArray(notifications)).toBe(true);
  });

  it("should get unread notifications only", async () => {
    const ctx = createAuthContext(5);
    const caller = appRouter.createCaller(ctx);

    const unreadNotifications = await caller.notifications.getUnread();

    expect(Array.isArray(unreadNotifications)).toBe(true);
    // All returned notifications should be unread
    for (const notif of unreadNotifications) {
      expect(notif.isRead).toBe(false);
    }
  });

  it("should mark notification as read", async () => {
    const ctx = createAuthContext(6);
    const caller = appRouter.createCaller(ctx);

    // This test assumes there's at least one notification
    // In a real scenario, you'd create one first
    const result = await caller.notifications.markAsRead({
      notificationId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should mark all notifications as read", async () => {
    const ctx = createAuthContext(7);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.markAllAsRead();

    expect(result.success).toBe(true);
  });
});
