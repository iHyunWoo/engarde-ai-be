/*
  Warnings:

  - You are about to drop the column `attack_attempts` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Match` table. All the data in the column will be lost.
  - Added the required column `attack_attempt_count` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `counter_attack_attempt_count` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `my_score` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opponent_score` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parry_attempt_count` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tournament_date` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Match" DROP COLUMN "attack_attempts",
DROP COLUMN "date",
ADD COLUMN     "attack_attempt_count" INTEGER NOT NULL,
ADD COLUMN     "counter_attack_attempt_count" INTEGER NOT NULL,
ADD COLUMN     "my_score" INTEGER NOT NULL,
ADD COLUMN     "opponent_score" INTEGER NOT NULL,
ADD COLUMN     "parry_attempt_count" INTEGER NOT NULL,
ADD COLUMN     "tournament_date" TIMESTAMP(3) NOT NULL;
