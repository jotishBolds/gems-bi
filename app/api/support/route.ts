import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth-options";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supportRequests = await prisma.support.findMany({
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(supportRequests);
  } catch (error) {
    console.error("Failed to fetch support requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch support requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, description } = await req.json();
    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const supportRequest = await prisma.support.create({
      data: {
        subject,
        description,
        employeeId: employee.id,
        status: "OPEN", // Set initial status to OPEN
      },
    });

    return NextResponse.json(supportRequest, { status: 201 });
  } catch (error) {
    console.error("Failed to create support request:", error);
    return NextResponse.json(
      { error: "Failed to create support request" },
      { status: 500 }
    );
  }
}
