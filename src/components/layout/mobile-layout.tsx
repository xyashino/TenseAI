import { Separator } from "@/components/ui/separator";
import { NavigationList } from "./navigation-list";

interface MobileLayoutProps {
  currentPath: string;
}

export function MobileLayout({ currentPath }: MobileLayoutProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-20 flex-col border-t border-sidebar-border bg-sidebar lg:hidden">
      <Separator className="bg-sidebar-border" />
      <div className="flex flex-1 items-center justify-around px-2">
        <NavigationList currentPath={currentPath} />
      </div>
    </div>
  );
}
