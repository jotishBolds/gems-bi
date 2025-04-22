import React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, HelpCircle, LogOut, BarChart, Star } from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

// Define a type for the allowed roles
type AllowedRole = "CM" | "CS" | "DOP";

const RoleSidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // Type guard function to check if the role is allowed
  const isAllowedRole = (role: string | undefined): role is AllowedRole => {
    return role === "CM" || role === "CS" || role === "DOP";
  };

  if (!session || !session.user || !isAllowedRole(session.user.role)) {
    return null;
  }

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const isActive = (path: string) => pathname === path;

  const links = [
    { href: "/emp-stats", icon: BarChart, text: "Dashboard" },
    { href: "/emp-dashboard", icon: Users, text: "All Employees" },
  ];

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
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                  isActive(link.href) ? "bg-gray-50" : ""
                }`}
              >
                <link.icon className="mr-2" size={20} /> {link.text}
              </Link>
            ))}
          </nav>
          <span className="flex items-center p-4 text-gray-700 hover:bg-gray-10">
            {/* <p className="text-sm">Role: {session.user.role}</p> */}
            {session.user.role === "CM" ? (
              <p className="text-sm flex">
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
              </p>
            ) : (
              <p className="text-sm">Role: {session.user.role}</p>
            )}
          </span>
          <div className="border-t">
            {/* <Link
              href="/support"
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                isActive("/support") ? "bg-gray-50" : ""
              }`}
            >
              <HelpCircle className="mr-2" size={20} /> Support
            </Link> */}
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

export default RoleSidebar;
