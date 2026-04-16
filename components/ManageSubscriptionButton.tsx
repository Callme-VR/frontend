"use client";

import { authClient } from "@/lib/auth-client";

interface ManageSubscriptionButtonProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function ManageSubscriptionButton({
  children = "Manage Subscription",
  className = "",
  disabled = false,
}: ManageSubscriptionButtonProps) {
  const handleManageSubscription = async () => {
    try {
      await authClient.customer.portal();
    } catch (error) {
      console.error("Failed to open customer portal:", error);
    }
  };

  return (
    <button
      onClick={handleManageSubscription}
      disabled={disabled}
      className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
