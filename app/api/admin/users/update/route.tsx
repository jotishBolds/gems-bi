import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
      },
      select: {
        id: true,
        email: true,
        username: true,
        mobileNumber: true,
        role: true,
        verificationStatus: true,
        createdAt: true,
        employee: {
          select: {
            employeeId: true,
            empname: true,
            fatherName: true,
            profileImage: true,
            dateOfBirth: true,
            gender: true,
            maritalstatus: true,
            department: true,
            presentdesignation: true,
            dateOfInitialAppointment: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Transform the result to include employee details directly in the user object
    const transformedUsers = users.map((user) => ({
      ...user,
      employee: user.employee
        ? {
            ...user.employee,
            dateOfBirth: user.employee.dateOfBirth
              ? user.employee.dateOfBirth.toISOString()
              : null,
            dateOfInitialAppointment: user.employee.dateOfInitialAppointment
              ? user.employee.dateOfInitialAppointment.toISOString()
              : null,
          }
        : null,
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
