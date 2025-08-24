/*
  Warnings:

  - Made the column `opponent_id` on table `Match` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Match" DROP CONSTRAINT "Match_opponent_id_fkey";

-- AlterTable
ALTER TABLE "public"."Match" ALTER COLUMN "opponent_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_opponent_id_fkey" FOREIGN KEY ("opponent_id") REFERENCES "public"."Opponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
