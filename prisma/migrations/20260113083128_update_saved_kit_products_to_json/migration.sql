/*
  Warnings:

  - Changed the type of `products` on the `saved_kits` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "saved_kits" DROP COLUMN "products",
ADD COLUMN     "products" JSONB NOT NULL;
