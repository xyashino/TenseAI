import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/hooks/use-logout";
import { LogOutIcon } from "lucide-react";
import { ResetPasswordDialog } from "./reset-password-dialog";

export function AccountActions() {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  return (
    <>
      <div className="mt-4 pt-4 border-t">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ResetPasswordDialog />
          <Button
            type="button"
            variant="destructive"
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="w-full sm:w-auto"
          >
            <LogOutIcon className="size-4" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
