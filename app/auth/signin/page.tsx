"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ZodError } from "zod";
import { SignInSchemaType, signInSchema } from "@/lib/zod/sign-in-schemas";
import { useBiToast } from "@/components/page-layout/toast/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BarLoader } from "react-spinners";
import { Volume2, VolumeX } from "lucide-react";
import Canvas from "./canva";
import { RoleType } from "@prisma/client";
import Link from "next/link";

const roleDashboardMap: Record<RoleType, string> = {
  ADMIN: "/dashboard",
  EMPLOYEE: "/employee-dashboard",
  CADRE_CONTROLLING_AUTHORITY: "/cadre/statistics",
  CM: "/emp-stats",
  CS: "/emp-stats",
  DOP: "/emp-stats",
};

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState<SignInSchemaType>({
    identifier: "",
    password: "",
  });
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<SignInSchemaType>>({});
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(120);
  const [canResendOtp, setCanResendOtp] = useState<boolean>(false);
  const [isOtpValid, setIsOtpValid] = useState<boolean>(false);
  const [resendingOtp, setResendingOtp] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [isEmployee, setIsEmployee] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const showToast = useBiToast();
  const { data: session, status } = useSession();
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check for employeeId in URL parameters
    const employeeId = searchParams.get("employeeId");
    if (employeeId) {
      setFormData((prev) => ({ ...prev, identifier: employeeId }));
      setIsEmployee(true);
    }
  }, [searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const userRole = session.user.role as RoleType;
      const dashboardRoute = roleDashboardMap[userRole] || "/default-dashboard";
      router.push(dashboardRoute);
    }
  }, [status, session, router]);

  const speakMessage = (message: string) => {
    if (voiceEnabled && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    speakMessage(voiceEnabled ? "Voice disabled" : "Voice enabled");
  };

  const setOtpInputRef = useCallback(
    (index: number) => (el: HTMLInputElement | null) => {
      otpInputRefs.current[index] = el;
    },
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Check if the identifier is in the employee ID format
    setIsEmployee(/^\d+\/[A-Z]+\/\d+$/.test(value));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }

      setIsOtpValid(newOtp.every((digit) => digit !== ""));
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      signInSchema.parse(formData);

      const result = await signIn("credentials", {
        redirect: false,
        identifier: formData.identifier,
        password: formData.password,
      });

      if (result?.error) {
        if (result.error === "OTP_REQUIRED") {
          setShowOtpModal(true);
          setOtpTimer(120);
          setCanResendOtp(false);
          showToast({
            title: "OTP Required",
            description:
              "An OTP has been sent to your registered mobile number",
            type: "default",
            actiontext: "Enter OTP",
          });
          speakMessage(
            "Please enter the OTP sent to your registered mobile number"
          );
        } else if (result.error === "EMPLOYEE_ID_REQUIRED") {
          showToast({
            title: "Employee ID Required",
            description:
              "Employees must sign in using their Employee ID, not email",
            type: "destructive",
            actiontext: "Try Again",
          });
          speakMessage(
            "Employees must sign in using their Employee ID, not email. Please try again."
          );
        } else {
          showToast({
            title: "Error",
            description: result.error,
            type: "destructive",
            actiontext: "Try Again",
          });
          speakMessage("Sign in failed. Please try again.");
        }
      } else if (result?.ok) {
        router.push("/dashboard");
        speakMessage("Sign in successful. Welcome to your dashboard.");
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Partial<SignInSchemaType> = {};
        error.errors.forEach((err) => {
          if (typeof err.path[0] === "string") {
            formattedErrors[err.path[0] as keyof SignInSchemaType] =
              err.message;
          }
        });
        setErrors(formattedErrors);
        speakMessage("Please check your input and try again.");
      } else {
        showToast({
          title: "Error",
          description: "An unexpected error occurred",
          type: "destructive",
          actiontext: "Try Again",
        });
        speakMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isOtpValid) {
      showToast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        type: "destructive",
        actiontext: "Try Again",
      });
      speakMessage("Invalid OTP. Please enter a valid 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: formData.identifier,
        password: formData.password,
        otp: otp.join(""),
      });

      if (result?.error) {
        showToast({
          title: "Error",
          description: result.error,
          type: "destructive",
          actiontext: "Try Again",
        });
        speakMessage("OTP verification failed. Please try again.");
      } else if (result?.ok) {
        setShowOtpModal(false);
        router.push("/dashboard");
        speakMessage("OTP verified successfully. Welcome to your dashboard.");
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: "An unexpected error occurred",
        type: "destructive",
        actiontext: "Try Again",
      });
      speakMessage("An unexpected error occurred. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setResendingOtp(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: formData.identifier,
        password: formData.password,
      });

      if (result?.error === "OTP_REQUIRED") {
        setOtpTimer(120);
        setCanResendOtp(false);
        setOtp(["", "", "", "", "", ""]);
        setIsOtpValid(false);
        showToast({
          title: "OTP Resent",
          description:
            "A new OTP has been sent to your registered mobile number",
          type: "default",
          actiontext: "Enter OTP",
        });
        speakMessage(
          "A new OTP has been sent to your registered mobile number"
        );
      } else {
        showToast({
          title: "Error",
          description: "Failed to resend OTP. Please try again.",
          type: "destructive",
          actiontext: "Try Again",
        });
        speakMessage("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: "An unexpected error occurred",
        type: "destructive",
        actiontext: "Try Again",
      });
      speakMessage("An unexpected error occurred. Please try again.");
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] md:h-[80vh] py-2">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <Canvas canvasRef={canvasRef} />
      <div className="w-full max-w-xl p-8 z-10">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-3xl font-bold text-center">Sign In</h1>
          <p className="text-center mb-6">
            Government Employee Management System (GEMS)
          </p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="flex flex-col">
            <label
              htmlFor="identifier"
              className="mb-2 font-medium text-gray-700"
            >
              {isEmployee ? "Employee ID" : "Email or Employee ID"}
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-none"
              placeholder={
                isEmployee
                  ? "Enter your employee ID"
                  : "Enter your email or employee ID"
              }
            />
            {errors.identifier && (
              <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="password"
              className="mb-2 font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-none"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <Button
            type="submit"
            className="border-indigo-600 bg-indigo-600  hover:bg-indigo-700 p-6 rounded-none w-full text-lg flex justify-center items-center mt-6"
            disabled={loading}
          >
            {loading ? (
              <BarLoader width={100} height={3} color={"#ffffff"} />
            ) : (
              "Sign In"
            )}
          </Button>
          <Link href={"/forgot-pass"}>
            {" "}
            <p className="text-center text-gray-500 text-sm mt-2">
              Forgot your password?
            </p>
          </Link>
        </form>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            onClick={toggleVoice}
            className="border-indigo-600 bg-indigo-50 hover:bg-indigo-100 flex items-center text-sm text-gray-600"
          >
            {voiceEnabled ? (
              <Volume2 className="mr-2 h-4 w-4" />
            ) : (
              <VolumeX className="mr-2 h-4 w-4" />
            )}
            {voiceEnabled ? "Disable Voice" : "Enable Voice"}
          </Button>
        </div>
      </div>

      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent
          className="sm:max-w-md "
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-6 gap-2 ">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={setOtpInputRef(index)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-full text-center text-xl font-bold"
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-center text-gray-600">
            {otpTimer > 0 ? (
              `Resend OTP in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60)
                .toString()
                .padStart(2, "0")}`
            ) : (
              <>
                Didn&apos;t receive the code?{" "}
                <Button
                  variant="link"
                  className="p-0"
                  onClick={handleResendOtp}
                  disabled={!canResendOtp || resendingOtp}
                >
                  {resendingOtp ? "Resending..." : "Resend OTP"}
                </Button>
              </>
            )}
          </p>
          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setShowOtpModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleVerifyOtp}
              disabled={verifyingOtp || !isOtpValid}
              className="border-indigo-600 bg-indigo-600  hover:bg-indigo-700 rounded-none"
            >
              {verifyingOtp ? (
                <BarLoader width={50} height={3} color={"#ffffff"} />
              ) : (
                "Verify OTP"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignIn;
