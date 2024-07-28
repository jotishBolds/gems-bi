import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/auth-options";
import { exportToPDF } from "@/components/cadre-export/pdf-export/export-pdf";
import { Employee } from "@/lib/types/em-types";
import { exportToCSV } from "@/components/cadre-export/csv-export/export-csv";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "CADRE_CONTROLLING_AUTHORITY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format");
  const ids = searchParams.get("ids");

  if (!format || (format !== "pdf" && format !== "csv")) {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  try {
    let employees: Employee[];

    if (ids) {
      const employeeIds = ids.split(",");
      employees = await prisma.employee.findMany({
        where: {
          id: { in: employeeIds },
          cadre: {
            controllingUserId: session.user.id,
          },
        },
        include: {
          user: true,
          cadre: true,
        },
      });
    } else {
      employees = await prisma.employee.findMany({
        where: {
          cadre: {
            controllingUserId: session.user.id,
          },
        },
        include: {
          user: true,
          cadre: true,
        },
      });
    }

    let result: ArrayBuffer | string;
    let contentType: string;
    let fileName: string;

    if (format === "pdf") {
      result = await exportToPDF(employees);
      contentType = "application/pdf";
      fileName = "employees_export.pdf";
    } else {
      result = await exportToCSV(employees);
      contentType = "text/csv";
      fileName = "employees_export.csv";
    }

    const response = new NextResponse(result);
    response.headers.set("Content-Type", contentType);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    return response;
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Error exporting data" },
      { status: 500 }
    );
  }
}
