import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/auth-options";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const recentRequests = await prisma.support.findMany({
      where: { employeeId: employee.id },
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5, // Limit to 5 most recent requests
    });

    return NextResponse.json(recentRequests);
  } catch (error) {
    console.error("Failed to fetch recent support requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent support requests" },
      { status: 500 }
    );
  }
}
