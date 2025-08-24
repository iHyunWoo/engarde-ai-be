-- CreateEnum
CREATE TYPE "public"."TechniqueType" AS ENUM ('attack', 'defense', 'etc');

-- AlterTable
ALTER TABLE "public"."Technique" ADD COLUMN     "type" "public"."TechniqueType";
