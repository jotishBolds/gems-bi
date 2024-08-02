import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth-options";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
            cadre: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Combine user and employee data
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      mobileNumber: user.mobileNumber,
      role: user.role,

      ...user.employee,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  console.log("Received update data:", data);

  // Fields that can be updated
  const updatableFields = [
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
    "presentdesignation",
    "departmentOfPosting",
    "dateOfInitialAppointment",
    "dateOfAppointmentGazettedGrade",
    "dateOfAppointmentPresentPost",
    "TotalLengthOfSerive",
    "retirement",
    "cadreId",
    "dateOfLastPromotionSubstantive",
    "dateOfLastPromotionOfficiating",
    "natureOfEmployment",
    "spouseName",
    "totalChildren",
  ];

  // Filter out non-updatable fields
  const filteredData: { [key: string]: any } = Object.fromEntries(
    Object.entries(data).filter(([key]) => updatableFields.includes(key))
  );

  // Ensure date fields are in ISO-8601 format
  const dateFields = [
    "dateOfBirth",
    "dateOfInitialAppointment",
    "dateOfAppointmentGazettedGrade",
    "dateOfAppointmentPresentPost",
    "dateOfLastPromotionSubstantive",
    "dateOfLastPromotionOfficiating",
    "retirement",
  ];
  dateFields.forEach((field) => {
    if (typeof filteredData[field] === "string") {
      filteredData[field] = new Date(filteredData[field]).toISOString();
    }
  });
  const calculateRetirementDate = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth);
    const retirementDate = new Date(dob);
    retirementDate.setFullYear(dob.getFullYear() + 60);
    return retirementDate;
  };

  if (filteredData.dateOfBirth) {
    filteredData.retirement = calculateRetirementDate(filteredData.dateOfBirth);
  }
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: { employee: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        email: data.email,
        username: data.username,
        mobileNumber: data.phoneNumber,
        role: data.role,
        employee: {
          upsert: {
            create: {
              empname: filteredData.empname,
              fatherName: filteredData.fatherName,
              dateOfBirth: new Date(filteredData.dateOfBirth),
              gender: filteredData.gender,
              phoneNumber: filteredData.phoneNumber,
              emailaddress: filteredData.emailaddress,
              maritalstatus: filteredData.maritalstatus,
              spouseName: filteredData.spouseName,
              totalChildren: filteredData.totalChildren,
              state: filteredData.state,
              district: filteredData.district,
              constituency: filteredData.constituency,
              gpu: filteredData.gpu,
              ward: filteredData.ward,
              pin: filteredData.pin,
              policestation: filteredData.policestation,
              postoffice: filteredData.postoffice,
              department: filteredData.department,
              presentdesignation: filteredData.presentdesignation,
              departmentOfPosting: filteredData.departmentOfPosting,
              dateOfInitialAppointment: new Date(
                filteredData.dateOfInitialAppointment
              ),
              dateOfAppointmentGazettedGrade: new Date(
                filteredData.dateOfAppointmentGazettedGrade
              ),
              dateOfAppointmentPresentPost: new Date(
                filteredData.dateOfAppointmentPresentPost
              ),
              TotalLengthOfSerive: filteredData.TotalLengthOfSerive,
              retirement: new Date(filteredData.retirement),
              cadre: { connect: { id: filteredData.cadreId } },
            },
            update: {
              empname: filteredData.empname,
              fatherName: filteredData.fatherName,
              dateOfBirth: new Date(filteredData.dateOfBirth),
              gender: filteredData.gender,
              phoneNumber: filteredData.phoneNumber,
              emailaddress: filteredData.emailaddress,
              maritalstatus: filteredData.maritalstatus,
              spouseName: filteredData.spouseName,
              totalChildren: filteredData.totalChildren,
              state: filteredData.state,
              district: filteredData.district,
              constituency: filteredData.constituency,
              gpu: filteredData.gpu,
              ward: filteredData.ward,
              pin: filteredData.pin,
              policestation: filteredData.policestation,
              postoffice: filteredData.postoffice,
              department: filteredData.department,
              presentdesignation: filteredData.presentdesignation,
              departmentOfPosting: filteredData.departmentOfPosting,
              dateOfInitialAppointment: new Date(
                filteredData.dateOfInitialAppointment
              ),
              dateOfAppointmentGazettedGrade: new Date(
                filteredData.dateOfAppointmentGazettedGrade
              ),
              dateOfAppointmentPresentPost: new Date(
                filteredData.dateOfAppointmentPresentPost
              ),
              dateOfLastPromotionSubstantive: new Date(
                filteredData.dateOfLastPromotionSubstantive
              ),
              dateOfLastPromotionOfficiating: new Date(
                filteredData.dateOfLastPromotionOfficiating
              ),
              natureOfEmployment: filteredData.natureOfEmployment,
              TotalLengthOfSerive: filteredData.TotalLengthOfSerive,
              retirement: new Date(filteredData.retirement),
              cadre: { connect: { id: filteredData.cadreId } },
            },
          },
        },
      },
      include: {
        employee: {
          include: {
            cadre: true,
          },
        },
      },
    });

    console.log("Updated user:", updatedUser);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if the user has an associated employee record
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { employee: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If the user has an employee record, delete it first
    if (user.employee) {
      await prisma.employee.delete({
        where: { userId: params.id },
      });
    }

    // Then delete the user
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { verificationStatus: status },
    });

    // Ensure the updatedUser is correctly returned
    const userFromDb = await prisma.user.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json(userFromDb);
  } catch (error) {
    console.error("Failed to update verification status:", error);
    return NextResponse.json(
      { error: "Failed to update verification status" },
      { status: 500 }
    );
  }
}

// In the AdminDashboard component, update the handleVerifyUser function
