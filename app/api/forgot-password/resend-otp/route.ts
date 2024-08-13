import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(phoneNumber: string, message: string) {
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  // Implement actual SMS sending logic here
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

    return NextResponse.json(
      { message: "New OTP sent successfully" },
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
