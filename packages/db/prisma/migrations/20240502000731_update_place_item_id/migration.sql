/*
  Warnings:

  - You are about to drop the column `lat` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Place` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Place" DROP COLUMN "lat",
DROP COLUMN "lng";
