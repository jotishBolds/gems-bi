import jsPDF from "jspdf";
import "jspdf-autotable";
import path from "path";
import fs from "fs/promises";
import { Employee } from "@/lib/types/em-types";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { createCanvas } from "canvas";

export async function exportToPDF(employees: Employee[]): Promise<ArrayBuffer> {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  let yPosition = margin;

  const formatDate = (date: Date | null | undefined): string => {
    return date ? date.toISOString().split("T")[0] : "N/A";
  };

  const addHeader = async (employee: Employee) => {
    doc.setFillColor(0, 48, 87);
    doc.rect(0, 0, pageWidth, 35, "F");
    doc.setTextColor(255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Report", margin, 15);

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

  const addFooter = () => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(0, 48, 87);
      doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
      doc.setTextColor(255);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 5, {
        align: "center",
      });
    }
  };

  const checkAndAddNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }
  };

  const addTable = (title: string, data: any[][]) => {
    checkAndAddNewPage(50); // Minimum space for title and a few rows

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

  for (const employee of employees) {
    await addHeader(employee);

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
    doc.text(employee.empname || "N/A", margin + 35, yPosition + 10);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${employee.cadre?.name || "N/A"}`, margin + 35, yPosition + 18);
    doc.text(
      `Employee ID: ${employee.employeeId || "N/A"}`,
      margin + 35,
      yPosition + 26
    );

    // Generate QR Code
    try {
      const qrCodeData = JSON.stringify({
        employeeId: employee.employeeId,
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

    // Personal Information
    const personalInfo = [
      ["Employee Name", employee.empname || "N/A"],
      ["Employee ID", employee.employeeId || "N/A"],
      ["Father's Name", employee.fatherName || "N/A"],
      ["Date of Birth", formatDate(employee.dateOfBirth)],
      ["Gender", employee.gender || "N/A"],
      ["Phone Number", employee.phoneNumber || "N/A"],
      ["Email Address", employee.emailaddress || "N/A"],
      ["Marital Status", employee.maritalstatus || "N/A"],
    ];

    if (employee.maritalstatus?.toLowerCase() === "married") {
      personalInfo.push(["Spouse Name", employee.spouseName || "N/A"]);
      personalInfo.push(["Total Children", employee.totalChildren || "N/A"]);
    }

    addTable("Personal Information", personalInfo);

    // Address Information
    const addressInfo = [
      ["State", employee.state || "N/A"],
      ["District", employee.district || "N/A"],
      ["Constituency", employee.constituency || "N/A"],
      ["GPU(Gram Panchayat Unit)", employee.gpu || "N/A"],
      ["Ward", employee.ward || "N/A"],
      ["Pincode", employee.pin || "N/A"],
      ["Police Station(PS)", employee.policestation || "N/A"],
      ["Post Office(PO)", employee.postoffice || "N/A"],
    ];
    addTable("Address Information", addressInfo);

    // Professional Information
    const professionalInfo = [
      ["Cadre", employee.cadre?.name || "Not specified"],
      ["Department", employee.department || "N/A"],
      ["Present Designation", employee.presentdesignation || "N/A"],
      ["Department Of Posting", employee.departmentOfPosting || "N/A"],
      ["Nature of Employment", employee.natureOfEmployment || "N/A"],
      [
        "Date of Initial Appointment",
        formatDate(employee.dateOfInitialAppointment),
      ],
      [
        "Date of Appointment in Gazetted Grade",
        formatDate(employee.dateOfAppointmentGazettedGrade),
      ],
      [
        "Date of Appointment to Present Post",
        formatDate(employee.dateOfAppointmentPresentPost),
      ],
      ["Total Length of Service", employee.TotalLengthOfSerive || "N/A"],
      [
        "Date of Last Promotion Officiating",
        formatDate(employee.dateOfLastPromotionOfficiating),
      ],
      [
        "Date of Last Promotion Substantive",
        formatDate(employee.dateOfLastPromotionSubstantive),
      ],
      ["Retirement Date", formatDate(employee.retirement)],
    ];
    addTable("Professional Information", professionalInfo);

    // Add a new page for the next employee
    if (employees.indexOf(employee) !== employees.length - 1) {
      doc.addPage();
    }
  }

  addFooter();

  return doc.output("arraybuffer");
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
