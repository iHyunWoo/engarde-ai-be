/*
  Warnings:

  - You are about to drop the column `note_id` on the `Marking` table. All the data in the column will be lost.
  - Added the required column `note` to the `Marking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Marking" DROP CONSTRAINT "Marking_note_id_fkey";

-- AlterTable
ALTER TABLE "public"."Marking" DROP COLUMN "note_id",
ADD COLUMN     "note" TEXT NOT NULL;
