-- CreateEnum
CREATE TYPE "public"."UploadStatus" AS ENUM ('pending', 'completed', 'failed');

-- AlterTable
ALTER TABLE "public"."Match" ADD COLUMN     "status" "public"."UploadStatus" NOT NULL DEFAULT 'completed';

-- AlterTable
ALTER TABLE "public"."Note" ALTER COLUMN "text" SET DATA TYPE CITEXT;
