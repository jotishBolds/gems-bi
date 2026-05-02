-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('REGULAR_PERMANENT', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "TemporarySubType" AS ENUM ('ADHOC', 'CONSOLIDATED', 'MUSTER_ROLL', 'WORK_CHARGE', 'DAILY_WAGES');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "employmentType" "EmploymentType",
ADD COLUMN     "temporarySubType" "TemporarySubType";
