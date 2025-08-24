-- CreateEnum
CREATE TYPE "public"."MatchStage" AS ENUM ('preliminary', 'main');

-- AlterTable
ALTER TABLE "public"."Match" ADD COLUMN     "stage" "public"."MatchStage" NOT NULL DEFAULT 'preliminary';
