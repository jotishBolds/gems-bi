import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { identifier, otp } = await req.json();

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { employee: { employeeId: identifier } }],
        otp: otp,
        otpExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Clear the OTP after successful verification
    await prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpExpiry: null },
    });

    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in OTP verification:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
