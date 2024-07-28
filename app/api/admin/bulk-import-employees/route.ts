import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/auth-options";

const employeeSchema = z.object({
  empname: z.string().nonempty("Employee name is required"),
  dateOfBirth: z.string().optional().nullable(),
  cadre: z.string().nonempty("Cadre name is required"),
  department: z.string().nonempty("Department is required"),
  emailaddress: z.string().email().optional(),
  presentdesignation: z.string().optional(),
  fatherName: z.string().optional(),
  phoneNumber: z.string().optional(),
  gender: z.string().optional(),
  maritalstatus: z.string().optional(),
  spouseName: z.string().optional(),
  totalChildren: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  constituency: z.string().optional(),
  gpu: z.string().optional(),
  ward: z.string().optional(),
  pin: z.string().optional(),
  policestation: z.string().optional(),
  postoffice: z.string().optional(),
  dateOfInitialAppointment: z.string().optional(),
  dateOfAppointmentGazettedGrade: z.string().optional(),
  dateOfAppointmentPresentPost: z.string().optional(),
  TotalLengthOfSerive: z.string().optional(),
  retirement: z.string().optional(),
  dateOfLastPromotionSubstantive: z.string().optional(),
  dateOfLastPromotionOfficiating: z.string().optional(),
  natureOfEmployment: z.string().optional(),
});

type EmployeeInput = z.infer<typeof employeeSchema>;

function parseDate(dateString: string | null | undefined): Date | null {
  console.log(`Parsing date: ${dateString}, Type: ${typeof dateString}`);

  if (!dateString) {
    console.log("Date string is null or undefined");
    return null;
  }

  // Handle Excel date serial numbers
  if (!isNaN(Number(dateString))) {
    const excelDate = Number(dateString);
    console.log(`Detected Excel date serial number: ${excelDate}`);
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    const adjustedDate = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
    console.log(`Parsed Excel date: ${adjustedDate.toISOString()}`);
    return adjustedDate;
  }

  // Handle string dates
  let parts: string[];
  if (dateString.includes("/")) {
    // Handle US date format (month/day/year)
    parts = dateString.split("/");
    if (parts.length === 3) {
      let [month, day, year] = parts.map(Number);
      // Adjust year if it's in two-digit format
      if (year < 100) {
        year += year < 50 ? 2000 : 1900;
      }
      console.log(
        `Parsed US format - year: ${year}, month: ${month}, day: ${day}`
      );
      const date = new Date(Date.UTC(year, month - 1, day));
      console.log(`Parsed US format date: ${date.toISOString()}`);
      return date;
    }
  } else if (dateString.includes("-")) {
    // Handle ISO format (year-month-day)
    parts = dateString.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      console.log(
        `Parsed ISO format - year: ${year}, month: ${month}, day: ${day}`
      );
      const date = new Date(Date.UTC(year, month - 1, day));
      console.log(`Parsed ISO format date: ${date.toISOString()}`);
      return date;
    }
  }

  console.log(`Failed to parse date: ${dateString}`);
  return null;
}

async function findCadre(cadreName: string, department: string) {
  return await prisma.cadre.findFirst({
    where: {
      name: cadreName,
      controllingDepartment: department,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      defval: null,
      raw: false,
    });

    const results = {
      success: 0,
      errors: [] as string[],
    };

    for (const [index, row] of jsonData.entries()) {
      try {
        if (typeof row !== "object" || row === null) {
          throw new Error("Invalid row data");
        }

        // Convert all values to strings or null
        const stringRow: Partial<EmployeeInput> = Object.fromEntries(
          Object.entries(row as Record<string, unknown>).map(([key, value]) => [
            key,
            value === null ? null : String(value).trim(),
          ])
        );

        console.log("Row data:", stringRow); // Log the row data for debugging

        const validatedData = employeeSchema.parse(stringRow);

        console.log(
          `Row ${index + 2} DOB before parsing:`,
          validatedData.dateOfBirth
        );
        console.log(
          `Row ${index + 2} DOB type:`,
          typeof validatedData.dateOfBirth
        );

        const parsedDOB = parseDate(validatedData.dateOfBirth);
        console.log(
          `Row ${index + 2} DOB after parsing:`,
          parsedDOB?.toISOString() ?? "null"
        );

        // Find the cadre
        const cadre = await findCadre(
          validatedData.cadre,
          validatedData.department
        );

        if (!cadre) {
          throw new Error(
            `Cadre "${validatedData.cadre}" not found for department "${validatedData.department}"`
          );
        }

        // Prepare the data for Prisma, handling required fields and date parsing
        const employeeData = {
          empname: validatedData.empname,
          dateOfBirth: parsedDOB,
          department: validatedData.department,
          cadreId: cadre.id,
          emailaddress:
            validatedData.emailaddress || `employee${index + 2}@example.com`,
          presentdesignation: validatedData.presentdesignation || null,
          fatherName: validatedData.fatherName || null,
          phoneNumber: validatedData.phoneNumber || `employee${index + 2}`,
          gender: validatedData.gender || null,
          maritalstatus: validatedData.maritalstatus || null,
          spouseName: validatedData.spouseName || null,
          totalChildren: validatedData.totalChildren || null,
          state: validatedData.state || null,
          district: validatedData.district || null,
          constituency: validatedData.constituency || null,
          gpu: validatedData.gpu || null,
          ward: validatedData.ward || null,
          pin: validatedData.pin || null,
          policestation: validatedData.policestation || null,
          postoffice: validatedData.postoffice || null,
          dateOfInitialAppointment: parseDate(
            validatedData.dateOfInitialAppointment
          ),
          dateOfAppointmentGazettedGrade: parseDate(
            validatedData.dateOfAppointmentGazettedGrade
          ),
          dateOfAppointmentPresentPost: parseDate(
            validatedData.dateOfAppointmentPresentPost
          ),
          TotalLengthOfSerive: validatedData.TotalLengthOfSerive || null,
          retirement: parseDate(validatedData.retirement),
          dateOfLastPromotionSubstantive: parseDate(
            validatedData.dateOfLastPromotionSubstantive
          ),
          dateOfLastPromotionOfficiating: parseDate(
            validatedData.dateOfLastPromotionOfficiating
          ),
          natureOfEmployment: validatedData.natureOfEmployment || null,
        };

        console.log(
          `Row ${index + 2} final employeeData:`,
          JSON.stringify(employeeData, null, 2)
        );

        // Create the employee
        await prisma.employee.create({
          data: employeeData,
        });

        results.success++;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.errors
            .map((err) => {
              const field = err.path.join(".");
              return `${field}: ${err.message}`;
            })
            .join(", ");
          results.errors.push(`Row ${index + 2}: ${errorMessages}`);
        } else if (error instanceof Error) {
          results.errors.push(`Row ${index + 2}: ${error.message}`);
        } else {
          results.errors.push(`Row ${index + 2}: Unknown error`);
        }
      }
    }

    return NextResponse.json({
      message: "Import completed",
      results,
    });
  } catch (error) {
    console.error("Error in bulk import:", error);
    return NextResponse.json(
      { error: "Failed to process the uploaded file" },
      { status: 500 }
    );
  }
}
