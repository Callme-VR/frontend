import { inngest } from "@/inngest/client";
import db from "@/lib/prisma";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

// ✅ Single S3 client instance
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// ❌ Removed unused/incorrect function (listS3ObjectByPrefix)

export const Processvideo = inngest.createFunction(
  {
    id: "process-video",
    retries: 1,
    concurrency: [{ limit: 1, key: "event.data.userId" }],
    triggers: [{ event: "process-video-endpoints" }],
  },
  async ({ event, step }) => {
    const { uploadedFileId } = event.data as {
      uploadedFileId: string;
      userId: string;
    };

    try {
      // ✅ FIX: avoid variable shadowing
      const result = await step.run("check-credits", async () => {
        const uploadedFile = await db.uploadedFile.findUniqueOrThrow({
          where: {
            id: uploadedFileId,
          },
          select: {
            user: {
              select: {
                id: true,
                credits: true,
              },
            },
            s3Key: true,
          },
        });

        return {
          userId: uploadedFile.user.id,
          s3Key: uploadedFile.s3Key,
          credits: uploadedFile.user.credits,
        };
      });

      const { userId, s3Key, credits } = result;

      if (credits > 0) {
        await step.run("set-status-processing", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "processing",
            },
          });
        });

        await step.fetch(process.env.PROCESS_VIDEO_ENDPOINT!, {
          method: "POST",
          body: JSON.stringify({
            s3_key: s3Key,
          }),
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${process.env.PROCESS_VIDEO_ENDPOINT_AUTH!}`,
          },
        });

        const { clipsFound } = await step.run("create-clip", async () => {
          const folderprefix = s3Key.split("/")[0]!;

          const allkeys = await listS3ObjectsByPrefix(folderprefix);

          // Exclude the original uploaded file by exact key match
          // Only include .mp4 files (generated clips), skip metadata/thumbnails
          const clipkeys = allkeys.filter(
            (key): key is string =>
              key !== undefined && key !== s3Key && key.endsWith(".mp4")
          );

          if (clipkeys.length > 0) {
            // ✅ FIX: createMany instead of create
            await db.clip.createMany({
              data: clipkeys.map((clipkey) => ({
                s3Key: clipkey,
                uploadedFileId,
                userId,
              })),
            });
          }

          return { clipsFound: clipkeys.length };
        });

        await step.run("deduct-credits", async () => {
          await db.user.update({
            where: {
              id: userId,
            },
            data: {
              credits: {
                decrement: Math.min(credits, clipsFound),
              },
            },
          });
        });

        await step.run("set-status-processed", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "processed",
            },
          });
        });

        return { success: true, s3Key };
      } else {
        await step.run("set-status-no-credits", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "no credits",
            },
          });
        });
      }
    } catch (error: unknown) {
      console.error("Process Video Error:", error);
      await db.uploadedFile.update({
        where: {
          id: uploadedFileId,
        },
        data: {
          status: "failed",
        },
      });
    }
  },
);

// ✅ Keep only ONE correct helper function
async function listS3ObjectsByPrefix(prefix: string) {
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME!,
    Prefix: prefix,
  });

  const response = await s3Client.send(command);

  return (
    response.Contents?.map((item) => item.Key).filter(Boolean) ?? []
  );
}