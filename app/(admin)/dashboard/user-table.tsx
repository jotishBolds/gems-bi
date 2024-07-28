import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp, Trash2, Check, X, User } from "lucide-react";
import Image from "next/image";
import { CombinedUserData } from "@/types/user";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface UserTableProps {
  currentUsers: CombinedUserData[];
  expandedUserId: string | null;
  handleUserClick: (userId: string) => void;
  handleDeleteUser: (userId: string) => void;
  handleEditClick: (userId: string) => void;
  verificationStatus: { [key: string]: string };
  handleVerifyUser: (userId: string, status: boolean) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  currentUsers,
  expandedUserId,
  handleUserClick,
  handleDeleteUser,
  handleEditClick,
  verificationStatus,
  handleVerifyUser,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profile
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Email
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Mobile
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Role
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verification
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user) => (
              <React.Fragment key={user.id}>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.profileImage ? (
                        <Image
                          src={user.profileImage}
                          alt={`${user.username}'s profile`}
                          width={40}
                          height={40}
                          className="rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-500 sm:hidden">
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                    {user.mobileNumber}
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                    {user.role}
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    {user.role === "EMPLOYEE" && (
                      <div className="flex items-center justify-between">
                        <span
                          className={`mr-2 font-medium ${
                            verificationStatus[user.id] === "Verified"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {verificationStatus[user.id] || "Pending"}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={verificationStatus[user.id] === "Verified"}
                            onCheckedChange={(checked) =>
                              handleVerifyUser(user.id, checked)
                            }
                          />
                          <span className="text-sm text-gray-500">
                            {verificationStatus[user.id] === "Verified" ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        onClick={() => handleUserClick(user.id)}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {expandedUserId === user.id ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" /> Collapse
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" /> Expand
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDeleteUser(user.id)}
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(currentPage - 1)}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={() => handlePageChange(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default UserTable;
