/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar_url" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "google_id" TEXT;

-- CreateIndex
CREATE INDEX "Token_user_id_type_idx" ON "Token"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_login_idx" ON "User"("login");
