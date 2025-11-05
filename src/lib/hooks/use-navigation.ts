import type { NavigationItemConfig } from "@/types";
import { ActivityIcon, BookOpenIcon, ClockIcon, PlayIcon, SettingsIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { NavigationRoutes } from "../enums/navigation";

export function useNavigation(currentPath: string, activeSessionsCount: number) {
  const navigationItems: NavigationItemConfig[] = useMemo(
    () => [
      {
        href: NavigationRoutes.PRACTICE,
        label: "Practice",
        icon: PlayIcon,
      },
      {
        href: NavigationRoutes.ACTIVE_SESSIONS,
        label: "Active Sessions",
        icon: ActivityIcon,
        isConditional: true,
        badge: activeSessionsCount,
      },
      {
        href: NavigationRoutes.THEORY,
        label: "Theory",
        icon: BookOpenIcon,
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
    ],
    [activeSessionsCount]
  );

  const isActive = useCallback((href: string) => currentPath.startsWith(href), [currentPath]);

  const visibleItems = useMemo(
    () => navigationItems.filter((item) => !item.isConditional || activeSessionsCount > 0),
    [navigationItems, activeSessionsCount]
  );

  return { navigationItems, visibleItems, isActive };
}
