/*
  Warnings:

  - You are about to drop the column `my_type` on the `Marking` table. All the data in the column will be lost.
  - You are about to drop the column `opponent_type` on the `Marking` table. All the data in the column will be lost.
  - Made the column `my_techinque_id` on table `Marking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `opponent_techinque_id` on table `Marking` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Marking" DROP CONSTRAINT "Marking_my_techinque_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Marking" DROP CONSTRAINT "Marking_opponent_techinque_id_fkey";

-- AlterTable
ALTER TABLE "public"."Marking" DROP COLUMN "my_type",
DROP COLUMN "opponent_type",
ALTER COLUMN "my_techinque_id" SET NOT NULL,
ALTER COLUMN "opponent_techinque_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_my_techinque_id_fkey" FOREIGN KEY ("my_techinque_id") REFERENCES "public"."Technique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_opponent_techinque_id_fkey" FOREIGN KEY ("opponent_techinque_id") REFERENCES "public"."Technique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
