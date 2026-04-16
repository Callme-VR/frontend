import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Navbar from "@/components/webcomponenst/navbar";
import db from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Fetch fresh credits from database
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true, email: true },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <>
      <Navbar credit={user.credits} email={user.email} />
      {children}
    </>
  );
}
