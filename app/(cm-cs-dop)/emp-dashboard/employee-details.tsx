import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  Calendar,
  Briefcase,
  MapPin,
  User,
  Download,
  Edit,
} from "lucide-react";

interface Employee {
  id: string;
  empname: string;
  email: string;
  department: string;
  presentdesignation: string;
  departmentOfPosting: string;
  profileImage: string | null;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailaddress: string;
  maritalstatus: string;
  spouseName?: string;
  totalChildren?: string;
  state: string;
  district: string;
  constituency: string;
  gpu: string;
  ward: string;
  pin: string;
  policestation: string;
  postoffice: string;
  dateOfInitialAppointment: string;
  dateOfAppointmentGazettedGrade: string;
  dateOfAppointmentPresentPost: string;
  TotalLengthOfSerive: string;
  retirement: string;
  dateOfLastPromotionSubstantive: string;
  dateOfLastPromotionOfficiating: string;
  natureOfEmployment: string;
  cadreName: string | null;
}

const EmployeeDetails: React.FC<{ employee: Employee }> = ({ employee }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <ScrollArea className="h-full w-full p-2">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 sm:w-24 sm:h-24">
                  <AvatarImage
                    src={employee.profileImage || ""}
                    alt={`${employee.empname}`}
                  />
                  <AvatarFallback className="text-xl sm:text-2xl">
                    {employee.empname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h2 className="text-lg sm:text-2xl font-bold leading-tight">
                    {`${employee.empname} `},{" "}
                    {employee.cadreName && <>{employee.cadreName}</>}
                  </h2>

                  <div className="flex flex-col items-start md:flex-row flex-wrap md:items-center mt-2 md:space-x-2">
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      {employee.presentdesignation}
                    </Badge>
                    <Badge className="text-xs sm:text-sm mt-2 md:mt-0">
                      {employee.department}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <InfoItem
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone"
                  value={employee.phoneNumber}
                />
                <InfoItem
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={employee.email}
                />
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="DOB"
                  value={formatDate(employee.dateOfBirth)}
                />
                <InfoItem
                  icon={<User className="w-4 h-4" />}
                  label="Gender"
                  value={employee.gender}
                />
                <InfoItem
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Joined"
                  value={formatDate(employee.dateOfInitialAppointment)}
                />
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Retirement"
                  value={formatDate(employee.retirement)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="text-xs md:text-sm">
              Personal
            </TabsTrigger>
            <TabsTrigger value="address" className="text-xs md:text-sm">
              Address
            </TabsTrigger>
            <TabsTrigger value="employment" className="text-xs md:text-sm">
              Employment
            </TabsTrigger>
          </TabsList>
          <TabsContent value="personal">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <InfoItem label="Father's Name" value={employee.fatherName} />
                  <InfoItem
                    label="Marital Status"
                    value={employee.maritalstatus}
                  />
                  {employee.maritalstatus === "Married" && (
                    <>
                      <InfoItem
                        label="Spouse Name"
                        value={employee.spouseName || "N/A"}
                      />
                      <InfoItem
                        label="Total Children"
                        value={employee.totalChildren || "N/A"}
                      />
                    </>
                  )}
                  <InfoItem
                    label="Total Service"
                    value={employee.TotalLengthOfSerive}
                  />
                  <InfoItem
                    label="Nature of Employment"
                    value={employee.natureOfEmployment}
                  />
                  <InfoItem
                    label="Department Of Posting"
                    value={employee.departmentOfPosting || "N/A"}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="address">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Address Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <InfoItem label="State" value={employee.state} />
                  <InfoItem label="District" value={employee.district} />
                  <InfoItem
                    label="Constituency"
                    value={employee.constituency}
                  />
                  <InfoItem label="GPU" value={employee.gpu} />
                  <InfoItem label="Ward" value={employee.ward} />
                  <InfoItem label="PIN" value={employee.pin} />
                  <InfoItem
                    label="Police Station"
                    value={employee.policestation}
                  />
                  <InfoItem label="Post Office" value={employee.postoffice} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="employment">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Initial Appointment"
                    value={formatDate(employee.dateOfInitialAppointment)}
                  />
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Gazetted Grade Appointment"
                    value={formatDate(employee.dateOfAppointmentGazettedGrade)}
                  />
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Present Post Appointment"
                    value={formatDate(employee.dateOfAppointmentPresentPost)}
                  />
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Last Substantive Promotion"
                    value={formatDate(employee.dateOfLastPromotionSubstantive)}
                  />
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Last Officiating Promotion"
                    value={formatDate(employee.dateOfLastPromotionOfficiating)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

const InfoItem: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-2">
    {icon && <div className="text-gray-400 mt-0.5">{icon}</div>}
    <div className="flex-grow">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-medium break-words">{value}</p>
    </div>
  </div>
);

export default EmployeeDetails;
