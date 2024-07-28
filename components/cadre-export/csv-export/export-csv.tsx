import { createObjectCsvStringifier } from "csv-writer";

interface Cadre {
  name: string;
  controllingDepartment?: string | null;
}

interface Employee {
  id: string;
  employeeId?: string | null;
  empname?: string | null;
  fatherName?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  phoneNumber: string;
  emailaddress: string;
  maritalstatus?: string | null;
  state?: string | null;
  district?: string | null;
  constituency?: string | null;
  gpu?: string | null;
  ward?: string | null;
  pin?: string | null;
  policestation?: string | null;
  postoffice?: string | null;
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
  cadre?: Cadre | null;
}

export async function exportToCSV(employees: Employee[]): Promise<string> {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: "id", title: "Employee ID" },
      { id: "employeeId", title: "Employee ID (Custom)" },
      { id: "empname", title: "Name" },
      { id: "fatherName", title: "Father's Name" },
      { id: "dateOfBirth", title: "Date of Birth" },
      { id: "gender", title: "Gender" },
      { id: "phoneNumber", title: "Phone Number" },
      { id: "emailaddress", title: "Email Address" },
      { id: "maritalstatus", title: "Marital Status" },
      { id: "state", title: "State" },
      { id: "district", title: "District" },
      { id: "constituency", title: "Constituency" },
      { id: "gpu", title: "GPU (Gram Panchayat Unit)" },
      { id: "ward", title: "Ward" },
      { id: "pin", title: "Pincode" },
      { id: "policestation", title: "Police Station" },
      { id: "postoffice", title: "Post Office" },
      { id: "department", title: "Department" },
      { id: "presentdesignation", title: "Present Designation" },
      { id: "cadre", title: "Cadre" },
      { id: "controllingDepartment", title: "Controlling Department" },
      { id: "dateOfInitialAppointment", title: "Date of Initial Appointment" },
      {
        id: "dateOfAppointmentGazettedGrade",
        title: "Date of Appointment in Gazetted Grade",
      },
      {
        id: "dateOfAppointmentPresentPost",
        title: "Date of Appointment to Present Post",
      },
      { id: "TotalLengthOfSerive", title: "Total Length of Service" },
      { id: "retirement", title: "Retirement Date" },
      {
        id: "dateOfLastPromotionSubstantive",
        title: "Date of Last Promotion (Substantive)",
      },
      {
        id: "dateOfLastPromotionOfficiating",
        title: "Date of Last Promotion (Officiating)",
      },
      { id: "natureOfEmployment", title: "Nature of Employment" },
    ],
  });

  const records = employees.map((e) => ({
    id: e.id,
    employeeId: e.employeeId ?? "",
    empname: e.empname ?? "",
    fatherName: e.fatherName ?? "",
    dateOfBirth: e.dateOfBirth?.toLocaleDateString() ?? "N/A",
    gender: e.gender ?? "",
    phoneNumber: e.phoneNumber,
    emailaddress: e.emailaddress,
    maritalstatus: e.maritalstatus ?? "N/A",
    state: e.state ?? "N/A",
    district: e.district ?? "N/A",
    constituency: e.constituency ?? "N/A",
    gpu: e.gpu ?? "N/A",
    ward: e.ward ?? "N/A",
    pin: e.pin ?? "N/A",
    policestation: e.policestation ?? "N/A",
    postoffice: e.postoffice ?? "N/A",
    department: e.department,
    presentdesignation: e.presentdesignation ?? "",
    cadre: e.cadre?.name ?? "N/A",
    controllingDepartment: e.cadre?.controllingDepartment ?? "N/A",
    dateOfInitialAppointment:
      e.dateOfInitialAppointment?.toLocaleDateString() ?? "N/A",
    dateOfAppointmentGazettedGrade:
      e.dateOfAppointmentGazettedGrade?.toLocaleDateString() ?? "N/A",
    dateOfAppointmentPresentPost:
      e.dateOfAppointmentPresentPost?.toLocaleDateString() ?? "N/A",
    TotalLengthOfSerive: e.TotalLengthOfSerive ?? "",
    retirement: e.retirement?.toLocaleDateString() ?? "N/A",
    dateOfLastPromotionSubstantive: e.dateOfLastPromotionSubstantive
      ? e.dateOfLastPromotionSubstantive.toLocaleDateString()
      : "N/A",
    dateOfLastPromotionOfficiating: e.dateOfLastPromotionOfficiating
      ? e.dateOfLastPromotionOfficiating.toLocaleDateString()
      : "N/A",
    natureOfEmployment: e.natureOfEmployment ?? "N/A",
  }));

  const csvString =
    csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
  return csvString;
}
