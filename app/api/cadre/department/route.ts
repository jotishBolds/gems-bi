import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const departments = await prisma.cadre.findMany({
      select: {
        controllingDepartment: true,
      },
      distinct: ["controllingDepartment"],
      where: {
        controllingDepartment: {
          not: null,
        },
      },
    });

    const uniqueDepartments = departments
      .map((cadre) => cadre.controllingDepartment)
      .filter(Boolean);

    return NextResponse.json(uniqueDepartments);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}
