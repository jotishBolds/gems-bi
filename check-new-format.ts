import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmployeeIdFormat() {
  try {
    const employees = await prisma.employee.findMany({
      select: { employeeId: true, empname: true },
      take: 10,
      orderBy: { employeeId: 'asc' }
    });

    console.log('New Employee ID Format:');
    console.log('================================');
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.employeeId} - ${emp.empname}`);
    });

    // Test the regex pattern
    const regex = /^\d+\/[A-Z]+\/\d+$/;
    console.log('\nValidation Test:');
    employees.forEach((emp, index) => {
      const isValid = regex.test(emp.employeeId || '');
      console.log(`${index + 1}. ${emp.employeeId} - ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error checking employee IDs:', error);
    await prisma.$disconnect();
  }
}

checkEmployeeIdFormat();