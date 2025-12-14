/*
  Warnings:

  - Made the column `pisteLocation` on table `Marking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Marking" ALTER COLUMN "pisteLocation" SET NOT NULL;
