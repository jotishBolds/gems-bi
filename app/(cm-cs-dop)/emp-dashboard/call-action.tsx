import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Phone, Mail, MessageSquare, UserPlus } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface Employee {
  id: string;
  empname: string;
  email: string;
  phoneNumber: string;
  presentdesignation: string;
  profileImage: string | null;
}

interface ConnectModalProps {
  employee: Employee;
}

const ConnectModal: React.FC<ConnectModalProps> = ({ employee }) => {
  const contactMethods = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Call",
      action: () => window.open(`tel:${employee.phoneNumber}`, "_blank"),
      color: "",
    },
    {
      icon: <FaWhatsapp className="w-5 h-5" />,
      label: "WhatsApp",
      action: () =>
        window.open(`https://wa.me/${employee.phoneNumber}`, "_blank"),
      color: "",
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      action: () => window.open(`mailto:${employee.email}`, "_blank"),
      color: "",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "SMS",
      action: () => window.open(`sms:${employee.phoneNumber}`, "_blank"),
      color: "",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Connect
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">
            Connect with {employee.empname}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-2 p-4">
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={employee.profileImage || ""}
              alt={employee.empname}
            />
            <AvatarFallback>{employee.empname[0]}</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold">{employee.empname}</h3>
          <p className="text-sm text-gray-500">{employee.presentdesignation}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {contactMethods.map((method, index) => (
            <Button
              key={index}
              onClick={method.action}
              className={`${method.color} text-white flex items-center justify-center py-2 px-4 rounded-lg transition-colors duration-300`}
            >
              {method.icon}
              <span className="ml-2">{method.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectModal;
