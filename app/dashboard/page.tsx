"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import db from "@/lib/prisma";
import DashBoardClient from "@/components/webcomponenst/DashBoardClient";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/sign-in");
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const userData = await db.user.findUniqueOrThrow({
    where: {
      id: session.user.id,
    },
    select: {
      uploadedFiles: {
        where: {
          uploaded: true,
        },

        select: {
          id: true,
          s3Key: true,
          displayName: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              clips: true,
            },
          },
        },
      },
      clips: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const formattedFiles = userData.uploadedFiles.map((file) => ({
    id: file.id,
    s3Key: file.s3Key,
    filename: file.displayName ?? "Unknown filename",
    status: file.status,
    createdAt: file.createdAt,
    clipCount: file._count.clips,
  }));

  return (
    <DashBoardClient uploadedFiles={formattedFiles} clips={userData.clips} />
  );
}

// DashBoardClient

// vishal