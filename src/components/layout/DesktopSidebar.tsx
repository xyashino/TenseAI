import { Separator } from "@/components/ui/separator";
import type { LayoutUser } from "@/types";
import { AppLogo } from "../AppLogo";
import { NavigationList } from "./NavigationList";
import { UserProfileMenu } from "./UserProfileMenu";

interface SidebarProps {
  user: LayoutUser;
  currentPath: string;
}

export function DesktopSidebar({ user, currentPath }: SidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="p-6">
        <AppLogo />
      </div>

      <nav className="flex-1 px-3">
        <NavigationList currentPath={currentPath} />
      </nav>

      <Separator />

      <div className="p-3">
        <UserProfileMenu user={user} align="end" />
      </div>
    </div>
  );
}
