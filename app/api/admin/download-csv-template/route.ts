import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth-options";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csvContent = `empname,fatherName,dateOfBirth,gender,phoneNumber,emailaddress,maritalstatus,spouseName,totalChildren,state,district,constituency,gpu,ward,pin,policestation,postoffice,cadreId,department,presentdesignation,dateOfInitialAppointment,dateOfAppointmentGazettedGrade,dateOfAppointmentPresentPost,TotalLengthOfSerive,retirement,dateOfLastPromotionSubstantive,dateOfLastPromotionOfficiating,natureOfEmployment
John Doe,Michael Doe,1985-05-15,Male,1234567890,john.doe@example.com,Married,Jane Doe,2,State1,District1,Constituency1,GPU1,Ward1,123456,PS1,PO1,cadre-id-1,Department1,Manager,2010-01-01,2015-01-01,2020-01-01,13 years,2045-05-15,2019-01-01,2020-01-01,Permanent
Jane Smith,William Smith,1990-08-20,Female,9876543210,jane.smith@example.com,Single,,,State2,District2,Constituency2,GPU2,Ward2,654321,PS2,PO2,cadre-id-2,Department2,Assistant,2012-06-01,2017-06-01,2021-06-01,11 years,2050-08-20,2020-06-01,2021-06-01,Contract`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition":
        "attachment; filename=employee_import_template.csv",
    },
  });
}
