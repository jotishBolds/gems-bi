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
    const totalEmployees = await prisma.user.count({
      where: { role: "EMPLOYEE" },
    });
    const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
    const totalCadres = await prisma.cadre.count();

    const roleDistribution = await prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    });

    const cadreDistribution = await prisma.employee.groupBy({
      by: ["cadreId"],
      _count: { _all: true },
    });

    const currentDate = new Date();
    const sixMonthsFromNow = new Date(
      currentDate.setMonth(currentDate.getMonth() + 6)
    );

    const upcomingRetirements = await prisma.employee.findMany({
      where: {
        retirement: {
          lte: sixMonthsFromNow,
          gte: new Date(),
        },
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        cadre: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        retirement: "asc",
      },
    });

    return NextResponse.json({
      totalEmployees,
      totalAdmins,
      totalCadres,
      roleDistribution,
      cadreDistribution,
      upcomingRetirements,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
