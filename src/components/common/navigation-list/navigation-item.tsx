import { cn } from "@/lib/utils";

interface NavigationItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}

export function NavigationItem({ href, label, icon: Icon, isActive }: NavigationItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-md px-3 py-3 text-sm transition-colors",
        "text-white/70 hover:bg-white/10 hover:text-white",
        isActive && "text-white"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="relative">
        <Icon className={cn("h-6 w-6", isActive ? "text-white" : "text-white/70")} />
      </div>
      <span className="text-xs">{label}</span>
    </a>
  );
}
