/*
  Warnings:

  - You are about to drop the column `address` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "address",
ADD COLUMN     "constituency" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "gpu" TEXT,
ADD COLUMN     "maritalstatus" TEXT,
ADD COLUMN     "pin" TEXT,
ADD COLUMN     "policestation" TEXT,
ADD COLUMN     "postoffice" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "ward" TEXT;
