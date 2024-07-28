/*
  Warnings:

  - You are about to drop the column `maritalStatus` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `permanentAddressId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `temporaryAddressId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_permanentAddressId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_temporaryAddressId_fkey";

-- DropIndex
DROP INDEX "Employee_permanentAddressId_key";

-- DropIndex
DROP INDEX "Employee_temporaryAddressId_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "maritalStatus",
DROP COLUMN "permanentAddressId",
DROP COLUMN "temporaryAddressId",
ADD COLUMN     "address" TEXT;

-- DropTable
DROP TABLE "Address";
