/*
  Warnings:

  - You are about to drop the column `verificationStatus` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "verificationStatus";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'Pending';
