export interface UserData {
  id: string;
  email: string;
  username: string;
  mobileNumber: string;
  role: string;
  verificationStatus: string;
}

export interface Cadre {
  id: string;
  name: string;
  controllingDepartment?: string;
}

export interface EmployeeData {
  empname?: string;
  fatherName?: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  emailaddress?: string;
  maritalstatus?: string;
  spouseName?: string;
  totalChildren?: string;
  state?: string;
  district?: string;
  constituency?: string;
  gpu?: string;
  ward?: string;
  pin?: string;
  policestation?: string;
  postoffice?: string;
  cadre?: Cadre;
  profileImage?: string;
  department?: string;
  presentdesignation?: string;
  dateOfInitialAppointment?: string;
  dateOfAppointmentGazettedGrade?: string;
  dateOfAppointmentPresentPost?: string;
  TotalLengthOfSerive?: string;
  retirement?: string;
  dateOfLastPromotionSubstantive?: string;
  dateOfLastPromotionOfficiating?: string;
  natureOfEmployment?: string;
}

export type CombinedUserData = UserData &
  EmployeeData & {
    cadreId?: string;
    profileImage?: string;
    verificationStatus?: string;
  };
