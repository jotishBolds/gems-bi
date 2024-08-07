"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  User,
  Briefcase,
  Building,
  Users,
  Calendar,
  Phone,
  Mail,
  Lock,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBiToast } from "@/components/page-layout/toast/use-toast";

import { BarLoader } from "react-spinners";
import Canvas from "../../signin/canva";
import EmployeeRegisterNotice from "./note";

// Zod schema
const employeeSchema = z
  .object({
    empname: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    cadreName: z.string().min(1, "Cadre is required"),
    department: z.string(),
    departmentOfPosting: z.string().min(1, "Department of posting is required"),
    presentdesignation: z.string().min(1, "Present designation is required"),
    dateOfBirth: z.string().refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
    }, "Invalid date of birth"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface Cadre {
  id: string;
  name: string;
  controllingDepartment: string;
}

const EmployeeRegister: React.FC = () => {
  const [cadres, setCadres] = useState<Cadre[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const showToast = useBiToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  useEffect(() => {
    fetchCadres();
    fetchDepartments();
  }, []);

  const fetchCadres = async () => {
    try {
      const response = await fetch("/api/cadre/all");
      if (response.ok) {
        const data = await response.json();
        setCadres(data);
      } else {
        showToast({
          title: "Error",
          description: "Failed to fetch cadres",
          type: "destructive",
          actiontext: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error fetching cadres:", error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred",
        type: "destructive",
        actiontext: "Try Again",
      });
    }
  };
  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/cadre/department");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        showToast({
          title: "Error",
          description: "Failed to fetch departments",
          type: "destructive",
          actiontext: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred",
        type: "destructive",
        actiontext: "Try Again",
      });
    }
  };
  const handleSelectChange = (value: string) => {
    const selectedCadre = cadres.find((cadre) => cadre.name === value);
    setValue("cadreName", value);
    setValue("department", selectedCadre?.controllingDepartment || "");
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async (data: EmployeeFormData) => {
    setLoading(true);

    try {
      if (!showOtpInput) {
        // First step: Register employee and send OTP
        const response = await fetch("/api/employee-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (response.ok) {
          setShowOtpInput(true);
          showToast({
            title: "Success",
            description: "OTP sent to your mobile number. Please verify.",
            type: "default",
            actiontext: "Close",
          });
        } else {
          showToast({
            title: "Error",
            description: responseData.message || "Registration failed",
            type: "destructive",
            actiontext: "Try Again",
          });
        }
      } else {
        // Second step: Verify OTP
        const otpResponse = await fetch("/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, otp }),
        });

        if (otpResponse.ok) {
          showToast({
            title: "Success",
            description: "Registration successful!",
            type: "default",
            actiontext: "Close",
          });
          router.push("/auth/signin");
        } else {
          showToast({
            title: "Error",
            description: "Invalid OTP. Please try again.",
            type: "destructive",
            actiontext: "Try Again",
          });
        }
      }
    } catch (error) {
      console.error("Error registering employee:", error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred",
        type: "destructive",
        actiontext: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] py-8 px-4 bg-gray-50">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <Canvas canvasRef={canvasRef} />
      <div className="w-full max-w-5xl bg-white p-8 rounded-lg shadow-xl z-10">
        <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Employee Registration
          </h1>
          <p className="text-lg text-gray-600">
            Government Employee Management System (GEMS)
          </p>
        </div>
        <EmployeeRegisterNotice />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!showOtpInput ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="empname"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="empname"
                    {...register("empname")}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.empname && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.empname.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="presentdesignation"
                  className="text-sm font-medium text-gray-700"
                >
                  Present Designation
                </Label>
                <div className="relative">
                  <Briefcase
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="presentdesignation"
                    {...register("presentdesignation")}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your designation"
                  />
                </div>
                {errors.presentdesignation && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.presentdesignation.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="departmentOfPosting"
                  className="text-sm font-medium text-gray-700"
                >
                  Department of Posting
                </Label>
                <div className="relative">
                  <Building
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Select
                    onValueChange={(value) =>
                      setValue("departmentOfPosting", value)
                    }
                  >
                    <SelectTrigger className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.departmentOfPosting && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.departmentOfPosting.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="cadreName"
                  className="text-sm font-medium text-gray-700"
                >
                  Cadre
                </Label>
                <div className="relative">
                  <Users
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Select onValueChange={handleSelectChange}>
                    <SelectTrigger className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                      <SelectValue placeholder="Select a cadre" />
                    </SelectTrigger>
                    <SelectContent>
                      {cadres.map((cadre) => (
                        <SelectItem key={cadre.id} value={cadre.name}>
                          {cadre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.cadreName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cadreName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="dateOfBirth"
                  className="text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </Label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <input
                id="department"
                {...register("department")}
                type="hidden"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label
                htmlFor="otp"
                className="text-sm font-medium text-gray-700"
              >
                OTP
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter the OTP sent to your mobile"
                  required
                />
              </div>
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-none text-white font-semibold py-3 px-4  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? (
              <BarLoader width={100} height={4} color={"#ffffff"} />
            ) : showOtpInput ? (
              "Verify OTP"
            ) : (
              "Register"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegister;
