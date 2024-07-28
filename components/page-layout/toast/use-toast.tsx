// hooks/useCustomToast.ts
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

type ToastType = "default" | "destructive";

interface ToastOptions {
  title?: string;
  description: string;
  type?: ToastType;
  duration?: number;
  actiontext?: string;
}

export const useBiToast = () => {
  const { toast } = useToast();

  const showToast = ({
    title,
    description,
    type = "default",
    duration = 3000,
    actiontext,
  }: ToastOptions) => {
    toast({
      title: title,
      description: description,
      variant: type === "destructive" ? "destructive" : "default",
      duration: duration,
      action: <ToastAction altText="Try again">{actiontext}</ToastAction>,
    });
  };

  return showToast;
};
