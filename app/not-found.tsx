"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HomeIcon, SearchIcon } from "lucide-react";

const Custom404 = () => {
  return (
    <div className="min-h-screen md:min-h-[90vh] bg-gradient-to-br from-indigo-50 via-blue-50 to-white flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl">
          <CardContent className="p-6 sm:p-10">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <h1 className="text-6xl sm:text-8xl font-extrabold text-indigo-600 mb-4 text-center">
                404
              </h1>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
                Page Not Found
              </h2>
            </motion.div>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Oops! It seems like you've ventured into uncharted territory. The
              page you're looking for might have been moved or doesn't exist.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/" passHref>
                <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center">
                  <HomeIcon className="mr-2 h-5 w-5" />
                  Go to Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Custom404;
