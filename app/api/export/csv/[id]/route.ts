import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { createObjectCsvStringifier } from "csv-writer";

import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("CSV Export API called with ID:", params.id);

  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYEE") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = params;

    const employee = await prisma.employee.findUnique({
      where: { userId: id },
      include: { cadre: true },
    });

    console.log("Employee found:", employee);

    if (!employee) {
      return new NextResponse(JSON.stringify({ error: "Employee not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "empname", title: "Employee Name" },

        { id: "fatherName", title: "Father's Name" },
        { id: "dateOfBirth", title: "Date of Birth" },
        { id: "gender", title: "Gender" },
        { id: "phoneNumber", title: "Phone Number" },
        { id: "emailaddress", title: "Email Address" },
        { id: "maritalstatus", title: "Marital Status" },
        { id: "state", title: "State" },
        { id: "district", title: "District" },
        { id: "constituency", title: "Constituency" },
        { id: "gpu", title: "GPU(Gram Panchayat Unit)" },
        { id: "ward", title: "Ward" },
        { id: "pin", title: "Pincode" },
        { id: "policestation", title: "Police Station(PS)" },
        { id: "postoffice", title: "Post Office(PO)" },
        { id: "cadre", title: "Cadre" },
        { id: "department", title: "Department" },
        { id: "presentdesignation", title: "Present Designation" },
        { id: "natureOfEmployment", title: "Nature of Employment" },
        {
          id: "dateOfInitialAppointment",
          title: "Date of Initial Appointment",
        },
        {
          id: "dateOfAppointmentGazettedGrade",
          title: "Date of Appointment in Gazetted Grade",
        },
        {
          id: "dateOfAppointmentPresentPost",
          title: "Date of Appointment to Present Post",
        },
        { id: "TotalLengthOfSerive", title: "Total Length of Service" },
        {
          id: "dateOfLastPromotionOfficiating",
          title: "Date of Last Promotion Officiating",
        },
        {
          id: "dateOfLastPromotionSubstantive",
          title: "Date of Last Promotion Substantive",
        },
        { id: "retirement", title: "Retirement Date" },
      ],
    });

    const formatDate = (date: Date | null): string =>
      date ? date.toISOString().split("T")[0] : "N/A";

    const records = [
      {
        ...employee,
        cadre: employee.cadre?.name || "Not specified",
        dateOfBirth: formatDate(employee.dateOfBirth),
        dateOfInitialAppointment: formatDate(employee.dateOfInitialAppointment),
        dateOfAppointmentGazettedGrade: formatDate(
          employee.dateOfAppointmentGazettedGrade
        ),
        dateOfAppointmentPresentPost: formatDate(
          employee.dateOfAppointmentPresentPost
        ),
        dateOfLastPromotionOfficiating: formatDate(
          employee.dateOfLastPromotionOfficiating
        ),
        dateOfLastPromotionSubstantive: formatDate(
          employee.dateOfLastPromotionSubstantive
        ),
        retirement: formatDate(employee.retirement),
      },
    ];

    // Combine header and records
    const csvString =
      csvStringifier.getHeaderString() +
      csvStringifier.stringifyRecords(records);

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=employee_profile.csv",
      },
    });
  } catch (error) {
    console.error("Error in CSV export:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
