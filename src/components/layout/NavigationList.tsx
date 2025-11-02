import { useActiveSessionsCount } from "@/lib/hooks/use-active-sessions-count";
import { useNavigation } from "@/lib/hooks/use-navigation";
import { NavigationItem } from "./NavigationItem";

interface NavigationListProps {
  currentPath: string;
  onNavigate?: () => void;
}

export function NavigationList({ currentPath, onNavigate }: NavigationListProps) {
  const { data: activeSessionsCount = 0 } = useActiveSessionsCount();
  const { visibleItems, isActive } = useNavigation(currentPath, activeSessionsCount);

  return (
    <ul className="space-y-1">
      {visibleItems.map((item) => (
        <li key={item.href}>
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
