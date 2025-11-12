import { withQueryClient } from "@/components/providers/with-query-client";
import { useActiveSessionsCount } from "@/lib/hooks/use-active-sessions-count";
import { useNavigation } from "@/lib/hooks/use-navigation";
import { NavigationItem } from "./navigation-item";

interface NavigationListProps {
  currentPath: string;
  onNavigate?: () => void;
}

function NavigationList({ currentPath, onNavigate }: NavigationListProps) {
  const { data: activeSessionsCount = 0 } = useActiveSessionsCount();
  const { visibleItems, isActive } = useNavigation(currentPath, activeSessionsCount);

  return (
    <ul className="flex flex-row items-center w-full justify-around gap-1 lg:flex-col lg:gap-2">
      {visibleItems.map((item) => (
        <li key={item.href} className="relative">
          <NavigationItem
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={isActive(item.href)}
            badge={item.badge}
            onClick={onNavigate}
          />
        </li>
      ))}
    </ul>
  );
}

export const NavigationListWithQueryClient = withQueryClient(NavigationList);
