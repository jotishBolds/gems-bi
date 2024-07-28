import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchSectionProps {
  searchUsername: string;
  setSearchUsername: (value: string) => void;
  searchEmail: string;
  setSearchEmail: (value: string) => void;
  searchRole: string;
  setSearchRole: (value: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchUsername,
  setSearchUsername,
  searchEmail,
  setSearchEmail,
  searchRole,
  setSearchRole,
}) => {
  const fields = [
    {
      id: "searchUsername",
      label: "Username",
      icon: "👤",
      state: searchUsername,
      setState: setSearchUsername,
      type: "text",
    },
    {
      id: "searchEmail",
      label: "Email",
      icon: "✉️",
      state: searchEmail,
      setState: setSearchEmail,
      type: "text",
    },
    {
      id: "searchRole",
      label: "Role",
      icon: "",
      state: searchRole,
      setState: setSearchRole,
      type: "select",
      options: [
        { value: "ALL_ROLES", label: "All Roles" },
        { value: "ADMIN", label: "Admin" },
        { value: "EMPLOYEE", label: "Employee" },
        { value: "CM", label: "CM" },
        { value: "DOP", label: "DOP" },
        { value: "CS", label: "CS" },
        {
          value: "CADRE_CONTROLLING_AUTHORITY",
          label: "Cadre Controlling Authority",
        },
      ],
    },
  ];

  return (
    <div className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Search Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label
                htmlFor={field.id}
                className="text-sm font-medium text-gray-700"
              >
                {field.label}
              </Label>
              <div className="relative">
                {field.type === "text" ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {field.icon}
                    </span>
                    <Input
                      id={field.id}
                      type="text"
                      value={field.state}
                      onChange={(e) => field.setState(e.target.value)}
                      className="pl-10"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                ) : (
                  <Select value={field.state} onValueChange={field.setState}>
                    <SelectTrigger className="w-full">
                      <span className="absolute left-3 text-gray-500">
                        {field.icon}
                      </span>
                      <SelectValue
                        placeholder={`Select ${field.label.toLowerCase()}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
