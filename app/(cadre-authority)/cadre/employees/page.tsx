"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import CadreSideBarLayout from "@/components/page-layout/sidebar/cadre-sidebar-layout";
import { ScaleLoader } from "react-spinners";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  FileIcon,
  DownloadIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  GridIcon,
  ListIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  cadre: {
    name: string;
    controllingDepartment: string;
  };
  user: {
    username: string;
    mobileNumber: string;
  };
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>
        {pageNumbers.map((number) => (
          <PaginationItem key={number}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(number);
              }}
              isActive={currentPage === number}
            >
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

const ITEMS_PER_PAGE = 8;

const EmployeesPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [controllingDepartment, setControllingDepartment] = useState<
    string | null
  >(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user.role === "CADRE_CONTROLLING_AUTHORITY"
    ) {
      fetchEmployees();
    }
  }, [status, session]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/cadre-authority/employees");
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      setEmployees(data);
      if (data.length > 0) {
        setControllingDepartment(data[0].cadre.controllingDepartment);
      }
    } catch (err) {
      setError("Error fetching employees");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "csv") => {
    try {
      const employeeIds =
        selectedEmployees.length > 0
          ? selectedEmployees
          : employees.map((e) => e.id);
      const response = await fetch(
        `/api/cadre-authority/export?format=${format}&ids=${employeeIds.join(
          ","
        )}`
      );

      if (!response.ok) {
        throw new Error(`Failed to export ${format.toUpperCase()}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `employees_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Export Successful",
        description: `Employees data exported as ${format.toUpperCase()}`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Export Failed",
        description: `Failed to export employees data as ${format.toUpperCase()}`,
        variant: "destructive",
      });
    }
  };

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAllEmployees = () => {
    setSelectedEmployees((prev) =>
      prev.length === employees.length ? [] : employees.map((e) => e.id)
    );
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      `${employee.empname} ${employee.department} ${employee.presentdesignation}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      (selectedDepartment === null ||
        employee.department === selectedDepartment)
  );

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const pageCount = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ScaleLoader color="#4B5563" />
      </div>
    );
  }

  if (
    status === "unauthenticated" ||
    session?.user.role !== "CADRE_CONTROLLING_AUTHORITY"
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Access denied!</strong>
          <span className="block sm:inline">
            {" "}
            You don&apos;t have permission to view this page.
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <CadreSideBarLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              Employees Dashboard
            </h1>
            <h2 className="text-xl text-gray-600">
              {controllingDepartment || "Not specified"}
            </h2>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={() =>
                setViewMode(viewMode === "card" ? "table" : "card")
              }
            >
              {viewMode === "card" ? (
                <ListIcon className="mr-2 h-4 w-4" />
              ) : (
                <GridIcon className="mr-2 h-4 w-4" />
              )}
              {viewMode === "card" ? "Table View" : "Card View"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileIcon className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileIcon className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
            <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <div className="flex items-center">
            <Checkbox
              id="selectAll"
              checked={selectedEmployees.length === employees.length}
              onCheckedChange={handleSelectAllEmployees}
            />
            <label htmlFor="selectAll" className="ml-2 text-sm text-gray-600">
              Select All
            </label>
          </div>
        </div>
        {paginatedEmployees.length === 0 ? (
          <p className="text-gray-600">No employees found.</p>
        ) : (
          <>
            {viewMode === "card" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedEmployees.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    isSelected={selectedEmployees.includes(employee.id)}
                    onSelect={() => handleSelectEmployee(employee.id)}
                  />
                ))}
              </div>
            ) : (
              <EmployeeTable
                employees={paginatedEmployees}
                selectedEmployees={selectedEmployees}
                onSelectEmployee={handleSelectEmployee}
              />
            )}
            <div className="mt-8 flex justify-center">
              <PaginationControls
                currentPage={currentPage}
                totalPages={pageCount}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </CadreSideBarLayout>
  );
};

function EmployeeCard({
  employee,
  isSelected,
  onSelect,
}: {
  employee: Employee;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={employee.profileImage || ""}
                alt={`${employee.empname}`}
              />
              <AvatarFallback>{employee.empname[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{employee.empname}</CardTitle>
              <p className="text-sm text-gray-500">
                {employee.presentdesignation}
              </p>
            </div>
          </div>
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Badge variant="secondary" className="mb-2">
            {employee.department}
          </Badge>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MailIcon size={16} />
            <span>{employee.emailaddress}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <PhoneIcon size={16} />
            <span>{employee.phoneNumber}</span>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mt-4">
              View Details
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            <EmployeeDetails employee={employee} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function EmployeeTable({
  employees,
  selectedEmployees,
  onSelectEmployee,
}: {
  employees: Employee[];
  selectedEmployees: string[];
  onSelectEmployee: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Select</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell>
              <Checkbox
                checked={selectedEmployees.includes(employee.id)}
                onCheckedChange={() => onSelectEmployee(employee.id)}
              />
            </TableCell>
            <TableCell>
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={employee.profileImage || ""}
                  alt={`${employee.empname}`}
                />
                <AvatarFallback>{employee.empname[0]}</AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell>{employee.empname}</TableCell>
            <TableCell>{employee.presentdesignation}</TableCell>
            <TableCell>{employee.department}</TableCell>
            <TableCell>{employee.emailaddress}</TableCell>
            <TableCell>{employee.phoneNumber}</TableCell>
            <TableCell>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>Employee Details</DialogTitle>
                  </DialogHeader>
                  <EmployeeDetails employee={employee} />
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmployeeDetails({ employee }: { employee: Employee }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <ScrollArea className="h-[80vh] w-full p-2">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 sm:w-24 sm:h-24">
                  <AvatarImage
                    src={employee.profileImage || ""}
                    alt={`${employee.empname}`}
                  />
                  <AvatarFallback className="text-xl sm:text-2xl">
                    {employee.empname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h2 className="text-lg sm:text-2xl font-bold leading-tight">
                    {`${employee.empname} `},{" "}
                    {employee.cadre.name && <>{employee.cadre.name}</>}
                  </h2>

                  <div className="flex flex-col items-start md:flex-row flex-wrap md:items-center mt-2 md:space-x-2">
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      {employee.presentdesignation}
                    </Badge>
                    <Badge className="text-xs sm:text-sm mt-2 md:mt-0">
                      {employee.department}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <InfoItem
                  icon={<PhoneIcon className="w-4 h-4" />}
                  label="Phone"
                  value={employee.phoneNumber}
                />
                <InfoItem
                  icon={<MailIcon className="w-4 h-4" />}
                  label="Email"
                  value={employee.emailaddress}
                />
                <InfoItem
                  icon={<CalendarIcon className="w-4 h-4" />}
                  label="DOB"
                  value={formatDate(employee.dateOfBirth)}
                />
                <InfoItem
                  icon={<UserIcon className="w-4 h-4" />}
                  label="Gender"
                  value={employee.gender}
                />
                <InfoItem
                  icon={<BriefcaseIcon className="w-4 h-4" />}
                  label="Joined"
                  value={formatDate(employee.dateOfInitialAppointment)}
                />
                <InfoItem
                  icon={<CalendarIcon className="w-4 h-4" />}
                  label="Retirement"
                  value={formatDate(employee.retirement)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="text-xs md:text-sm">
              Personal
            </TabsTrigger>
            <TabsTrigger value="address" className="text-xs md:text-sm">
              Address
            </TabsTrigger>
            <TabsTrigger value="employment" className="text-xs md:text-sm">
              Employment
            </TabsTrigger>
          </TabsList>
          <TabsContent value="personal">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Career Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <InfoItem label="Father's Name" value={employee.fatherName} />
                  <InfoItem
                    label="Marital Status"
                    value={employee.maritalstatus}
                  />
                  <InfoItem
                    label="Total Service"
                    value={employee.TotalLengthOfSerive}
                  />
                  <InfoItem
                    label="Nature of Employment"
                    value={employee.natureOfEmployment}
                  />
                  <InfoItem
                    label="Department Of Posting"
                    value={employee.departmentOfPosting || "N/A"}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="address">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Address Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <InfoItem label="State" value={employee.state} />
                  <InfoItem label="District" value={employee.district} />
                  <InfoItem
                    label="Constituency"
                    value={employee.constituency}
                  />
                  <InfoItem label="GPU" value={employee.gpu} />
                  <InfoItem label="Ward" value={employee.ward} />
                  <InfoItem label="PIN" value={employee.pin} />
                  <InfoItem
                    label="Police Station"
                    value={employee.policestation}
                  />
                  <InfoItem label="Post Office" value={employee.postoffice} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="employment">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <InfoItem
                    icon={<CalendarIcon className="w-4 h-4" />}
                    label="Initial Appointment"
                    value={formatDate(employee.dateOfInitialAppointment)}
                  />
                  <InfoItem
                    icon={<CalendarIcon className="w-4 h-4" />}
                    label="Gazetted Grade Appointment"
                    value={formatDate(employee.dateOfAppointmentGazettedGrade)}
                  />
                  <InfoItem
                    icon={<CalendarIcon className="w-4 h-4" />}
                    label="Present Post Appointment"
                    value={formatDate(employee.dateOfAppointmentPresentPost)}
                  />
                  <InfoItem
                    icon={<CalendarIcon className="w-4 h-4" />}
                    label="Last Substantive Promotion"
                    value={formatDate(employee.dateOfLastPromotionSubstantive)}
                  />
                  <InfoItem
                    icon={<CalendarIcon className="w-4 h-4" />}
                    label="Last Officiating Promotion"
                    value={formatDate(employee.dateOfLastPromotionOfficiating)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}

const InfoItem: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-2">
    {icon && <div className="text-gray-400 mt-0.5">{icon}</div>}
    <div className="flex-grow">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-medium break-words">{value}</p>
    </div>
  </div>
);

export default EmployeesPage;
