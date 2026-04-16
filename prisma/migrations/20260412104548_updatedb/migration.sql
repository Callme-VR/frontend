/*
  Warnings:

  - You are about to drop the column `description` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Clip` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Clip" DROP CONSTRAINT "Clip_uploadedFileId_fkey";

-- AlterTable
ALTER TABLE "Clip" DROP COLUMN "description",
DROP COLUMN "duration",
DROP COLUMN "status",
DROP COLUMN "title";

-- CreateIndex
CREATE INDEX "Clip_s3Key_idx" ON "Clip"("s3Key");

-- CreateIndex
CREATE INDEX "UploadedFile_s3Key_idx" ON "UploadedFile"("s3Key");

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "UploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
