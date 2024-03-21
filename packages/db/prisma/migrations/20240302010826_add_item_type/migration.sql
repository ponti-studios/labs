-- CreateEnum
CREATE TYPE "ListItemType" AS ENUM ('FLIGHT', 'PLACE');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "itemType" "ListItemType" NOT NULL DEFAULT 'PLACE';
