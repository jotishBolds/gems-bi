// app/api/cadre-authority/employees/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/auth-options";

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

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
