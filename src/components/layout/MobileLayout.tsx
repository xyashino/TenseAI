import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { LayoutUser } from "@/types";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { AppLogo } from "../AppLogo";
import { NavigationList } from "./NavigationList";
import { UserProfileMenu } from "./UserProfileMenu";

interface MobileLayoutProps {
  user: LayoutUser;
  currentPath: string;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
}

export function MobileLayout({ user, currentPath }: MobileLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b bg-card px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={isDrawerOpen}
        >
          <MenuIcon className="h-6 w-6" />
        </Button>

        <AppLogo />

        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
        </Avatar>
      </header>

      {/* Mobile Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="p-6">
              <AppLogo />
            </div>

            <nav className="flex-1 px-3">
              <NavigationList currentPath={currentPath} onNavigate={() => setIsDrawerOpen(false)} />
            </nav>

            <Separator />

            <div className="p-3">
              <UserProfileMenu user={user} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
