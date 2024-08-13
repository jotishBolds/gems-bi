"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ZodError, z } from "zod";
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
import Canvas from "@/app/auth/signin/canva";

// Define Zod schemas for form validation
const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or Employee ID is required"),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ForgotPassword: React.FC = () => {
  const [formData, setFormData] = useState({ identifier: "" });
  const [resetPasswordData, setResetPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [otpTimer, setOtpTimer] = useState(120);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [isOtpValid, setIsOtpValid] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);

  const router = useRouter();
  const showToast = useBiToast();
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Check if the identifier is in the employee ID format
    setIsEmployee(/^\d+\/[A-Z]+\/\d+$/.test(value));
  };

  const handleResetPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setResetPasswordData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      forgotPasswordSchema.parse(formData);

      // Send request to forgot password API
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: formData.identifier }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtpModal(true);
        setOtpTimer(120);
        setCanResendOtp(false);
        showToast({
          title: "OTP Sent",
          description: "An OTP has been sent to your registered mobile number",
          type: "default",
          actiontext: "Enter OTP",
        });
        speakMessage(
          "Please enter the OTP sent to your registered mobile number"
        );
      } else {
        showToast({
          title: "Error",
          description: data.message || "An error occurred",
          type: "destructive",
          actiontext: "Try Again",
        });
        speakMessage("An error occurred. Please try again.");
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (typeof err.path[0] === "string") {
            formattedErrors[err.path[0]] = err.message;
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
      const response = await fetch("/api/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.identifier,
          otp: otp.join(""),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtpModal(false);
        setShowResetPasswordModal(true);
        speakMessage("OTP verified successfully. Please reset your password.");
      } else {
        showToast({
          title: "Error",
          description: data.message || "Failed to verify OTP",
          type: "destructive",
          actiontext: "Try Again",
        });
        speakMessage("OTP verification failed. Please try again.");
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      resetPasswordSchema.parse(resetPasswordData);

      const response = await fetch("/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: resetPasswordData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          title: "Success",
          description: "Your password has been reset successfully",
          type: "default",
          actiontext: "Sign In",
        });
        speakMessage(
          "Your password has been reset successfully. Please sign in with your new password."
        );
        router.push("/auth/signin");
      } else {
        showToast({
          title: "Error",
          description: data.message || "Failed to reset password",
          type: "destructive",
          actiontext: "Try Again",
        });
        speakMessage("Failed to reset password. Please try again.");
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (typeof err.path[0] === "string") {
            formattedErrors[err.path[0]] = err.message;
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

  const handleResendOtp = async () => {
    setResendingOtp(true);
    try {
      const response = await fetch("/api/forgot-password/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: formData.identifier }),
      });

      const data = await response.json();

      if (response.ok) {
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
          description: data.message || "Failed to resend OTP",
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
          <h1 className="text-3xl font-bold text-center">Forgot Password</h1>
          <p className="text-center mb-6">
            Government Employee Management System (GEMS)
          </p>
        </div>
        <form onSubmit={handleForgotPassword} className="space-y-4">
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
          <Button
            type="submit"
            className="border-indigo-600 bg-indigo-600 hover:bg-indigo-700 p-6 rounded-none w-full text-lg flex justify-center items-center mt-6"
            disabled={loading}
          >
            {loading ? (
              <BarLoader width={100} height={3} color={"#ffffff"} />
            ) : (
              "Reset Password"
            )}
          </Button>
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
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-6 gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  otpInputRefs.current[index] = el;
                }}
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
              className="border-indigo-600 bg-indigo-600 hover:bg-indigo-700 rounded-none"
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

      <Dialog
        open={showResetPasswordModal}
        onOpenChange={setShowResetPasswordModal}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="mb-2 font-medium text-gray-700"
              >
                New Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                value={resetPasswordData.password}
                onChange={handleResetPasswordChange}
                className="p-2 border border-gray-300 rounded-none"
                placeholder="Enter your new password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="confirmPassword"
                className="mb-2 font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={resetPasswordData.confirmPassword}
                onChange={handleResetPasswordChange}
                className="p-2 border border-gray-300 rounded-none"
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <DialogFooter className="sm:justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setShowResetPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="border-indigo-600 bg-indigo-600 hover:bg-indigo-700 rounded-none"
              >
                {loading ? (
                  <BarLoader width={50} height={3} color={"#ffffff"} />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForgotPassword;
