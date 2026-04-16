"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";

interface SuccessClientProps {
  checkoutId: string | null;
}

export default function SuccessClient({ checkoutId }: SuccessClientProps) {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!checkoutId) {
      router.replace("/");
      return;
    }

    // Give Polar's webhook a moment to fire and update credits in the DB
    // before the dashboard layout runs its server-side credit query.
    const timer = setTimeout(() => {
      // Clear Next.js client-side cache so the dashboard layout re-fetches
      // the fresh credit count from the database on the next render.
      router.refresh();
      router.replace("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkoutId, router]);

  // No valid checkout — render nothing while redirect fires
  if (!checkoutId) {
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

        <p className="text-xs text-gray-400 mt-4">Order ID: {checkoutId}</p>
      </div>
    </div>
  );
}
