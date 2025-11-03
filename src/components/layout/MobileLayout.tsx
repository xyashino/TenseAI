import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "@/lib/hooks/use-logout";
import type { LayoutUser } from "@/types";
import { LogOutIcon } from "lucide-react";
import { NavigationList } from "./NavigationList";

interface MobileLayoutProps {
  user: LayoutUser;
  currentPath: string;
}

export function MobileLayout({ user, currentPath }: MobileLayoutProps) {
  const logoutMutation = useLogout();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-20 flex-col border-t border-sidebar-border bg-sidebar lg:hidden">
      <Separator className="bg-sidebar-border" />
      <div className="flex flex-1 items-center justify-around px-2">
        <NavigationList currentPath={currentPath} />
        <Separator orientation="vertical" className="h-12 bg-sidebar-border" />
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1.5 px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOutIcon className="h-6 w-6" />
          <span className="text-xs">{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
        </Button>
      </div>
    </div>
  );
}
