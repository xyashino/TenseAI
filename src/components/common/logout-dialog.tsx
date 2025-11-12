import { withQueryClient } from "@/components/providers/with-query-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLogout } from "@/lib/hooks/use-logout";
import { cn } from "@/lib/utils";
import { LogOutIcon } from "lucide-react";
import type { ReactNode } from "react";

interface LogoutDialogProps {
  trigger?: ReactNode;
  className?: string;
}

export function LogoutDialog({ trigger, className }: LogoutDialogProps) {
  const logoutMutation = useLogout();

  const defaultTrigger = (
    <button
      className={cn(
        "relative flex lg:mx-auto flex-col gap-1.5 rounded-md lg:px-3 lg:py-3 text-xs transition-colors items-center justify-center",
        "text-white/70 lg:hover:bg-white/10 lg:hover:text-white",
        logoutMutation.isPending && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={logoutMutation.isPending}
    >
      <LogOutIcon className="lg:size-6 size-5 text-white/70" />
      <span className="hidden lg:block">Log out</span>
    </button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger || defaultTrigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out of your account and will need to log in again to access your content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const LogoutDialogWithQueryClient = withQueryClient(LogoutDialog);
