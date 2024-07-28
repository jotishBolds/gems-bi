/*
  Warnings:

  - Added the required column `controllingDepartment` to the `Cadre` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cadre" ADD COLUMN     "controllingDepartment" TEXT NOT NULL;
