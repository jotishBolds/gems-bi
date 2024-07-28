import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth-options";
type AllowedRole = "CM" | "CS" | "DOP";

// Type guard function to check if the role is allowed
const isAllowedRole = (role: string | undefined): role is AllowedRole => {
  return role === "CM" || role === "CS" || role === "DOP";
};
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !isAllowedRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        empname: true,
        fatherName: true,
        dateOfBirth: true,
        gender: true,
        phoneNumber: true,
        emailaddress: true,
        maritalstatus: true,
        spouseName: true,
        totalChildren: true,
        state: true,
        district: true,
        constituency: true,
        gpu: true,
        ward: true,
        pin: true,
        policestation: true,
        postoffice: true,
        department: true,
        presentdesignation: true,
        dateOfInitialAppointment: true,
        dateOfAppointmentGazettedGrade: true,
        dateOfAppointmentPresentPost: true,
        TotalLengthOfSerive: true,
        retirement: true,
        dateOfLastPromotionSubstantive: true,
        dateOfLastPromotionOfficiating: true,
        natureOfEmployment: true,
        profileImage: true,
        cadre: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            email: true,
            username: true,
            mobileNumber: true,
            role: true,
          },
        },
      },
    });

    const transformedEmployees = employees.map((employee) => ({
      ...employee,
      ...employee.user,
      cadreName: employee.cadre?.name || null,
      user: undefined,
      cadre: undefined,
    }));

    return NextResponse.json(transformedEmployees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}
