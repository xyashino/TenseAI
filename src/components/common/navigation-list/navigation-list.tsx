import { withQueryClient } from "@/components/providers/with-query-client";
import { NavigationRoutes } from "@/lib/enums/navigation";
import type { NavigationItemConfig } from "@/types";
import { BookOpenIcon, ClockIcon, PlayIcon, SettingsIcon } from "lucide-react";
import { NavigationItem } from "./navigation-item";

interface NavigationListProps {
  currentPath: string;
}

const navigationItems: NavigationItemConfig[] = [
  {
    href: NavigationRoutes.THEORY,
    label: "Theory",
    icon: BookOpenIcon,
  },
  {
    href: NavigationRoutes.TRAINING,
    label: "Training",
    icon: PlayIcon,
  },
  {
    href: NavigationRoutes.HISTORY,
    label: "History",
    icon: ClockIcon,
  },
  {
    href: NavigationRoutes.ACCOUNT,
    label: "Account",
    icon: SettingsIcon,
  },
];

function NavigationList({ currentPath }: NavigationListProps) {
  const isActive = (href: string) => currentPath.startsWith(href);

  return (
    <ul className="flex flex-row items-center w-full justify-around gap-1 lg:flex-col lg:gap-2">
      {navigationItems.map((item) => (
        <li key={item.href} className="relative">
          <NavigationItem href={item.href} label={item.label} icon={item.icon} isActive={isActive(item.href)} />
        </li>
      ))}
    </ul>
  );
}

export const NavigationListWithQueryClient = withQueryClient(NavigationList);
