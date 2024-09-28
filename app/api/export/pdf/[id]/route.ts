import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import jsPDF from "jspdf";
import "jspdf-autotable";
import path from "path";
import fs from "fs/promises";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { createCanvas } from "canvas";

import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("PDF Export API called with ID:", params.id);

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

    if (!employee) {
      return new NextResponse(JSON.stringify({ error: "Employee not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    let yPosition = margin;

    // Header
    doc.setFillColor(0, 48, 87);
    doc.rect(0, 0, pageWidth, 25, "F");
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Profile", margin, 15);

    // Barcode
    const barcodeData = employee.employeeId || "N/A";
    const barcodeDataUrl = await generateBarcodePNG(barcodeData);
    doc.addImage(barcodeDataUrl, "PNG", pageWidth - 50, 5, 40, 10);
    doc.setFontSize(8);
    doc.text(barcodeData, pageWidth - 30, 20, { align: "center" });

    // Generated on field
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 22);

    yPosition = 30;

    // Employee photo and basic info
    let imageData;
    if (employee.profileImage) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        employee.profileImage
      );
      try {
        imageData = await fs.readFile(imagePath);
      } catch (error) {
        console.error("Error reading image file:", error);
      }
    }

    if (imageData) {
      doc.addImage(imageData, "JPEG", margin, yPosition, 25, 25);
    } else {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, 25, 25, "F");
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("No Image", margin + 12.5, yPosition + 12.5, {
        align: "center",
      });
    }

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${employee.empname || "N/A"}`, margin + 30, yPosition + 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${employee.cadre?.name || "N/A"}`, margin + 30, yPosition + 15);
    doc.text(
      `ID: ${employee.employeeId || "N/A"}`,
      margin + 30,
      yPosition + 22
    );

    // QR Code
    try {
      const loginUrl = new URL(
        "https://7166srvb-3000.inc1.devtunnels.ms/auth/signin"
      );
      loginUrl.searchParams.append("employeeId", employee.employeeId || "");
      const qrCodeDataUrl = await QRCode.toDataURL(loginUrl.toString());
      doc.addImage(qrCodeDataUrl, "PNG", pageWidth - 35, yPosition, 25, 25);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }

    yPosition += 30;

    // Function to add a table
    const addTable = (
      title: string,
      data: any[][],
      startY: number,
      columnWidths: number[]
    ) => {
      (doc as any).autoTable({
        startY: startY,
        head: [
          [
            {
              content: title,
              colSpan: 2,
              styles: {
                halign: "center",
                fillColor: [0, 48, 87],
                textColor: 255,
                fontStyle: "bold",
              },
            },
          ],
        ],
        body: data,
        theme: "striped",
        headStyles: {
          fillColor: [0, 48, 87],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 8,
        },
        bodyStyles: { textColor: 50, fontSize: 7 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: columnWidths[0], fontStyle: "bold" },
          1: { cellWidth: columnWidths[1] },
        },
      });

      return (doc as any).lastAutoTable.finalY + 5;
    };

    // Prepare tables
    const personalInfo = [
      ["Father's Name", employee.fatherName || "N/A"],
      [
        "Date of Birth",
        employee.dateOfBirth
          ? employee.dateOfBirth.toISOString().split("T")[0]
          : "N/A",
      ],
      ["Gender", employee.gender || "N/A"],
      ["Phone Number", employee.phoneNumber],
      ["Email Address", employee.emailaddress],
      ["Marital Status", employee.maritalstatus || "N/A"],
    ];

    if (employee.maritalstatus?.toLowerCase() === "married") {
      personalInfo.push(["Spouse Name", employee.spouseName || "N/A"]);
      personalInfo.push(["Total Children", employee.totalChildren || "N/A"]);
    }

    const addressInfo = [
      ["State", employee.state || "N/A"],
      ["District", employee.district || "N/A"],
      ["Constituency", employee.constituency || "N/A"],
      ["GPU", employee.gpu || "N/A"],
      ["Ward", employee.ward || "N/A"],
      ["Pincode", employee.pin || "N/A"],
      ["Police Station", employee.policestation || "N/A"],
      ["Post Office", employee.postoffice || "N/A"],
    ];

    const professionalInfo = [
      ["Department", employee.department],
      ["Present Designation", employee.presentdesignation || "N/A"],
      ["Department Of Posting", employee.departmentOfPosting || "N/A"],
      ["Nature of Employment", employee.natureOfEmployment || "N/A"],
      [
        "Date of Initial Appointment",
        employee.dateOfInitialAppointment
          ? employee.dateOfInitialAppointment.toISOString().split("T")[0]
          : "N/A",
      ],
      [
        "Date of Appointment (Gazetted Grade)",
        employee.dateOfAppointmentGazettedGrade
          ? employee.dateOfAppointmentGazettedGrade.toISOString().split("T")[0]
          : "N/A",
      ],
      [
        "Date of Appointment to Present Post",
        employee.dateOfAppointmentPresentPost
          ? employee.dateOfAppointmentPresentPost.toISOString().split("T")[0]
          : "N/A",
      ],
      ["Total Length of Service", employee.TotalLengthOfSerive || "N/A"],
      [
        "Date of Last Promotion (Officiating)",
        employee.dateOfLastPromotionOfficiating
          ? employee.dateOfLastPromotionOfficiating.toISOString().split("T")[0]
          : "N/A",
      ],
      [
        "Date of Last Promotion (Substantive)",
        employee.dateOfLastPromotionSubstantive
          ? employee.dateOfLastPromotionSubstantive.toISOString().split("T")[0]
          : "N/A",
      ],
      [
        "Retirement Date",
        employee.retirement
          ? employee.retirement.toISOString().split("T")[0]
          : "N/A",
      ],
    ];

    // Add tables
    const columnWidth = (pageWidth - 2 * margin) / 2 - 5;
    yPosition = addTable("Personal Information", personalInfo, yPosition, [
      columnWidth,
      columnWidth,
    ]);
    yPosition = addTable("Address Information", addressInfo, yPosition, [
      columnWidth,
      columnWidth,
    ]);
    yPosition = addTable(
      "Professional Information",
      professionalInfo,
      yPosition,
      [columnWidth, columnWidth]
    );

    // Footer
    doc.setFillColor(0, 48, 87);
    doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
    doc.setTextColor(255);
    doc.setFontSize(8);
    doc.text("Page 1 of 1", pageWidth - margin, pageHeight - 4, {
      align: "right",
    });

    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=employee_profile.pdf",
      },
    });
  } catch (error) {
    console.error("Error in PDF export:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

async function generateBarcodePNG(text: string): Promise<string> {
  const canvas = createCanvas(100, 30);
  JsBarcode(canvas, text, {
    width: 1,
    height: 30,
    format: "CODE128",
    displayValue: false,
  });
  return canvas.toDataURL();
}
