import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const uniqueDepartments = url.searchParams.get("uniqueDepartments");
  const department = url.searchParams.get("department");

  try {
    if (uniqueDepartments) {
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

      const uniqueDepartmentsList = departments
        .map((cadre) => cadre.controllingDepartment)
        .filter(Boolean);

      return NextResponse.json(uniqueDepartmentsList);
    } else if (department) {
      const cadres = await prisma.cadre.findMany({
        where: {
          controllingDepartment: department,
          controllingUserId: null,
        },
        select: {
          id: true,
          name: true,
          controllingAdminAuthority: true,
          controllingDepartment: true,
        },
      });
      return NextResponse.json(cadres);
    } else {
      const cadres = await prisma.cadre.findMany({
        select: {
          id: true,
          name: true,
          controllingAdminAuthority: true,
          controllingDepartment: true,
        },
      });
      return NextResponse.json(cadres);
    }
  } catch (error) {
    console.error("Failed to fetch cadres:", error);
    return NextResponse.json(
      { error: "Failed to fetch cadres" },
      { status: 500 }
    );
  }
}