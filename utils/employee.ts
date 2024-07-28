import prisma from "@/lib/prisma";

export async function fetchEmployeeData(id: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        cadre: true,
      },
    });
    return employee;
  } catch (error) {
    console.error("Error fetching employee data:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
