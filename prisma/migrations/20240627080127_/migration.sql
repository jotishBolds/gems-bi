/*
  Warnings:

  - You are about to drop the column `basicPay` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `currentGrade` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `designation` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `employeeCode` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `joiningDate` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the `LeaveRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Promotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Qualification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Training` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transfer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `TotalLengthOfSerive` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfAppointmentGazettedGrade` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfAppointmentPresentPost` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfInitialAppointment` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailaddress` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentdesignation` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `retirement` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LeaveRecord" DROP CONSTRAINT "LeaveRecord_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Qualification" DROP CONSTRAINT "Qualification_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceDetail" DROP CONSTRAINT "ServiceDetail_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Training" DROP CONSTRAINT "Training_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_employeeId_fkey";

-- DropIndex
DROP INDEX "Employee_employeeCode_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "basicPay",
DROP COLUMN "currentGrade",
DROP COLUMN "designation",
DROP COLUMN "employeeCode",
DROP COLUMN "joiningDate",
ADD COLUMN     "TotalLengthOfSerive" TEXT NOT NULL,
ADD COLUMN     "dateOfAppointmentGazettedGrade" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dateOfAppointmentPresentPost" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dateOfInitialAppointment" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "emailaddress" TEXT NOT NULL,
ADD COLUMN     "fatherName" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "presentdesignation" TEXT NOT NULL,
ADD COLUMN     "retirement" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "LeaveRecord";

-- DropTable
DROP TABLE "Promotion";

-- DropTable
DROP TABLE "Qualification";

-- DropTable
DROP TABLE "ServiceDetail";

-- DropTable
DROP TABLE "Training";

-- DropTable
DROP TABLE "Transfer";

-- CreateIndex
CREATE UNIQUE INDEX "Employee_phoneNumber_key" ON "Employee"("phoneNumber");
