-- CreateEnum
CREATE TYPE "public"."Result" AS ENUM ('win', 'lose', 'attempt');

-- CreateEnum
CREATE TYPE "public"."MatchStage" AS ENUM ('preliminary', 'main');

-- CreateEnum
CREATE TYPE "public"."MarkingQuality" AS ENUM ('good', 'bad', 'lucky');

-- CreateEnum
CREATE TYPE "public"."TechniqueType" AS ENUM ('attack', 'defense', 'etc');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Match" (
    "id" SERIAL NOT NULL,
    "tournamentName" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "myScore" INTEGER NOT NULL,
    "opponentScore" INTEGER NOT NULL,
    "tournamentDate" TIMESTAMP(3) NOT NULL,
    "objectName" TEXT NOT NULL DEFAULT '',
    "opponentId" INTEGER NOT NULL,
    "stage" "public"."MatchStage" NOT NULL DEFAULT 'preliminary',

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Marking" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "timestamp" DOUBLE PRECISION NOT NULL,
    "result" "public"."Result" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "quality" "public"."MarkingQuality" NOT NULL,
    "remainTime" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "myTechniqueId" INTEGER,
    "opponentTechniqueId" INTEGER,

    CONSTRAINT "Marking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Note" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" CITEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Opponent" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Opponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Technique" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "public"."TechniqueType" NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Technique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TechniqueAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "techniqueId" INTEGER NOT NULL,
    "matchId" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TechniqueAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Note_user_id_text_key" ON "public"."Note"("userId", "text");

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_opponent_id_fkey" FOREIGN KEY ("opponentId") REFERENCES "public"."Opponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_match_id_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_my_technique_id_fkey" FOREIGN KEY ("myTechniqueId") REFERENCES "public"."Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_opponent_technique_id_fkey" FOREIGN KEY ("opponentTechniqueId") REFERENCES "public"."Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Marking" ADD CONSTRAINT "Marking_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Note" ADD CONSTRAINT "Note_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Opponent" ADD CONSTRAINT "Opponent_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Technique" ADD CONSTRAINT "Technique_parent_id_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Technique" ADD CONSTRAINT "Technique_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TechniqueAttempt" ADD CONSTRAINT "TechniqueAttempt_match_id_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TechniqueAttempt" ADD CONSTRAINT "TechniqueAttempt_technique_id_fkey" FOREIGN KEY ("techniqueId") REFERENCES "public"."Technique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TechniqueAttempt" ADD CONSTRAINT "TechniqueAttempt_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
