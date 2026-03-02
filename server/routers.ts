import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createTicketCheckoutSession, getUserTicketPurchases } from "./payments";
import { addFavorite, removeFavorite, isFavorited, getUserFavorites } from "./favorites";
import {
  getOrCreateNotificationPreferences,
  updateNotificationPreferences,
  getUnreadNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  createNotification,
} from "./notifications";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  payments: router({
    /**
     * Create a checkout session for ticket purchase
     */
    createCheckoutSession: protectedProcedure
      .input(
        z.object({
          eventId: z.string(),
          eventTitle: z.string(),
          priceInCents: z.number().positive(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("User not authenticated");

        const successUrl = `${ctx.req.headers.origin || "https://example.com"}/map?payment=success`;
        const cancelUrl = `${ctx.req.headers.origin || "https://example.com"}/map?payment=cancelled`;

        const checkoutUrl = await createTicketCheckoutSession(
          ctx.user.id,
          ctx.user.email || "",
          ctx.user.name,
          input.eventId,
          input.eventTitle,
          input.priceInCents,
          successUrl,
          cancelUrl
        );

        return { checkoutUrl };
      }),

    /**
     * Get user's ticket purchases
     */
    myPurchases: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");
      return getUserTicketPurchases(ctx.user.id);
    }),
  }),

  favorites: router({
    /**
     * Add event to favorites
     */
    add: protectedProcedure
      .input(
        z.object({
          eventId: z.string(),
          eventTitle: z.string(),
          eventCity: z.string(),
          eventCategory: z.string(),
          eventPrice: z.string().optional(),
          eventDate: z.string().optional(),
          eventImageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("User not authenticated");

        await addFavorite(
          ctx.user.id,
          input.eventId,
          input.eventTitle,
          input.eventCity,
          input.eventCategory,
          input.eventPrice,
          input.eventDate,
          input.eventImageUrl
        );

        return { success: true };
      }),

    /**
     * Remove event from favorites
     */
    remove: protectedProcedure
      .input(
        z.object({
          eventId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("User not authenticated");

        await removeFavorite(ctx.user.id, input.eventId);

        return { success: true };
      }),

    /**
     * Check if event is favorited
     */
    isFavorited: protectedProcedure
      .input(
        z.object({
          eventId: z.string(),
        })
      )
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return false;
        return isFavorited(ctx.user.id, input.eventId);
      }),

    /**
     * Get all user's favorite events
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");
      return getUserFavorites(ctx.user.id);
    }),
  }),

  notifications: router({
    /**
     * Get notification preferences for current user
     */
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");
      return getOrCreateNotificationPreferences(ctx.user.id);
    }),

    /**
     * Update notification preferences
     */
    updatePreferences: protectedProcedure
      .input(
        z.object({
          enableUpcomingEvents: z.boolean().optional(),
          enablePriceChanges: z.boolean().optional(),
          enableFavoriteUpdates: z.boolean().optional(),
          upcomingEventsRadius: z.number().optional(),
          upcomingEventsDaysBefore: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("User not authenticated");
        await updateNotificationPreferences(ctx.user.id, input);
        return { success: true };
      }),

    /**
     * Get unread notifications
     */
    getUnread: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");
      return getUnreadNotifications(ctx.user.id);
    }),

    /**
     * Get all notifications (paginated)
     */
    getAll: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("User not authenticated");
        return getUserNotifications(ctx.user.id, input.limit, input.offset);
      }),

    /**
     * Mark notification as read
     */
    markAsRead: protectedProcedure
      .input(
        z.object({
          notificationId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await markNotificationAsRead(input.notificationId);
        return { success: true };
      }),

    /**
     * Mark all notifications as read
     */
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");
      await markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),

    /**
     * Get unread notification count
     */
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");
      const count = await getUnreadNotificationCount(ctx.user.id);
      return { count };
    }),
  }),
});

export type AppRouter = typeof appRouter;
