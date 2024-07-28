/*
  Warnings:

  - You are about to drop the column `firstName` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Employee` table. All the data in the column will be lost.
  - Added the required column `empname` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "empname" TEXT NOT NULL;
