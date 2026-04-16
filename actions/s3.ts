"use server"

import db from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { headers } from "next/headers"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from "uuid"
export async function GenerateUploaderURL(fileInfo: {
     filename: string,
     "content-type": string
}): Promise<{
     success: boolean
     signedUrl: string,
     key: string,
     uploadFileId: string
}> {

     const session = await auth.api.getSession({
          headers: await headers()
     })

     if (!session) {
          throw new Error("User not authenticated")
     }


     const s3client = new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
               accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
               secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
          }
     })
     const fileExtension = fileInfo.filename.split(".").pop() ?? "";
     const uniqueId = uuidv4();
     const key = `${uniqueId}/original.${fileExtension}`;

     const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
          ContentType: fileInfo["content-type"]
     });

     const signedUrl = await getSignedUrl(s3client, command, { expiresIn: 600 });

     const uploadFileDbRecord = await db.uploadedFile.create({
          data: {
               userId: session.user.id,
               s3Key: key,
               displayName: fileInfo.filename,
               uploaded: false
          },
          select: {
               id: true
          }
     })

     return { success: true, signedUrl, key, uploadFileId: uploadFileDbRecord.id }
}