-- AlterTable
ALTER TABLE "public"."Marking" ADD COLUMN     "my_techinque_id" INTEGER,
ADD COLUMN     "opponent_techinque_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."Technique" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" INTEGER,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Technique_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_my_techinque_id_fkey" FOREIGN KEY ("my_techinque_id") REFERENCES "public"."Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_opponent_techinque_id_fkey" FOREIGN KEY ("opponent_techinque_id") REFERENCES "public"."Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Technique" ADD CONSTRAINT "Technique_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Technique" ADD CONSTRAINT "Technique_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
