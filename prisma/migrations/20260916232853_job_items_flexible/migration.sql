/*
  Warnings:

  - You are about to drop the column `unitPrice` on the `JobItem` table. All the data in the column will be lost.
  - Added the required column `name` to the `JobItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitCost` to the `JobItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "JobItem" DROP CONSTRAINT "JobItem_productId_fkey";

-- AlterTable
ALTER TABLE "JobItem" DROP COLUMN "unitPrice",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "unitCost" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "JobItem" ADD CONSTRAINT "JobItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
