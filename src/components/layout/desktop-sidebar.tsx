import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "@/lib/hooks/use-logout";
import { LogOutIcon } from "lucide-react";
import { NavigationList } from "./navigation-list";

interface SidebarProps {
  currentPath: string;
}

export function DesktopSidebar({ currentPath }: SidebarProps) {
  const logoutMutation = useLogout();

  return (
    <div className="fixed left-0 top-0 z-50 flex h-screen w-20 flex-col bg-sidebar/95 backdrop-blur-md border-r border-sidebar-border shadow-2xl shadow-black/20">
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-sidebar/50 to-sidebar pointer-events-none" />

      <div className="relative flex items-center justify-center p-6">
        <AppLogo showText={false} />
      </div>

      <nav className="relative flex-1 px-2 py-4">
        <NavigationList currentPath={currentPath} />
      </nav>

      <Separator className="relative bg-sidebar-border" />

      <div className="relative p-3">
        <Button
          variant="ghost"
          className="flex w-full flex-col items-center gap-1.5 px-3 py-3 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
