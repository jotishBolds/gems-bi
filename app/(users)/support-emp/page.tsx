import SideBarLayout from "@/components/page-layout/sidebar/sidebar-layout";
import SupportForm from "@/components/support/support-page";
import React from "react";

export default function EmployeeSupportPage() {
  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Submit a Support Request</h1>
        <SupportForm />
      </div>
    </SideBarLayout>
  );
}
