/*
  Warnings:

  - You are about to drop the column `note` on the `Marking` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Note` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,text]` on the table `Note` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `text` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
create extension if not exists citext;

-- AlterTable
ALTER TABLE "public"."Marking" DROP COLUMN "note",
ADD COLUMN     "note_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."Note" DROP COLUMN "content",
DROP COLUMN "deleted_at",
ADD COLUMN     "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "text" CITEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Note_user_id_text_key" ON "public"."Note"("user_id", "text");

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "public"."Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;
