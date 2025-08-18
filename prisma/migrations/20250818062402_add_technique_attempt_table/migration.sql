/*
  Warnings:

  - You are about to drop the column `attack_attempt_count` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `counter_attack_attempt_count` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `parry_attempt_count` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Match" DROP COLUMN "attack_attempt_count",
DROP COLUMN "counter_attack_attempt_count",
DROP COLUMN "parry_attempt_count";

-- CreateTable
CREATE TABLE "public"."TechniqueAttempt" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "technique_id" INTEGER NOT NULL,
    "match_id" INTEGER,
    "attemptCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "TechniqueAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TechniqueAttempt" ADD CONSTRAINT "TechniqueAttempt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TechniqueAttempt" ADD CONSTRAINT "TechniqueAttempt_technique_id_fkey" FOREIGN KEY ("technique_id") REFERENCES "public"."Technique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TechniqueAttempt" ADD CONSTRAINT "TechniqueAttempt_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;
