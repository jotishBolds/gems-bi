"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminSideBarLayout from "@/components/page-layout/sidebar/admin-sidebar-layput";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { ScaleLoader } from "react-spinners";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface StatisticsData {
  totalEmployees: number;
  totalAdmins: number;
  totalCadres: number;
  roleDistribution: { role: string; _count: { _all: number } }[];
  cadreDistribution: { cadreId: string; _count: { _all: number } }[];
  upcomingRetirements: {
    user: { username: string; email: string };
    cadre: { name: string };
    retirement: string;
  }[];
}

const AdminStatistics: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "ADMIN") {
      fetchStatistics();
    } else if (status !== "loading") {
      router.push("/auth/admin/login");
    }
  }, [status, session, router]);

  const fetchStatistics = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data: StatisticsData = await res.json();
        setStatistics(data);
      } else {
        console.error("Failed to fetch statistics");
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <AdminSideBarLayout>
        <div className="flex justify-center items-center h-screen">
          <ScaleLoader color="#000000" loading={true} height={50} />
        </div>
      </AdminSideBarLayout>
    );
  }

  if (!statistics) {
    return (
      <AdminSideBarLayout>
        <div className="text-center text-2xl mt-10">
          Failed to load statistics
        </div>
      </AdminSideBarLayout>
    );
  }

  const roleData = statistics.roleDistribution.map((role) => ({
    name: role.role,
    value: role._count._all,
  }));

  const cadreData = statistics.cadreDistribution.map((cadre) => ({
    name: cadre.cadreId,
    value: cadre._count._all,
  }));

  return (
    <AdminSideBarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Admin Statistics
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.totalEmployees}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalAdmins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Cadres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalCadres}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
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
              <CardTitle>Cadre Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cadreData}>
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
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upcoming Retirements (Next 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cadre</TableHead>
                  <TableHead>Retirement Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statistics.upcomingRetirements.map((employee, index) => (
                  <TableRow key={index}>
                    <TableCell>{employee.user.username}</TableCell>
                    <TableCell>{employee.user.email}</TableCell>
                    <TableCell>{employee.cadre.name}</TableCell>
                    <TableCell>
                      {new Date(employee.retirement).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminSideBarLayout>
  );
};

export default AdminStatistics;
