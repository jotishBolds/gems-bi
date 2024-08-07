"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScaleLoader } from "react-spinners";
import { Info, Lock } from "lucide-react";
import AdminSideBarLayout from "@/components/page-layout/sidebar/admin-sidebar-layput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Employee {
  employeeId: string;
  empname: string;
  fatherName: string;
  profileImage: string | null;
  dateOfBirth: string;
  gender: string;
  maritalstatus: string;
  department: string;
  presentdesignation: string;
  dateOfInitialAppointment: string;
  createdAt: string | null;
}

interface User {
  id: string;
  username: string;
  email: string;
  mobileNumber: string;
  role: string;
  verificationStatus: string;

  employee: Employee | null;
}

const UserProfileManagement: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "ADMIN") {
      fetchUsers();
    } else if (status !== "loading") {
      router.push("/auth/signin");
    }
  }, [status, session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users/update");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUpdateStatus = (createdAt: string | null | undefined) => {
    if (!createdAt) {
      return {
        status: "Unknown",
        badge: "default" as const,
        class: "bg-gray-400",
      };
    }

    const profileCreationDate = new Date(createdAt);
    const threeMonthsAfterCreation = new Date(profileCreationDate);
    threeMonthsAfterCreation.setMonth(threeMonthsAfterCreation.getMonth() + 3);
    const now = new Date();

    const sevenDaysBeforeExpiration = new Date(
      threeMonthsAfterCreation.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    if (now > threeMonthsAfterCreation) {
      return {
        status: "Expired",
        badge: "destructive" as const,
        class: "bg-red-600",
      };
    } else if (
      now >= sevenDaysBeforeExpiration &&
      now <= threeMonthsAfterCreation
    ) {
      return {
        status: "Expiring Soon",
        badge: "secondary" as const,
        class: "bg-orange-300 w-[105px] text-center items-center",
      };
    } else {
      return {
        status: "Active",
        badge: "default" as const,
        class: "bg-green-600",
      };
    }
  };

  const isUpdatePermanentlyDisabled = (
    createdAt: string | null | undefined
  ) => {
    if (!createdAt) {
      return false;
    }

    const profileCreationDate = new Date(createdAt);
    const threeMonthsAfterCreation = new Date(profileCreationDate);
    threeMonthsAfterCreation.setMonth(threeMonthsAfterCreation.getMonth() + 3);
    return new Date() > threeMonthsAfterCreation;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ScaleLoader />
      </div>
    );
  }

  return (
    <AdminSideBarLayout>
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              User Profile Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Profile</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Mobile
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Department
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Designation
                    </TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Update Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const { status, badge } = getUpdateStatus(
                      user.employee?.createdAt
                    );
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={user.employee?.profileImage || undefined}
                              alt={user.employee?.empname || user.username}
                            />
                            <AvatarFallback>
                              {(user.employee?.empname || user.username)
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          {user.employee?.employeeId || "N/A"}
                        </TableCell>
                        <TableCell>
                          {user.employee?.empname || user.username}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.mobileNumber}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {user.employee?.department || "N/A"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {user.employee?.presentdesignation || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.verificationStatus === "Verified"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {user.verificationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={badge}
                            className={
                              getUpdateStatus(user.employee?.createdAt).class
                            }
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => setSelectedUser(user)}
                                variant="outline"
                                size="sm"
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Employee Profile</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="grid gap-4 py-4">
                                  <div className="flex items-center space-x-4">
                                    <Avatar className="w-16 h-16">
                                      <AvatarImage
                                        src={
                                          selectedUser.employee?.profileImage ||
                                          undefined
                                        }
                                        alt={
                                          selectedUser.employee?.empname ||
                                          selectedUser.username
                                        }
                                      />
                                      <AvatarFallback>
                                        {(
                                          selectedUser.employee?.empname ||
                                          selectedUser.username
                                        )
                                          .charAt(0)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-lg font-semibold">
                                        {selectedUser.employee?.empname ||
                                          selectedUser.username}
                                      </h3>
                                      <p className="text-sm text-gray-500">
                                        {selectedUser.employee
                                          ?.presentdesignation || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <ProfileField
                                      label="Employee ID"
                                      value={selectedUser.employee?.employeeId}
                                    />
                                    <ProfileField
                                      label="Department"
                                      value={selectedUser.employee?.department}
                                    />
                                    <ProfileField
                                      label="Email"
                                      value={selectedUser.email}
                                    />
                                    <ProfileField
                                      label="Mobile"
                                      value={selectedUser.mobileNumber}
                                    />
                                    <ProfileField
                                      label="Date of Birth"
                                      value={formatDate(
                                        selectedUser.employee?.dateOfBirth || ""
                                      )}
                                    />
                                    <ProfileField
                                      label="Gender"
                                      value={selectedUser.employee?.gender}
                                    />
                                    <ProfileField
                                      label="Marital Status"
                                      value={
                                        selectedUser.employee?.maritalstatus
                                      }
                                    />
                                    <ProfileField
                                      label="Date of Initial Appointment"
                                      value={formatDate(
                                        selectedUser.employee
                                          ?.dateOfInitialAppointment || ""
                                      )}
                                    />
                                  </div>
                                  <div className="mt-4">
                                    <h4 className="font-semibold mb-2">
                                      Update Status
                                    </h4>
                                    <Badge
                                      variant={
                                        getUpdateStatus(
                                          selectedUser.employee?.createdAt
                                        ).badge
                                      }
                                    >
                                      {
                                        getUpdateStatus(
                                          selectedUser.employee?.createdAt
                                        ).status
                                      }
                                    </Badge>
                                  </div>
                                  {selectedUser.employee?.createdAt &&
                                    isUpdatePermanentlyDisabled(
                                      selectedUser.employee.createdAt
                                    ) && (
                                      <Alert variant="destructive">
                                        <Lock className="h-4 w-4" />
                                        <AlertTitle>Profile Locked</AlertTitle>
                                        <AlertDescription>
                                          This profile is permanently locked and
                                          can no longer be updated. The lock was
                                          applied 3 months after the profile
                                          creation on{" "}
                                          {formatDate(
                                            selectedUser.employee?.createdAt
                                          )}
                                          .
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Alert variant="default" className="mt-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Update Period Information</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5">
              <li>
                <span className="font-semibold">Active:</span> User can update
                their profile
              </li>
              <li>
                <span className="font-semibold">Expiring Soon:</span> Update
                period ends within 7 days
              </li>
              <li>
                <span className="font-semibold">Expired:</span> Profile is
                locked and can no longer be updated
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </AdminSideBarLayout>
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

export default UserProfileManagement;
