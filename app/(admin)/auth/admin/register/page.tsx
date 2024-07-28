"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarLoader } from "react-spinners";
import { ZodError } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useBiToast } from "@/components/page-layout/toast/use-toast";
import { z } from "zod";
import { RoleType } from "@prisma/client";
import AdminSideBarLayout from "@/components/page-layout/sidebar/admin-sidebar-layput";

const adminRegisterSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    mobileNumber: z.string().regex(/^\d{10}$/, "Invalid mobile number"),
    role: z.nativeEnum(RoleType),
    cadreId: z.string().optional(),
    cadreIds: z.array(z.string()).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type Cadre = {
  id: string;
  name: string;
  controllingAdminAuthority: string;
  controllingDepartment: string | null;
};

type AdminRegisterSchemaType = z.infer<typeof adminRegisterSchema> & {
  cadreIds?: string[];
};

type FormErrors = Partial<Record<keyof AdminRegisterSchemaType, string>>;

const AdminRegister = () => {
  const [formData, setFormData] = useState<AdminRegisterSchemaType>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    role: RoleType.ADMIN,
    cadreId: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const showToast = useBiToast();
  const [cadres, setCadres] = useState<Cadre[]>([]);
  const [selectedCadre, setSelectedCadre] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState<{ [key: string]: Cadre[] }>(
    {}
  );

  const handleDepartmentChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const department = e.target.value;
    setSelectedDepartment(department);

    try {
      const response = await fetch(
        `/api/cadre?department=${encodeURIComponent(department)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const departmentCadres: Cadre[] = await response.json();

      if (departmentCadres && departmentCadres.length > 0) {
        const cadreIds = departmentCadres.map((cadre) => cadre.id);
        setFormData((prev) => ({ ...prev, cadreIds: cadreIds }));
      } else {
        setFormData((prev) => ({ ...prev, cadreIds: [] }));
      }
    } catch (error) {
      console.error("Error fetching department cadres:", error);
    }
  };
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/cadre?uniqueDepartments=true");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const departmentList: string[] = await response.json();
        setDepartments(
          departmentList.reduce((acc, dept) => {
            acc[dept] = [];
            return acc;
          }, {} as { [key: string]: Cadre[] })
        );
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);
  useEffect(() => {
    const fetchCadres = async () => {
      try {
        const response = await fetch("/api/cadre");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Cadre[] = await response.json();

        // Group cadres by department
        const groupedDepartments: { [key: string]: Cadre[] } = data.reduce(
          (acc, cadre) => {
            const dept = cadre.controllingDepartment || "Others";
            if (!acc[dept]) {
              acc[dept] = [];
            }
            acc[dept].push(cadre);
            return acc;
          },
          {} as { [key: string]: Cadre[] }
        );

        setDepartments(groupedDepartments);
      } catch (error) {
        console.error("Error fetching cadres:", error);
      }
    };
    fetchCadres();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors({});
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "role" && value !== RoleType.CADRE_CONTROLLING_AUTHORITY) {
      setSelectedCadre("");
      setFormData((prev) => ({ ...prev, cadreId: "" }));
    }
  };

  const handleCadreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCadre(e.target.value);
    setFormData((prev) => ({ ...prev, cadreId: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      adminRegisterSchema.parse(formData);

      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          title: "Success",
          description: `User ${formData.username} registered successfully as ${formData.role}!`,
          type: "default",
          actiontext: "Close",
        });

        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          mobileNumber: "",
          role: RoleType.ADMIN,
          cadreId: "",
          cadreIds: [],
        });
        setSelectedDepartment("");
      } else {
        showToast({
          title: "Error",
          description: data.message || "Registration failed",
          type: "destructive",
          actiontext: "Try Again",
        });

        if (data.message === "Email already exists") {
          setErrors((prev) => ({ ...prev, email: "Email already exists" }));
        } else if (data.message === "Mobile number already exists") {
          setErrors((prev) => ({
            ...prev,
            mobileNumber: "Mobile number already exists",
          }));
        } else if (data.message === "Username already exists") {
          setErrors((prev) => ({
            ...prev,
            username: "Username already exists",
          }));
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0];
          if (typeof path === "string" && path in formData) {
            formattedErrors[path as keyof AdminRegisterSchemaType] =
              err.message;
          }
        });
        setErrors(formattedErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <AdminSideBarLayout>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">
            Register New User
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Create new user accounts with specific roles for system access.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Account Information
          </h2>
          <p className="text-gray-600 mb-6">
            Enter the basic details for the new user account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Username field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-none shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-none shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-none shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-none shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Additional Details
              </h2>
              <p className="text-gray-600 mb-6">
                Specify the user&apos;s role and contact information.
              </p>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                {/* Mobile Number field */}
                <div>
                  <label
                    htmlFor="mobileNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-none shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter mobile number"
                  />
                  {errors.mobileNumber && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                {/* Role dropdown */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-none shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a role</option>
                    <option value={RoleType.ADMIN}>Admin</option>

                    <option value={RoleType.CADRE_CONTROLLING_AUTHORITY}>
                      Cadre Controlling Authority
                    </option>
                    <option value={RoleType.EMPLOYEE}>Employee</option>
                    <option value={RoleType.CM}>CM</option>
                    <option value={RoleType.CS}>CS</option>
                    <option value={RoleType.DOP}>DOP</option>
                  </select>
                  {errors.role && (
                    <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>
                {formData.role === RoleType.CADRE_CONTROLLING_AUTHORITY && (
                  <div>
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={selectedDepartment}
                      onChange={handleDepartmentChange}
                      className="mt-1 block w-full border border-gray-300 rounded-none shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a department</option>
                      {Object.keys(departments).map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.cadreIds && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.cadreIds}
                      </p>
                    )}
                  </div>
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
                  "Register User"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminSideBarLayout>
  );
};

export default AdminRegister;
