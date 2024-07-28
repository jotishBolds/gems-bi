import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingDetails = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="flex items-center mb-4 md:mb-0">
          <Skeleton className="w-12 h-12 rounded-full mr-4" />
          <div>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <div className="space-y-2 md:space-y-0 md:space-x-2">
          <Skeleton className="w-full md:w-32 h-10" />
        </div>
      </div>

      <div className="border-t pt-4">
        <Skeleton className="h-6 w-[150px] mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(15)].map((_, index) => (
            <div key={index}>
              <Skeleton className="h-4 w-[100px] mb-1" />
              <Skeleton className="h-6 w-[200px]" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-24 h-10" />
      </div>
    </>
  );
};

export default LoadingDetails;
