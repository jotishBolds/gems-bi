"use client";
import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Send } from "lucide-react";

interface FormData {
  subject: string;
  description: string;
}

interface SupportRequest {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
}

export default function EmployeeSupportPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [recentRequests, setRecentRequests] = useState<SupportRequest[]>([]);

  useEffect(() => {
    fetchRecentRequests();
    const interval = setInterval(fetchRecentRequests, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRecentRequests = async () => {
    try {
      const response = await fetch("/api/support/recent");
      if (!response.ok) throw new Error("Failed to fetch recent requests");
      const data: SupportRequest[] = await response.json();
      setRecentRequests(data);
    } catch (error) {
      console.error("Error fetching recent requests:", error);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to submit support request");

      setSubmitSuccess(true);
      reset();
      fetchRecentRequests(); // Refresh the recent requests list
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Submit Support Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  {...register("subject", {
                    required: "Subject is required",
                  })}
                  placeholder="Subject"
                  className="w-full"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>
              <div>
                <Textarea
                  {...register("description", {
                    required: "Description is required",
                  })}
                  placeholder="Describe your issue"
                  rows={5}
                  className="w-full"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              {submitSuccess && (
                <Alert variant="default">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Your support request has been submitted successfully.
                  </AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit Support Request"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Recent Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="text-gray-500">No recent requests found.</p>
            ) : (
              <ul className="space-y-4">
                {recentRequests.map((request) => (
                  <li key={request.id} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{request.subject}</span>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Submitted on{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
