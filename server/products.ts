/**
 * Stripe Products Configuration
 * Define all products and prices for ticket sales
 */

export const STRIPE_PRODUCTS = {
  TICKET: {
    name: "Ingresso de Evento",
    description: "Ingresso para eventos Agitaí",
  },
} as const;

/**
 * Helper function to create a price object for Stripe
 * Used when creating checkout sessions
 */
export function createTicketPrice(eventId: string, eventTitle: string, priceInCents: number) {
  return {
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
  };
}
