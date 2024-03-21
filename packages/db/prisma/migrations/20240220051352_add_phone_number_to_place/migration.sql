/*
  Warnings:

  - You are about to drop the column `latitude` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Place` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Place" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "phoneNumber" TEXT;
