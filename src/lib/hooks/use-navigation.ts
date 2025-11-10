import type { NavigationItemConfig } from "@/types";
import { BookOpenIcon, ClockIcon, PlayIcon, SettingsIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { NavigationRoutes } from "../enums/navigation";

export function useNavigation(currentPath: string, activeSessionsCount: number) {
  const navigationItems: NavigationItemConfig[] = useMemo(
    () => [
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
