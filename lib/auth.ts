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
    "5d518c29-8804-4bca-9b13-2a275c245c73": 50, // Small Pack  – 50 credits
    "3deb32fd-578f-4cc3-8594-3850f92f61b8": 150, // Medium Pack – 150 credits
    "37433757-1f3b-490c-afb9-32c12e2f86f4": 500, // Large Pack  – 500 credits
  };
  return creditMap[productId] ?? 0;
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "https://clipa-tau.vercel.app",
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
            createCustomerOnSignUp: true,
            use: [
              checkout({
                products: [
                  {
                    productId: "37433757-1f3b-490c-afb9-32c12e2f86f4", // Large plan
                    slug: "large",
                  },
                  {
                    productId: "3deb32fd-578f-4cc3-8594-3850f92f61b8", // Medium plan
                    slug: "medium",
                  },
                  {
                    productId: "5d518c29-8804-4bca-9b13-2a275c245c73", // Small plan
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
