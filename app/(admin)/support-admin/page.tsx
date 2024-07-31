"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import AdminSideBarLayout from "@/components/page-layout/sidebar/admin-sidebar-layput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Employee {
  empname: string;
}

interface SupportRequest {
  id: string;
  subject: string;
  description: string;
  employee: Employee;
  status: string;
  createdAt: string;
}

export default function AdminSupportPage() {
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(
    null
  );

  useEffect(() => {
    fetchSupportRequests();
    const interval = setInterval(fetchSupportRequests, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSupportRequests = async () => {
    try {
      const response = await fetch("/api/support");
      if (!response.ok) throw new Error("Failed to fetch support requests");
      const data: SupportRequest[] = await response.json();
      setSupportRequests(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSupportStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok)
        throw new Error("Failed to update support request status");
      await fetchSupportRequests();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "IN_PROGRESS":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "OPEN":
        return "This request is newly opened and awaiting attention.";
      case "IN_PROGRESS":
        return "This request is currently being worked on by our support team.";
      case "RESOLVED":
        return "This request has been successfully resolved.";
      default:
        return "Status unknown";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <AdminSideBarLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Support Requests Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Total Requests</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {supportRequests.length}
                </p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800">Open Requests</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {supportRequests.filter((r) => r.status === "OPEN").length}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">
                  Resolved Requests
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {
                    supportRequests.filter((r) => r.status === "RESOLVED")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Support Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Subject</TableHead>
                    <TableHead className="w-1/4">Description</TableHead>
                    <TableHead className="w-1/6">Employee</TableHead>
                    <TableHead className="w-1/6">Status</TableHead>
                    <TableHead className="w-1/6">Date</TableHead>
                    <TableHead className="w-1/6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.subject}
                      </TableCell>
                      <TableCell>
                        <div className="truncate max-w-xs">
                          {request.description}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="text-blue-500 hover:underline text-sm mt-1"
                            >
                              Read More
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>
                                {selectedRequest?.subject}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                {selectedRequest?.description}
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>{request.employee.empname}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                        <div className="text-xs mt-1">
                          {getStatusDescription(request.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          onValueChange={(value) =>
                            updateSupportStatus(request.id, value)
                          }
                          defaultValue={request.status}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">
                              In Progress
                            </SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSideBarLayout>
  );
}
