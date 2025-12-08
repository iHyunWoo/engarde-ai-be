/*
  Warnings:

  - You are about to drop the `AdminInviteCode` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[adminInviteCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."AdminInviteCode" DROP CONSTRAINT "AdminInviteCode_createdBy_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "adminInviteCode" TEXT,
ADD COLUMN     "adminInviteCodeExpiresAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."AdminInviteCode";

-- CreateIndex
CREATE UNIQUE INDEX "User_adminInviteCode_key" ON "public"."User"("adminInviteCode");
