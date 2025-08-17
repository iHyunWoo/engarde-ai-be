/*
  Warnings:

  - You are about to drop the column `opponent_name` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `opponent_team` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Match" DROP COLUMN "opponent_name",
DROP COLUMN "opponent_team";
