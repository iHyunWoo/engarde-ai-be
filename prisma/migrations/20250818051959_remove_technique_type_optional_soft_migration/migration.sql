/*
  Warnings:

  - Made the column `type` on table `Technique` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Technique" ALTER COLUMN "type" SET NOT NULL;
