import React from "react";
import { CombinedUserData } from "@/types/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserDetailsProps {
  user: CombinedUserData;
  onEdit: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, onEdit }) => {
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderDetailItem = (
    label: string,
    value: string | undefined,
    isDate: boolean = false
  ) => (
    <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-2">
      <span className="font-semibold text-gray-700 break-words">{label}:</span>
      <span className="text-gray-600 break-words">
        {isDate ? formatDate(value) : value || "N/A"}
      </span>
    </div>
  );

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">User Details</h2>
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-2 h-full mb-8 md:grid-cols-4 gap-2 sm:gap-0">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {renderDetailItem("Employee Name", user.empname)}

            {renderDetailItem("Father Name", user.fatherName)}
            {renderDetailItem("Date of Birth", user.dateOfBirth, true)}
            {renderDetailItem("Gender", user.gender)}
            {renderDetailItem("Phone Number", user.phoneNumber)}
            {renderDetailItem("Email Address", user.emailaddress)}
            {renderDetailItem("Marital Status", user.maritalstatus)}
            {user.maritalstatus === "Married" && (
              <>
                {renderDetailItem("Spouse Name", user.spouseName)}
                {renderDetailItem("Total Children", user.totalChildren)}
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value="address">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {renderDetailItem("State", user.state)}
            {renderDetailItem("District", user.district)}
            {renderDetailItem("Constituency", user.constituency)}
            {renderDetailItem("GPU(Gram Panchayat Unit)", user.gpu)}
            {renderDetailItem("Ward", user.ward)}
            {renderDetailItem("Pincode", user.pin)}
            {renderDetailItem("Police Station(PS)", user.policestation)}
            {renderDetailItem("Post Office(PO)", user.postoffice)}
          </div>
        </TabsContent>
        <TabsContent value="employment">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {renderDetailItem("Cadre", user.cadre?.name)}
            {renderDetailItem(
              "Controlling Department",
              user.cadre?.controllingDepartment
            )}
            {renderDetailItem("Department", user.department)}
            {renderDetailItem("Present Designation", user.presentdesignation)}
            {renderDetailItem("Nature of Employment", user.natureOfEmployment)}
            {renderDetailItem(
              "Date of Initial Appointment",
              user.dateOfInitialAppointment,
              true
            )}
            {renderDetailItem(
              "Date of Appointment Gazetted Grade",
              user.dateOfAppointmentGazettedGrade,
              true
            )}
            {renderDetailItem(
              "Date of Appointment Present Post",
              user.dateOfAppointmentPresentPost,
              true
            )}
          </div>
        </TabsContent>
        <TabsContent value="other">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {renderDetailItem(
              "Date of Last Promotion Officiating",
              user.dateOfLastPromotionOfficiating,
              true
            )}
            {renderDetailItem(
              "Date of Last Promotion Substantive",
              user.dateOfLastPromotionSubstantive,
              true
            )}
            {renderDetailItem(
              "Total Length of Service",
              user.TotalLengthOfSerive
            )}
            {renderDetailItem("Retirement", user.retirement, true)}
          </div>
        </TabsContent>
      </Tabs>
      <button
        onClick={onEdit}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Edit Details
      </button>
    </div>
  );
};

export default UserDetails;
