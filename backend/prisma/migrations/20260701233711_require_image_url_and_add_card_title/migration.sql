/*
  Warnings:

  - Made the column `imageUrl` on table `Board` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `title` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Board" ALTER COLUMN "imageUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "title" TEXT NOT NULL;
