/*
  Warnings:

  - The values [USER] on the enum `RoleType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[employeeId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cadreSequence` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoleType_new" AS ENUM ('ADMIN', 'CADRE_CONTROLLING_AUTHORITY', 'EMPLOYEE', 'CM', 'CS', 'DOP');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "RoleType_new" USING ("role"::text::"RoleType_new");
ALTER TYPE "RoleType" RENAME TO "RoleType_old";
ALTER TYPE "RoleType_new" RENAME TO "RoleType";
DROP TYPE "RoleType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Cadre" ADD COLUMN     "lastSequenceNumber" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "cadreSequence" INTEGER NOT NULL,
ADD COLUMN     "employeeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "otpExpiry" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee"("employeeId");
