"use client";

import { ReactNode } from "react";
import NavBar from "../nav-bar/nav-bar";
import { Toaster } from "../ui/toaster";

type LayoutProps = {
  children: ReactNode;
};

const PageLayout = ({ children }: LayoutProps) => {
  return (
    <main>
      <NavBar />
      {children}
      <Toaster />
    </main>
  );
};

export default PageLayout;
