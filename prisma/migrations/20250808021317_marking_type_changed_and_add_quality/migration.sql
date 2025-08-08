/*
  Warnings:

  - You are about to drop the column `attack_type` on the `Marking` table. All the data in the column will be lost.
  - You are about to drop the column `defense_type` on the `Marking` table. All the data in the column will be lost.
  - Added the required column `my_type` to the `Marking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `note` to the `Marking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opponent_type` to the `Marking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quality` to the `Marking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MarkingType" AS ENUM ('none', 'lunge', 'advanced_lunge', 'fleche', 'push', 'parry', 'counter_attack');

-- CreateEnum
CREATE TYPE "public"."MarkingQuality" AS ENUM ('good', 'bad', 'lucky');

-- AlterTable
ALTER TABLE "public"."Marking" DROP COLUMN "attack_type",
DROP COLUMN "defense_type",
ADD COLUMN     "my_type" "public"."MarkingType" NOT NULL,
ADD COLUMN     "note" TEXT NOT NULL,
ADD COLUMN     "opponent_type" "public"."MarkingType" NOT NULL,
ADD COLUMN     "quality" "public"."MarkingQuality" NOT NULL;

-- DropEnum
DROP TYPE "public"."AttackType";

-- DropEnum
DROP TYPE "public"."DefenseType";
