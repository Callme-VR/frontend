"use server"
import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma"
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export default async function generateVideo(uploadFileId: string) {

     const uploadvideo = await db.uploadedFile.findUniqueOrThrow({
          where: {
               id: uploadFileId,
          },
          select: {
               id: true,
               userId: true,
               s3Key: true,
          }
     });

     // Send event to process the video
     await inngest.send({
          name: "process-video-endpoints",
          data: {
               uploadedFileId: uploadvideo.id,
               userId: uploadvideo.userId,
          }
     })

     // Mark file as uploaded and update status to queued
     await db.uploadedFile.update({
          where: {
               id: uploadFileId
          },
          data: {
               uploaded: true,
               status: "queued"
          }
     })
     revalidatePath("/dashboard")

     return {
          success: true,
          message: "Video generation started"
     }
}

// get and download clip play url

export async function getClipPlayURL(clipId: string): Promise<{ success: boolean, url?: string, error?: string }> {
     const session = await auth.api.getSession({
          headers: await headers(),
     });

     if (!session?.user?.id) {
          return {
               success: false,
               error: "User not authenticated"
          }
     }


     try {
          const clip = await db.clip.findUniqueOrThrow({
               where: {
                    id: clipId,
                    userId: session.user.id
               }
          })
          const s3Client = new S3Client({
               region: process.env.AWS_REGION!,
               credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
               },
          });
          const command = new GetObjectCommand({
               Bucket: process.env.S3_BUCKET_NAME!,
               Key: clip.s3Key
          })
          const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          return {
               success: true,
               url: signedUrl
          }
     } catch (error) {
          console.error("Error getting clip play URL:", error);
          return {
               success: false,
               error: "Failed to get clip play URL"
          }
     }
}