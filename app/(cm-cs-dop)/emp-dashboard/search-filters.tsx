import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, ChevronDown, ChevronUp, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SearchFilters {
  firstName: string;
  lastName: string;
  department: string;
  cadre: string;
  designation: string;
}

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    firstName: "",
    lastName: "",
    department: "",
    cadre: "all",
    designation: "",
  });
  const [cadres, setCadres] = useState<{ id: string; name: string }[]>([]);
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchCadres = async () => {
      try {
        const response = await fetch("/api/cadre/cm");
        if (!response.ok) {
          throw new Error("Failed to fetch cadres");
        }
        const data = await response.json();
        setCadres(data);
      } catch (error) {
        console.error("Error fetching cadres:", error);
      }
    };

    fetchCadres();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCadreChange = (value: string) => {
    setFilters((prev) => ({ ...prev, cadre: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
    setAccordionValue(undefined);
  };

  const clearFilters = () => {
    const clearedFilters = {
      firstName: "",
      lastName: "",
      department: "",
      cadre: "all",
      designation: "",
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const toggleAccordion = () => {
    setAccordionValue((prev) => (prev === "item-1" ? undefined : "item-1"));
  };

  const renderMobileView = () => (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6 md:hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Search Filters</h2>
        <Button variant="ghost" size="sm" onClick={toggleAccordion}>
          {accordionValue === "item-1" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      <Accordion
        type="single"
        collapsible
        value={accordionValue}
        onValueChange={setAccordionValue}
      >
        <AccordionItem value="item-1">
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="firstName-mobile"
                  className="text-sm font-medium text-gray-700"
                >
                  First Name
                </Label>
                <Input
                  type="text"
                  id="firstName-mobile"
                  name="firstName"
                  placeholder="Search by first name"
                  value={filters.firstName}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="lastName-mobile"
                  className="text-sm font-medium text-gray-700"
                >
                  Last Name
                </Label>
                <Input
                  type="text"
                  id="lastName-mobile"
                  name="lastName"
                  placeholder="Search by last name"
                  value={filters.lastName}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="department-mobile"
                  className="text-sm font-medium text-gray-700"
                >
                  Department
                </Label>
                <Input
                  type="text"
                  id="department-mobile"
                  name="department"
                  placeholder="Search by department"
                  value={filters.department}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="designation-mobile"
                  className="text-sm font-medium text-gray-700"
                >
                  Designation
                </Label>
                <Input
                  type="text"
                  id="designation-mobile"
                  name="designation"
                  placeholder="Search by designation"
                  value={filters.designation}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="cadre-mobile"
                  className="text-sm font-medium text-gray-700"
                >
                  Cadre
                </Label>
                <Select onValueChange={handleCadreChange} value={filters.cadre}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select cadre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cadres</SelectItem>
                    {cadres.map((cadre) => (
                      <SelectItem key={cadre.id} value={cadre.name}>
                        {cadre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  const renderDesktopView = () => (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6 hidden md:block">
      <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <Label
            htmlFor="firstName"
            className="text-sm font-medium text-gray-700"
          >
            First Name
          </Label>
          <Input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="Search by first name"
            value={filters.firstName}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <Label
            htmlFor="lastName"
            className="text-sm font-medium text-gray-700"
          >
            Last Name
          </Label>
          <Input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Search by last name"
            value={filters.lastName}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <Label
            htmlFor="department"
            className="text-sm font-medium text-gray-700"
          >
            Department
          </Label>
          <Input
            type="text"
            id="department"
            name="department"
            placeholder="Search by department"
            value={filters.department}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <Label
            htmlFor="designation"
            className="text-sm font-medium text-gray-700"
          >
            Designation
          </Label>
          <Input
            type="text"
            id="designation"
            name="designation"
            placeholder="Search by designation"
            value={filters.designation}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="cadre" className="text-sm font-medium text-gray-700">
            Cadre
          </Label>
          <Select onValueChange={handleCadreChange} value={filters.cadre}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select cadre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cadres</SelectItem>
              {cadres.map((cadre) => (
                <SelectItem key={cadre.id} value={cadre.name}>
                  {cadre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderMobileView()}
      {renderDesktopView()}
    </>
  );
};

export default SearchFilter;
