/*
  Warnings:

  - You are about to drop the column `controllingAuthority` on the `Cadre` table. All the data in the column will be lost.
  - You are about to drop the column `controllingDepartment` on the `Cadre` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[controllingAdminAuthorityId]` on the table `Cadre` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `controllingAdminAuthorityId` to the `Cadre` table without a default value. This is not possible if the table is not empty.
  - Added the required column `controllingDepartmentId` to the `Cadre` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cadre" DROP COLUMN "controllingAuthority",
DROP COLUMN "controllingDepartment",
ADD COLUMN     "controllingAdminAuthorityId" TEXT NOT NULL,
ADD COLUMN     "controllingDepartmentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cadre_controllingAdminAuthorityId_key" ON "Cadre"("controllingAdminAuthorityId");

-- AddForeignKey
ALTER TABLE "Cadre" ADD CONSTRAINT "Cadre_controllingAdminAuthorityId_fkey" FOREIGN KEY ("controllingAdminAuthorityId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cadre" ADD CONSTRAINT "Cadre_controllingDepartmentId_fkey" FOREIGN KEY ("controllingDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
