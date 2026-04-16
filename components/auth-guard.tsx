"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/sign-in",
}: AuthGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      if (requireAuth && !session) {
        router.push(redirectTo);
      } else if (!requireAuth && session) {
        router.push("/dashboard");
      }
    }
  }, [session, isPending, requireAuth, redirectTo, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div> */}
      </div>
    );
  }

  if (requireAuth && !session) {
    return null;
  }

  if (!requireAuth && session) {
    return null;
  }

  return <>{children}</>;
}
