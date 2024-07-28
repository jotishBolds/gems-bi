import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/auth-options";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { username, email, password, mobileNumber, role, cadreIds } =
    await req.json();

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }, { mobileNumber }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { message: "Username already exists" },
          { status: 400 }
        );
      }
      if (existingUser.mobileNumber === mobileNumber) {
        return NextResponse.json(
          { message: "Mobile number already exists" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        mobileNumber,
        role,
      },
    });

    if (
      role === "CADRE_CONTROLLING_AUTHORITY" &&
      cadreIds &&
      cadreIds.length > 0
    ) {
      await prisma.cadre.updateMany({
        where: {
          id: {
            in: cadreIds,
          },
        },
        data: {
          controllingUserId: newUser.id,
        },
      });
    }

    return NextResponse.json(
      { message: "User registered successfully", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Error registering user" },
      { status: 500 }
    );
  }
}
