import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import prisma from "@/lib/prisma";

// Validate Polar environment variables
const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
const polarServer =
  process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production";

if (!polarAccessToken) {
  console.warn(
    "POLAR_ACCESS_TOKEN is not set. Polar integration will be disabled.",
  );
}

const polarClient = new Polar({
  accessToken: polarAccessToken || "",
  server: polarServer === "sandbox" ? "sandbox" : undefined,
});

// Map Polar product IDs → credits to grant
function getCreditsForProduct(productId: string): number {
  const creditMap: Record<string, number> = {
    "48084992-90d5-404c-8a75-c7eb95178ad9": 50, // Small Pack  – 50 credits
    "d13df262-9690-4da0-8c2b-e337ab7fd92e": 150, // Medium Pack – 150 credits
    "91904a1e-a2a4-4287-b7ef-315faf8a902a": 500, // Large Pack  – 500 credits
  };
  return creditMap[productId] ?? 0;
}

// Debug: Check if required environment variables are set
if (!process.env.BETTER_AUTH_SECRET) {
  console.error("CRITICAL: BETTER_AUTH_SECRET is not set!");
}
if (!process.env.DATABASE_URL) {
  console.error("CRITICAL: DATABASE_URL is not set!");
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    ...(polarAccessToken
      ? [
        polar({
          client: polarClient,
          // Set to false so that an expired / invalid POLAR_ACCESS_TOKEN
          // cannot block user sign-up.  Polar customers are created
          // automatically at first checkout instead.
          // Once you have confirmed your POLAR_ACCESS_TOKEN is valid in
          // Vercel → Settings → Environment Variables, you can safely
          // flip this back to `true`.
          createCustomerOnSignUp: true,
          use: [
            checkout({
              products: [
                {
                  productId: "91904a1e-a2a4-4287-b7ef-315faf8a902a", // Large plan
                  slug: "large",
                },
                {
                  productId: "d13df262-9690-4da0-8c2b-e337ab7fd92e", // Medium plan
                  slug: "medium",
                },
                {
                  productId: "48084992-90d5-404c-8a75-c7eb95178ad9", // Small plan
                  slug: "small",
                },
              ],
              // Relative path – better-auth resolves it against BETTER_AUTH_URL
              successUrl: "/success?checkout_id={CHECKOUT_ID}",
              authenticatedUsersOnly: true,
            }),
            portal(),
            webhooks({
              secret: process.env.POLAR_WEBHOOK_SECRET as string,

              // ✅ MAIN CREDIT-GRANTING HANDLER
              onOrderPaid: async (payload) => {
                // payload.data is a fully SDK-parsed Order (camelCase fields)
                const order = payload.data;
                const userEmail = order.customer.email;
                // productId is a top-level camelCase field on Order (string | null)
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
              },

              onCustomerStateChanged: async (payload) => {
                console.log(
                  `[Polar webhook] customer.state_changed – id=${payload.data.id}`,
                );
              },

              onPayload: async (payload) => {
                console.log(
                  `[Polar webhook] received event: ${payload.type}`,
                );
              },
            }),
          ],
        }),
      ]
      : []),
  ],
});
