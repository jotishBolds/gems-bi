"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import SideBarLayout from "@/components/page-layout/sidebar/sidebar-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScaleLoader } from "react-spinners";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  Trash2,
  User,
  X,
} from "lucide-react";
import AdminSideBarLayout from "@/components/page-layout/sidebar/admin-sidebar-layput";
import Image from "next/image";
import { Cadre, CombinedUserData } from "@/types/user";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<CombinedUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [noEmployeeDetails, setNoEmployeeDetails] = useState(false);
  const { register, handleSubmit, setValue, reset, watch } =
    useForm<CombinedUserData>();
  const [cadres, setCadres] = useState<Cadre[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<{
    [key: string]: CombinedUserData | null;
  }>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const [searchUsername, setSearchUsername] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchRole, setSearchRole] = useState("EMPLOYEE");
  const [verificationStatus, setVerificationStatus] = useState<{
    [key: string]: string;
  }>({});
  const [formData, setFormData] = useState<CombinedUserData | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (editingUserId && expandedUsers[editingUserId]) {
      const userData = expandedUsers[editingUserId];
      const initialData = {
        ...userData,
        emailaddress: userData.email,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
          : "",
        dateOfInitialAppointment: userData.dateOfInitialAppointment
          ? new Date(userData.dateOfInitialAppointment)
              .toISOString()
              .split("T")[0]
          : "",
        dateOfAppointmentGazettedGrade: userData.dateOfAppointmentGazettedGrade
          ? new Date(userData.dateOfAppointmentGazettedGrade)
              .toISOString()
              .split("T")[0]
          : "",
        dateOfAppointmentPresentPost: userData.dateOfAppointmentPresentPost
          ? new Date(userData.dateOfAppointmentPresentPost)
              .toISOString()
              .split("T")[0]
          : "",
        retirement: userData.retirement
          ? new Date(userData.retirement).toISOString().split("T")[0]
          : "",
        dateOfLastPromotionOfficiating: userData.dateOfLastPromotionOfficiating
          ? new Date(userData.dateOfLastPromotionOfficiating)
              .toISOString()
              .split("T")[0]
          : "",
        dateOfLastPromotionSubstantive: userData.dateOfLastPromotionSubstantive
          ? new Date(userData.dateOfLastPromotionSubstantive)
              .toISOString()
              .split("T")[0]
          : "",
        cadreId: userData.cadre?.id,
      };
      setFormData(initialData);
      reset(initialData);
    }
  }, [editingUserId, expandedUsers, reset]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchUsername, searchEmail, searchRole]);

  const filteredUsers = users.filter((user) => {
    return (
      (searchUsername === "" ||
        user.username.toLowerCase().includes(searchUsername.toLowerCase())) &&
      (searchEmail === "" ||
        user.email.toLowerCase().includes(searchEmail.toLowerCase())) &&
      (searchRole === "ALL_ROLES" || user.role === searchRole)
    );
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data: CombinedUserData[] = await res.json();
        setUsers(data);
        // Update verificationStatus state based on the fetched data
        const newVerificationStatus = data.reduce(
          (acc: { [key: string]: string }, user: CombinedUserData) => {
            acc[user.id] = user.verificationStatus || "Pending";
            return acc;
          },
          {}
        );
        setVerificationStatus(newVerificationStatus);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCadres = useCallback(async () => {
    try {
      const res = await fetch("/api/cadre");
      if (res.ok) {
        const data = await res.json();
        setCadres(data);
      } else {
        console.error("Failed to fetch cadres");
      }
    } catch (error) {
      console.error("Error fetching cadres:", error);
    }
  }, []);
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/cadre/department");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      } else {
        console.error("Failed to fetch departments");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  }, []);
  const handleVerifyUser = async (userId: string, status: boolean) => {
    try {
      const newStatus = status ? "Verified" : "Pending";
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setVerificationStatus((prev) => ({
          ...prev,
          [userId]: updatedUser.verificationStatus,
        }));
        // Update the users state as well
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { ...user, verificationStatus: updatedUser.verificationStatus }
              : user
          )
        );
      } else {
        console.error("Failed to update verification status");
        // Revert the switch if the API call fails
        setVerificationStatus((prev) => ({
          ...prev,
          [userId]: prev[userId],
        }));
      }
    } catch (error) {
      console.error("Error updating verification status:", error);
      // Revert the switch if there's an error
      setVerificationStatus((prev) => ({
        ...prev,
        [userId]: prev[userId],
      }));
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "ADMIN") {
      fetchUsers();
      fetchCadres();
      fetchDepartments();
    } else if (status !== "loading") {
      router.push("/auth/admin/login");
    }
  }, [status, session, router, fetchUsers, fetchCadres]);
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

  const fetchUserDetails = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data: CombinedUserData = await res.json();
        setExpandedUsers((prev) => ({ ...prev, [userId]: data }));
        setNoEmployeeDetails(!data.empname);
      } else {
        console.error("Failed to fetch user details");
        setExpandedUsers((prev) => ({ ...prev, [userId]: null }));
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setExpandedUsers((prev) => ({ ...prev, [userId]: null }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    if (expandedUsers[userId]) {
      setExpandedUsers((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      setEditingUserId(null);
    } else {
      fetchUserDetails(userId);
    }
  };

  const handleEditClick = (userId: string) => {
    setEditingUserId(userId);
    const userData = expandedUsers[userId];
    if (userData) {
      reset({
        ...userData,
        emailaddress: userData.email,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
          : "",
        dateOfInitialAppointment: userData.dateOfInitialAppointment
          ? new Date(userData.dateOfInitialAppointment)
              .toISOString()
              .split("T")[0]
          : "",
        dateOfAppointmentGazettedGrade: userData.dateOfAppointmentGazettedGrade
          ? new Date(userData.dateOfAppointmentGazettedGrade)
              .toISOString()
              .split("T")[0]
          : "",
        dateOfAppointmentPresentPost: userData.dateOfAppointmentPresentPost
          ? new Date(userData.dateOfAppointmentPresentPost)
              .toISOString()
              .split("T")[0]
          : "",
        retirement: userData.retirement
          ? new Date(userData.retirement).toISOString().split("T")[0]
          : "",
        dateOfLastPromotionOfficiating: userData.dateOfLastPromotionOfficiating
          ? new Date(userData.dateOfLastPromotionOfficiating)
              .toISOString()
              .split("T")[0]
          : "",
        dateOfLastPromotionSubstantive: userData.dateOfLastPromotionSubstantive
          ? new Date(userData.dateOfLastPromotionSubstantive)
              .toISOString()
              .split("T")[0]
          : "",
        cadreId: userData.cadre?.id,
      });
    }
  };

  const handleCreateUser = () => {
    router.push("/admin/create-user");
  };

  const handleUpdateUser = async (data: CombinedUserData) => {
    if (!editingUserId || !formData) return;
    setIsUpdating(true);
    try {
      const updatedData = {
        ...formData,
        id: editingUserId,
        role: expandedUsers[editingUserId]?.role,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : null,
        dateOfInitialAppointment: formData.dateOfInitialAppointment
          ? new Date(formData.dateOfInitialAppointment).toISOString()
          : null,
        dateOfAppointmentGazettedGrade: formData.dateOfAppointmentGazettedGrade
          ? new Date(formData.dateOfAppointmentGazettedGrade).toISOString()
          : null,
        dateOfAppointmentPresentPost: formData.dateOfAppointmentPresentPost
          ? new Date(formData.dateOfAppointmentPresentPost).toISOString()
          : null,
        retirement: formData.retirement
          ? new Date(formData.retirement).toISOString()
          : null,
        dateOfLastPromotionOfficiating: formData.dateOfLastPromotionOfficiating
          ? new Date(formData.dateOfLastPromotionOfficiating).toISOString()
          : null,
        dateOfLastPromotionSubstantive: formData.dateOfLastPromotionSubstantive
          ? new Date(formData.dateOfLastPromotionSubstantive).toISOString()
          : null,
        spouseName:
          formData.maritalstatus === "Married" ? formData.spouseName : null,
        totalChildren:
          formData.maritalstatus === "Married" ? formData.totalChildren : null,
      };
      const res = await fetch(`/api/admin/users/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const updatedUser: CombinedUserData = await res.json();
        setExpandedUsers((prev) => ({ ...prev, [editingUserId]: updatedUser }));
        setEditingUserId(null);
        fetchUsers();
        setExpandedUsers((prev) => {
          const newState = { ...prev };
          delete newState[editingUserId];
          return newState;
        });
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchUsers();
          setExpandedUsers((prev) => {
            const newState = { ...prev };
            delete newState[userId];
            return newState;
          });
          setEditingUserId(null);
        } else {
          console.error("Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleCadreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCadreId = e.target.value;
    const selectedCadre = cadres.find((cadre) => cadre.id === selectedCadreId);
    if (selectedCadre) {
      setFormData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          cadreId: selectedCadreId,
          department: selectedCadre.controllingDepartment ?? prev.department,
        };
      });
    }
  };
  const fields = [
    {
      id: "searchUsername",
      label: "Username",
      icon: "👤",
      state: searchUsername,
      setState: setSearchUsername,
      type: "text",
    },
    {
      id: "searchEmail",
      label: "Email",
      icon: "✉️",
      state: searchEmail,
      setState: setSearchEmail,
      type: "text",
    },
    {
      id: "searchRole",
      label: "Role",
      icon: "",
      state: searchRole,
      setState: setSearchRole,
      type: "select",
      options: [
        { value: "ALL_ROLES", label: "All Roles" },
        { value: "ADMIN", label: "Admin" },
        { value: "EMPLOYEE", label: "Employee" },
        { value: "CM", label: "CM" },
        { value: "DOP", label: "DOP" },
        { value: "CS", label: "CS" },
        {
          value: "CADRE_CONTROLLING_AUTHORITY",
          label: "Cadre Controlling Authority",
        },
      ],
    },
  ];
  if (status === "loading" || isLoading) {
    return (
      <AdminSideBarLayout>
        <div className="flex justify-center items-center h-screen">
          <ScaleLoader color="#000000" loading={true} height={50} />
        </div>
      </AdminSideBarLayout>
    );
  }

  if (status === "unauthenticated" || session?.user.role !== "ADMIN") {
    router.push("/auth/admin/login");
    return null;
  }

  const renderTableCell = (label: string, value: string | undefined) => (
    <TableCell>
      <div className="flex">
        <div className="font-bold mr-2">{label}:</div>
        <div>{value || "N/A"}</div>
      </div>
    </TableCell>
  );
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

  const renderFormField = (
    name: keyof CombinedUserData,
    label: string,
    type: string,
    options: Array<string | { value: string; label: string }> | null = null,
    disabled = false
  ) => (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}:
      </label>
      {type === "select" ? (
        <select
          id={name}
          {...register(name)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
          value={(formData?.[name] as string) || ""}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => {
              if (!prev) return null;
              if (name === "cadreId") {
                handleCadreChange(e);
                return prev; // handleCadreChange will update the state
              }
              return {
                ...prev,
                [name]: value,
              };
            });
          }}
        >
          <option value="">Select {label}</option>
          {options &&
            options.map((option, index) => (
              <option
                key={index}
                value={typeof option === "string" ? option : option.value}
              >
                {typeof option === "string" ? option : option.label}
              </option>
            ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          {...register(name)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled || name === "retirement"}
          value={(formData?.[name] as string) || ""}
          onChange={(e) =>
            setFormData((prev) =>
              prev ? { ...prev, [name]: e.target.value } : null
            )
          }
        />
      )}
    </div>
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  return (
    <AdminSideBarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          User Management
        </h1>
        <div className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Search Users
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-medium text-gray-700"
                  >
                    {field.label}
                  </Label>
                  <div className="relative">
                    {field.type === "text" ? (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {field.icon}
                        </span>
                        <Input
                          id={field.id}
                          type="text"
                          value={field.state}
                          onChange={(e) => field.setState(e.target.value)}
                          className="pl-10"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      </div>
                    ) : (
                      <Select
                        value={field.state}
                        onValueChange={field.setState}
                      >
                        <SelectTrigger className="w-full">
                          <span className="absolute left-3 text-gray-500">
                            {field.icon}
                          </span>
                          <SelectValue
                            placeholder={`Select ${field.label.toLowerCase()}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Mobile
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Role
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profileImage ? (
                            <Image
                              src={user.profileImage}
                              alt={`${user.username}'s profile`}
                              width={40}
                              height={40}
                              className="rounded-full mr-3"
                              unoptimized
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <User className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500 sm:hidden">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                        {user.email}
                      </TableCell>
                      <TableCell className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                        {user.mobileNumber}
                      </TableCell>
                      <TableCell className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                        {user.role}
                      </TableCell>
                      <TableCell className="px-4 py-4 whitespace-nowrap">
                        {user.role === "EMPLOYEE" && (
                          <div className="flex items-center justify-between">
                            <span
                              className={`mr-2 font-medium ${
                                verificationStatus[user.id] === "Verified"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {verificationStatus[user.id] || "Pending"}
                            </span>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={
                                  verificationStatus[user.id] === "Verified"
                                }
                                onCheckedChange={(checked) =>
                                  handleVerifyUser(user.id, checked)
                                }
                              />
                              <span className="text-sm text-gray-500">
                                {verificationStatus[user.id] === "Verified" ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <X className="w-4 h-4 text-red-500" />
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button
                            onClick={() => handleUserClick(user.id)}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            {expandedUsers[user.id] ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" /> Collapse
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" /> Expand
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            variant="destructive"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedUsers[user.id] && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                            {noEmployeeDetails ? (
                              <div className="text-gray-500 italic">
                                No Employee Details Available
                              </div>
                            ) : (
                              <>
                                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                  User Details
                                </h2>
                                <Tabs
                                  defaultValue="personal"
                                  className="w-full"
                                >
                                  <TabsList className="grid grid-cols-2 h-full mb-8 md:grid-cols-4 gap-2 sm:gap-0  ">
                                    <TabsTrigger value="personal">
                                      Personal
                                    </TabsTrigger>
                                    <TabsTrigger value="address">
                                      Address
                                    </TabsTrigger>
                                    <TabsTrigger value="employment">
                                      Employment
                                    </TabsTrigger>
                                    <TabsTrigger value="other">
                                      Other
                                    </TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="personal">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                      {renderDetailItem(
                                        "First Name",
                                        expandedUsers[user.id]?.empname
                                      )}

                                      {renderDetailItem(
                                        "Father Name",
                                        expandedUsers[user.id]?.fatherName
                                      )}
                                      {renderDetailItem(
                                        "Date of Birth",
                                        expandedUsers[user.id]?.dateOfBirth,
                                        true
                                      )}
                                      {renderDetailItem(
                                        "Gender",
                                        expandedUsers[user.id]?.gender
                                      )}
                                      {renderDetailItem(
                                        "Phone Number",
                                        expandedUsers[user.id]?.phoneNumber
                                      )}
                                      {renderDetailItem(
                                        "Email Address",
                                        expandedUsers[user.id]?.emailaddress
                                      )}
                                      {renderDetailItem(
                                        "Marital Status",
                                        expandedUsers[user.id]?.maritalstatus
                                      )}
                                      {expandedUsers[user.id]?.maritalstatus ===
                                        "Married" && (
                                        <>
                                          {renderDetailItem(
                                            "Spouse Name",
                                            expandedUsers[user.id]?.spouseName
                                          )}
                                          {renderDetailItem(
                                            "Total Children",
                                            expandedUsers[user.id]
                                              ?.totalChildren
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="address">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                      {renderDetailItem(
                                        "State",
                                        expandedUsers[user.id]?.state
                                      )}
                                      {renderDetailItem(
                                        "District",
                                        expandedUsers[user.id]?.district
                                      )}
                                      {renderDetailItem(
                                        "Constituency",
                                        expandedUsers[user.id]?.constituency
                                      )}
                                      {renderDetailItem(
                                        "GPU(Gram Panchayat Unit)",
                                        expandedUsers[user.id]?.gpu
                                      )}
                                      {renderDetailItem(
                                        "Ward",
                                        expandedUsers[user.id]?.ward
                                      )}
                                      {renderDetailItem(
                                        "Pincode",
                                        expandedUsers[user.id]?.pin
                                      )}
                                      {renderDetailItem(
                                        "Police Station(PS)",
                                        expandedUsers[user.id]?.policestation
                                      )}
                                      {renderDetailItem(
                                        "Post Office(PO)",
                                        expandedUsers[user.id]?.postoffice
                                      )}
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="employment">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                      {renderDetailItem(
                                        "Cadre",
                                        expandedUsers[user.id]?.cadre?.name
                                      )}
                                      {renderDetailItem(
                                        "Controlling Department",
                                        expandedUsers[user.id]?.cadre
                                          ?.controllingDepartment
                                      )}
                                      {renderDetailItem(
                                        "Department",
                                        expandedUsers[user.id]?.department
                                      )}
                                      {renderDetailItem(
                                        "Present Designation",
                                        expandedUsers[user.id]
                                          ?.presentdesignation
                                      )}
                                      {renderDetailItem(
                                        "Department of Posting",
                                        expandedUsers[user.id]
                                          ?.departmentOfPosting
                                      )}
                                      {renderDetailItem(
                                        "Nature of Employment",
                                        expandedUsers[user.id]
                                          ?.natureOfEmployment
                                      )}
                                      {renderDetailItem(
                                        "Date of Initial Appointment",
                                        expandedUsers[user.id]
                                          ?.dateOfInitialAppointment,
                                        true
                                      )}
                                      {renderDetailItem(
                                        "Date of Appointment Gazetted Grade",
                                        expandedUsers[user.id]
                                          ?.dateOfAppointmentGazettedGrade,
                                        true
                                      )}
                                      {renderDetailItem(
                                        "Date of Appointment Present Post",
                                        expandedUsers[user.id]
                                          ?.dateOfAppointmentPresentPost,
                                        true
                                      )}
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="other">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                      {renderDetailItem(
                                        "Date of Last Promotion Officiating",
                                        expandedUsers[user.id]
                                          ?.dateOfLastPromotionOfficiating,
                                        true
                                      )}
                                      {renderDetailItem(
                                        "Date of Last Promotion Substantive",
                                        expandedUsers[user.id]
                                          ?.dateOfLastPromotionSubstantive,
                                        true
                                      )}
                                      {renderDetailItem(
                                        "Total Length of Service",
                                        expandedUsers[user.id]
                                          ?.TotalLengthOfSerive
                                      )}
                                      {renderDetailItem(
                                        "Retirement",
                                        expandedUsers[user.id]?.retirement,
                                        true
                                      )}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                                {editingUserId === user.id ? (
                                  <form
                                    onSubmit={handleSubmit(handleUpdateUser)}
                                    className="mt-8 space-y-6"
                                  >
                                    <Tabs
                                      defaultValue="personal"
                                      className="w-full"
                                    >
                                      <TabsList className="grid grid-cols-2 mb-8 sm:grid-cols-4 gap-2 sm:gap-0">
                                        <TabsTrigger value="personal">
                                          Personal
                                        </TabsTrigger>
                                        <TabsTrigger value="address">
                                          Address
                                        </TabsTrigger>
                                        <TabsTrigger value="employment">
                                          Employment
                                        </TabsTrigger>
                                        <TabsTrigger value="other">
                                          Other
                                        </TabsTrigger>
                                      </TabsList>
                                      <TabsContent value="personal">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {renderFormField(
                                            "empname",
                                            "Employee Name",
                                            "text"
                                          )}

                                          {renderFormField(
                                            "fatherName",
                                            "Father Name",
                                            "text"
                                          )}
                                          {renderFormField(
                                            "dateOfBirth",
                                            "Date of Birth",
                                            "date"
                                          )}
                                          {renderFormField(
                                            "gender",
                                            "Gender",
                                            "select",
                                            ["Male", "Female", "Other"]
                                          )}
                                          {renderFormField(
                                            "phoneNumber",
                                            "Phone Number",
                                            "text"
                                          )}
                                          {renderFormField(
                                            "emailaddress",
                                            "Email Address",
                                            "email"
                                          )}
                                          {renderFormField(
                                            "maritalstatus",
                                            "Marital Status",
                                            "select",
                                            [
                                              "Single",
                                              "Married",
                                              "Divorced",
                                              "Widowed",
                                              "Separated",
                                              "Other",
                                            ]
                                          )}
                                          {formData?.maritalstatus ===
                                            "Married" && (
                                            <>
                                              {renderFormField(
                                                "spouseName",
                                                "Spouse Name",
                                                "text"
                                              )}
                                              {renderFormField(
                                                "totalChildren",
                                                "Total Children",
                                                "text"
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </TabsContent>
                                      <TabsContent value="address">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {renderFormField(
                                            "state",
                                            "State",
                                            "select",
                                            [
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
                                            ]
                                          )}
                                          {renderFormField(
                                            "district",
                                            "District",
                                            "text"
                                          )}
                                          {renderFormField(
                                            "constituency",
                                            "Constituency",
                                            "text"
                                          )}
                                          {renderFormField(
                                            "gpu",
                                            "GPU(Gram Panchayat Unit)",
                                            "text"
                                          )}
                                          {renderFormField(
                                            "ward",
                                            "Ward",
                                            "text"
                                          )}
                                          {renderFormField(
                                            "pin",
                                            "Pincode",
                                            "text"
                                          )}
                                          {renderFormField(
                                            "policestation",
                                            "Police Station(PS)",
                                            "text"
                                          )}
                                          {renderFormField(
                                            "postoffice",
                                            "Post Office(PO)",
                                            "text"
                                          )}
                                        </div>
                                      </TabsContent>
                                      <TabsContent value="employment">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {renderFormField(
                                            "cadreId",
                                            "Cadre",
                                            "select",
                                            cadres.map((cadre) => ({
                                              value: cadre.id,
                                              label: cadre.name,
                                            }))
                                          )}
                                          {renderFormField(
                                            "department",
                                            "Department",
                                            "text",
                                            null,
                                            true
                                          )}
                                          {renderFormField(
                                            "presentdesignation",
                                            "Present Designation",
                                            "text"
                                          )}
                                          {renderFormField(
                                            "departmentOfPosting",
                                            "Department of Posting",
                                            "select",
                                            departments
                                          )}
                                          {renderFormField(
                                            "natureOfEmployment",
                                            "Nature of Employment",
                                            "select",
                                            [
                                              "Temporary-Permanent (Regular)",
                                              "Adhoc",
                                              "Muster Roll",
                                              "Contract",
                                              "CO-Terminus",
                                              "Project Contract",
                                            ]
                                          )}
                                          {renderFormField(
                                            "dateOfInitialAppointment",
                                            "Date of Initial Appointment",
                                            "date"
                                          )}
                                          {renderFormField(
                                            "dateOfAppointmentGazettedGrade",
                                            "Date of Appointment Gazetted Grade",
                                            "date"
                                          )}
                                          {renderFormField(
                                            "dateOfAppointmentPresentPost",
                                            "Date of Appointment Present Post",
                                            "date"
                                          )}
                                        </div>
                                      </TabsContent>
                                      <TabsContent value="other">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {renderFormField(
                                            "dateOfLastPromotionSubstantive",
                                            "Date Of Last Promotion Substantive",
                                            "date"
                                          )}
                                          {renderFormField(
                                            "dateOfLastPromotionOfficiating",
                                            "Date Of Last Promotion Officiating",
                                            "date"
                                          )}
                                          {renderFormField(
                                            "TotalLengthOfSerive",
                                            "Total Length of Service",
                                            "text"
                                          )}
                                          {renderFormField(
                                            "retirement",
                                            "Retirement",
                                            "date",
                                            null,
                                            true
                                          )}
                                        </div>
                                      </TabsContent>
                                    </Tabs>
                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                                      <Button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                      >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isUpdating
                                          ? "Saving..."
                                          : "Save Changes"}
                                      </Button>
                                      <Button
                                        type="button"
                                        onClick={() => setEditingUserId(null)}
                                        variant="secondary"
                                        className="w-full sm:w-auto"
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </form>
                                ) : (
                                  <Button
                                    type="button"
                                    onClick={() => handleEditClick(user.id)}
                                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Details
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      onClick={() => handlePageChange(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </AdminSideBarLayout>
  );
};

export default AdminDashboard;
