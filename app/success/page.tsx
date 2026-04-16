"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useSession } from "@/lib/auth-client";

// Inner component that uses useSearchParams — must be wrapped in <Suspense>
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  // Polar's hosted checkout appends ?checkoutId=… (camelCase).
  // The better-auth checkout plugin uses ?checkout_id=… (snake_case).
  // Support both.
  const checkoutId =
    searchParams.get("checkoutId") || searchParams.get("checkout_id");

  useEffect(() => {
    if (!checkoutId) {
      // No checkout ID — send to home
      router.replace("/");
      return;
    }

    // Give Polar a moment to fire the webhook so credits are ready when the
    // dashboard server component runs its DB query.
    const timer = setTimeout(() => {
      // router.refresh() clears the Next.js client-side cache so the dashboard
      // layout fetches a fresh credit count from the database.
      router.refresh();
      router.replace("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkoutId, router]);

  if (!checkoutId) {
    // Rendered during SSR — searchParams not yet available; show nothing until
    // the client picks it up and triggers the redirect.
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-2">
          Thank you for your purchase
          {session?.user?.name ? `, ${session.user.name}` : ""}! Your credits
          have been added to your account.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          Redirecting you to your dashboard…
        </p>

        {/* Manual CTA in case the auto-redirect is slow */}
        <div className="space-y-3">
          <button
            onClick={() => {
              router.refresh();
              router.replace("/dashboard");
            }}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => (window.location.href = "/api/portal")}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Manage Subscription
          </button>
        </div>

        {checkoutId && (
          <p className="text-xs text-gray-400 mt-4">Order ID: {checkoutId}</p>
        )}
      </div>
    </div>
  );
}

// Loading skeleton shown while the Suspense boundary resolves
function SuccessFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-3 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto animate-pulse" />
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
