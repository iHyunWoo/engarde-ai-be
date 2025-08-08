/*
  Warnings:

  - Added the required column `remain_time` to the `Marking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Marking" ADD COLUMN     "remain_time" INTEGER NOT NULL;
