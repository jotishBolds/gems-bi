/*
  Warnings:

  - You are about to drop the column `controllingAdminAuthorityId` on the `Cadre` table. All the data in the column will be lost.
  - You are about to drop the column `controllingDepartmentId` on the `Cadre` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[controllingUserId]` on the table `Cadre` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `controllingAdminAuthority` to the `Cadre` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cadre" DROP CONSTRAINT "Cadre_controllingAdminAuthorityId_fkey";

-- DropForeignKey
ALTER TABLE "Cadre" DROP CONSTRAINT "Cadre_controllingDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_departmentId_fkey";

-- DropIndex
DROP INDEX "Cadre_controllingAdminAuthorityId_key";

-- AlterTable
ALTER TABLE "Cadre" DROP COLUMN "controllingAdminAuthorityId",
DROP COLUMN "controllingDepartmentId",
ADD COLUMN     "controllingAdminAuthority" TEXT NOT NULL,
ADD COLUMN     "controllingDepartment" TEXT,
ADD COLUMN     "controllingUserId" TEXT;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "departmentId",
ADD COLUMN     "department" TEXT NOT NULL;

-- DropTable
DROP TABLE "Department";

-- CreateIndex
CREATE UNIQUE INDEX "Cadre_controllingUserId_key" ON "Cadre"("controllingUserId");

-- AddForeignKey
ALTER TABLE "Cadre" ADD CONSTRAINT "Cadre_controllingUserId_fkey" FOREIGN KEY ("controllingUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
