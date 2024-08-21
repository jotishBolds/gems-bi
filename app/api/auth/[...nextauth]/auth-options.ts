import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { AuthResult, AuthUser } from "@/types/auth";
import { RoleType } from "@prisma/client";
import nodemailer from "nodemailer";
// import twilio from "twilio";
// import parsePhoneNumberFromString from "libphonenumber-js";
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
// const client = twilio(accountSid, authToken);
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

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(phoneNumber: string, message: string): Promise<void> {
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  // Implement your SMS sending logic here
}

async function sendEmail(
  email: string,
  subject: string,
  text: string,
  otp: string
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
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Your Login OTP</h1>
            </div>
            <div style="padding: 30px;">
              <p style="color: #333333; margin-bottom: 15px;">Hello,</p>
              <p style="color: #333333; margin-bottom: 15px;">Your One-Time Password (OTP) for login is:</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
                <p style="font-size: 32px; font-weight: bold; color: #3b82f6; margin: 0;">${otp}</p>
              </div>
              <p style="color: #333333; margin-bottom: 15px;">This OTP will expire in 10 minutes.</p>
              <p style="color: #333333; margin-bottom: 15px;">If you didn't request this OTP, please ignore this email or contact support if you have concerns.</p>
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

const rolesRequiringOTP: RoleType[] = [
  RoleType.EMPLOYEE,
  RoleType.ADMIN,
  RoleType.CS,
  RoleType.CM,
  RoleType.CADRE_CONTROLLING_AUTHORITY,
  RoleType.DOP,
];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or EmployeeID", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials): Promise<AuthResult | null> {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        let user;
        const isEmployeeId = /^\d+\/[A-Z]+\/\d+$/.test(credentials.identifier);

        if (isEmployeeId) {
          user = await prisma.user.findFirst({
            where: {
              employee: { employeeId: credentials.identifier },
              role: RoleType.EMPLOYEE,
            },
            include: { employee: true },
          });
        } else {
          user = await prisma.user.findFirst({
            where: {
              email: credentials.identifier,
              role: { not: RoleType.EMPLOYEE },
            },
            include: { employee: true },
          });
        }

        if (!user) {
          if (isEmployeeId) {
            throw new Error("Invalid credentials");
          } else {
            // Check if there's an EMPLOYEE with this email
            const employeeUser = await prisma.user.findUnique({
              where: {
                email: credentials.identifier,
                role: RoleType.EMPLOYEE,
              },
            });
            if (employeeUser) {
              throw new Error("EMPLOYEE_ID_REQUIRED");
            } else {
              throw new Error("Invalid credentials");
            }
          }
        }

        if (!(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error("Invalid credentials");
        }

        if (rolesRequiringOTP.includes(user.role)) {
          if (!credentials.otp || credentials.otp === "undefined") {
            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

            await prisma.user.update({
              where: { id: user.id },
              data: { otp, otpExpiry },
            });

            // Send OTP via SMS
            await sendSMS(user.mobileNumber, `Your OTP for login is: ${otp}`);

            // Send OTP via Email
            // In the authorize function, replace the existing sendEmail call with:
            await sendEmail(
              user.email,
              "Login OTP",
              `Your OTP for login is: ${otp}. This OTP will expire in 10 minutes.`,
              otp
            );

            throw new Error("OTP_REQUIRED");
          } else {
            if (
              !user.otp ||
              !user.otpExpiry ||
              user.otp !== credentials.otp ||
              user.otpExpiry < new Date()
            ) {
              throw new Error("Invalid or expired OTP");
            }

            await prisma.user.update({
              where: { id: user.id },
              data: { otp: null, otpExpiry: null },
            });
          }
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.username,
          phone: user.mobileNumber,
          employeeId: user.employee?.employeeId ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email || "";
        token.role = (user as AuthUser).role;
        token.username = (user as AuthUser).username;
        token.phone = (user as AuthUser).phone;
        token.employeeId = (user as AuthUser).employeeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role as RoleType;
        session.user.username = token.username as string;
        session.user.phone = token.phone as string;
        session.user.employeeId = token.employeeId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};
