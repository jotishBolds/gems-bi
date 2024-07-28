"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarLoader } from "react-spinners";
import { useBiToast } from "@/components/page-layout/toast/use-toast";
import { z } from "zod";
import AdminSideBarLayout from "@/components/page-layout/sidebar/admin-sidebar-layput";

const cadreSchema = z.object({
  name: z.string().min(3, "Cadre name must be at least 3 characters"),
  controllingDepartment: z
    .string()
    .min(1, "Controlling department is required"),
});

type CadreFormData = z.infer<typeof cadreSchema>;

const CadreForm = () => {
  const [formData, setFormData] = useState<CadreFormData>({
    name: "",
    controllingDepartment: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CadreFormData>>({});
  const router = useRouter();
  const showToast = useBiToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors({});
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      cadreSchema.parse(formData);

      const response = await fetch("/api/admin/cadre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          title: "Success",
          description: `Cadre ${formData.name} added successfully!`,
          type: "default",
          actiontext: "Close",
        });

        setFormData({
          name: "",
          controllingDepartment: "",
        });
      } else {
        showToast({
          title: "Error",
          description: data.message || "Failed to add cadre",
          type: "destructive",
          actiontext: "Try Again",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<CadreFormData> = {};
        error.errors.forEach((err) => {
          const path = err.path[0];
          if (typeof path === "string" && path in formData) {
            formattedErrors[path as keyof CadreFormData] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminSideBarLayout>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">
            Add New Cadre
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Create a new cadre in the system with specific details.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Cadre Information
          </h2>
          <p className="text-gray-600 mb-6">
            Enter the details for the new cadre.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <Label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cadre Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-none shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter cadre name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="controllingDepartment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Controlling Department
                </Label>
                <Input
                  type="text"
                  id="controllingDepartment"
                  name="controllingDepartment"
                  value={formData.controllingDepartment}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-none shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter controlling department"
                />
                {errors.controllingDepartment && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.controllingDepartment}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-5">
              <Button
                type="submit"
                className="w-full py-3 px-6 border border-transparent rounded-none shadow-sm text-lg font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {loading ? (
                  <BarLoader width={100} height={3} color={"#ffffff"} />
                ) : (
                  "Add Cadre"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminSideBarLayout>
  );
};

export default CadreForm;
