import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth-options";
import path from "path";
import fs from "fs/promises";

interface EmployeeData {
  empname: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailaddress: string;
  maritalstatus: string;
  state: string;
  district: string;
  constituency: string;
  gpu: string;
  ward: string;
  pin: string;
  policestation: string;
  postoffice: string;
  department: string;
  presentdesignation: string;
  departmentOfPosting: string;
  dateOfInitialAppointment: string;
  dateOfAppointmentGazettedGrade: string;
  dateOfAppointmentPresentPost: string;
  TotalLengthOfSerive: string;
  retirement: string;
  dateOfLastPromotionSubstantive: string;
  dateOfLastPromotionOfficiating: string;
  natureOfEmployment: string;
  spouseName?: string | null;
  totalChildren?: string | null;
}

const calculateRetirementDate = (dateOfBirth: string): string => {
  const dob = new Date(dateOfBirth);
  const retirementDate = new Date(dob);
  retirementDate.setFullYear(dob.getFullYear() + 60);
  return retirementDate.toISOString();
};

const safeParseDate = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};
// GET request handler
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { userId: params.id },
      include: {
        cadre: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            mobileNumber: true,
            role: true,
            isVerified: true,
            verificationStatus: true,
          },
        },
      },
    });
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee details" },
      { status: 500 }
    );
  }
}

// POST request handler

// Updated POST request handler
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const employeeData: Partial<EmployeeData> = {
      empname: formData.get("empname") as string,
      fatherName: formData.get("fatherName") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      gender: formData.get("gender") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      emailaddress: formData.get("emailaddress") as string,
      maritalstatus: formData.get("maritalstatus") as string,
      state: formData.get("state") as string,
      district: formData.get("district") as string,
      constituency: formData.get("constituency") as string,
      gpu: formData.get("gpu") as string,
      ward: formData.get("ward") as string,
      pin: formData.get("pin") as string,
      policestation: formData.get("policestation") as string,
      postoffice: formData.get("postoffice") as string,
      department: formData.get("department") as string,
      departmentOfPosting: formData.get("departmentOfPosting") as string,
      presentdesignation: formData.get("presentdesignation") as string,
      spouseName: formData.get("spouseName") as string | undefined,
      totalChildren: formData.get("totalChildren") as string | undefined,
      dateOfInitialAppointment: formData.get(
        "dateOfInitialAppointment"
      ) as string,
      dateOfAppointmentGazettedGrade: formData.get(
        "dateOfAppointmentGazettedGrade"
      ) as string,
      dateOfAppointmentPresentPost: formData.get(
        "dateOfAppointmentPresentPost"
      ) as string,
      TotalLengthOfSerive: formData.get("TotalLengthOfSerive") as string,
      retirement: formData.get("retirement") as string,
      dateOfLastPromotionSubstantive: formData.get(
        "dateOfLastPromotionSubstantive"
      ) as string,
      dateOfLastPromotionOfficiating: formData.get(
        "dateOfLastPromotionOfficiating"
      ) as string,
      natureOfEmployment: formData.get("natureOfEmployment") as string,
    };

    if (employeeData.dateOfBirth) {
      employeeData.retirement = calculateRetirementDate(
        employeeData.dateOfBirth
      );
    }

    if (employeeData.maritalstatus === "Married") {
      if (!employeeData.spouseName || !employeeData.totalChildren) {
        return NextResponse.json(
          {
            error:
              "Spouse name and total children are required for married employees",
          },
          { status: 400 }
        );
      }
    } else {
      employeeData.spouseName = null;
      employeeData.totalChildren = null;
    }

    // Validate required fields
    for (const [key, value] of Object.entries(employeeData)) {
      if (value === null || value === undefined || value === "") {
        if (key === "spouseName" || key === "totalChildren") {
          if (employeeData.maritalstatus === "Married") {
            return NextResponse.json(
              { error: `Missing required field for married employees: ${key}` },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            { error: `Missing required field: ${key}` },
            { status: 400 }
          );
        }
      }
    }

    // Ensure date fields are in ISO-8601 format
    const dateFields: (keyof EmployeeData)[] = [
      "dateOfBirth",
      "dateOfInitialAppointment",
      "dateOfAppointmentGazettedGrade",
      "dateOfAppointmentPresentPost",
      "retirement",
      "dateOfLastPromotionSubstantive",
      "dateOfLastPromotionOfficiating",
    ];
    dateFields.forEach((field) => {
      const dateValue = formData.get(field) as string | undefined;
      const parsedDate = safeParseDate(dateValue);
      if (parsedDate) {
        employeeData[field] = parsedDate.toISOString();
      } else if (dateValue) {
        return NextResponse.json(
          { error: `Invalid date for field: ${field}` },
          { status: 400 }
        );
      }
    });

    const cadreId = formData.get("cadreId") as string;
    if (!cadreId) {
      return NextResponse.json(
        { error: "Missing required field: cadreId" },
        { status: 400 }
      );
    }

    // Handle image upload
    const file = formData.get("profileImage") as File | null;
    let profileImagePath: string | undefined;
    if (file && file.size > 0) {
      const fileName = `${params.id}-${Date.now()}${path.extname(file.name)}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, fileBuffer);

      profileImagePath = `/uploads/${fileName}`;
    }

    // Update the existing employee record instead of creating a new one
    const updatedEmployee = await prisma.employee.update({
      where: { userId: params.id },
      data: {
        ...employeeData,
        profileImage: profileImagePath,
        cadre: {
          connect: { id: cadreId },
        },
      },
    });

    return NextResponse.json(updatedEmployee, { status: 200 });
  } catch (error) {
    console.error("Failed to update employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT request handler
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const updateData: Partial<EmployeeData> & {
      profileImage?: string;
      cadre?: { connect: { id: string } };
    } = {};

    // Fields that can be updated
    const updatableFields: (keyof EmployeeData)[] = [
      "empname",
      "fatherName",
      "dateOfBirth",
      "gender",
      "phoneNumber",
      "emailaddress",
      "maritalstatus",
      "state",
      "district",
      "constituency",
      "gpu",
      "ward",
      "pin",
      "policestation",
      "postoffice",
      "department",
      "departmentOfPosting",
      "presentdesignation",
      "dateOfInitialAppointment",
      "dateOfAppointmentGazettedGrade",
      "dateOfAppointmentPresentPost",
      "TotalLengthOfSerive",
      "retirement",
      "dateOfLastPromotionSubstantive",
      "dateOfLastPromotionOfficiating",
      "natureOfEmployment",
      "spouseName",
      "totalChildren",
    ];

    // Handle text fields
    updatableFields.forEach((field) => {
      const value = formData.get(field);
      if (value !== null && value !== "") {
        updateData[field] = value as string;
      }
    });

    if (updateData.dateOfBirth) {
      updateData.retirement = calculateRetirementDate(updateData.dateOfBirth);
    }
    // Ensure date fields are in ISO-8601 format
    const dateFields: (keyof EmployeeData)[] = [
      "dateOfBirth",
      "dateOfInitialAppointment",
      "dateOfAppointmentGazettedGrade",
      "dateOfAppointmentPresentPost",
      "retirement",
      "dateOfLastPromotionSubstantive",
      "dateOfLastPromotionOfficiating",
    ];

    dateFields.forEach((field) => {
      if (updateData[field]) {
        updateData[field] = new Date(updateData[field] as string).toISOString();
      }
    });

    // Handle cadre update
    const cadreId = formData.get("cadreId") as string;
    if (cadreId) {
      updateData.cadre = { connect: { id: cadreId } };
    }
    const maritalStatus = formData.get("maritalstatus") as string | undefined;
    if (maritalStatus) {
      updateData.maritalstatus = maritalStatus;
      if (maritalStatus === "Married") {
        updateData.spouseName = formData.get("spouseName") as
          | string
          | undefined;
        updateData.totalChildren = formData.get("totalChildren") as
          | string
          | undefined;
      } else {
        // If marital status is not "Married", set spouse name and total children to null
        updateData.spouseName = null;
        updateData.totalChildren = null;
      }
    }
    // Handle image upload
    const file = formData.get("profileImage") as File | null;
    if (file && file.size > 0) {
      const fileName = `${params.id}-${Date.now()}${path.extname(file.name)}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, fileBuffer);

      updateData.profileImage = `/uploads/${fileName}`;
    }

    // Update employee data in the database
    const updatedEmployee = await prisma.employee.update({
      where: { userId: params.id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Failed to update employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee", details: String(error) },
      { status: 500 }
    );
  }
}
