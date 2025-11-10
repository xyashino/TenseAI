import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
        "relative flex flex-col items-center gap-1.5 rounded-md px-3 py-3 text-sm transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-foreground font-medium"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="relative">
        <Icon className={cn("h-6 w-6", isActive && "text-sidebar-foreground")} />
        {badge !== undefined && badge > 0 && (
          <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
            {badge}
          </Badge>
        )}
      </div>
      <span className="text-xs">{label}</span>
    </a>
  );
}
