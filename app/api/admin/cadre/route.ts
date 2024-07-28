// app/api/cadre/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/auth-options";

const cadreSchema = z.object({
  name: z.string().min(3, "Cadre name must be at least 3 characters"),
  controllingDepartment: z
    .string()
    .min(1, "Controlling department is required"),
});

export async function POST(req: Request) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, controllingDepartment } = cadreSchema.parse(body);

    const newCadre = await prisma.cadre.create({
      data: {
        name,
        controllingDepartment,
        controllingAdminAuthority: "Department of Personnel",
      },
    });

    return NextResponse.json(newCadre, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating cadre:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
