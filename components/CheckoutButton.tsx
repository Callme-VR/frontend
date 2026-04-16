"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

interface CheckoutButtonProps {
  plan: "small" | "medium" | "large";
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function CheckoutButton({
  plan,
  children = "Get Started",
  className = "",
  disabled = false,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await authClient.checkout({
        slug: plan,
      });
    } catch (error) {
      console.error("Checkout failed:", error);
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes("invalid_token")) {
          alert("Payment system is not properly configured. Please contact support.");
        } else {
          alert("Unable to process checkout. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? "Processing..." : children}
    </button>
  );
}

// Predefined plan-specific components for convenience
export function SmallPlanButton(props: Omit<CheckoutButtonProps, "plan">) {
  return <CheckoutButton {...props} plan="small" />;
}

export function MediumPlanButton(props: Omit<CheckoutButtonProps, "plan">) {
  return <CheckoutButton {...props} plan="medium" />;
}

export function LargePlanButton(props: Omit<CheckoutButtonProps, "plan">) {
  return <CheckoutButton {...props} plan="large" />;
}
