import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckboxItem } from "@radix-ui/react-dropdown-menu";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  // ... other employee properties
}

interface EmployeeExportProps {
  employees: Employee[];
}

const EmployeeExport: React.FC<EmployeeExportProps> = ({ employees }) => {
  const { data: session } = useSession();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [exportType, setExportType] = useState<"pdf" | "csv">("pdf");

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleExport = async () => {
    const endpoint = `/api/export/${exportType}`;
    const body =
      selectedEmployees.length > 0 ? { employeeIds: selectedEmployees } : {};

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `employees.${exportType}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Export failed");
      }
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  if (session?.user.role !== "CADRE_CONTROLLING_AUTHORITY") {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Export Employees</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Employee Data</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={exportType === "pdf" ? "default" : "outline"}
              onClick={() => setExportType("pdf")}
            >
              PDF
            </Button>
            <Button
              variant={exportType === "csv" ? "default" : "outline"}
              onClick={() => setExportType("csv")}
            >
              CSV
            </Button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center space-x-2">
                <CheckboxItem
                  id={employee.id}
                  checked={selectedEmployees.includes(employee.id)}
                  onCheckedChange={() => handleSelectEmployee(employee.id)}
                />
                <label htmlFor={employee.id}>
                  {employee.firstName} {employee.lastName}
                </label>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleExport}>
          Export {selectedEmployees.length > 0 ? "Selected" : "All"} Employees
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeExport;
