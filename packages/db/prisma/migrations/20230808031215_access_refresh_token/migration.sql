/*
  Warnings:

  - You are about to drop the column `apiToken` on the `Token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accessToken]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refreshToken]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Token_apiToken_key";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "apiToken",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "refreshToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Token_accessToken_key" ON "Token"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Token_refreshToken_key" ON "Token"("refreshToken");
