"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, LogOut, Users, KeySquare, FormInput } from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const isActive = (path: string) => pathname === path;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          className="bg-white w-64 lg:w-80 fixed left-0 top-[90px] bottom-0 overflow-y-auto z-50 flex flex-col"
          initial="closed"
          animate="open"
          exit="closed"
          variants={sidebarVariants}
          transition={{ duration: 0.3 }}
        >
          <div className="sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Hi, {session.user.username}</h2>
            </div>
          </div>
          <nav className="flex-grow overflow-y-auto">
            <Link
              href="/dashboard"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/dashboard") ? "bg-gray-50" : ""
              }`}
            >
              <Users className="mr-2" size={20} /> All Users
            </Link>

            <Link
              href="/auth/admin/register"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/auth/admin/register") ? "bg-gray-50" : ""
              }`}
            >
              <KeySquare className="mr-2" size={20} /> Register User
            </Link>
            <Link
              href="/cadre-form"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/cadre-form") ? "bg-gray-50" : ""
              }`}
            >
              <FormInput className="mr-2" size={20} /> Add New Cadre
            </Link>
            <Link
              href="/import-csv"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/import-csv") ? "bg-gray-50" : ""
              }`}
            >
              <FormInput className="mr-2" size={20} /> Import Employee
            </Link>
          </nav>
          <span className="flex items-center p-4 text-gray-700 hover:bg-gray-10">
            <p className="text-sm">Role : {session.user.role}</p>
          </span>
          <div className="border-t">
            <Link
              href="/support-admin"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/support-admin") ? "bg-gray-50" : ""
              }`}
            >
              <HelpCircle className="mr-2" size={20} /> Support
            </Link>
            <Link
              href="/settings"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/settings") ? "bg-gray-50" : ""
              }`}
            >
              <LogOut className="mr-2" size={20} /> Signout
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default AdminSidebar;
