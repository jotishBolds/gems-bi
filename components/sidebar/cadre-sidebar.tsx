"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, FileText, HelpCircle, LogOut } from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

const CadreSidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || session.user.role !== "CADRE_CONTROLLING_AUTHORITY") {
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
              href="/cadre/statistics"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/cadre/statistics") ? "bg-gray-50" : ""
              }`}
            >
              <FileText className="mr-2" size={20} /> Reports
            </Link>
            <Link
              href="/cadre/employees"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/cadre/employees") ? "bg-gray-50" : ""
              }`}
            >
              <Users className="mr-2" size={20} /> Cadre Employees
            </Link>
          </nav>
          <span className="flex items-center p-4 text-gray-700 hover:bg-gray-10">
            <p className="text-sm">Role : {session.user.role}</p>
          </span>
          <div className="border-t">
            <Link
              href="/support"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/support") ? "bg-gray-50" : ""
              }`}
            >
              <HelpCircle className="mr-2" size={20} /> Support
            </Link>
            <Link
              href="/"
              onClick={() => signOut()}
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 `}
            >
              <LogOut className="mr-2" size={20} /> Signout
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default CadreSidebar;
