"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CadreSideBarLayout from "@/components/page-layout/sidebar/cadre-sidebar-layout";
import { ScaleLoader } from "react-spinners";
import {
  Users,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TrendingUp,
  CalendarClock,
} from "lucide-react";

interface EmployeeStatistics {
  totalEmployees: number;
  employeesByDepartment: Record<string, number>;
  employeesByGender: Record<string, number>;
  employeesByAgeGroup: Record<string, number>;
  employeesByYearsOfService: Record<string, number>;
  retiringThisYear: number;
  retiringNextYear: number;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

export default function EmployeeStatisticsPage() {
  const { data: session, status } = useSession();
  const [statistics, setStatistics] = useState<EmployeeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user.role === "CADRE_CONTROLLING_AUTHORITY"
    ) {
      fetchStatistics();
    }
  }, [status, session]);

  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/cadre-authority/employee-statistics");
      if (!response.ok) {
        throw new Error("Failed to fetch employee statistics");
      }
      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      setError("Error fetching employee statistics");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ScaleLoader color="#000000" />
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

  if (!statistics) {
    return null;
  }

  const genderData = Object.entries(statistics.employeesByGender).map(
    ([name, value]) => ({ name, value })
  );
  const departmentData = Object.entries(statistics.employeesByDepartment)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const ageData = Object.entries(statistics.employeesByAgeGroup)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));
  const serviceData = Object.entries(statistics.employeesByYearsOfService)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));
  const retirementData = [
    { name: "Retiring This Year", value: statistics.retiringThisYear },
    { name: "Retiring Next Year", value: statistics.retiringNextYear },
    {
      name: "Not Retiring Soon",
      value:
        statistics.totalEmployees -
        statistics.retiringThisYear -
        statistics.retiringNextYear,
    },
  ];

  return (
    <CadreSideBarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Cadre Employee Statistics Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {statistics.totalEmployees.toLocaleString()}
              </div>
              <p className="text-xs text-blue-600 mt-1">Active workforce</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Retiring This Year
              </CardTitle>
              <CalendarClock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600">
                {statistics.retiringThisYear}
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                Upcoming retirements
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <BarChartIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {Object.keys(statistics.employeesByDepartment).length}
              </div>
              <p className="text-xs text-green-600 mt-1">Operational units</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Years of Service
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">
                {(
                  Object.entries(statistics.employeesByYearsOfService).reduce(
                    (acc, [years, count]) => acc + parseInt(years) * count,
                    0
                  ) / statistics.totalEmployees
                ).toFixed(1)}
              </div>
              <p className="text-xs text-purple-600 mt-1">Years</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Gender Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
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
                    {genderData.map((entry, index) => (
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
                Age Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Years of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={serviceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8">
                    {retirementData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </CadreSideBarLayout>
  );
}
