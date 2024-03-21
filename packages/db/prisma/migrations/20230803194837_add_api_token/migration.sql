/*
  Warnings:

  - A unique constraint covering the columns `[apiToken]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "apiToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Token_apiToken_key" ON "Token"("apiToken");
