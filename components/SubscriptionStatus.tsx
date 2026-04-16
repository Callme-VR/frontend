"use client";

import { useSession } from "@/lib/auth-client";
import { ManageSubscriptionButton } from "./ManageSubscriptionButton";

export function SubscriptionStatus() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Subscription Status
      </h2>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Account</span>
          <span className="font-medium">{session.user.email}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>
        
        <div className="pt-4 border-t">
          <ManageSubscriptionButton className="w-full">
            Manage Subscription
          </ManageSubscriptionButton>
        </div>
      </div>
    </div>
  );
}
