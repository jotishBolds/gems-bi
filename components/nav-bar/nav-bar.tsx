"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Menu, X, User, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavBar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderNavLinks = () => {
    const linkClass = "hover:text-indigo-600 transition-colors duration-200";

    if (session?.user.role === "EMPLOYEE") {
      return (
        <>
          <Link href="/" className={linkClass}>
            <li>Home</li>
          </Link>
          <Link href="/employee-dashboard" className={linkClass}>
            <li>Dashboard</li>
          </Link>
          <Link href="/employee-dashboard" className={linkClass}>
            <li>Your Documents</li>
          </Link>
        </>
      );
    } else if (session?.user.role === "ADMIN") {
      return (
        <Link href="/admin-dashboard" className={linkClass}>
          <li>Admin Dashboard</li>
        </Link>
      );
    } else if (session?.user.role === "CADRE_CONTROLLING_AUTHORITY") {
      return (
        <>
          <Link href="/" className={linkClass}>
            <li>Home</li>
          </Link>
          <Link href="/cadre/employees" className={linkClass}>
            <li>Department Employees</li>
          </Link>
        </>
      );
    } else if (session?.user.role === "CM") {
      return (
        <>
          <Link href="/" className={linkClass}>
            <li>Home</li>
          </Link>
          <Link href="/emp-stats" className={linkClass}>
            <li>Dashboard</li>
          </Link>
          <Link href="/emp-dashboard" className={linkClass}>
            <li>Employees List</li>
          </Link>
        </>
      );
    } else if (session?.user.role === "CS") {
      return (
        <>
          <Link href="/" className={linkClass}>
            <li>Home</li>
          </Link>
          <Link href="/emp-stats" className={linkClass}>
            <li>Dashboard</li>
          </Link>
          <Link href="/emp-dashboard" className={linkClass}>
            <li>Employees List</li>
          </Link>
        </>
      );
    } else if (session?.user.role === "DOP") {
      return (
        <>
          <Link href="/" className={linkClass}>
            <li>Home</li>
          </Link>
          <Link href="/emp-stats" className={linkClass}>
            <li>Dashboard</li>
          </Link>
          <Link href="/emp-dashboard" className={linkClass}>
            <li>Employees List</li>
          </Link>
        </>
      );
    } else {
      return (
        <>
          <Link href="/" className={linkClass}>
            <li>Home</li>
          </Link>
          <Link href="/enquiry" className={linkClass}>
            <li>Enquiry</li>
          </Link>
          <Link href="/about" className={linkClass}>
            <li>About GEMS</li>
          </Link>
          <Link href="/contact" className={linkClass}>
            <li>Contact Us</li>
          </Link>
        </>
      );
    }
  };

  const renderAvatar = () => {
    let fallback = "OT";
    if (session?.user.role === "ADMIN") fallback = "AD";
    else if (session?.user.role === "EMPLOYEE") fallback = "EM";
    else if (session?.user.role === "CADRE_CONTROLLING_AUTHORITY")
      fallback = "CD";
    else if (session?.user.role === "CM") fallback = "CM";
    else if (session?.user.role === "CS") fallback = "CS";
    else if (session?.user.role === "DOP") fallback = "DP";

    return (
      <Avatar>
        <AvatarFallback className="bg-indigo-100 text-indigo-600">
          {fallback}
        </AvatarFallback>
      </Avatar>
    );
  };

  const renderDropdownContent = () => {
    const menuItemClass =
      "flex items-center gap-2 cursor-pointer hover:bg-indigo-50";

    if (session?.user.role === "ADMIN") {
      return (
        <>
          <DropdownMenuLabel
            className="cursor-pointer"
            onClick={() => router.push("/admin-dashboard")}
          >
            Admin Dashboard
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={menuItemClass}
            onClick={() => router.push("/manage-employees")}
          >
            <User size={16} /> Manage Employees
          </DropdownMenuItem>
          <DropdownMenuItem
            className={menuItemClass}
            onClick={() => router.push("/system-settings")}
          >
            <Settings size={16} /> System Settings
          </DropdownMenuItem>
        </>
      );
    } else if (session?.user.role === "EMPLOYEE") {
      return (
        <>
          <DropdownMenuLabel
            className="cursor-pointer"
            onClick={() => router.push("/employee-dashboard")}
          >
            Employee Dashboard
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={menuItemClass}
            onClick={() => router.push("/my-profile")}
          >
            <User size={16} /> My Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            className={menuItemClass}
            onClick={() => router.push("/my-tasks")}
          >
            <Settings size={16} /> My Tasks
          </DropdownMenuItem>
        </>
      );
    } else {
      return (
        <>
          <DropdownMenuLabel>User Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={menuItemClass}
            onClick={() => router.push("/profile")}
          >
            <User size={16} /> Profile
          </DropdownMenuItem>
        </>
      );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          className="font-bold text-3xl text-indigo-600 cursor-pointer"
          href="/"
        >
          GEMS
        </Link>
        <ul className="hidden lg:flex items-center gap-6">
          {renderNavLinks()}
        </ul>
        <div className="flex items-center gap-2">
          {!session ? (
            <div className="hidden lg:flex items-center gap-2">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                onClick={() => router.push("/auth/signin")}
              >
                <span className="flex items-center justify-center gap-1">
                  <p>Sign In</p>
                  <LogIn size={15} />
                </span>
              </Button>
              <Button
                variant="outline"
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md"
                onClick={() => router.push("/auth/employee/register")}
              >
                Employee Sign Up
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                {renderAvatar()}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {renderDropdownContent()}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50"
                  onClick={() => signOut()}
                >
                  <LogOut size={16} /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button className="lg:hidden focus:outline-none" onClick={toggleMenu}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isMenuOpen ? "close" : "menu"}
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? (
                  <X size={24} className="text-indigo-600" />
                ) : (
                  <Menu size={24} className="text-indigo-600" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </nav>
      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="lg:hidden bg-white border-t border-indigo-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="flex flex-col items-center py-4 space-y-4">
              {renderNavLinks()}
            </ul>
            {!session && (
              <div className="flex flex-col items-center gap-2 py-4">
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md w-full max-w-xs"
                  onClick={() => router.push("/auth/signin")}
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md w-full max-w-xs"
                  onClick={() => router.push("/auth/employee/register")}
                >
                  Employee Sign Up
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavBar;
