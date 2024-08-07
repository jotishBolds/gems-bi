"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { RoleType } from "@prisma/client";
import { Lock, User } from "lucide-react";
import { useBiToast } from "@/components/page-layout/toast/use-toast";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  mobileNumber: string;
  role: RoleType;
  employee?: {
    employeeId: string;
    empname: string;
    department: string;
    cadre?: {
      name: string;
    };
  };
}

interface PasswordChangeForm {
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const showToast = useBiToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeForm>();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user?.email) {
      fetchProfile(session.user.email);
    }
  }, [status, session, router]);

  const fetchProfile = async (email: string) => {
    try {
      const response = await fetch(`/api/profile?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        showToast({
          title: "Error",
          description: "Failed to fetch profile",
          type: "destructive",
          actiontext: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred",
        type: "destructive",
        actiontext: "Try Again",
      });
    }
  };

  const onPasswordChange: SubmitHandler<PasswordChangeForm> = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      showToast({
        title: "Error",
        description: "Passwords do not match",
        type: "destructive",
        actiontext: "Try Again",
      });
      return;
    }

    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile?.email,
          newPassword: data.newPassword,
        }),
      });

      if (response.ok) {
        showToast({
          title: "Success",
          description: "Password updated successfully",
          type: "default",
          actiontext: "Close",
        });
        reset();
      } else {
        showToast({
          title: "Error",
          description: "Failed to update password",
          type: "destructive",
          actiontext: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred",
        type: "destructive",
        actiontext: "Try Again",
      });
    }
  };

  if (!profile) {
    return (
      <div className="container mx-auto p-4 mt-0 md:mt-36">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-0 md:mt-36">
      <div className="container mx-auto p-4 ">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
            <CardDescription>
              View and manage your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">
                  <User className="mr-2 h-4 w-4" />
                  Profile Info
                </TabsTrigger>
                <TabsTrigger value="password">
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={profile.username} disabled />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} disabled />
                  </div>
                  <div>
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      value={profile.mobileNumber}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={profile.role} disabled />
                  </div>
                  {profile.employee && (
                    <>
                      <div>
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input
                          id="employeeId"
                          value={profile.employee.employeeId}
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="empname">Employee Name</Label>
                        <Input
                          id="empname"
                          value={profile.employee.empname}
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={profile.employee.department}
                          disabled
                        />
                      </div>
                      {profile.employee.cadre && (
                        <div>
                          <Label htmlFor="cadre">Cadre</Label>
                          <Input
                            id="cadre"
                            value={profile.employee.cadre.name}
                            disabled
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="password" className="mt-4">
                <form onSubmit={handleSubmit(onPasswordChange)}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...register("newPassword", {
                          required: "New password is required",
                        })}
                      />
                      {errors.newPassword && (
                        <p className="text-sm text-red-500">
                          {errors.newPassword.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...register("confirmPassword", {
                          required: "Please confirm your new password",
                        })}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    <Button type="submit">Change Password</Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
