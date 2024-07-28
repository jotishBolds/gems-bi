import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CombinedUserData, Cadre } from "@/types/user";

interface EditUserFormProps {
  user: CombinedUserData;
  cadres: Cadre[];
  onSubmit: (data: CombinedUserData) => void;
  onCancel: () => void;
}
const safelyConvertValue = (value: any, type: string): string | number => {
  if (value === null || value === undefined) {
    return "";
  }

  if (type === "number") {
    const num = Number(value);
    return isNaN(num) ? "" : num;
  }

  if (typeof value === "object" && value !== null) {
    // Assuming Cadre objects have an 'id' or 'name' property we can use
    return value.id?.toString() ?? value.name?.toString() ?? "";
  }

  return value.toString();
};
const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  cadres,
  onSubmit,
  onCancel,
}) => {
  const { control, handleSubmit, watch } = useForm<CombinedUserData>({
    defaultValues: {
      ...user,
      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
      dateOfInitialAppointment: user.dateOfInitialAppointment
        ? new Date(user.dateOfInitialAppointment).toISOString().split("T")[0]
        : "",
      dateOfAppointmentGazettedGrade: user.dateOfAppointmentGazettedGrade
        ? new Date(user.dateOfAppointmentGazettedGrade)
            .toISOString()
            .split("T")[0]
        : "",
      dateOfAppointmentPresentPost: user.dateOfAppointmentPresentPost
        ? new Date(user.dateOfAppointmentPresentPost)
            .toISOString()
            .split("T")[0]
        : "",
      retirement: user.retirement
        ? new Date(user.retirement).toISOString().split("T")[0]
        : "",
      dateOfLastPromotionOfficiating: user.dateOfLastPromotionOfficiating
        ? new Date(user.dateOfLastPromotionOfficiating)
            .toISOString()
            .split("T")[0]
        : "",
      dateOfLastPromotionSubstantive: user.dateOfLastPromotionSubstantive
        ? new Date(user.dateOfLastPromotionSubstantive)
            .toISOString()
            .split("T")[0]
        : "",
      cadreId: user.cadre?.id?.toString(),
    },
  });

  const maritalStatus = watch("maritalstatus");

  const renderField = (
    name: keyof CombinedUserData,
    label: string,
    type: string,
    options: string[] = []
  ) => (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}:
      </label>
      {type === "select" ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              defaultValue={safelyConvertValue(
                field.value,
                "string"
              ).toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      ) : (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Input
              id={name}
              type={type}
              {...field}
              value={safelyConvertValue(field.value, type)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Edit User</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderField("empname", "Employee Name", "text")}

        {renderField("fatherName", "Father Name", "text")}
        {renderField("dateOfBirth", "Date of Birth", "date")}
        {renderField("gender", "Gender", "select", ["Male", "Female", "Other"])}
        {renderField("phoneNumber", "Phone Number", "text")}
        {renderField("emailaddress", "Email Address", "email")}
        {renderField("maritalstatus", "Marital Status", "select", [
          "Single",
          "Married",
          "Divorced",
          "Widowed",
          "Separated",
          "Other",
        ])}
        {maritalStatus === "Married" && (
          <>
            {renderField("spouseName", "Spouse Name", "text")}
            {renderField("totalChildren", "Total Children", "number")}
          </>
        )}
        {renderField("state", "State", "select", [
          "Andhra Pradesh",
          "Arunachal Pradesh",
          "Assam",
          "Bihar",
          "Chhattisgarh",
          "Goa",
          "Gujarat",
          "Haryana",
          "Himachal Pradesh",
          "Jammu and Kashmir",
          "Jharkhand",
          "Karnataka",
          "Kerala",
          "Madhya Pradesh",
          "Maharashtra",
          "Manipur",
          "Meghalaya",
          "Mizoram",
          "Nagaland",
          "Odisha",
          "Punjab",
          "Rajasthan",
          "Sikkim",
          "Tamil Nadu",
          "Telangana",
          "Tripura",
          "Uttar Pradesh",
          "Uttarakhand",
          "West Bengal",
        ])}
        {renderField("district", "District", "text")}
        {renderField("constituency", "Constituency", "text")}
        {renderField("gpu", "GPU(Gram Panchayat Unit)", "text")}
        {renderField("ward", "Ward", "text")}
        {renderField("pin", "Pincode", "text")}
        {renderField("policestation", "Police Station(PS)", "text")}
        {renderField("postoffice", "Post Office(PO)", "text")}
        <div className="mb-4">
          <label
            htmlFor="cadreId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cadre:
          </label>
          <Controller
            name="cadreId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString() ?? undefined}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a cadre" />
                </SelectTrigger>
                <SelectContent>
                  {cadres.map((cadre) => (
                    <SelectItem key={cadre.id} value={cadre.id.toString()}>
                      {cadre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {renderField("department", "Department", "text")}
        {renderField("presentdesignation", "Present Designation", "text")}
        {renderField("natureOfEmployment", "Nature of Employment", "select", [
          "Temporary-Permanent (Regular)",
          "Adhoc",
          "Muster Roll",
          "Contract",
          "CO-Terminus",
          "Project Contract",
        ])}
        {renderField(
          "dateOfInitialAppointment",
          "Date of Initial Appointment",
          "date"
        )}
        {renderField(
          "dateOfAppointmentGazettedGrade",
          "Date of Appointment Gazetted Grade",
          "date"
        )}
        {renderField(
          "dateOfAppointmentPresentPost",
          "Date of Appointment Present Post",
          "date"
        )}
        {renderField(
          "dateOfLastPromotionSubstantive",
          "Date Of Last Promotion Substantive",
          "date"
        )}
        {renderField(
          "dateOfLastPromotionOfficiating",
          "Date Of Last Promotion Officiating",
          "date"
        )}
        {renderField("TotalLengthOfSerive", "Total Length of Service", "text")}
        {renderField("retirement", "Retirement", "date")}
      </div>
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Changes
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;
