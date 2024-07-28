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

    // Header function
    const addHeader = async () => {
      doc.setFillColor(0, 48, 87);
      doc.rect(0, 0, pageWidth, 35, "F");
      doc.setTextColor(255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Employee Profile", margin, 15);

      // Add barcode to header
      try {
        const barcodeData = employee.employeeId || "N/A";
        const barcodeDataUrl = await generateBarcodePNG(barcodeData);
        doc.addImage(barcodeDataUrl, "PNG", pageWidth - 60, 5, 50, 15);

        // Add employee ID below barcode
        doc.setFontSize(8);
        doc.text(barcodeData, pageWidth - 35, 25, { align: "center" });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }

      // Add "Generated on" field
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 25);

      yPosition = 40;
    };

    // Footer function
    const addFooter = () => {
      doc.setFillColor(0, 48, 87);
      doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
      doc.setTextColor(255);
      doc.setFontSize(8);
      doc.text("Page 1 of 1", pageWidth - margin, pageHeight - 5, {
        align: "right",
      });
    };

    // Add header
    await addHeader();

    // Add employee photo and basic info
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
      doc.addImage(imageData, "JPEG", margin, yPosition, 30, 30);
    } else {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, 30, 30, "F");
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("No Image", margin + 15, yPosition + 15, { align: "center" });
    }

    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${employee.empname || "N/A"}`, margin + 35, yPosition + 10);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${employee.cadre?.name || "N/A"}`, margin + 35, yPosition + 18);
    doc.text(
      `ID: ${employee.employeeId || "N/A"}`,
      margin + 35,
      yPosition + 26
    );

    // Generate QR Code
    try {
      const qrCodeData = JSON.stringify({
        id: employee.employeeId,
        name: employee.empname,
        designation: employee.presentdesignation,
        department: employee.department,
      });
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);
      doc.addImage(qrCodeDataUrl, "PNG", pageWidth - 40, yPosition, 30, 30);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }

    yPosition += 40;

    // Function to add a table
    const addTable = (title: string, data: any[][]) => {
      doc.setFontSize(12);
      doc.setTextColor(0, 48, 87);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, yPosition);
      yPosition += 5;

      (doc as any).autoTable({
        startY: yPosition,
        head: [["Field", "Value"]],
        body: data,
        theme: "striped",
        headStyles: {
          fillColor: [0, 48, 87],
          textColor: 255,
          fontStyle: "bold",
        },
        bodyStyles: { textColor: 50, fontSize: 8 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: "bold" },
          1: { cellWidth: "auto" },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 5;
    };

    // Prepare and add tables
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
    addTable("Personal Information", personalInfo);

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
    addTable("Address Information", addressInfo);

    const professionalInfo = [
      ["Department", employee.department],
      ["Present Designation", employee.presentdesignation || "N/A"],
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
    addTable("Professional Information", professionalInfo);

    // Add footer
    addFooter();

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
