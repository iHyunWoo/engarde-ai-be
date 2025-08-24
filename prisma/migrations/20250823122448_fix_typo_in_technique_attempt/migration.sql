/*
  Warnings:

  - You are about to drop the column `attemptCount` on the `TechniqueAttempt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."TechniqueAttempt" DROP COLUMN "attemptCount",
ADD COLUMN     "attempt_count" INTEGER NOT NULL DEFAULT 0;
