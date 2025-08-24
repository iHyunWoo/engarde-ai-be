-- DropForeignKey
ALTER TABLE "public"."Marking" DROP CONSTRAINT "Marking_my_technique_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Marking" DROP CONSTRAINT "Marking_opponent_technique_id_fkey";

-- AlterTable
ALTER TABLE "public"."Marking" ALTER COLUMN "my_technique_id" DROP NOT NULL,
ALTER COLUMN "opponent_technique_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_my_technique_id_fkey" FOREIGN KEY ("my_technique_id") REFERENCES "public"."Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_opponent_technique_id_fkey" FOREIGN KEY ("opponent_technique_id") REFERENCES "public"."Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;
