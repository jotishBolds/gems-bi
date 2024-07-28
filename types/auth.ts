import { User } from "next-auth";
import { RoleType } from "@prisma/client";

export interface AuthUser extends User {
  role?: RoleType;
  username?: string;
  phone?: string;
  email: string;
  employeeId?: string; // Add this line
}

export interface OTPRequiredResult {
  id: string;
  email: string;
  otpRequired: true;
}

export type AuthResult = AuthUser | OTPRequiredResult;
