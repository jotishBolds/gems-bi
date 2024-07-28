// app/api/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.otpExpiry || user.otp !== otp || user.otpExpiry < new Date()) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpiry: null },
    });

    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: "Error verifying OTP", error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
