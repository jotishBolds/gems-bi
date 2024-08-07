"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogIn, Menu, X, User, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserRole =
  | "EMPLOYEE"
  | "ADMIN"
  | "CADRE_CONTROLLING_AUTHORITY"
  | "CM"
  | "CS"
  | "DOP";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className="relative">
      <span
        className={`text-sm font-medium transition-colors hover:text-primary ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {children}
      </span>
      {isActive && (
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
          layoutId="underline"
          initial={false}
        />
      )}
    </Link>
  );
};

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderNavLinks = () => {
    const userRole = session?.user?.role as UserRole | undefined;

    switch (userRole) {
      case "EMPLOYEE":
        return (
          <>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/employee-dashboard">Dashboard</NavLink>
          </>
        );
      case "ADMIN":
        return (
          <>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/auth/admin/register">Register New User</NavLink>
            <NavLink href="/cadre-form">Add Cadre</NavLink>
            <NavLink href="/import-csv">Import</NavLink>
            <NavLink href="/user-update">User Profile</NavLink>
          </>
        );
      case "CADRE_CONTROLLING_AUTHORITY":
        return (
          <>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/cadre/statistics">Reports</NavLink>
            <NavLink href="/cadre/employees">Employees</NavLink>
          </>
        );
      case "CM":
      case "CS":
      case "DOP":
        return (
          <>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/emp-stats">Dashboard</NavLink>
            <NavLink href="/emp-dashboard">Employees List</NavLink>
          </>
        );
      default:
        return (
          <>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/enquiry">Enquiry</NavLink>
            <NavLink href="/about">About GEMS</NavLink>
            <NavLink href="/contact">Contact Us</NavLink>
          </>
        );
    }
  };

  const renderAvatar = () => {
    const fallbackMap: Record<UserRole, string> = {
      ADMIN: "AD",
      EMPLOYEE: "EM",
      CADRE_CONTROLLING_AUTHORITY: "CD",
      CM: "CM",
      CS: "CS",
      DOP: "DP",
    };
    const userRole = session?.user?.role as UserRole | undefined;
    const fallback =
      userRole && fallbackMap[userRole] ? fallbackMap[userRole] : "OT";

    return (
      <Avatar>
        <AvatarFallback className=" text-primary">{fallback}</AvatarFallback>
      </Avatar>
    );
  };

  const renderDropdownContent = () => {
    const menuItemClass = "flex items-center gap-2 cursor-pointer";
    const userRole = session?.user?.role as UserRole | undefined;

    switch (userRole) {
      case "ADMIN":
        return (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  Administrator
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={menuItemClass}
              onClick={() => router.push("/dashboard")}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={menuItemClass}
              onClick={() => router.push("/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Your Profile</span>
            </DropdownMenuItem>
            {/* <DropdownMenuItem
              className={menuItemClass}
              onClick={() => router.push("/system-settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>System Settings</span>
            </DropdownMenuItem> */}
          </>
        );
      case "EMPLOYEE":
        return (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Employee</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={menuItemClass}
              onClick={() => router.push("/employee-dashboard")}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Employee Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={menuItemClass}
              onClick={() => router.push("/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={menuItemClass}
              onClick={() => router.push("/my-tasks")}
            ></DropdownMenuItem>
          </>
        );
      default:
        return (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">User Menu</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={menuItemClass}
              onClick={() => router.push("/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-primary">GEMS</span>
          </Link>
          <div className="hidden md:flex md:items-center md:space-x-4">
            {renderNavLinks()}
          </div>
          <div className="flex items-center space-x-4">
            {!session ? (
              <div className="hidden md:flex md:items-center md:space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/auth/signin")}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/auth/employee/register")}
                  variant={"outline"}
                >
                  Employee Sign Up
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="relative h-8 w-8 rounded-full">
                    {renderAvatar()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {renderDropdownContent()}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:bg-red-50"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <button
              className="md:hidden focus:outline-none"
              onClick={toggleMenu}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isMenuOpen ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6 text-primary" />
                  ) : (
                    <Menu className="h-6 w-6 text-primary" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-background border-t"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-4 p-4">
              {renderNavLinks()}
              {!session && (
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => router.push("/auth/signin")}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start "
                    onClick={() => router.push("/auth/employee/register")}
                  >
                    Employee Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavBar;
