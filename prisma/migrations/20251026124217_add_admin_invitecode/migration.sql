-- CreateTable
CREATE TABLE "public"."AdminInviteCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AdminInviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminInviteCode_code_key" ON "public"."AdminInviteCode"("code");

-- AddForeignKey
ALTER TABLE "public"."AdminInviteCode" ADD CONSTRAINT "AdminInviteCode_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
