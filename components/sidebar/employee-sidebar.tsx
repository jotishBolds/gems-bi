"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  LayoutDashboard,
  FileText,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || session.user.role !== "EMPLOYEE") {
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
          className="bg-white w-64 lg:w-80 fixed left-0 top-[57px] bottom-0 overflow-y-auto z-50 flex flex-col"
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
              href="/employee-dashboard"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/employee-dashboard") ? "bg-gray-50" : ""
              }`}
            >
              <Home className="mr-2" size={20} /> Dashboard
            </Link>
            {/* <div className="relative">
              <button
                className={`flex items-center w-full text-left p-4 text-gray-700 hover:bg-gray-100 ${
                  isActive("/analytics") || isActive("/historical")
                    ? "bg-gray-50"
                    : ""
                }`}
                onClick={() => setSubmenuOpen(!submenuOpen)}
              >
                <LayoutDashboard className="mr-2" size={20} /> Dashboard
                <ChevronDown
                  className={`ml-auto transform ${
                    submenuOpen ? "rotate-180" : ""
                  }`}
                  size={20}
                />
              </button>
              <AnimatePresence>
                {submenuOpen && (
                  <motion.div
                    className="pl-8"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      href="/analytics"
                      className={`block p-2 text-gray-600 hover:bg-gray-100 ${
                        isActive("/analytics") ? "bg-gray-100" : ""
                      }`}
                    >
                      Promotions
                    </Link>
                    <Link
                      href="/historical"
                      className={`block p-2 text-gray-600 hover:bg-gray-100 ${
                        isActive("/historical") ? "bg-gray-100" : ""
                      }`}
                    >
                      Logs
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div> */}
            {/* <Link
              href="/documents"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/documents") ? "bg-gray-50" : ""
              }`}
            >
              <FileText className="mr-2" size={20} /> Documents
            </Link> */}
          </nav>
          <span className="flex items-center p-4 text-gray-700 hover:bg-gray-10">
            <p className="text-sm">Role : {session.user.role}</p>
          </span>
          <div className="border-t">
            <Link
              href="/support-emp"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/support-emp") ? "bg-gray-50" : ""
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

export default Sidebar;
