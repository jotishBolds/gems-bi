import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkEmployeeIdFormat() {
  try {
    const employees = await prisma.employee.findMany({
      select: { employeeId: true },
      take: 10,
      orderBy: { employeeId: "asc" },
    });

    console.log("Current Employee ID Format:");
    console.log("================================");
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.employeeId}`);
    });

    // Analyze the format
    if (employees.length > 0) {
      const firstId = employees[0].employeeId;
      console.log("\nFormat Analysis:");
      console.log(`- Length: ${firstId?.length} characters`);
      console.log(`- Starts with: ${firstId?.substring(0, 3)}`);
      console.log(`- Pattern: ${firstId?.replace(/\d/g, "X")}`);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error checking employee IDs:", error);
    await prisma.$disconnect();
  }
}

checkEmployeeIdFormat();
