import { RoleType } from "@prisma/client";

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  mobileNumber: string;
  role: RoleType;
  employee?: Employee;
  controlledCadres?: Cadre[];
  otp?: string | null;
  otpExpiry?: Date | null;
  isVerified: boolean;
  verificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  employeeId?: string | null;
  user?: User | null;
  userId?: string | null | undefined;
  empname?: string | null;
  fatherName?: string | null;
  profileImage?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  phoneNumber: string;
  emailaddress: string;
  maritalstatus?: string | null;
  spouseName?: string | null;
  totalChildren?: string | null;
  state?: string | null;
  district?: string | null;
  constituency?: string | null;
  gpu?: string | null;
  ward?: string | null;
  pin?: string | null;
  policestation?: string | null;
  postoffice?: string | null;
  cadre?: Cadre | null;
  cadreId?: string | null;
  cadreSequence?: number | null;
  department: string;
  presentdesignation?: string | null;
  dateOfInitialAppointment?: Date | null;
  dateOfAppointmentGazettedGrade?: Date | null;
  dateOfAppointmentPresentPost?: Date | null;
  TotalLengthOfSerive?: string | null;
  retirement?: Date | null;
  dateOfLastPromotionSubstantive?: Date | null;
  dateOfLastPromotionOfficiating?: Date | null;
  natureOfEmployment?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cadre {
  id: string;
  name: string;
  controllingAdminAuthority: string;
  controllingDepartment?: string | null;
  controllingUser?: User | null;
  controllingUserId?: string | null;
  employees?: Employee[];
  lastSequenceNumber: number;
  createdAt: Date;
  updatedAt: Date;
}
