import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        employeeId: true,
        empname: true,
        phoneNumber: true,
      },
      orderBy: {
        employeeId: "asc",
      },
    });

    console.log("Current employees in database:");
    console.log("Total employees:", employees.length);
    employees.forEach((emp, index) => {
      console.log(
        `${index + 1}. ID: ${emp.employeeId}, Name: ${emp.empname}, Phone: ${
          emp.phoneNumber
        }`
      );
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error checking employees:", error);
    await prisma.$disconnect();
  }
}

checkEmployees();
