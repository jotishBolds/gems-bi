/*
  Warnings:

  - You are about to drop the column `address` on the `Employee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[permanentAddressId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[temporaryAddressId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "address",
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "permanentAddressId" TEXT,
ADD COLUMN     "temporaryAddressId" TEXT;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "constituency" TEXT NOT NULL,
    "gpu" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "pinCode" TEXT,
    "policeStation" TEXT NOT NULL,
    "postOffice" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_permanentAddressId_key" ON "Employee"("permanentAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_temporaryAddressId_key" ON "Employee"("temporaryAddressId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_permanentAddressId_fkey" FOREIGN KEY ("permanentAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_temporaryAddressId_fkey" FOREIGN KEY ("temporaryAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
