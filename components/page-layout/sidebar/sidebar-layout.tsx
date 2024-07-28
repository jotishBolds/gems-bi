"use client";
import Sidebar from "@/components/sidebar/employee-sidebar";
import React, { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";

type LayoutProps = {
  children: ReactNode;
};

const SideBarLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(isSmallScreen);
      setSidebarOpen(!isSmallScreen);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || session.user.role !== "EMPLOYEE") {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <main
        className={`flex-1 overflow-x-hidden ${
          sidebarOpen ? "md:ml-64 lg:ml-80" : ""
        }`}
      >
        <motion.button
          className="fixed top-24 z-50 p-2 bg-white rounded-full shadow-md md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          whileTap={{ scale: 0.95 }}
          animate={{
            left: sidebarOpen ? "calc(190px + 1rem)" : "1rem",
          }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={sidebarOpen ? "close" : "menu"}
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
};

export default SideBarLayout;
