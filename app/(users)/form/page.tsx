"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import Image from "next/image";

import SideBarLayout from "@/components/page-layout/sidebar/sidebar-layout";
import { useRouter } from "next/navigation";
import { BarLoader, ScaleLoader } from "react-spinners";
import { Button } from "@/components/ui/button";

interface Cadre {
  id: string;
  name: string;
  controllingDepartment: string | null;
}

interface EmployeeFormData {
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
  cadreId: string;
  department: string;
  presentdesignation: string;
  dateOfInitialAppointment: string;
  dateOfAppointmentGazettedGrade: string;
  dateOfAppointmentPresentPost: string;
  TotalLengthOfSerive: string;
  retirement: string;
  dateOfLastPromotionSubstantive: string;
  dateOfLastPromotionOfficiating: string;
  natureOfEmployment: string;
  spouseName: string;
  totalChildren: string;
}

const EmployeeForm: React.FC = () => {
  const [cadres, setCadres] = useState<Cadre[]>([]);
  const { register, handleSubmit, watch, setValue, reset } =
    useForm<EmployeeFormData>();
  const { data: session } = useSession();
  const router = useRouter();
  const [isUpdate, setIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchCadresAndEmployeeData = async () => {
      try {
        const [cadresResponse, employeeResponse] = await Promise.all([
          fetch("/api/cadre"),
          session?.user.id
            ? fetch(`/api/employee/${session.user.id}`)
            : Promise.resolve(null),
        ]);

        const cadresData = await cadresResponse.json();
        setCadres(cadresData);

        if (employeeResponse) {
          if (employeeResponse.ok) {
            const employeeData: EmployeeFormData & { profileImage?: string } =
              await employeeResponse.json();
            if (employeeData) {
              const dateFields = [
                "dateOfBirth",
                "dateOfInitialAppointment",
                "dateOfAppointmentGazettedGrade",
                "dateOfAppointmentPresentPost",
                "retirement",
                "dateOfLastPromotionSubstantive",
                "dateOfLastPromotionOfficiating",
              ];
              dateFields.forEach((field) => {
                if (employeeData[field as keyof EmployeeFormData]) {
                  employeeData[field as keyof EmployeeFormData] = new Date(
                    employeeData[field as keyof EmployeeFormData]
                  )
                    .toISOString()
                    .split("T")[0];
                }
              });

              reset(employeeData);
              setIsUpdate(true);
              if (employeeData.profileImage) {
                setImagePreview(employeeData.profileImage);
              }
            }
          } else if (employeeResponse.status !== 404) {
            throw new Error("Failed to fetch employee data");
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCadresAndEmployeeData();
  }, [session, reset]);

  const selectedCadreId = watch("cadreId");

  useEffect(() => {
    if (selectedCadreId) {
      const selectedCadre = cadres.find(
        (cadre) => cadre.id === selectedCadreId
      );
      if (selectedCadre && selectedCadre.controllingDepartment) {
        setValue("department", selectedCadre.controllingDepartment);
      }
    }
  }, [selectedCadreId, cadres, setValue]);
  const calculateRetirementDate = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth);
    const retirementDate = new Date(dob);
    retirementDate.setFullYear(dob.getFullYear() + 60);
    return retirementDate.toISOString().split("T")[0];
  };

  useEffect(() => {
    const dateOfBirth = watch("dateOfBirth");
    if (dateOfBirth) {
      const retirementDate = calculateRetirementDate(dateOfBirth);
      setValue("retirement", retirementDate);
    }
  }, [watch("dateOfBirth")]);
  const onSubmit = async (data: EmployeeFormData) => {
    if (!session?.user.id) {
      console.error("User ID not available");
      return;
    }

    const url = `/api/employee/${session.user.id}`;
    const method = isUpdate ? "PUT" : "POST";
    setLoading(true);

    const formData = new FormData();
    const updatableFields = [
      "empname",
      "fatherName",
      "dateOfBirth",
      "gender",
      "phoneNumber",
      "emailaddress",
      "maritalstatus",
      "state",
      "district",
      "constituency",
      "gpu",
      "ward",
      "pin",
      "policestation",
      "postoffice",
      "department",
      "presentdesignation",
      "dateOfInitialAppointment",
      "dateOfAppointmentGazettedGrade",
      "dateOfAppointmentPresentPost",
      "TotalLengthOfSerive",
      "retirement",
      "cadreId",
      "dateOfLastPromotionSubstantive",
      "dateOfLastPromotionOfficiating",
      "natureOfEmployment",
      "spouseName",
      "totalChildren",
    ] as const;

    updatableFields.forEach((field) => {
      if (data[field] !== undefined && data[field] !== null) {
        formData.append(field, data[field] as string);
      }
    });

    if (profileImage instanceof File) {
      formData.append("profileImage", profileImage);
    }

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log(
          isUpdate
            ? "Employee details updated successfully"
            : "Employee details saved successfully",
          result
        );
        router.push("/employee-dashboard");
      } else {
        const errorData = await response.json();
        console.error(
          isUpdate
            ? "Failed to update employee details"
            : "Failed to save employee details",
          errorData
        );
        alert(
          `Error: ${errorData.error || response.statusText}. ${
            errorData.details || ""
          }`
        );
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert(`An error occurred: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (session?.user.role !== "EMPLOYEE") {
    return <div>Only employees can create their form.</div>;
  }

  if (initialLoading) {
    return (
      <SideBarLayout>
        <div className="flex justify-center items-center h-screen">
          <ScaleLoader />
        </div>
      </SideBarLayout>
    );
  }
  return (
    <SideBarLayout>
      <div className="max-w-8xl mx-auto p-4 md:p-8 space-y-8 bg-white shadow-lg rounded-lg">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Employee Details
          </h2>
          <p className="text-gray-600">
            Please fill out the following details about yourself.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-md border-4 border-gray-200 group-hover:border-blue-500 transition-all duration-300">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Profile"
                    layout="fill"
                    objectFit="cover"
                    quality={100}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg
                      className="w-12 h-12 md:w-16 md:h-16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-colors duration-300">
                <svg
                  className="w-4 h-4 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Personal Information Section */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  {...register("empname")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father&apos;s Name
                </label>
                <input
                  {...register("fatherName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  {...register("dateOfBirth")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  {...register("phoneNumber")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  {...register("emailaddress")}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status
                </label>
                <select
                  {...register("maritalstatus")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {watch("maritalstatus") === "Married" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spouse Name
                    </label>
                    <input
                      {...register("spouseName")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Children
                    </label>
                    <input
                      {...register("totalChildren")} // Remove valueAsNumber
                      type="number" // Changed to text to match the schema
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Address Information Section */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  {...register("state")}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                >
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  {...register("district")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Constituency
                </label>
                <input
                  {...register("constituency")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GPU(Gram Panchayat Unit)
                </label>
                <input
                  {...register("gpu")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ward
                </label>
                <input
                  {...register("ward")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  {...register("pin")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Police Station(PS)
                </label>
                <input
                  {...register("policestation")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post Office(PO)
                </label>
                <input
                  {...register("postoffice")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>
          </section>

          {/* Employment Information Section */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Employment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cadre
                </label>
                <select
                  {...register("cadreId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                >
                  <option value="">Select Cadre</option>
                  {cadres.map((cadre) => (
                    <option key={cadre.id} value={cadre.id}>
                      {cadre.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  {...register("department")}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Present Designation
                </label>
                <input
                  {...register("presentdesignation")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Last Promotion (Substantive)
                </label>
                <input
                  {...register("dateOfLastPromotionSubstantive")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Last Promotion (Officiating)
                </label>
                <input
                  {...register("dateOfLastPromotionOfficiating")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nature of Employment
                </label>
                <select
                  {...register("natureOfEmployment")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                >
                  <option value="">Select Nature of Employment</option>
                  <option value="Temporary-Permanent (Regular)">
                    Temporary-Permanent (Regular)
                  </option>
                  <option value="Adhoc">Adhoc</option>
                  <option value="Muster Roll">Muster Roll</option>
                  <option value="Contract">Contract</option>
                  <option value="CO-Terminus">CO-Terminus</option>
                  <option value="Project Contract">Project Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Initial Appointment
                </label>
                <input
                  {...register("dateOfInitialAppointment")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Appointment to Gazetted Grade
                </label>
                <input
                  {...register("dateOfAppointmentGazettedGrade")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Appointment to Present Post
                </label>
                <input
                  {...register("dateOfAppointmentPresentPost")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Length of Service
                </label>
                <input
                  {...register("TotalLengthOfSerive")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Retirement
                </label>
                <input
                  {...register("retirement")}
                  type="date"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-100"
                />
              </div>
            </div>
          </section>

          {/* Submit and Cancel Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              type="submit"
              variant={"default"}
              className="w-full sm:w-1/2 py-3 rounded-md"
            >
              {loading ? (
                <BarLoader
                  color="#ffffff"
                  loading={loading}
                  height={4}
                  width={100}
                />
              ) : isUpdate ? (
                "Update Employee"
              ) : (
                "Submit Employee"
              )}
            </Button>
            <Button
              variant={"secondary"}
              className="w-full sm:w-1/2 rounded-md"
              onClick={() => router.push("/employee-dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </SideBarLayout>
  );
};

export default EmployeeForm;
