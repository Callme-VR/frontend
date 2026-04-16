import { Webhooks } from "@polar-sh/nextjs";
import type { WebhookOrderPaidPayload } from "@polar-sh/sdk/models/components/webhookorderpaidpayload";
import prisma from "@/lib/prisma";

// Map Polar product IDs → credits to grant
function getCreditsForProduct(productId: string): number {
  const creditMap: Record<string, number> = {
    "48084992-90d5-404c-8a75-c7eb95178ad9": 50, // Small Pack  – 50 credits
    "d13df262-9690-4da0-8c2b-e337ab7fd92e": 150, // Medium Pack – 150 credits
    "91904a1e-a2a4-4287-b7ef-315faf8a902a": 500, // Large Pack  – 500 credits
  };
  return creditMap[productId] ?? 0;
}

async function handleOrderPaid(payload: WebhookOrderPaidPayload) {
  // payload.data is an SDK-parsed Order with camelCase fields.
  // productId is a top-level field on Order (string | null).
  // customer.email is always present.
  const order = payload.data;
  const userEmail = order.customer.email;
  const productId = order.productId;

  console.log(
    `[Polar webhook] order.paid – id=${order.id} customer=${userEmail} productId=${productId}`,
  );

  if (!productId) {
    console.error(
      `[Polar webhook] No productId on order ${order.id} – skipping credit grant`,
    );
    return;
  }

  const creditsToAdd = getCreditsForProduct(productId);

  if (creditsToAdd === 0) {
    console.error(
      `[Polar webhook] Unknown productId "${productId}" on order ${order.id} – no credits added`,
    );
    return;
  }

  try {
    const updated = await prisma.user.update({
      where: { email: userEmail },
      data: { credits: { increment: creditsToAdd } },
      select: { credits: true },
    });
    console.log(
      `[Polar webhook] ✅ Added ${creditsToAdd} credits to ${userEmail}. New balance: ${updated.credits}`,
    );
  } catch (error) {
    console.error(
      `[Polar webhook] ❌ Failed to add credits to ${userEmail}:`,
      error,
    );
  }
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  // ✅ Grant credits when payment is confirmed
  onOrderPaid: handleOrderPaid,

  // ✅ Remove credits on refund (implement as needed)
  onOrderRefunded: async (payload) => {
    const order = payload.data;
    console.log(
      `[Polar webhook] order.refunded – id=${order.id} customer=${order.customer.email}`,
    );
    // TODO: deduct credits for refunded order if required
  },

  // ✅ Log customer creation
  onCustomerCreated: async (payload) => {
    const customer = payload.data;
    console.log(
      `[Polar webhook] customer.created – id=${customer.id} email=${customer.email}`,
    );
  },
});
