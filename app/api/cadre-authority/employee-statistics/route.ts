import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/auth-options";

interface EmployeeStatistics {
  totalEmployees: number;
  employeesByDepartment: Record<string, number>;
  employeesByGender: Record<string, number>;
  employeesByAgeGroup: Record<string, number>;
  employeesByYearsOfService: Record<string, number>;
  retiringThisYear: number;
  retiringNextYear: number;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "CADRE_CONTROLLING_AUTHORITY") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { controlledCadres: true },
    });

    if (!user || user.controlledCadres.length === 0) {
      return NextResponse.json(
        { message: "No controlled cadres found" },
        { status: 404 }
      );
    }

    const controllingDepartments = user.controlledCadres
      .map((cadre) => cadre.controllingDepartment)
      .filter((department): department is string => department !== null);

    const employees = await prisma.employee.findMany({
      where: {
        department: { in: controllingDepartments },
        user: { role: "EMPLOYEE" },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            mobileNumber: true,
          },
        },
        cadre: {
          select: {
            name: true,
            controllingDepartment: true,
          },
        },
      },
    });

    const statistics: EmployeeStatistics = {
      totalEmployees: employees.length,
      employeesByDepartment: {},
      employeesByGender: {
        Male: 0,
        Female: 0,
        Other: 0,
      },
      employeesByAgeGroup: {},
      employeesByYearsOfService: {},
      retiringThisYear: 0,
      retiringNextYear: 0,
    };

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    employees.forEach((employee) => {
      // Department statistics
      statistics.employeesByDepartment[employee.department] =
        (statistics.employeesByDepartment[employee.department] || 0) + 1;

      // Gender statistics
      if (employee.gender === "Male" || employee.gender === "Female") {
        statistics.employeesByGender[employee.gender] += 1;
      } else {
        statistics.employeesByGender["Other"] += 1;
      }

      // Age group statistics
      if (employee.dateOfBirth) {
        const age = currentYear - new Date(employee.dateOfBirth).getFullYear();
        const ageGroup = `${Math.floor(age / 10) * 10}-${
          Math.floor(age / 10) * 10 + 9
        }`;
        statistics.employeesByAgeGroup[ageGroup] =
          (statistics.employeesByAgeGroup[ageGroup] || 0) + 1;
      }

      // Years of service statistics
      if (employee.dateOfInitialAppointment) {
        const yearsOfService =
          currentYear -
          new Date(employee.dateOfInitialAppointment).getFullYear();
        const serviceGroup = `${Math.floor(yearsOfService / 5) * 5}-${
          Math.floor(yearsOfService / 5) * 5 + 4
        }`;
        statistics.employeesByYearsOfService[serviceGroup] =
          (statistics.employeesByYearsOfService[serviceGroup] || 0) + 1;
      }

      // Retirement statistics
      if (employee.retirement) {
        const retirementYear = new Date(employee.retirement).getFullYear();
        if (retirementYear === currentYear) {
          statistics.retiringThisYear += 1;
        } else if (retirementYear === nextYear) {
          statistics.retiringNextYear += 1;
        }
      }
    });

    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Error fetching employee statistics:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
