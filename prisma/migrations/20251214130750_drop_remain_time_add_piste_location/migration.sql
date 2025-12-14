/*
  Warnings:

  - You are about to drop the column `remainTime` on the `Marking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Marking" DROP COLUMN "remainTime",
ADD COLUMN     "pisteLocation" INTEGER DEFAULT 0;
