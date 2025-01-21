//File : /api/cadrer-export/pdf-export/export-pdf.ts
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Employee } from "@/lib/types/em-types";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { createCanvas } from "canvas";

async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
}

export async function exportToPDF(employees: Employee[]): Promise<ArrayBuffer> {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;

  const formatDate = (date: Date | null | undefined): string => {
    return date ? date.toISOString().split("T")[0] : "N/A";
  };

  const addHeader = async (employee: Employee) => {
    doc.setFillColor(0, 48, 87);
    doc.rect(0, 0, pageWidth, 25, "F");
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Profile", margin, 15);

    // Add barcode to header
    try {
      const barcodeData = employee.employeeId || "N/A";
      const barcodeDataUrl = await generateBarcodePNG(barcodeData);
      doc.addImage(barcodeDataUrl, "PNG", pageWidth - 50, 5, 40, 10);
      doc.setFontSize(8);
      doc.text(barcodeData, pageWidth - 30, 20, { align: "center" });
    } catch (error) {
      console.error("Error generating barcode:", error);
    }

    // Add "Generated on" field
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 22);
  };

  const addFooter = () => {
    doc.setFillColor(0, 48, 87);
    doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
    doc.setTextColor(255);
    doc.setFontSize(8);
    doc.text("Page 1 of 1", pageWidth - margin, pageHeight - 4, {
      align: "right",
    });
  };

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

  for (const employee of employees) {
    await addHeader(employee);

    let yPosition = 30;

    // Add employee photo and basic info
    if (employee.profileImage) {
      try {
        // Fetch image from Vercel Blob URL
        const imageDataUrl = await fetchImageAsBase64(employee.profileImage);
        doc.addImage(imageDataUrl, "JPEG", margin, yPosition, 25, 25);
      } catch (error) {
        console.error("Error adding image to PDF:", error);
        // Fallback for failed image load
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPosition, 25, 25, "F");
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("No Image", margin + 12.5, yPosition + 12.5, {
          align: "center",
        });
      }
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
    doc.text(employee.empname || "N/A", margin + 30, yPosition + 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${employee.cadre?.name || "N/A"}`, margin + 30, yPosition + 15);
    doc.text(
      `ID: ${employee.employeeId || "N/A"}`,
      margin + 30,
      yPosition + 22
    );

    // Generate QR Code
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

    addFooter();

    // Add a new page for the next employee, if there is one
    if (employees.indexOf(employee) !== employees.length - 1) {
      doc.addPage();
    }
  }

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
