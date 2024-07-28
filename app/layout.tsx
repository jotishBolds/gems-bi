import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import PageLayout from "@/components/page-layout/page-layout";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/auth-options";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Government Employee Management System (EMS)",
  description:
    "This is a system for managing government employee data and administrative functions.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          <PageLayout>{children}</PageLayout>
        </Providers>
      </body>
    </html>
  );
}
