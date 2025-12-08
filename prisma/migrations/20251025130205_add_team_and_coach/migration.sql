-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'COACH', 'PLAYER');

-- AlterTable
ALTER TABLE "public"."Marking" ADD COLUMN     "coachNote" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "public"."Match" ADD COLUMN     "coachFeedback" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'PLAYER',
ADD COLUMN     "teamId" INTEGER;

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inviteCode" TEXT,
    "coachId" INTEGER NOT NULL,
    "inviteCodeExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_inviteCode_key" ON "public"."Team"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "Team_coachId_key" ON "public"."Team"("coachId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
