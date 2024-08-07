"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScaleLoader, BarLoader } from "react-spinners";
import SideBarLayout from "@/components/page-layout/sidebar/sidebar-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  Clock,
  AlertCircle,
  Info,
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface UserData {
  id: string;
  username: string;
  email: string;
  mobileNumber: string;
  role: string;
  isVerified: string;
  verificationStatus: string;
}

interface EmployeeData {
  empname: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailaddress: string;
  maritalstatus: string;
  state: string;
  district: string;
  constituency: string;
  gpu: string;
  ward: string;
  pin: string;
  policestation: string;
  postoffice: string;
  cadre: {
    name: string;
  } | null;
  department: string;
  presentdesignation: string;
  departmentOfPosting: string;
  dateOfInitialAppointment: string;
  dateOfAppointmentGazettedGrade: string;
  dateOfAppointmentPresentPost: string;
  TotalLengthOfSerive: string;
  retirement: string;
  profileImage: string | null;
  dateOfLastPromotionSubstantive: string;
  dateOfLastPromotionOfficiating: string;
  natureOfEmployment: string;
  spouseName?: string;
  totalChildren?: string;
  user: UserData;
  createdAt: string;
  updatedAt: string;
}

const EmployeeProfile: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchEmployeeData();
    } else {
      setIsLoading(false);
    }
  }, [status, session]);

  const fetchEmployeeData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/employee/${session?.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployee(data);
      } else {
        console.error("Failed to fetch employee data");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const handleUpdateForm = () => {
    router.push("/form/update-form");
  };

  const handleCSVExport = async () => {
    if (employee) {
      try {
        setCsvLoading(true);
        const response = await fetch(`/api/export/csv/${session?.user.id}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = "employee_profile.csv";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          console.error("Failed to export CSV");
        }
      } catch (error) {
        console.error("Error exporting CSV:", error);
      } finally {
        setCsvLoading(false);
      }
    }
  };

  const handlePDFExport = async () => {
    if (employee) {
      try {
        setPdfLoading(true);
        const response = await fetch(`/api/export/pdf/${session?.user.id}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          window.open(url, "_blank");
        } else {
          console.error("Failed to export PDF");
        }
      } catch (error) {
        console.error("Error exporting PDF:", error);
      } finally {
        setPdfLoading(false);
      }
    }
  };

  const renderVerificationBadge = () => {
    if (!employee || !employee.user) return null;

    if (employee.user.verificationStatus === "Verified") {
      return (
        <Badge variant="default" className="bg-green-500 text-white">
          <CheckCircle className="w-4 h-4 mr-1" />
          Verified
        </Badge>
      );
    } else if (employee.user.verificationStatus === "Pending") {
      return (
        <Badge variant="default" className="bg-yellow-500 text-white">
          <Clock className="w-4 h-4 mr-1" />
          Pending
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-red-500 text-white">
          <AlertCircle className="w-4 h-4 mr-1" />
          Not Verified
        </Badge>
      );
    }
  };

  const renderVerificationStatus = () => {
    if (!employee || !employee.user) return null;

    switch (employee.user.verificationStatus) {
      case "Verified":
        return null;
      case "Pending":
        return (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Verification Pending</AlertTitle>
            <AlertDescription>
              Your account is pending verification. Some features may be
              limited.
            </AlertDescription>
          </Alert>
        );
      default:
        return (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Account Not Verified</AlertTitle>
            <AlertDescription>
              Your account has not been verified. Please contact support for
              assistance.
            </AlertDescription>
          </Alert>
        );
    }
  };

  const isVerificationPending = () => {
    return employee?.user?.verificationStatus === "Pending";
  };
  const isUpdatePermanentlyDisabled = () => {
    if (!employee || !employee.createdAt) return false;
    const profileCreationDate = new Date(employee.createdAt);
    const threeMonthsAfterCreation = new Date(profileCreationDate);
    threeMonthsAfterCreation.setMonth(threeMonthsAfterCreation.getMonth() + 3);
    return new Date() > threeMonthsAfterCreation;
  };

  const renderUpdateNote = () => {
    if (isUpdatePermanentlyDisabled()) {
      return (
        <Alert variant="destructive" className="mb-4">
          <Lock className="h-4 w-4" />
          <AlertTitle>Profile Locked</AlertTitle>
          <AlertDescription>
            Your profile is now permanently locked and can no longer be updated.
            This lock was applied 3 months after your profile creation on{" "}
            {formatDate(employee?.createdAt)}.
          </AlertDescription>
        </Alert>
      );
    } else if (employee?.createdAt) {
      const lockDate = new Date(employee.createdAt);
      lockDate.setMonth(lockDate.getMonth() + 3);
      return (
        <Alert variant="default" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Update Period</AlertTitle>
          <AlertDescription>
            You can update your profile until{" "}
            {formatDate(lockDate.toISOString())}. After this date, your profile
            will be permanently locked.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    router.push("/auth/employee/login");
    return null;
  }

  return (
    <SideBarLayout>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        {renderVerificationStatus()}
        {renderUpdateNote()}
        {isLoading ? (
          <div className="flex items-center justify-center">
            <ScaleLoader />
          </div>
        ) : employee ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative">
                    {employee.profileImage ? (
                      <Image
                        src={employee.profileImage}
                        alt={`${employee.empname}`}
                        className="w-32 h-32 rounded-full object-cover"
                        width={128}
                        height={128}
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-4xl text-gray-600">
                          {employee.empname}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2">
                      {renderVerificationBadge()}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h2 className=" text-lg md:text-2xl font-bold">
                        {employee.empname}
                        {employee.cadre?.name && (
                          <span>,{employee.cadre.name}</span>
                        )}
                      </h2>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">
                      {employee.presentdesignation}
                    </p>
                    <p className="text-md text-gray-600 mb-2">
                      {employee.department}
                    </p>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">{employee.emailaddress}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">{employee.phoneNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          DOB: {formatDate(employee.dateOfBirth)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          D.O.I.A:{" "}
                          {formatDate(employee.dateOfInitialAppointment)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          {employee.district}, {employee.state}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          Retirement: {formatDate(employee.retirement)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-2 h-full md:grid-cols-4 gap-2 sm:gap-0">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
                <TabsTrigger value="service">Service</TabsTrigger>
              </TabsList>
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Career Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ProfileField
                      label="Father's Name"
                      value={employee.fatherName}
                    />
                    <ProfileField
                      label="Date of Birth"
                      value={formatDate(employee.dateOfBirth)}
                    />
                    <ProfileField label="Gender" value={employee.gender} />
                    <ProfileField
                      label="Marital Status"
                      value={employee.maritalstatus}
                    />
                    {employee.maritalstatus === "Married" && (
                      <>
                        <ProfileField
                          label="Spouse Name"
                          value={employee.spouseName}
                        />
                        <ProfileField
                          label="Total Children"
                          value={employee.totalChildren}
                        />
                      </>
                    )}
                    <ProfileField
                      label="Mobile Number"
                      value={employee.phoneNumber}
                    />
                    <ProfileField
                      label="Email Address"
                      value={employee.emailaddress}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="address">
                <Card>
                  <CardHeader>
                    <CardTitle>Address Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ProfileField label="State" value={employee.state} />
                    <ProfileField label="District" value={employee.district} />
                    <ProfileField
                      label="Constituency"
                      value={employee.constituency}
                    />
                    <ProfileField label="GPU" value={employee.gpu} />
                    <ProfileField label="Ward" value={employee.ward} />
                    <ProfileField label="Pin Code" value={employee.pin} />
                    <ProfileField
                      label="Police Station"
                      value={employee.policestation}
                    />
                    <ProfileField
                      label="Post Office"
                      value={employee.postoffice}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="employment">
                <Card>
                  <CardHeader>
                    <CardTitle>Employment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ProfileField
                      label="Department"
                      value={employee.department}
                    />
                    <ProfileField
                      label="Present Designation"
                      value={employee.presentdesignation}
                    />
                    <ProfileField
                      label="Department of Posting"
                      value={employee.departmentOfPosting}
                    />
                    <ProfileField
                      label="Nature of Employment"
                      value={employee.natureOfEmployment}
                    />
                    <ProfileField
                      label="Cadre"
                      value={employee.cadre?.name || "Not specified"}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="service">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ProfileField
                      label="Date of Initial Appointment"
                      value={formatDate(employee.dateOfInitialAppointment)}
                    />
                    <ProfileField
                      label="Date of Appointment in Gazetted Grade"
                      value={formatDate(
                        employee.dateOfAppointmentGazettedGrade
                      )}
                    />
                    <ProfileField
                      label="Date of Appointment to Present Post"
                      value={formatDate(employee.dateOfAppointmentPresentPost)}
                    />
                    <ProfileField
                      label="Date of Last Promotion (Officiating)"
                      value={formatDate(
                        employee.dateOfLastPromotionOfficiating
                      )}
                    />
                    <ProfileField
                      label="Date of Last Promotion (Substantive)"
                      value={formatDate(
                        employee.dateOfLastPromotionSubstantive
                      )}
                    />
                    <ProfileField
                      label="Total Length of Service"
                      value={employee.TotalLengthOfSerive}
                    />
                    <ProfileField
                      label="Retirement Date"
                      value={formatDate(employee.retirement)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        onClick={handleUpdateForm}
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={
                          isVerificationPending() ||
                          isUpdatePermanentlyDisabled()
                        }
                      >
                        Update Profile
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isUpdatePermanentlyDisabled()
                      ? "Your profile is permanently locked and can no longer be updated"
                      : isVerificationPending()
                      ? "Verification pending"
                      : "Update your profile"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                onClick={handleCSVExport}
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isVerificationPending()}
              >
                {csvLoading ? (
                  <BarLoader width={50} height={2} color={"#000000"} />
                ) : (
                  "Export CSV"
                )}
              </Button>
              <Button
                onClick={handlePDFExport}
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isVerificationPending()}
              >
                {pdfLoading ? (
                  <BarLoader width={50} height={2} color={"#000000"} />
                ) : (
                  "Export PDF"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Button
              onClick={() => router.push("/form/create-form")}
              className="rounded-none w-full sm:w-auto"
            >
              Create Employee Form
            </Button>
          </div>
        )}
      </div>
    </SideBarLayout>
  );
};

const ProfileField: React.FC<{ label: string; value: string | undefined }> = ({
  label,
  value,
}) => (
  <div className="break-words">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-900">{value || "Not specified"}</p>
  </div>
);

export default EmployeeProfile;
