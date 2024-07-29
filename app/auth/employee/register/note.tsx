import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const EmployeeRegisterNotice = () => {
  return (
    <Alert variant="default" className="mb-4 md:mb-6">
      <InfoIcon className="h-4 w-4 md:h-5 md:w-5" />
      <AlertTitle className="text-sm md:text-base font-semibold">
        Important Notice
      </AlertTitle>
      <AlertDescription className="text-xs md:text-sm">
        <p className="mt-1 md:mt-2">
          Before registering, please ensure that your information matches your
          official documents:
        </p>
        <ul className="list-disc pl-4 md:pl-5 mt-1 md:mt-2 space-y-1">
          <li>Enter your name in sentence case (e.g., Tashi Bhutia)</li>
          <li>
            Your date of birth should exactly match your official documents
          </li>
          <li>Select the cadre that corresponds to your current position</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default EmployeeRegisterNotice;
