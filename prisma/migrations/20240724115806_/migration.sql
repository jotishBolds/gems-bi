-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_cadreId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_userId_fkey";

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "cadreId" DROP NOT NULL,
ALTER COLUMN "cadreSequence" DROP NOT NULL,
ALTER COLUMN "employeeId" DROP NOT NULL,
ALTER COLUMN "empname" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_cadreId_fkey" FOREIGN KEY ("cadreId") REFERENCES "Cadre"("id") ON DELETE SET NULL ON UPDATE CASCADE;
