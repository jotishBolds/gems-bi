"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
} from "lucide-react";
import AdminSideBarLayout from "@/components/page-layout/sidebar/admin-sidebar-layput";

const BulkImportEmployees = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [results, setResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus("idle");
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/bulk-import-employees", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("success");
        setResults(data.results);
      } else {
        setUploadStatus("error");
        setResults({
          success: 0,
          errors: [data.error || "An error occurred during upload."],
        });
      }
    } catch (error) {
      setUploadStatus("error");
      setResults({ success: 0, errors: ["An unexpected error occurred."] });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/download-csv-template");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "employee_import_template.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  return (
    <AdminSideBarLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Bulk Import Employees</h1>
        <Card>
          <CardHeader>
            <CardTitle>Upload Employee Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label
                  htmlFor="file-upload"
                  className="block text-sm font-medium text-gray-700"
                >
                  Upload Excel or CSV File
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <Input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Excel or CSV file up to 10MB
                  </p>
                </div>
              </div>
            </div>
            {file && (
              <p className="text-sm text-gray-500 mb-4">
                Selected file: {file.name}
              </p>
            )}
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload and Import"
              )}
            </Button>

            {uploadStatus === "success" && results && (
              <Alert className="mt-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Import Completed</AlertTitle>
                <AlertDescription>
                  Successfully imported {results.success} employee(s).
                  {results.errors.length > 0 && (
                    <>
                      <br />
                      {results.errors.length} error(s) occurred:
                      <ul className="list-disc pl-5 mt-2">
                        {results.errors.map((error, index) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === "error" && results && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {results.errors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSideBarLayout>
  );
};

export default BulkImportEmployees;
