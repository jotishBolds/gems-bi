"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Phone, Mail, MessageSquare, UserPlus } from "lucide-react";
import EmployeeDetails from "./employee-details";

import SearchFilter from "./search-filters";
import RoleSideBarLayout from "@/components/page-layout/sidebar/all-role-sidebar-layout";
import ConnectModal from "./call-action";

interface Employee {
  id: string;
  empname: string;
  email: string;
  department: string;
  presentdesignation: string;
  departmentOfPosting: string;
  profileImage: string | null;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailaddress: string;
  maritalstatus: string;
  spouseName?: string;
  totalChildren?: string;
  state: string;
  district: string;
  constituency: string;
  gpu: string;
  ward: string;
  pin: string;
  policestation: string;
  postoffice: string;
  dateOfInitialAppointment: string;
  dateOfAppointmentGazettedGrade: string;
  dateOfAppointmentPresentPost: string;
  TotalLengthOfSerive: string;
  retirement: string;
  dateOfLastPromotionSubstantive: string;
  dateOfLastPromotionOfficiating: string;
  natureOfEmployment: string;
  cadreName: string | null;
}

type AllowedRole = "CM" | "CS" | "DOP";

const isAllowedRole = (role: string | undefined): role is AllowedRole => {
  return role === "CM" || role === "CS" || role === "DOP";
};

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;
  const { data: session } = useSession();

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cm/employees");
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      setEmployees(data);
      setFilteredEmployees(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user && isAllowedRole(session.user.role)) {
      fetchEmployees();
    }
  }, [session, fetchEmployees]);

  const handleSearch = useCallback(
    (filters: {
      empname: string;
      department: string;
      cadre: string;
      designation: string;
    }) => {
      const results = employees.filter((employee) => {
        const empnameMatch = (employee.empname || "")
          .toLowerCase()
          .includes((filters.empname || "").toLowerCase());

        const designationMatch = (employee.presentdesignation || "")
          .toLowerCase()
          .includes((filters.designation || "").toLowerCase());
        const departmentMatch = (employee.department || "")
          .toLowerCase()
          .includes((filters.department || "").toLowerCase());
        const cadreMatch =
          filters.cadre === "all" ||
          (employee.cadreName || "").toLowerCase() ===
            (filters.cadre || "").toLowerCase();

        return (
          empnameMatch && designationMatch && departmentMatch && cadreMatch
        );
      });

      setFilteredEmployees(results);
      setTotalPages(Math.ceil(results.length / itemsPerPage));
      setCurrentPage(1);
    },
    [employees]
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <RoleSideBarLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Employee List</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchFilter onSearch={handleSearch} />
            {isLoading ? (
              <EmployeeListSkeleton />
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Photo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Cadre</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        <TableHead className="text-right">Connect</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <Avatar>
                              <AvatarImage
                                src={employee.profileImage || ""}
                                alt={`${employee.empname} `}
                              />
                              <AvatarFallback>
                                {employee.empname[0]}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{`${employee.empname} `}</TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.presentdesignation}</TableCell>
                          <TableCell>{employee.cadreName || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl h-[90vh]">
                                <DialogHeader>
                                  <DialogTitle>Employee Details</DialogTitle>
                                </DialogHeader>
                                <EmployeeDetails employee={employee} />
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell className="text-right">
                            {/* <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Connect
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[525px]">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-bold mb-4 ">
                                    Connect with {employee.empname}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-between items-center py-4">
                                  <Button
                                    onClick={() =>
                                      window.open(
                                        `tel:${employee.phoneNumber}`,
                                        "_blank"
                                      )
                                    }
                                    className="flex-1 mx-1 bg-orange-700 hover:bg-orange-800 text-white"
                                  >
                                    <Phone className="w-5 h-5 mr-2" />
                                    Call
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      window.open(
                                        `https://wa.me/${employee.phoneNumber}`,
                                        "_blank"
                                      )
                                    }
                                    className="flex-1 mx-1 bg-[#25D366] hover:bg-[#27b35a] text-white"
                                  >
                                    <FaWhatsapp className="w-5 h-5 mr-2" />
                                    WhatsApp
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      window.open(
                                        `mailto:${employee.email}`,
                                        "_blank"
                                      )
                                    }
                                    className="flex-1 mx-1 bg-blue-500 hover:bg-blue-600 text-white"
                                  >
                                    <Mail className="w-5 h-5 mr-2" />
                                    Email
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog> */}
                            <ConnectModal employee={employee} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleSideBarLayout>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
      >
        Previous
      </Button>
      <span>{`Page ${currentPage} of ${totalPages}`}</span>
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
};

const EmployeeListSkeleton: React.FC = () => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Photo</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Cadre</TableHead>
          <TableHead className="text-right">Actions</TableHead>
          <TableHead className="text-right">Connect</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-10 w-10 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[120px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[180px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[140px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[80px]" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-8 w-[60px] ml-auto" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-8 w-[60px] ml-auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default EmployeeList;
