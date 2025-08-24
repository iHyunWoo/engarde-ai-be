-- AlterTable
ALTER TABLE "public"."Marking" ADD COLUMN     "my_technique_id" INTEGER,
ADD COLUMN     "opponent_technique_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_my_technique_id_fkey" FOREIGN KEY ("my_technique_id") REFERENCES "public"."Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_opponent_technique_id_fkey" FOREIGN KEY ("opponent_technique_id") REFERENCES "public"."Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;
