import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth-options";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        mobileNumber: true,
        role: true,
        verificationStatus: true,
        employee: {
          select: {
            profileImage: true,
          },
        },
      },
    });

    // Transform the result to maintain the existing structure
    // while adding the profileImage if it exists
    const transformedUsers = users.map((user) => ({
      ...user,
      profileImage: user.employee?.profileImage || null,
      employee: undefined, // Remove the employee object to maintain previous structure
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
