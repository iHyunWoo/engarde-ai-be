-- DropForeignKey
ALTER TABLE "public"."Team" DROP CONSTRAINT "Team_coachId_fkey";

-- AlterTable
ALTER TABLE "public"."Team" ALTER COLUMN "coachId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
