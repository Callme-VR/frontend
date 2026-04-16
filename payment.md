# Polar Payment Implementation Guide

This document explains how Polar payments are integrated into the project, from configuration to credit granting.

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Environment Variables](#2-environment-variables)
3. [Backend Configuration (Better-Auth)](#3-backend-configuration-better-auth)
4. [Checkout Implementation](#4-checkout-implementation)
5. [Webhook Handling & Credit Granting](#5-webhook-handling--credit-granting)
6. [Customer Portal](#6-customer-portal)
7. [Alternative Integration (Standard Polar Next.js)](#7-alternative-integration-standard-polar-nextjs)

---


## 1. Prerequisites
- A Polar account ([polar.sh](https://polar.sh)).
- Products created in Polar (get their Product IDs).
- An Access Token from Polar settings.
- A Webhook Secret (generated when you add your endpoint in Polar).

## 2. Environment Variables
Add the following to your `.env` or `.env.local`:

```env
# Polar Configuration
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_webhook_secret
POLAR_SERVER=sandbox # or production
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Success URL for checkout
SUCCESS_URL=http://localhost:3000/success
```

## 3. Backend Configuration (Better-Auth)
The primary integration uses `better-auth` plugins for seamless user session management.

**File:** `lib/auth.ts`
- Initializes the `Polar` SDK.
- Configures `betterAuth` with `polar()`, `checkout()`, `portal()`, and `webhooks()` plugins.
- Defines the mapping between Polar Product IDs and plan slugs (e.g., `small`, `medium`, `large`).

```typescript
// lib/auth.ts snippet
polar({
  client: polarClient,
  createCustomerOnSignUp: true, // Automatically creates Polar customer
  use: [
    checkout({
      products: [
        { productId: "ID_1", slug: "small" },
        { productId: "ID_2", slug: "medium" },
        { productId: "ID_3", slug: "large" },
      ],
      successUrl: "/success?checkout_id={CHECKOUT_ID}",
      authenticatedUsersOnly: true,
    }),
    portal(),
    webhooks({
      secret: process.env.POLAR_WEBHOOK_SECRET,
      onOrderPaid: async (payload) => {
        // Credit granting logic here
      }
    })
  ]
})
```

## 4. Checkout Implementation
The frontend uses the `authClient` to initiate the checkout flow.

**File:** `components/CheckoutButton.tsx`
- Uses `authClient.checkout({ slug: plan })`.
- This redirects the user to the Polar-hosted checkout page.

```typescript
// components/CheckoutButton.tsx snippet
const handleCheckout = async () => {
  await authClient.checkout({
    slug: plan, // 'small', 'medium', or 'large'
  });
};
```

**File:** `app/pricing/page.tsx`
- Displays the pricing tiers and uses `CheckoutButton` for each plan.

## 5. Webhook Handling & Credit Granting
When a user completes a payment, Polar sends a `order.paid` webhook.

**Logic (Centralized in `lib/auth.ts` or `app/api/webhook/polar/route.ts`):**
1. Receives the `order.paid` payload.
2. Extracts `customer.email` and `productId`.
3. Maps `productId` to a specific number of credits using `getCreditsForProduct()`.
4. Updates the user's credit balance in the database using Prisma.

```typescript
// Credit mapping example
function getCreditsForProduct(productId: string): number {
  const creditMap: Record<string, number> = {
    "5d518c29-8804-4bca-9b13-2a275c245c73": 50,  // Small Pack
    "3deb32fd-578f-4cc3-8594-3850f92f61b8": 150, // Medium Pack
    "37433757-1f3b-490c-afb9-32c12e2f86f4": 500, // Large Pack
  };
  return creditMap[productId] ?? 0;
}

// Database update
await prisma.user.update({
  where: { email: userEmail },
  data: { credits: { increment: creditsToAdd } },
});
```

## 6. Customer Portal
Users can manage their subscriptions or view payment history via the Polar Customer Portal.

**File:** `components/ManageSubscriptionButton.tsx`
- Uses `authClient.portal()` to redirect the user to their personal Polar portal.

```typescript
const handleManageSubscription = async () => {
  await authClient.portal();
};
```

## 7. Alternative Integration (Standard Polar Next.js)
The project also contains a standalone implementation using the `@polar-sh/nextjs` library directly.

- **Checkout Route:** `app/api/checkout/route.ts`
  - Accessible via `/api/checkout?products=PRODUCT_ID`.
- **Webhook Route:** `app/api/webhook/polar/route.ts`
  - Handles webhooks independently of `better-auth`.
- **Usage:** See `app/dashboard/billing/page.tsx` for an example of direct URL redirection to `/api/checkout`.

---

## Summary of Files Related to Payment
| File | Purpose |
|------|---------|
| `lib/auth.ts` | Backend configuration, Webhook logic, Product mapping |
| `lib/auth-client.ts` | Frontend client initialization with Polar plugin |
| `components/CheckoutButton.tsx` | UI button to trigger checkout |
| `components/ManageSubscriptionButton.tsx` | UI button to open Polar Customer Portal |
| `app/api/checkout/route.ts` | Standalone checkout API handler |
| `app/api/webhook/polar/route.ts` | Standalone webhook API handler |
| `app/pricing/page.tsx` | Pricing page with plan selection |
| `app/dashboard/billing/page.tsx` | Dashboard billing management |
| `prisma/schema.prisma` | User model with `credits` field |

