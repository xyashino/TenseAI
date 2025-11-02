import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavigationItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  badge?: number;
  onClick?: () => void;
}

export function NavigationItem({ href, label, icon: Icon, isActive, badge, onClick }: NavigationItemProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground font-medium"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge variant="secondary" className="h-5 min-w-5 px-1">
          {badge}
        </Badge>
      )}
    </a>
  );
}
