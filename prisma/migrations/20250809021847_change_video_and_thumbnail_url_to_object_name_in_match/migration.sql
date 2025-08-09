/*
  Warnings:

  - You are about to drop the column `thumbnail_url` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `video_url` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Match" DROP COLUMN "thumbnail_url",
DROP COLUMN "video_url",
ADD COLUMN     "object_name" TEXT NOT NULL DEFAULT '';
