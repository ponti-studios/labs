/*
  Warnings:

  - You are about to drop the column `listId` on the `Place` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[listId,itemId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - Made the column `listId` on table `Item` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_listId_fkey";

-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_itemId_fkey";

-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_listId_fkey";

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "listId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "listId";

-- CreateIndex
CREATE UNIQUE INDEX "Item_listId_itemId_key" ON "Item"("listId", "itemId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
