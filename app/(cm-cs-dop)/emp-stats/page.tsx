"use client";
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScaleLoader } from "react-spinners";
import {
  Users,
  CalendarClock,
  Building,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import RoleSideBarLayout from "@/components/page-layout/sidebar/all-role-sidebar-layout";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Employee {
  id: string;
  empname: string;
  department: string;
  retirement: string | null;
  natureOfEmployment: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

const EmployeeStatistics: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<
    "all" | "regular" | "temporary"
  >("all");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/cm/employees");
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        const data = await response.json();
        setEmployees(data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching employee data");
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ScaleLoader color="#000000" />
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

  const totalEmployees = employees.length;
  const regularEmployees = employees.filter(
    (employee) =>
      employee.natureOfEmployment === "Temporary-Permanent (Regular)"
  );
  const temporaryEmployees = employees.filter(
    (employee) =>
      employee.natureOfEmployment !== "Temporary-Permanent (Regular)"
  );

  const filteredEmployees = employees.filter((employee) => {
    if (employeeFilter === "all") return true;
    if (employeeFilter === "regular")
      return employee.natureOfEmployment === "Temporary-Permanent (Regular)";
    if (employeeFilter === "temporary")
      return employee.natureOfEmployment !== "Temporary-Permanent (Regular)";
    return true;
  });

  const departmentCounts = filteredEmployees.reduce((acc, employee) => {
    acc[employee.department] = (acc[employee.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentData = Object.entries(departmentCounts).map(
    ([name, value]) => ({ name, value })
  );

  const currentDate = new Date();
  const oneYearFromNow = new Date(
    currentDate.getFullYear() + 1,
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const retiringEmployees = filteredEmployees.filter((employee) => {
    if (!employee.retirement) return false;
    const retirementDate = new Date(employee.retirement);
    return !isNaN(retirementDate.getTime()) && retirementDate <= oneYearFromNow;
  });

  const retiringWithinYear = retiringEmployees.length;

  const retirementData = [
    { name: "Retiring within a year", value: retiringWithinYear },
    {
      name: "Not retiring soon",
      value: filteredEmployees.length - retiringWithinYear,
    },
  ];

  const handleFilterClick = (filter: "all" | "regular" | "temporary") => {
    setEmployeeFilter(filter);
    setIsOpen(true);
  };

  return (
    <RoleSideBarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Employee Statistics Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                All Employees
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {filteredEmployees.length.toLocaleString()}
              </div>
              <p className="text-xs text-blue-600 mt-1">Active workforce</p>
              <div className="flex flex-wrap justify-between mt-4 gap-2">
                <Button
                  variant={employeeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterClick("all")}
                  className="flex-grow "
                >
                  All ({totalEmployees})
                </Button>
                <Button
                  variant={employeeFilter === "regular" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterClick("regular")}
                  className="flex-grow"
                >
                  Regular ({regularEmployees.length})
                </Button>
                <Button
                  variant={
                    employeeFilter === "temporary" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleFilterClick("temporary")}
                  className="flex-grow"
                >
                  Temporary ({temporaryEmployees.length})
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Retiring Within a Year
              </CardTitle>
              <CalendarClock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600">
                {retiringWithinYear}
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                Upcoming retirements
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {Object.keys(departmentCounts).length}
              </div>
              <p className="text-xs text-green-600 mt-1">Operational units</p>
            </CardContent>
          </Card>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-8">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center"
            >
              {isOpen ? (
                <>
                  Hide Employee List <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Show Employee List <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {employeeFilter === "all"
                    ? "All Employees"
                    : employeeFilter === "regular"
                    ? "Regular Employees"
                    : "Temporary Employees"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nature of Employment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Retirement Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.map((employee) => (
                        <tr key={employee.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {employee.empname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {employee.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {employee.natureOfEmployment}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {employee.retirement
                              ? new Date(
                                  employee.retirement
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Department Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {departmentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Retirement Outlook
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={retirementData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleSideBarLayout>
  );
};

export default EmployeeStatistics;
