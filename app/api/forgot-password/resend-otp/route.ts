import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

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

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(phoneNumber: string, message: string) {
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  // Implement actual SMS sending logic here
}

async function sendEmail(email: string, subject: string, text: string) {
  try {
    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: subject,
      text: text,
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

export async function POST(req: NextRequest) {
  const { identifier } = await req.json();

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { employee: { employeeId: identifier } }],
      },
      include: { employee: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry },
    });

    await sendSMS(
      user.mobileNumber,
      `Your new OTP for password reset is: ${otp}`
    );
    await sendEmail(
      user.email,
      "New Password Reset OTP",
      `Your new OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`
    );

    return NextResponse.json(
      { message: "New OTP sent successfully to your phone and email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in resending OTP:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
