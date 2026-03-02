import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { getDb } from "./db";
import { stripeCustomers, ticketPurchases, InsertTicketPurchase } from "../drizzle/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: number, email: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if customer already exists
  const existing = await db
    .select()
    .from(stripeCustomers)
    .where(eq(stripeCustomers.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      user_id: userId.toString(),
    },
  });

  // Save to database
  await db.insert(stripeCustomers).values({
    userId,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

/**
 * Create a checkout session for ticket purchase
 */
export async function createTicketCheckoutSession(
  userId: number,
  userEmail: string,
  userName: string | null | undefined,
  eventId: string,
  eventTitle: string,
  priceInCents: number,
  successUrl: string,
  cancelUrl: string
) {
  // Get or create Stripe customer
  const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail, userName || undefined);

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: `Ingresso: ${eventTitle}`,
            description: `Ingresso para o evento ${eventTitle}`,
            metadata: {
              event_id: eventId,
            },
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId.toString(),
    metadata: {
      user_id: userId.toString(),
      event_id: eventId,
      event_title: eventTitle,
      customer_email: userEmail,
      customer_name: userName || "Unknown",
    },
    allow_promotion_codes: true,
  });

  // Save purchase record with pending status
  const db = await getDb();
  if (db && session.payment_intent) {
    await db.insert(ticketPurchases).values({
      userId,
      eventId,
      eventTitle,
      quantity: 1,
      priceInCents,
      stripePaymentIntentId: session.payment_intent.toString(),
      stripeCheckoutSessionId: session.id,
      status: "pending",
    });
  }

  return session.url;
}

/**
 * Handle successful payment from webhook
 */
export async function handlePaymentSuccess(paymentIntentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update purchase status to completed
  await db
    .update(ticketPurchases)
    .set({ status: "completed" })
    .where(eq(ticketPurchases.stripePaymentIntentId, paymentIntentId));
}

/**
 * Handle failed payment from webhook
 */
export async function handlePaymentFailed(paymentIntentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update purchase status to failed
  await db
    .update(ticketPurchases)
    .set({ status: "failed" })
    .where(eq(ticketPurchases.stripePaymentIntentId, paymentIntentId));
}

/**
 * Get user's ticket purchases
 */
export async function getUserTicketPurchases(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(ticketPurchases)
    .where(eq(ticketPurchases.userId, userId));
}
