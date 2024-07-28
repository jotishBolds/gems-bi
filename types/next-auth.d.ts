import { RoleType } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role?: RoleType;
      username?: string;
      phone?: string;
      employeeId?: string; // Add this line
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role?: RoleType;
    username?: string;
    phone?: string;
    otpRequired?: boolean;
    employeeId?: string; // Add this line
  }
}
