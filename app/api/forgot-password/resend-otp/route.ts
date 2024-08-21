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
      `Your new OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`,
      otp
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
