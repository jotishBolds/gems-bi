import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

interface EmployeeData {
  employeeId: string;
  empname: string;
  phoneNumber: string;
  emailaddress: string;
  cadreId: string;
  cadreSequence: number;
  department: string;
  departmentOfPosting: string;
  presentdesignation: string;
  dateOfBirth: Date;
}

function generateEmployeeId(cadreCode: string, sequence: number): string {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `${randomPart}/${cadreCode}/${sequence}`;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(phoneNumber: string, message: string) {
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  // Implement actual SMS sending logic here
}

export async function POST(req: NextRequest) {
  const {
    empname,
    email,
    phoneNumber,
    password,
    cadreName,
    department,
    departmentOfPosting,
    presentdesignation,
    dateOfBirth,
  } = await req.json();

  try {
    const cadre = await prisma.cadre.findFirst({
      where: { name: cadreName },
    });

    if (!cadre) {
      return NextResponse.json(
        { message: "Invalid cadre name" },
        { status: 400 }
      );
    }

    let newCadreSequence = cadre.lastSequenceNumber + 1;

    // Parse the date of birth
    const parsedDateOfBirth = new Date(dateOfBirth);
    if (isNaN(parsedDateOfBirth.getTime())) {
      return NextResponse.json(
        { message: "Invalid date of birth" },
        { status: 400 }
      );
    }

    // Check if an employee with matching empname, cadre, department, and dateOfBirth exists
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        empname,
        cadre: { name: cadreName },
        department,
        dateOfBirth: parsedDateOfBirth,
      },
      include: { user: true },
    });

    let employeeId: string;
    let responseMessage: string;
    let statusCode: number;

    if (existingEmployee) {
      // If employee exists but doesn't have an employeeId, generate one
      if (!existingEmployee.employeeId) {
        employeeId = generateEmployeeId(
          cadreName.substring(0, 3).toUpperCase(),
          newCadreSequence
        );
      } else {
        employeeId = existingEmployee.employeeId;
        // If employeeId already exists, don't increment the sequence
        newCadreSequence = cadre.lastSequenceNumber;
      }

      // Update existing employee
      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

      if (existingEmployee.user) {
        // Update existing user
        await prisma.user.update({
          where: { id: existingEmployee.user.id },
          data: {
            email,
            password: hashedPassword,
            mobileNumber: phoneNumber,
            otp,
            otpExpiry,
          },
        });
      } else {
        // Create new user for existing employee
        await prisma.user.create({
          data: {
            username: empname,
            email,
            password: hashedPassword,
            mobileNumber: phoneNumber,
            role: "EMPLOYEE",
            otp,
            otpExpiry,
            employee: {
              connect: { id: existingEmployee.id },
            },
          },
        });
      }

      // Update employee information
      await prisma.employee.update({
        where: { id: existingEmployee.id },
        data: {
          phoneNumber,
          emailaddress: email,
          employeeId,
          cadreSequence: newCadreSequence,
          departmentOfPosting,
          presentdesignation,
        },
      });

      await sendSMS(phoneNumber, `Your OTP for account update is: ${otp}`);
      await sendSMS(phoneNumber, `Your Employee ID is: ${employeeId}`);

      responseMessage =
        "Employee information updated successfully. Please verify OTP.";
      statusCode = 200;
    } else {
      // Create new employee
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { mobileNumber: phoneNumber }],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "User with this email or phone number already exists" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      employeeId = generateEmployeeId(
        cadreName.substring(0, 3).toUpperCase(),
        newCadreSequence
      );

      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

      const employeeData: EmployeeData = {
        employeeId,
        empname,
        phoneNumber,
        emailaddress: email,
        cadreId: cadre.id,
        cadreSequence: newCadreSequence,
        department,
        departmentOfPosting,
        presentdesignation,
        dateOfBirth: parsedDateOfBirth,
      };

      // Create new user and employee in a single transaction
      await prisma.$transaction(async (prisma) => {
        const employee = await prisma.employee.create({
          data: employeeData,
        });

        await prisma.user.create({
          data: {
            username: email,
            email,
            password: hashedPassword,
            mobileNumber: phoneNumber,
            role: "EMPLOYEE",
            otp,
            otpExpiry,
            employee: {
              connect: { id: employee.id },
            },
          },
        });
      });

      await sendSMS(phoneNumber, `Your OTP for registration is: ${otp}`);
      await sendSMS(phoneNumber, `Your Employee ID is: ${employeeId}`);

      responseMessage = "Employee registered successfully. Please verify OTP.";
      statusCode = 201;
    }

    // Update cadre's lastSequenceNumber
    await prisma.cadre.update({
      where: { id: cadre.id },
      data: { lastSequenceNumber: newCadreSequence },
    });

    return NextResponse.json(
      {
        message: responseMessage,
        employeeId,
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error("Error registering/updating employee:", error);
    return NextResponse.json(
      { message: "Error processing employee data" },
      { status: 500 }
    );
  }
}
