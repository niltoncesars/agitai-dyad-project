import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createTicketCheckoutSession, getUserTicketPurchases } from "./payments";

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
});

export type AppRouter = typeof appRouter;
