import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

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

// Email configuration
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailHost = process.env.EMAIL_HOST;
const emailPort = parseInt(process.env.EMAIL_PORT || "587", 10);

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465, // true for 465, false for other ports
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

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

async function sendEmail(
  email: string,
  subject: string,
  text: string,
  otp?: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: subject,
      text: text,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #3b82f6; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${subject}</h1>
            </div>
            <div style="padding: 30px;">
              ${
                otp
                  ? `
                  <p style="color: #333333; margin-bottom: 15px;">Your One-Time Password (OTP) is:</p>
                  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
                    <p style="font-size: 32px; font-weight: bold; color: #3b82f6; margin: 0;">${otp}</p>
                  </div>
                  <p style="color: #333333; margin-bottom: 15px;">This OTP will expire in 10 minutes.</p>
                  `
                  : ""
              }
              <p style="color: #333333; margin-bottom: 15px;">If you didn't request this, please ignore this email or contact support if you have concerns.</p>
              <p style="color: #333333;">Best regards,<br>GEMS</p>
            </div>
            <div style="background-color: #f9fafb; padding: 15px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">&copy; 2024 GEMS. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
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

    if (!cadre || !cadre.code) {
      return NextResponse.json(
        { message: "Invalid cadre name or missing cadre code" },
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

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    if (existingEmployee) {
      // If employee exists but doesn't have an employeeId, generate one
      if (!existingEmployee.employeeId) {
        employeeId = generateEmployeeId(cadre.code, newCadreSequence);
      } else {
        employeeId = existingEmployee.employeeId;
        // If employeeId already exists, don't increment the sequence
        newCadreSequence = cadre.lastSequenceNumber;
      }

      // Update existing employee
      const hashedPassword = await bcrypt.hash(password, 10);

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
      await sendEmail(
        email,
        "Account Update OTP",
        `Your OTP for account update is: ${otp}. This OTP will expire in 10 minutes.`,
        otp
      );
      await sendSMS(phoneNumber, `Your Employee ID is: ${employeeId}`);
      await sendEmail(
        email,
        "Your Employee ID",
        `Your Employee ID is: ${employeeId}`
      );

      responseMessage =
        "Employee information updated successfully. Please verify OTP sent to your phone and email.";
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

      employeeId = generateEmployeeId(cadre.code, newCadreSequence);

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
      await sendEmail(
        email,
        "Registration OTP",
        `Your OTP for registration is: ${otp}. This OTP will expire in 10 minutes.`,
        otp
      );
      await sendSMS(phoneNumber, `Your Employee ID is: ${employeeId}`);
      await sendEmail(
        email,
        "Your Employee ID",
        `Your Employee ID is: ${employeeId}`
      );

      responseMessage =
        "Employee registered successfully. Please verify OTP sent to your phone and email.";
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
