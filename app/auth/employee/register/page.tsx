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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBiToast } from "@/components/page-layout/toast/use-toast";
import { Eye, EyeOff } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center min-h-[90vh] py-4 px-4 md:py-8">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <Canvas canvasRef={canvasRef} />
      <div className="w-full max-w-4xl bg-white bg-opacity-90 p-4 md:p-8 rounded-lg shadow-lg z-10">
        <div className="flex flex-col items-center justify-center gap-2 mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            Employee Registration
          </h1>
          <p className="text-sm md:text-base text-center">
            Government Employee Management System (GEMS)
          </p>
        </div>
        <EmployeeRegisterNotice />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!showOtpInput ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <Label
                  htmlFor="empname"
                  className="mb-2 font-medium text-gray-700"
                >
                  Name
                </Label>
                <Input
                  id="empname"
                  {...register("empname")}
                  className="p-2 border border-gray-300 rounded-none"
                  placeholder="Enter your full name"
                />
                {errors.empname && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.empname.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="dateOfBirth"
                  className="mb-2 font-medium text-gray-700"
                >
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  className="p-2 border border-gray-300 rounded-none"
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="phoneNumber"
                  className="mb-2 font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber")}
                  className="p-2 border border-gray-300 rounded-none"
                  placeholder="Enter your phone number"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="email"
                  className="mb-2 font-medium text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="p-2 border border-gray-300 rounded-none"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="password"
                  className="mb-2 font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="p-2 border border-gray-300 rounded-none"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="confirmPassword"
                  className="mb-2 font-medium text-gray-700"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className="p-2 border border-gray-300 rounded-none"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="cadreName"
                  className="mb-2 font-medium text-gray-700"
                >
                  Cadre
                </Label>
                <Select onValueChange={handleSelectChange}>
                  <SelectTrigger className="p-2 border border-gray-300 rounded-none">
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
                {errors.cadreName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cadreName.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="department"
                  className="mb-2 font-medium text-gray-700"
                >
                  Department
                </Label>
                <Input
                  id="department"
                  {...register("department")}
                  readOnly
                  className="p-2 border border-gray-300 rounded-none bg-gray-100"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <Label htmlFor="otp" className="mb-2 font-medium text-gray-700">
                OTP
              </Label>
              <Input
                id="otp"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                className="p-2 border border-gray-300 rounded-none"
                placeholder="Enter the OTP sent to your mobile"
                required
              />
            </div>
          )}
          <Button
            type="submit"
            className="border-indigo-600 bg-indigo-600 hover:bg-indigo-700 p-6 rounded-none w-full text-lg flex justify-center items-center mt-6"
            disabled={loading}
          >
            {loading ? (
              <BarLoader width={100} height={3} color={"#ffffff"} />
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
