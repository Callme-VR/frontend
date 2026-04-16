import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "https://clipa-tau.vercel.app",
  plugins: [polarClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
